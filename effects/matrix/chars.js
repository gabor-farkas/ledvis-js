const numChars = 10;
const codeH = numChars + 1;
const codeDot = numChars + 2;
const codeOne = numChars + 3;
const codeThree = numChars + 4;

const matrixChars =
    [
        [0, 0, 0, 0, 0],

        [0b01110,
            0b10001,
            0b10001,
            0b10001,
            0b01110],

        [0b00100,
            0b01100,
            0b00100,
            0b00100,
            0b00100],

        [0b01110,
            0b10001,
            0b00010,
            0b01100,
            0b11111],

        [0b11110,
            0b00001,
            0b00010,
            0b00001,
            0b11110],

        [0b01000,
            0b01000,
            0b01111,
            0b00010,
            0b00010],

        [0b11111,
            0b10000,
            0b11110,
            0b00001,
            0b11110],

        [0b01110,
            0b10000,
            0b11110,
            0b10001,
            0b01110],

        [0b11111,
            0b00010,
            0b00100,
            0b01000,
            0b10000],

        [0b01110,
            0b10001,
            0b01110,
            0b10001,
            0b01110],

        [0b01110,
            0b10001,
            0b01111,
            0b00001,
            0b01110],

        //;-- extra chars
        [0b11011,
            0b11011,
            0b11111,
            0b11011,
            0b11011],

        [0b00000,
            0b00000,
            0b00000,
            0b00110,
            0b00110],

        [0b00110,
            0b01110,
            0b00110,
            0b00110,
            0b00110],

        [0b11110,
            0b00011,
            0b00110,
            0b00011,
            0b11110]]