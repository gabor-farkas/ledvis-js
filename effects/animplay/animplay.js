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
            let animDescriptor = window.template.animDescriptors[5];
            for (let i = 0; i < 24 * 24; i++) {
                context.screen[i] = window.template.data[animDescriptor.offset + frame * 24 * 24 + i] * 4;
            }
        }
    }
}