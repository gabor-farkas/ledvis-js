function sideEffect(context, scrollOutbuf, effectNumber) {
    let outline = [];
    let outline2 = []

    function drawOutline(inputBuffer, outputBuffer) {
        for (var i = 0; i < 48 * 26; i++) {
            outputBuffer[i] = 0;
        }
        let si = 48;
        let di = 48;
        for (var i = 0; i < 24 * 48; i++ , di++) {
            let result = inputBuffer[si++]
            if (result == 0) {
                result = result | inputBuffer[si - 2]
                    | inputBuffer[si] | inputBuffer[si - 49]
                    | inputBuffer[si + 47];
                outputBuffer[di] = result;
            }
        }
    }

    function orBuffers(inputBuffer, outputBuffer) {
        for (var i = 0; i < 48 * 26; i++) {
            outputBuffer[i] = outputBuffer[i] | inputBuffer[i];
        }
    }

    function clearOutlineBuffers() {
        for (var i = 0; i < 48 * 26; i++) {
            outline[i] = 0;
            outline2[i] = 0;
        }
    }


    function im0() {
        drawOutline(outline, outline2);
        orBuffers(outline, outline2);
        drawOutline(outline2, outline);
        orBuffers(outline, outline2);
        drawOutline(outline2, outline);
    }

    function im1() {
        clearOutlineBuffers();
    }

    const gradTab = [63, 48, 32, 16, 8, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 8, 16, 32, 48, 63];
    function im2() {
        clearOutlineBuffers();
        for (let y = 0; y < 24; y++) {
            for (let x = 0; x < 48; x++) {
                outline[48 + y * 48 + x] = gradTab[y] * 8;
            }
        }
    }

    return {
        initialize: () => {
        },
        destroy: () => {

        },
        step: () => {
        },
        render: () => {
            clearOutlineBuffers();
            for (let y = 0; y < 24; y++) {
                for (let x = 0; x < 24; x++) {
                    outline[48 + 12 + 48 * y + x] = scrollOutbuf[y * 24 + x];
                }
            }
            [im0, im1, im2][effectNumber]();
            // _pef_0
            for (let y = 0; y < 24; y++) {
                for (let x = 0; x < 24; x++) {
                    let al = outline[48 + 12 + 48 * y + x];
                    al >>= 2;
                    let ah = outline2[48 + 12 + 48 * y + x];
                    ah >>= 3;
                    al = al | ah | scrollOutbuf[24 * y + x];
                    context.screen[24 * y + x] = al;
                }
            }
        }
    }
}