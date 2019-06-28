// TODO nwp_params		db	5,5,3,5,4,2
// as letter_increment
function nwpEffect(context, srcText) {
    function fx1Text(text, buf, x, y) {
        font.writeText(text, x, y, buf, 24, 24, 254, 255);
        font.writeText(text, x+2, y+2, buf, 24, 24, 96, 255);
        font.writeText(text, x+1, y+1, buf, 24, 24, 192, 255);
    }
    let counter = 0;
    let counter2 = 0;
    let text = " " + srcText + " ";
    let image = 0;

    function fadeBl(buf1, buf2) {
        let cnt = (counter < 12) ? counter : 23 - counter;
        let buf = (counter < 12) ? buf1 : buf2;
        let bl = 256 - cnt * 255 / 12;
        for (let i = 0; i < 24 * 24; i++) {
            context.screen[i] = buf[i] * bl / 256;
        }
    }

    function fadeCr(buf1, buf2) {
        let bh = counter * 255 / 23;
        let bl = 256 - bh;
        for (let i = 0; i < 24 * 24; i++) {
            context.screen[i] = (buf1[i] * bl + buf2[i] * bh) / 256;
        }
    }

    function copy(buf, srcIndex, destIndex, len) {
        for (let i = 0; i < len ; i ++) {
            context.screen[destIndex++] = buf[srcIndex++];
        }
    }
    function horLines(buf1, buf2) {
        let bl = counter + 1;
        let bh = 24 - bl;
        let src1 = 0;
        let src2 = 0;
        let dst = 0;
        for (let i = 0; i < 12; i ++) {
            // odd line to the left
            src1 += bl;
            copy(buf1, src1, dst, bh);
            src1 += bh;
            dst += bh;
            copy(buf2, src2, dst, bl);
            src2 += 24;
            dst += bl;
            // even line to the right
            src2 += bh;
            copy(buf2, src2, dst, bl);
            src2 += bl;
            dst += bl;
            copy(buf1, src1, dst, bh);
            src1 += 24;
            dst += bh;
        }
        // blur
        let s = context.screen;
        let p = 24;
        for (let i = 1; i <= 22; i ++) {
            s[p++] = 0;
            for (let j = 1; j <= 22; j ++) {
                let blurred = (s[p-1] + s[p+1] + s[p-24] + s[p+24] + s[p-25] + s[p-23] + s[p+23] + s[p+25])/8;
                s[p] = blurred * bh / 24 + s[p] * bl / 24;
                p ++;
            }
            s[p++] = 0;
        }
    }

    function horzSclr(buf1, buf2) {
        let src1 = 0;
        let src2 = 0;
        let p = 0;
        let bl = counter;
        let bh = 24 - counter;
        for (let i = 0; i < 24; i ++) {
            src1 += bl;
            copy(buf1, src1, p, bh);
            p+= bh;
            src1 += bh;
            copy(buf2, src2, p, bl);
            p+= bl;
            src2 += 24;
        }
    }

    function vertbars(buf1, buf2) {
        let bl = (counter + 2) / 2;
        let bh = (12 - bl - 1) * 2;
        let src1 = 0;
        let src2 = 0;
        let p = 0;
        for (let i = 0; i < 24; i ++) {
            copy(buf2, src2, p, bl);
            src2 += bl; p += bl; src1 += bl;
            copy(buf1, src1, p, bh);
            src1 += bh; p += bh; src2 += bh;
            copy(buf2, src2, p, bl);
            src2 += bl; p += bl; src1 += bl;
        }
    }

    function ptab(buf1, buf2) {
        let tab = [0,0,3,3,6,6,9,9,
		1,1,4,4,7,7,10,10,
        2,2,5,5,8,8,11,11];
        let ah = counter;
        let bl = counter % 12;
        let src1 = 0;
        let src2 = 0;
        let p = 0;
        for (let a = 0; a < 4; a ++) {
            let edx = 0;
            for (let b = 0; b < 3; b ++) {
                for (let c = 0; c < 6; c ++) {
                    for (let d = 0; d < 8; d++) {
                        let al = buf1[src1++];
                        if (ah >= 12) al = 0;
                        if (bl >= tab[edx]) {
                            al = buf2[src2];
                            if (ah < 12) {
                                al = 0;
                            }
                        }
                        context.screen[p++] = al;
                        src2 ++;
                        edx ++;
                    }
                    edx -= 8;
                }
                edx += 8;
            }
        }
    }

    let effects = [fadeBl, fadeCr, horLines, horzSclr, ptab, vertbars];
    let effect = null;

    return {
        initialize: () => {
            font.selectFont(1);
            effect = effects[Math.floor(Math.random() * effects.length)];
        },
        destroy: () => {

        },
        step: () => {
            counter2 += 3;
            if (counter2 >= 48) {
                image ++;
                if (image == text.length - 1) {
                    context.effectFinished();
                }
                counter2 = 0;
            }
            counter = Math.min(23, counter2);
        },
        render: () => {
            let buf1 = [];
            let buf2 = [];
            for (let i = 0; i < 24 * 24; i++) {
                buf1[i] = 0;
                buf2[i] = 0;
            }
            fx1Text(text[image], buf1, 3, -4);
            fx1Text(text[image + 1], buf2, 3, -4);
            ptab(buf1, buf2);
        },
    }
}