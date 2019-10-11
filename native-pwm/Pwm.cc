#include "Pwm.h"

Nan::Persistent<v8::FunctionTemplate> Pwm::constructor;

NAN_MODULE_INIT(Pwm::Init) {
  v8::Local<v8::FunctionTemplate> ctor = Nan::New<v8::FunctionTemplate>(Pwm::New);
  constructor.Reset(ctor);
  ctor->InstanceTemplate()->SetInternalFieldCount(1);
  ctor->SetClassName(Nan::New("Pwm").ToLocalChecked());

  Nan::SetPrototypeMethod(ctor, "test", Test);

  target->Set(Nan::New("Pwm").ToLocalChecked(), ctor->GetFunction());
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

  double input = Nan::To<double>(info[0]).FromJust();

  info.GetReturnValue().Set(input + 1);
}
