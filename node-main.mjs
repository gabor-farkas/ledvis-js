import * as fs from 'fs';
import { template, controlScript } from './main.mjs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const pwmModule = require('./native-pwm');
let pwm = new pwmModule.Pwm();
pwm.adjust([64, 10000, 1000]);

template.setBinaryLoader(() => {
    let buffer = fs.readFileSync('./data/images.fls');
    return Promise.resolve(buffer);
});
template.loadTemplate();

let stop = false;
let context = {};
let matrix = {};
matrix.fastMode = false;
context.screen = [];
context.renderer = {};
context.renderer.render = () => {
    /*
    for (let i = 0; i < 24; i ++) {
        let line = "";
        for (let j = 0; j < 24; j ++) {
            line += context.screen[i * 24 + j] ? ' ' : '.';
        }
        console.log(line);
    }
    */
    if (!stop) pwm.test(context.screen);
};
template.loaded.then(() => {
    controlScript(context);
});

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


