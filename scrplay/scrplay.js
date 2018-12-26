function startScreenplay(context) {
    /* we originally had a PIT timer (1193182 Hz) with
     * a divisor rate of 0 (65536), so it's 18Hz
    */
    const MAIN_STEP_INTERVAL = 10;//55; //ms
    context.timeMs = 0;
    function mainStep() {
        context.timeMs += MAIN_STEP_INTERVAL;
        context.effect.step();
        context.effect.render();
        context.renderer.render();
        setTimeout(mainStep, MAIN_STEP_INTERVAL);
    }
    mainStep();
}