import { font } from '../../utils/font.mjs';

function scrollEffect(context, sideEffectFactory, text, effectNumber) {
    let position = 0;
    let textPixelWidth = 0;
    let scrollOutbuf = [];
    let sideEffect;
    return {
        initialize: () => {
	    console.log("Starting scroll: " + text);
            position = 0;
            font.selectFont(0);
            textPixelWidth = 0;
            for (let i = 0; i < text.length; i ++) {
                let width = font.getCharWidth(text.charCodeAt(i));
                textPixelWidth += width;
            }
            // todo set numframes to width + 36
            sideEffect = sideEffectFactory(context, scrollOutbuf, effectNumber);
        },
        destroy: () => {

        },
        step: () => {
            position ++;
            if (position >= textPixelWidth + 36) {
                context.effectFinished();
            }
        },
        render: () => {
            for (let i = 0; i < 24 * 24; i++) {
                scrollOutbuf[i] = 0;
            }
            font.writeText(text, 24 - position, 4, scrollOutbuf, 24, 24, 192, 0);
            sideEffect.render();
        },
        scrollOutbuf: scrollOutbuf
    }
}

export { scrollEffect };