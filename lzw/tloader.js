window.template = (function () {
    let uncompressed = [];
    let indexes;
    function loadTemplate() {
        fetch('data/images.fls').then(response => {
            response.arrayBuffer().then(buffer => {
                let fls = new Uint8Array(buffer);
                let tl_templatelen = fls[0] + (fls[1] << 8);
                let tl_datalen = fls[4 + tl_templatelen] + (fls[5 + tl_templatelen] << 8) +
                    (fls[6 + tl_templatelen] << 16);
                indexes = new Uint8Array(buffer.slice(4, tl_templatelen));
                let compressedData = new Uint8Array(buffer.slice(12 + tl_templatelen));
                lzw().uncompress(compressedData, uncompressed);
                decodeAnimation();
                /*
                for (let i = 0; i < 64; i ++) {
                    let x = [];
                    for (let j = 0; j < 16; j ++) {
                        x.push(uncompressed[i*16+j].toString(16));
                    }
                    console.log(x);
                }
                */
            })
        })
    }
    function decodeAnimation() {
        let frameCount = 0x86;
        let src = uncompressed.slice(0, 24*24*frameCount);
        let srcIndex = 0;
        for (let i = 0; i < 24 * 24; i ++) {
            for (let j = 0; j < frameCount; j ++) {
                uncompressed[j * 24 * 24 + i] = src[srcIndex++];
            }
        }
    }
    return {
        loadTemplate: loadTemplate,
        data: uncompressed
    }
})();

window.template.loadTemplate();