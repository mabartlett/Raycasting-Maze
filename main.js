"use strict";

/**
 * @file Contains the main function that drives the program. It instantiates all
 * the necessary objects to build the game and run it.
 * @author Marcus Bartlett
 */

/** Drives the program. */
function main() {
    setUpCanvas();
    let g = new Game();
    g.start();
}

/** Sets up the canvas according to dimensions specified in constants. */
function setUpCanvas() {
    const canvas = document.querySelector(`#${CANVAS_ID}`);
    canvas.style.width = `${SCREEN_WIDTH}px`;
    canvas.style.height = `${SCREEN_HEIGHT}px`;
    canvas.setAttribute("width", SCREEN_WIDTH);
    canvas.setAttribute("height", SCREEN_HEIGHT);
}

main();