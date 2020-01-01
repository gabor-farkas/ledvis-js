import * as fs from 'fs';
import { template, controlScript } from './main.mjs';
import { createRequire } from 'module';
import express from 'express';
const require = createRequire(import.meta.url);

const pwmModule = require('./native-pwm');
let pwm = new pwmModule.Pwm();
pwm.adjust([64, 10000, 500]);

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
    let adjusted = [];
    for (let i = 0; i < 24 * 24; i ++) {
       adjusted[i] = 255 - Math.cos(context.screen[i] / 256 * Math.PI / 2) * 255;
       adjusted[i] = 255 - Math.cos(adjusted[i] / 256 * Math.PI / 2) * 255;
    }
    if (!stop) pwm.test(adjusted);
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

const app = express();
app.use(express.static('static'));
app.get('/data', (req, res) => {
	res.send('' + JSON.stringify(context.screen));
});
app.get('/interval', (req, res) => {
	context.interval = req.query.interval;
	res.send('OK');
});
app.listen(80, () => console.log('listening'));
