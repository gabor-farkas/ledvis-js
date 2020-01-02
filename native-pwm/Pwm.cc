#include "Pwm.h"
#include <stdio.h>
#include <stdlib.h>
#include <thread>
#include <fcntl.h>
#include <sys/mman.h>
#include <unistd.h>
#include <sys/ioctl.h>
#include <linux/i2c-dev.h>
#include <sys/time.h>

Nan::Persistent<v8::FunctionTemplate> Pwm::constructor;

int t_fill = 500000;
int t_span = 1000000;

unsigned char screen [24*24];
int activeWait = 4096;
int pwmCycles = 32;
int turnOffWait = 1024;

// GPIO indexes
// 8-bit column register data bus
#define COL_REG 4
// 6 load enable wires for column latches
#define LOAD_COL 12
// 3-bit demux input
#define ROW_ADDR 18
// row demux enable 1
#define RB1 21
// row demux enable 2
#define RB2 22
// inverted output enable wire on all column registers
#define N_C_OE 23

#define BCM2708_PERI_BASE         0x3F000000 /* for rpi2+ */
#define GPIO_BASE                (BCM2708_PERI_BASE + 0x200000) /* GPIO controller */
#define BLOCK_SIZE (4*1024)
int  mem_fd;
void *gpio_map = 0;
// I/O access
volatile unsigned *gpio;
// GPIO setup macros. Always use INP_GPIO(x) before using OUT_GPIO(x) or SET_GPIO_ALT(x,y)
#define INP_GPIO(g) *(gpio+((g)/10)) &= ~(7<<(((g)%10)*3))
#define OUT_GPIO(g) *(gpio+((g)/10)) |=  (1<<(((g)%10)*3))
#define SET_GPIO_ALT(g,a) *(gpio+(((g)/10))) |= (((a)<=3?(a)+4:(a)==4?3:2)<<(((g)%10)*3))

#define GPIO_SET *(gpio+7)  // sets   bits which are 1 ignores bits which are 0
#define GPIO_CLR *(gpio+10) // clears bits which are 1 ignores bits which are 0

#define gpioSet(g) GPIO_SET = 1 << (g);
#define gpioClr(g) GPIO_CLR = 1 << (g);

/**
 * We write the GPIO registers using direct memory (I/O) register access on the SoC level.
 * This allows higher speeds than other GPIO drivers, but we need root access.
*/
void setupGPIO() {
 // setup io
    /* open /dev/mem */
   if ((mem_fd = open("/dev/mem", O_RDWR|O_SYNC) ) < 0) {
      printf("can't open /dev/mem \n");
      exit(-1);
   }

   /* mmap GPIO */
   gpio_map = mmap(
      NULL,             //Any adddress in our space will do
      BLOCK_SIZE,       //Map length
      PROT_READ|PROT_WRITE,// Enable reading & writting to mapped memory
      MAP_SHARED,       //Shared with other processes
      mem_fd,           //File to map
      GPIO_BASE         //Offset to GPIO peripheral
   );

   close(mem_fd); //No need to keep mem_fd open after mmap

   if (gpio_map == MAP_FAILED) {
      printf("mmap error %d\n", (int)gpio_map);//errno also set!
      exit(-1);
   }

   printf("GPIO setup complete\n");

   // Always use volatile pointer!
   gpio = (volatile unsigned *)gpio_map;
}


void setupController() {
  setupGPIO();
  // setup pin modes. We need to use INP before setting OUT (it's just due to the way the macros are written above)
  for (int i = COL_REG; i <= N_C_OE; i ++) {
    INP_GPIO(i);
    OUT_GPIO(i);
  }
  gpioSet(N_C_OE); // disable column output
  // clear column load wires
  for (int i = LOAD_COL; i < LOAD_COL + 6; i ++) {
    gpioClr(i);
  }
  printf("Controller setup complete\n");
}


void pwmThread() {
  printf("PWM thread started\n");
  int cycle = 0;
  unsigned char row = 0;
  gpioClr(N_C_OE);
  while (true) {
    if (false) {
       // simple PWM
       gpioClr(ROW_ADDR);
       gpioClr(ROW_ADDR + 1);
       gpioClr(ROW_ADDR + 2);
       gpioSet(RB1);
       gpioClr(RB2);
       if (t_fill > 0) {
         gpioSet(COL_REG);
         gpioSet(LOAD_COL);
         gpioClr(LOAD_COL);
	       usleep(t_fill);
       }
       gpioClr(COL_REG);
       gpioSet(LOAD_COL);
       gpioClr(LOAD_COL);
       usleep(t_span - t_fill);
    } else {
      // full-screen PWM
      unsigned char threshold = 255 - cycle * 255 / pwmCycles;
      int subrow = row % 8;
      // turn off output
      gpioSet(N_C_OE);
      gpioClr(RB1);gpioClr(RB2);
      // wait for turnoff to complete
      for (int i = 0; i < turnOffWait; i ++) gpioClr(N_C_OE);
      // set the new row address
      if (subrow & 1) gpioSet(ROW_ADDR) else gpioClr(ROW_ADDR);
      if (subrow & 2) gpioSet(ROW_ADDR + 1) else gpioClr(ROW_ADDR + 1);
      if (subrow & 4) gpioSet(ROW_ADDR + 2) else gpioClr(ROW_ADDR + 2);
      // set the new column register values
      int srcIndex = row * 24;
      for (int cg = 0; cg < 6; cg ++) {
        for (int bit = 0; bit < 8; bit ++) {
          if (screen[srcIndex++] < threshold) {
            gpioClr(COL_REG + bit);
          } else {
            gpioSet(COL_REG + bit);
          }
        }
        gpioSet(LOAD_COL + cg);
        gpioClr(LOAD_COL + cg);
        if (cg == 2) srcIndex += 11*24; //skip to bottom part
      }
      // turn on output
      if (row < 8) gpioSet(RB1) else gpioSet(RB2);
      gpioClr(N_C_OE);

      /* Some active wait to hold the output for a given time.
       * I just wanted to avoid working with timers here. It
       * would make overall timing more reliable probably, but the
       * current result is visually acceptable.
       * We could increase timing reliability by running the PWM itself
       * in a different process with high priority and processor affinity,
       * in theory we have a 4-core processor after all.
      */
      for (int i = 0; i < activeWait; i ++) gpioClr(N_C_OE);

      if (++row >= 12) {
        if (++cycle >= pwmCycles) cycle = 0;
        row = 0;
      }
    }
  }
}

std::thread t1;

NAN_MODULE_INIT(Pwm::Init) {
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(Pwm::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("Pwm").ToLocalChecked());

  Nan::SetPrototypeMethod(ctor, "setScreenData", Test);
  Nan::SetPrototypeMethod(ctor, "adjust", Adjust);

  target->Set(Nan::GetCurrentContext(), Nan::New("Pwm").ToLocalChecked(), ctor->GetFunction(Nan::GetCurrentContext()).ToLocalChecked()).FromJust();

  setupController();

  t1 = std::thread(pwmThread);
}

NAN_METHOD(Pwm::New) {
  // throw an error if constructor is called without new keyword
  if(!info.IsConstructCall()) {
    return Nan::ThrowError(Nan::New("Pwm::New - called without new keyword").ToLocalChecked());
  }

  // create a new instance and wrap our javascript instance
  Pwm* pwm = new Pwm();
  pwm->Wrap(info.Holder());

  // return the wrapped javascript instance
  info.GetReturnValue().Set(info.Holder());
}

NAN_METHOD(Pwm::SetScreenData) {
  // unwrap this Pwm
//  Pwm * self = Nan::ObjectWrap::Unwrap<Pwm>(info.This());

  v8::Local<v8::Array> jsArr = v8::Local<v8::Array>::Cast(info[0]);

  if (false) {
    // simple pwm here
    t_fill = (int) jsArr->Get(Nan::GetCurrentContext(), 0).ToLocalChecked()->NumberValue(Nan::GetCurrentContext()).FromJust();
    t_span = (int) jsArr->Get(Nan::GetCurrentContext(), 1).ToLocalChecked()->NumberValue(Nan::GetCurrentContext()).FromJust();
    if (t_fill < 0) t_fill = 0;
    if (t_fill > t_span) t_fill = t_span;
  } else {
    // screen buffer unfolding here
    for (int i = 0; i < 24*24; i ++) {
      screen[i] = (int) jsArr->Get(Nan::GetCurrentContext(), i).ToLocalChecked()->NumberValue(Nan::GetCurrentContext()).FromJust();
    }
  }

  info.GetReturnValue().Set(0);
}

NAN_METHOD(Pwm::Adjust) {

  v8::Local<v8::Array> jsArr = v8::Local<v8::Array>::Cast(info[0]);

  pwmCycles = (int) jsArr->Get(Nan::GetCurrentContext(), 0).ToLocalChecked()->NumberValue(Nan::GetCurrentContext()).FromJust();
  activeWait = (int) jsArr->Get(Nan::GetCurrentContext(), 1).ToLocalChecked()->NumberValue(Nan::GetCurrentContext()).FromJust();
  turnOffWait = (int) jsArr->Get(Nan::GetCurrentContext(), 2).ToLocalChecked()->NumberValue(Nan::GetCurrentContext()).FromJust();

  info.GetReturnValue().Set(0);
}


