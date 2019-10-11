import { random } from '../random.mjs';

function kukacEffect(context) {
    const initiallen = 4;
    const maxlength = 64;
    // the head is always the 0 index
    let pixels = [];
    let foodPos = [0, 0];
    let direction = [1, 0];
    const possibleDirections = [
        [0, -1], [1, 0], [0, 1], [-1, 0]
    ];
    let gameCountdown = 3;
    let restartGame = function () {
        if (--gameCountdown <= 0) {
            context.effectFinished();
        }
        pixels = [];
        for (let i = 0; i < initiallen; i++) {
            pixels.push([12, 12 + i]);
        }
        placeFood();
        findDirection();
    }
    let placeFood = function () {
        let placed = false;
        do {
            foodPos = [random(23), random(23)];
        } while (doesCollide(foodPos));
    }
    let vectorAdd = function (v1, v2) {
        let result = [];
        for (let i = 0; i < v1.length; i++) {
            result.push(v1[i] + v2[i]);
        }
        return result;
    }
    let vectorCompare = function (v1, v2) {
        for (let i = 0; i < v1.length; i++) {
            if (v1[i] != v2[i])
                return false;
        }
        return true;
    }
    let findDirection = function () {
        let head = pixels[0];
        if (head[1] < foodPos[1]) {
            direction = [0, 1];
        } else if (head[1] > foodPos[1]) {
            direction = [0, -1];
        } else {
            if (head[0] < foodPos[0]) {
                direction = [1, 0];
            } else {
                direction = [-1, 0];
            }
        }
        if (!doesCollide(vectorAdd(head, direction)))
            return;
        // find another direction
        let foundDirection = null;
        possibleDirections.forEach(candidateDirection => {
            if (!doesCollide(vectorAdd(head, candidateDirection))) {
                foundDirection = candidateDirection;
                return false;
            }
        });
        
        if (foundDirection) {
            direction = foundDirection;
        } else {
            // we died, there's no possible direction
            restartGame();
        }
    }
    let doesCollide = function (vector) {
        if (vector[0] < 0 || vector[0] > 23)
            return true;
        if (vector[1] < 0 || vector[1] > 23)
            return true;
        let result = false;
        pixels.forEach(pixel => {
            if (vectorCompare(pixel, vector))
                result = true;
        });
        return result;
    }
    let kukacStep = function () {
        let head = pixels[0];
        let newHead = vectorAdd(head, direction);
        pixels.unshift(newHead);
        if (!vectorCompare(newHead, foodPos)) {
            pixels.pop();
        } else {
            placeFood();
        }
        if (pixels.length == maxlength) {
            restartGame();
        } else {
            findDirection();
        }
    }
    let kukacRender = function () {
        for (let i = 0; i < 24 * 24; i++)
            context.screen[i] = 0;
        pixels.forEach(pixel => {
            context.screen[pixel[0] + 24 * pixel[1]] = 128;
        });
        context.screen[foodPos[0] + 24 * foodPos[1]] = 255;
    }
    return {
        initialize: () => {
            restartGame();
        },
        destroy: () => {
        },
        step: () => {
            kukacStep();
        },
        render: () => {
            kukacRender();
        }
    }
}

export { kukacEffect };