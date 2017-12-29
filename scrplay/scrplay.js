function startScreenplay(context) {
    const MAIN_STEP_INTERVAL = 100; //ms
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