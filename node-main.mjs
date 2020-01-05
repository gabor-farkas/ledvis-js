import * as fs from 'fs';
import { template, controlScript } from './main.mjs';
import { createRequire } from 'module';
import express from 'express';
const require = createRequire(import.meta.url);

const pwmModule = require('./native-pwm');
let pwm = new pwmModule.Pwm();
/** Items in the array
 * 1. PWM cycles in total. Increasing this value allows more colors, but decreases the overall framerate
 *   and might cause flicker. The original design used 32. Going above 64 doesn't really make sense as
 *   there's no perceived difference.
 * 2. Hold time, in active wait cycles - this affects the time a single row is kept turned on
 * 3. Turn-off wait time. When switching lines, we turn off the column output so that a single row doesn't
 *     'leak' into the next row. Before we can actually start increasing the row address and setting the new
 *     column values, we have to wait a little so that the 'turn-off' actually takes effect.
 */
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
    // renderOnConsole();
    let adjusted = [];
    for (let i = 0; i < 24 * 24; i ++) {
        /* use a double-cosine transformed output. Linearly adjusting the PWM on the
         * LEDs don't visually procude a perceived linear change on the actual brightness.
         * Even a small turn-on spike produces a relatively high brightness, and filling PWM
         * further quickly approaches full perceived brightness.
         * This transformation adjusts against that effect.
         */
       adjusted[i] = 255 - Math.cos(context.screen[i] / 256 * Math.PI / 2) * 255;
       adjusted[i] = 255 - Math.cos(adjusted[i] / 256 * Math.PI / 2) * 255;
    }
    if (!stop) pwm.setScreenData(adjusted);
};
template.loaded.then(() => {
    controlScript(context);
});

function renderOnConsole() {
    for (let i = 0; i < 24; i ++) {
        let line = "";
        for (let j = 0; j < 24; j ++) {
            line += context.screen[i * 24 + j] ? ' ' : '.';
        }
        console.log(line);
    }
}

console.log('Press any key to exit');

if (process.stdin.setRawMode) {
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', () => {
    stop = true;
    let screen = [];
    for (let i = 0; i < 24*24; i++) screen[i] = 0;
    pwm.setScreenData(screen);
    setTimeout(() => { process.exit(0) }, 100);
  });
}

/**
 * Use a local webserver to allow monitoring of the animation over http
 * The html skeleton is static/index.html (not to be confused with the top-leve
 *  index.html which is used for browser-only execution).
 */
const app = express();
app.use(express.static('static'));
app.get('/data', (req, res) => {
	res.send(JSON.stringify(context.screen));
});
// allows controlling the speed of the animation the same way as the browser-standalone version
app.get('/interval', (req, res) => {
	context.interval = req.query.interval;
	res.send('OK');
});
app.get('/control', (req, res) => {
	console.log(JSON.stringify(req.query));
	res.send('OK');
});
app.listen(80, () => console.log('listening'));
