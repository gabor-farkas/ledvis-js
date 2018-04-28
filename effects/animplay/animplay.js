function animplayEffect(context) {
    let frame = 0;
    return {
        initialize: () => {
        },
        destroy: () => {

        },
        step: () => {
            frame++;
        },
        render: () => {
            for (let i = 0; i < 24 * 24; i++) {
                context.screen[i] = window.template.data[frame * 24 * 24 + i] * 4;
            }
        }
    }
}