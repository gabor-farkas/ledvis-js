function testEffect(context) {
    let a = 0;
    let b = 0;
    return {
        step: function() {
            a = Math.sin(context.timeMs / 500);
            b = 0 - a;
        },
        render: function() {
            for (let x = 0; x < 23; x ++) {
                for (let y = 0; y < 23; y++) {
                    let p = ((x + y) & 1) == 0;
                    let i = p ? a : b;
                    i = Math.floor(i * 128 + 127);
                    context.screen[y * 24 + x] = i;
                }
            }
        }
    }
}