#include "Pwm.h"
#include <stdio.h>
#include <stdlib.h>
#include <thread>
#include <fcntl.h>
#include <sys/mman.h>
#include <unistd.h>

#define BCM2708_PERI_BASE         0x3F000000 /* for rpi2+ 8*/
#define GPIO_BASE                (BCM2708_PERI_BASE + 0x200000) /* GPIO controller */

#define PAGE_SIZE (4*1024)
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


Nan::Persistent<v8::FunctionTemplate> Pwm::constructor;

int t_fill = 500000;
int t_span = 1000000;

void pwmThread() {
   while (true) {
	if (t_fill > 0) {
    	    GPIO_SET = 1 << 2;
	    usleep(t_fill);
	}
	GPIO_CLR = 1 << 2;
	usleep(t_span - t_fill);
    }
}

std::thread t1;


NAN_MODULE_INIT(Pwm::Init) {
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(Pwm::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("Pwm").ToLocalChecked());

  Nan::SetPrototypeMethod(ctor, "test", Test);

  target->Set(Nan::New("Pwm").ToLocalChecked(), ctor->GetFunction());

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

   // Always use volatile pointer!
   gpio = (volatile unsigned *)gpio_map;

   INP_GPIO(2);
   OUT_GPIO(2);

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

NAN_METHOD(Pwm::Test) {
  // unwrap this Pwm
  Pwm * self = Nan::ObjectWrap::Unwrap<Pwm>(info.This());

  v8::Local<v8::Array> jsArr = v8::Local<v8::Array>::Cast(info[0]);

  t_fill = (int) jsArr->Get(0)->NumberValue();
  t_span = (int) jsArr->Get(1)->NumberValue();

  info.GetReturnValue().Set(0);
}
