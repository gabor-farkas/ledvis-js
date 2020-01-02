#include <nan.h>
#include "Pwm.h"

NAN_MODULE_INIT(InitModule) {
  Pwm::Init(target);
}

NODE_MODULE(myModule, InitModule);
