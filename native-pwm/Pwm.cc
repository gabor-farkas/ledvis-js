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

int file_i2c;

void startupI2c() {
  char *filename = (char*)"/dev/i2c-1";
  if ((file_i2c = open(filename, O_RDWR)) < 0) {
    printf("Cannot open i2c bus");
    return;
  }
  if (ioctl(file_i2c, I2C_SLAVE, 0x20) < 0) {
    printf("Failed to acquire bus");
  }
}

void writeReg(int addr, int val) {
  unsigned char buffer[2] = {addr, val};
  if (write(file_i2c, buffer, 2) != 2) {
    printf("Couldn't write to i2c");
  }
}

void setupMux() {
  writeReg(0x05, 0b00100000); // force bank to 0
  writeReg(0x0A, 0b00100000); // IOCON bank = 0, seqop disabled
  writeReg(0x00, 0x00); // A as outputs
  writeReg(0x01, 0x00); // B as outputs
  writeReg(0x12, 0x00); // output on A
  writeReg(0x13, 0x00); // output on B
  printf("mux configured");
}

void pwmThread() {
   struct timeval now, pulse;
   while (true) {
	// gettimeofday(&pulse, NULL);
	if (t_fill > 0) {
	    if (t_fill < 60) {
		unsigned char buffer[4] = {0x12, 0xFF, 0x12, 0x00}; // just quick blink
		write(file_i2c, buffer, 4);
	    } else {
	        writeReg(0x12, 0xFF);
	        usleep(t_fill);
	    }
	}
	writeReg(0x12, 0x00);
	 //gettimeofday(&now, NULL);
	usleep(t_span - t_fill);
	//printf("%d\n", now.tv_usec - pulse.tv_usec);
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

  startupI2c();
  setupMux();

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

