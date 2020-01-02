#include <nan.h>

class Pwm : public Nan::ObjectWrap {
public:

  static NAN_MODULE_INIT(Init);
  static NAN_METHOD(SetScreenData);
  static NAN_METHOD(Adjust);
  static NAN_METHOD(New);

  static Nan::Persistent<v8::FunctionTemplate> constructor;
};
