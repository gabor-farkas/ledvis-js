const pwmModule = require('./native-pwm');
let pwm = new pwmModule.Pwm();
pwm.adjust([255, 100000, 1000]);
let t = 0;
let stop = false;
function blink() {
  if (stop) return;
  let screen = [];
  let c = ~~t % 24;
  for (let i = 0; i < 24 * 24; i ++) { 
    let rot = t / 3;
    let x = i % 24;
    let y = ~~(i/24);
    let x1 = Math.cos(rot) * x + Math.sin(rot) * y;
    let y1 = Math.sin(rot) * x - Math.cos(rot) * y;
    screen[i] = Math.max(0, 255 * (
		Math.sin(t + x1 * (1.1 + 0.5 * Math.cos(t))) +
		Math.sin(t + y1 * (0.9 + 0.5 * Math.cos(t/2)))) / 2);
    //screen[i] = (x + y) * 255/ 46;
    //screen[i] = (((x >> 2) + (y >> 2)) % 2) * 255;
    //screen[i] = (x == c || y == c) ? 255 : 0;
    screen[i] = 255 - Math.cos(screen[i] / 256 * Math.PI / 2) * 255;
  }
  pwm.test(screen);
  t += 0.1;
  setTimeout(blink, 50);
}
blink();

console.log('Press any key to exit');

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', () => {
  stop = true;
  let screen = [];
  for (let i = 0; i < 24*24; i++) screen[i] = 0;
  pwm.test(screen);
  setTimeout(() => { process.exit(0) }, 100);
});
