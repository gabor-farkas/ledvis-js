const pwmModule = require('./native-pwm');
let pwm = new pwmModule.Pwm();
let t = 0;
function blink() {
  let fill = Math.sin(t) * 499 + 500;
  pwm.test([fill, 1000]);
  t += 0.1;
  console.log("blinkie", fill);
  setTimeout(blink, 50);
}
blink();
