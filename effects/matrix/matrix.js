function matrixEffect(context) {
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

    fallStart = function () {
        counter = 0;
        counter2 = 0;
        charcode = 0;
        fallStartChar(fallChars[0]);
    }

    fallStartChar = function (charCodeAndPos) {
        charcode = charCodeAndPos[0];
        xpos = charCodeAndPos[1];
        mblur = [];
        for (let i = 0; i < mblurphases; i++) {
            let posY = -10;
            let color = i * 255 / mblurphases;
            mblur.push([posY, color]);
        }
    }

    fallStep = function () {
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

    fallRender = function () {
        for (let i = 0; i < 24 * 24; i++)
            context.screen[i] = 0;
        for (let i = 0; i < counter; i++) {
            putChar2(255, i * 6, 9, fallChars[i][0])
        }
        if (counter == 4)
            return;
        for (let i = 0; i < mblurphases; i++) {
            putChar2(mblur[i][1], xpos, mblur[i][0], charcode);
        }
    }

    putChar2 = function (pccolor, pcX, pcY, charIndex) {
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
            fallStart();
        },
        destroy: () => {
        },
        step: () => {
            fallStep();
        },
        render: () => {
            fallRender();
        }
    }
}