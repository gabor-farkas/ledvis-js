function scrollEffect(context) {
    let position = 0;
    return {
        initialize: () => {
            position = 0;
            console.log(font.getCharWidth(65));
        },
        destroy: () => {

        },
        step: () => {

        },
        render: () => {
            for (let i = 0; i < 24 * 24; i++) {
                context.screen[i] = 0;
            }
            font.putChar(65, 0, 0, context.screen, 24, 24, 192, 0);
        }
    }
}