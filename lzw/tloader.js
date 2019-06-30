window.template = (function () {
    let uncompressed = [];
    let descriptorsRaw;
    let animDescriptors = [];
    let loadResolve = null;
    let loaded = new Promise((resolve, reject) => {
        loadResolve = resolve;
    });
    function loadTemplate() {
        fetch('data/images.fls').then(response => {
            response.arrayBuffer().then(buffer => {
                let fls = new Uint8Array(buffer);
                let tl_templatelen = fls[0] + (fls[1] << 8);
                let tl_datalen = fls[4 + tl_templatelen] + (fls[5 + tl_templatelen] << 8) +
                    (fls[6 + tl_templatelen] << 16);
                descriptorsRaw = new Uint8Array(buffer.slice(4, tl_templatelen + 4));
                let compressedData = new Uint8Array(buffer.slice(12 + tl_templatelen));
                lzw().uncompress(compressedData, uncompressed);
                decodeAnimations();
                loadResolve(true);
            });
        })
    }
    function decodeAnimations() {
        let srcIndex = 0;
        while (srcIndex < descriptorsRaw.length) {
            if (descriptorsRaw[srcIndex] == 2) {
                srcIndex += 5;
                let name = '';
                let b = 0;
                while ((b = descriptorsRaw[srcIndex++]) != 0) {
                    name += String.fromCharCode(b);
                }
                let frameCount = descriptorsRaw[srcIndex];
                let offset = descriptorsRaw[srcIndex + 13]
                        + (descriptorsRaw[srcIndex + 14] << 8)
                        + (descriptorsRaw[srcIndex + 15] << 16)
                        + (descriptorsRaw[srcIndex + 16] << 24);
                animDescriptors.push({
                    offset: offset,
                    frameCount: frameCount,
                    name: name
                });
                let src = uncompressed.slice(offset, 24*24*frameCount + offset);
                let srcIndex2 = 0;
                for (let i = 0; i < 24 * 24; i ++) {
                    for (let j = 0; j < frameCount; j ++) {
                        uncompressed[offset + j * 24 * 24 + i] = src[srcIndex2++];
                    }
                }
                srcIndex += 17;
            } else {
                //console.log('oh noes', descriptorsRaw[srcIndex], srcIndex);
                let blockLen = descriptorsRaw[srcIndex + 1];
                srcIndex += blockLen;
            }
        }
    }
    return {
        loadTemplate: loadTemplate,
        data: uncompressed,
        animDescriptors: animDescriptors,
        loaded: loaded
    }
})();

window.template.loadTemplate();