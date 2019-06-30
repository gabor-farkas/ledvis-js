function animplayEffect(context, animName) {
    let frame = 0;
    let animDescriptor = null;
    return {
        initialize: () => {
            animDescriptor = window.template.animDescriptors.filter(desc => desc.name == animName)[0];
        },
        destroy: () => {

        },
        step: () => {
            frame++;
            if (frame >= animDescriptor.frameCount) {
                context.effectFinished();
            }
        },
        render: () => {
            for (let i = 0; i < 24 * 24; i++) {
                context.screen[i] = window.template.data[animDescriptor.offset + frame * 24 * 24 + i] * 4;
            }
        }
    }
}