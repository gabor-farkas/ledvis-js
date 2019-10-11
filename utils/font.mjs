import { fonts } from './fontData.mjs';

let font = new (function font() {
    
    const mapping = {
        'Ú': '\xDA',
        'é': '\xE9',
        'í': '\xED',
        'á': '\xE1',
        'ű': '\xFB',
        'ö': '\xF6',
        'ő': '\xF5',
        'Ő': '\xD5',
        'ó': '\xF3',
        'Ó': '\xD3',
        'Á': '\xC1',
        'Í': '\xCD',
        'É': '\xC9',
        'Ö': '\xD6',
        'ü': '\xFC',
        'Ü': '\xDC',   
    }
    
    let fontRawData = [fonts.font1, fonts.font2];
    let fontDefs = [];
    let selectedFontIndex = 0;
    fontRawData.forEach(rawData => {
        let fontDef = {}
        fontDefs.push(fontDef);
        fontDef.asciitab = [];
        fontDef.rawData = rawData;
        fontDef.fontHeight = rawData[256];
        let index = 0;
        for (let i = 256 + 4; i < rawData.length;) {
            let foundIndex = 0;
            while (rawData[foundIndex] != index) {
                foundIndex++;
            }
            fontDef.asciitab[foundIndex] = i;
            let charWidth = rawData[i];
            let charDataLength = ((charWidth * fontDef.fontHeight) >> 3) + 1;
            i += charDataLength + 4;
            index++;
        }
    });
    let currentFontDef = fontDefs[selectedFontIndex];
    this.selectFont = function (index) {
        currentFontDef = fontDefs[index];
        selectedFontIndex = index;
    }
    this.getCharWidth = function (charCode) {
        if (!currentFontDef.asciitab[charCode])
            return 0; // char not defined
        let fontOffset = currentFontDef.asciitab[charCode];
        let pcCharWidth = currentFontDef.rawData[fontOffset];
        return pcCharWidth;
    }

    this.writeText = function (text, ffX, ffY, bufferMatrix, bufferWidth, bufferHeight, color, bgColor) {
        let x = 0;
        for (let i = 0; i < text.length; i ++) {
            let width = this.putChar(text.charCodeAt(i), ffX + x, ffY, bufferMatrix, bufferWidth, bufferHeight, color, bgColor);
            x+= width;
        }
    }

    this.putChar = function (charCode, ffX, ffY, bufferMatrix, bufferWidth, bufferHeight, color, bgColor) {
        let char = String.fromCharCode(charCode);
        if (mapping.hasOwnProperty(char)) {
            charCode = mapping[char].charCodeAt(0);
        }
        if (!currentFontDef.asciitab[charCode])
            return; // char not defined
        let fontOffset = currentFontDef.asciitab[charCode];
        let pcCharWidth = currentFontDef.rawData[fontOffset];
        fontOffset += 4;
        if (ffX < -24 || ffX > bufferWidth)
            return pcCharWidth;
        let bitpos = 0;
        let pcY = ffY;
        for (let line = 0; line < currentFontDef.fontHeight; line++) { // plc1
            if (pcY >= 0 && pcY < bufferHeight) {
                let pcX = ffX;
                for (let col = 0; col < pcCharWidth; col++) { // pcl2
                    if (pcX >= 0 && pcX < bufferWidth) {
                        let bufItem = currentFontDef.rawData[fontOffset + (bitpos >> 3)];
                        let bit = (bufItem >> (7 - (bitpos & 0x7))) & 1;
                        let bitColor = bit ? color : bgColor;
                        if (bitColor != 255) {
                            bufferMatrix[pcY * bufferWidth + pcX] = bitColor;
                        }
                    } // pc1
                    pcX++;
                    bitpos++;
                }
            } else {    //pc2
                bitpos += pcCharWidth;
            }
            // pc3
            pcY++;
        }
        return pcCharWidth;
    }
    return this;
})();

export { font };