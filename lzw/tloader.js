function loadTemplate() {
    fetch('data/images.fls').then(response => {
        response.arrayBuffer().then(buffer => {
            let fls = new Uint8Array(buffer);
            let tl_templatelen = fls[0] + (fls[1] << 8);
            let tl_datalen = fls[4 + tl_templatelen] + (fls[5 + tl_templatelen] << 8) +
                (fls[6 + tl_templatelen] << 16);
            // 2do copy template data buffer so that we can release fls
            console.log(tl_templatelen, tl_datalen);
            let compressedData = new Uint8Array(buffer.slice(12 + tl_templatelen));
            let dest = [];
            lzw().uncompress(compressedData, dest);
            console.log(dest);
        })
    })
}

loadTemplate();