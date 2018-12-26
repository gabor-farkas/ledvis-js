function matrixEffect(context) {
    // falling chars
    let counter = 0;
    let counter2 = 0;
    let charcode = 0;
    let xpos = 0;
    const fallChars = [
        [codeOne, 0],
        [codeThree, 6],
        [codeDot, 12],
        [codeH, 18]
    ];
    const mblurphases = 8;
    let mblur = [];

    // matrix effect
    const blockheight = 16 * 6
    const numblocks = 6
    const blocks_size = blockheight * 6 * numblocks
    let blocks = []; // of size blocks_size
    let blockdata = [];
    let lastrow = 0;
    let mcounter = 24*4;
    let part = 0;
    let speed = 16;

    let fallStart = function () {
        counter = 0;
        counter2 = 0;
        charcode = 0;
        fallStartChar(fallChars[0]);
    }

    let fallStartChar = function (charCodeAndPos) {
        charcode = charCodeAndPos[0];
        xpos = charCodeAndPos[1];
        mblur = [];
        for (let i = 0; i < mblurphases; i++) {
            let posY = -10;
            let color = i * 255 / mblurphases;
            mblur.push([posY, color]);
        }
    }

    let fallStep = function () {
        counter2++;
        if (counter2 >= 8) {
            if (counter + 1 < 4) {
                counter++;
                counter2 = 0;
                fallStartChar(fallChars[counter]);
            } else { // .fs3
                counter = 4;
            } // .fs4
        }  //.fs2
        if (counter == 4)
            return;

        for (let i = 0; i < mblur.length - 1; i++) {
            mblur[i][0] = mblur[i + 1][0];
        }
        mblurlast = mblur[mblur.length - 1];
        mblurlast[0] = Math.min(9, mblurlast[0] + 3);
    }

    let fallRender = function () {
        for (let i = 0; i < counter; i++) {
            putChar2(255, i * 6, 9, fallChars[i][0])
        }
        if (counter == 4)
            return;
        for (let i = 0; i < mblurphases; i++) {
            putChar2(mblur[i][1], xpos, mblur[i][0], charcode);
        }
    }

    // matrix stuff
    let matrixStart = function () {
        for (let i = 0; i < numblocks * blockheight * 5; i ++) {
            blocks[i] = 0;
        }
        for (let i = 0; i < numblocks; i++) {
            newBlock(i);
        }
    }

    let newBlock = function (index) {
        blockdata[index] = {};
        blockdata[index].columnIndex = lastrow;
        lastrow = (lastrow + 1) & 3;
        let numCharsInColumn = Math.floor(Math.random() * 11) + 5;
        let heightPx = numCharsInColumn * 6;
        blockdata[index].heightPx = heightPx;
        let offset = - heightPx * 16 - Math.floor(Math.random() * 5 * 16);
        blockdata[index].offset = offset;
        let destOffset = index * blockheight * 5;
        for (let i = numCharsInColumn; i > 0; i--) {
            let pcColor = (i == 1) ? 255 : 192;
            let charCode = Math.floor(Math.random() * numChars) + 1;
            putChar(pcColor, charCode, destOffset);
            destOffset += 6*5;
        }
    }

    let matrixRender = function() {
        for (let i = 0; i < 24 * 24; i++) {
            context.screen[i] = 0;
        }
        
        let blockIndex = 0;
        for (let i = 0; i < numblocks; i ++) {
            let matrixIndex = 6 * blockdata[i].columnIndex;
            let ebx = blockdata[i].offset;
            ebx = (-ebx >> 4); 
            let ecx = blockdata[i].heightPx
            let esi = blockIndex;
            if (ebx < ecx) {
                if (ebx != 0) {
                    if (ebx <= 0) {
                        let ecx = ebx + 24
                        let eax = - 24 * ebx;
                        matrixIndex += eax;
                    }  else { // frskipfromsrc
                        ecx -= ebx;
                        ebx *= 5;
                        esi += ebx;
                    }
                } // .frstart
                if (ecx > 0) {
                    ecx = Math.min(ecx, 24);
                    for (;ecx > 0;ecx --) {
                        for (let j = 0; j < 5; j ++) {
                            context.screen[matrixIndex++] = blocks[esi++];
                        }
                        matrixIndex += 24 - 5;
                    }
                } // frl2end
            } // .frskipall
            blockIndex += blockheight * 5;
        }
    }

    let matrixStep = function() {
        if (mcounter-- == 0) {
            if (part == 0) {
                part ++;
                mcounter = 12; //mc_part1
            }  else {// .fs30
                if (part == 1) {
                    part ++;
                }
            }
        } // .fs3
        if (part == 1) {
            speed ++;
        } // .fs4

        for (let i = 0; i < numblocks; i ++) {
            blockdata[i].offset += speed;
            if (blockdata[i].offset >= 24*16) {
                if (part != 2) {
                    newBlock(i);
                } else {
                    blockdata[i].offset = 24 * 16;
                }
            } // .fs1 
        }

        if (part == 2) {
            fallStep();
        } // .fs5
    }

    // common stuff

    let putChar = function (pcColor, charCode, destOffset) {
        for (let charRow = 0; charRow < 5; charRow++) {
            let rowPixels = matrixChars[charCode][charRow];
            for (let charCol = 0; charCol < 5; charCol++) {
                blocks[destOffset++] = (rowPixels & 16) ? pcColor : 0;
                rowPixels <<= 1;
            }
        }
    }

    let putChar2 = function (pccolor, pcX, pcY, charIndex) {
        for (let y = 0, sy = pcY; y < 5; y++ , sy++) {
            if (sy < 0 || sy > 23) continue;
            let charLine = matrixChars[charIndex][y];
            for (let x = 0, sx = pcX; x < 5; x++ , sx++) {
                if ((charLine & 16) && sx >= 0 && sx < 24) {
                    context.screen[sy * 24 + sx] = pccolor;
                }
                charLine <<= 1;
            }
        }
    }

    return {
        initialize: () => {
            matrixStart();
            fallStart();
            setTimeout(context.effectFinished, 11 * 1000);
        },
        destroy: () => {
        },
        step: () => {
            matrixStep();
        },
        render: () => {
            matrixRender();
            fallRender();
        }
    }
}