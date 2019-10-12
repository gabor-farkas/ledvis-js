const pwmModule = require('./native-pwm');
let pwm = new pwmModule.Pwm();
let t = 0;
function blink() {
  pwm.test([Math.sin(t) * 450 + 500, 1000]);
  t += 0.1;
  console.log("blinkie", t);
  setTimeout(blink, 50);
}
blink();
