import * as fs from 'fs';
import { template, controlScript } from './main.mjs';

template.setBinaryLoader(() => {
    let buffer = fs.readFileSync('./data/images.fls');
    return Promise.resolve(buffer);
});
template.loadTemplate();

let context = {};
let matrix = {};
matrix.fastMode = false;
context.screen = [];
context.renderer = {};
context.renderer.render = () => {
    for (let i = 0; i < 24; i ++) {
        let line = "";
        for (let j = 0; j < 24; j ++) {
            line += context.screen[i * 24 + j] ? ' ' : '.';
        }
        console.log(line);
    }
};
template.loaded.then(() => {
    controlScript(context);
});
