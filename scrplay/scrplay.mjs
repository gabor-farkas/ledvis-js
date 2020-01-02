function startScreenplay(context) {

    context.interval = 55;

    if (typeof document !== 'undefined') {
        let s = document.getElementById('_2dscreen');
        let ht = null;
        let speedUp = function() {
            context.interval = 10;
            ht = setTimeout(hyperspeed, 3000);
        }
        let hyperspeed = function() {
            ht = null;
            context.interval = 1;
        }
        let reset = function() {
            if (ht != null) {
                clearTimeout(ht);
            }
            context.interval = 55;
        }
        s.onmousedown = speedUp;
        s.onmouseup = reset;
        s.onmouseout = reset
        s.addEventListener("touchstart", speedUp, false);
        s.addEventListener("touchend", reset, false);
        s.addEventListener("touchcancel", reset, false);
    }

    /* we originally had a PIT timer (1193182 Hz) with
     * a divisor rate of 0 (65536), so it's 18Hz
    */
    context.timeMs = 0;
    function mainStep() {
        context.timeMs += context.interval;
        context.effect.step();
        context.effect.render();
        context.renderer.render();
        setTimeout(mainStep, context.interval);
    }
    mainStep();
}

export { startScreenplay };
