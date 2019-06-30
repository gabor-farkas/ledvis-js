function startScreenplay(context) {

    let interval = 55;

    let s = document.getElementById('_2dscreen');
    let ht = null;
    speedUp = function() {
        interval = 10;
        ht = setTimeout(hyperspeed, 3000);
    }
    hyperspeed = function() {
        ht = null;
        interval = 1;
    }
    reset = function() {
        if (ht != null) {
            clearTimeout(ht);
        }
        interval = 55;
    }
    s.onmousedown = speedUp;
    s.onmouseup = reset;
    s.onmouseout = reset
    s.addEventListener("touchstart", speedUp, false);
    s.addEventListener("touchend", reset, false);
    s.addEventListener("touchcancel", reset, false);

    /* we originally had a PIT timer (1193182 Hz) with
     * a divisor rate of 0 (65536), so it's 18Hz
    */
    context.timeMs = 0;
    function mainStep() {
        context.timeMs += interval;
        context.effect.step();
        context.effect.render();
        context.renderer.render();
        setTimeout(mainStep, interval);
    }
    mainStep();
}