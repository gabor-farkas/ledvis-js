const pwmModule = require('./native-pwm');
let pwm = new pwmModule.Pwm();
let t = 0;
function blink() {
  let fill = Math.sin(t) * 249 + 250;
  pwm.test([fill, 1000]);
  t += 0.1;
  console.log("blinkie", fill);
  setTimeout(blink, 50);
}
blink();
