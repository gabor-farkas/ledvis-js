function fadeFilter(context, animName) {
    let fadeCount = 0;
    let fadeSpeed = 4;
    return {
        initialize: () => {
        },
        destroy: () => {

        },
        step: () => {
            fadeCount += fadeSpeed;
            fadeCount = Math.min(fadeCount, 255);
        },
        render: () => {
            for (let i = 0; i < 24 * 24; i++) {
                context.screen[i] = (context.screen[i] * (256 - fadeCount)) / 256;
            }
        }
    }
}