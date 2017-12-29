function init2dRenderer(context, canvasContainer) {
    let canvas = document.createElement('canvas');
    canvas.width = '240';
    canvas.height = '240';
    canvasContainer.appendChild(canvas);
    return {
        render: function() {
            let ctx = canvas.getContext("2d");
            for (let x = 0; x < 23; x ++) {
                for (let y = 0; y < 23; y++) {
                    var intensity = context.screen[y * 24 + x];
                    ctx.fillStyle = 'rgba(' + Math.floor(intensity) + ', 0,0,1)';
                    ctx.fillRect(x * 10, y * 10, 10, 10);
                }
            }
        }
    };
}