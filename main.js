/**
 * @file Contains the main function that drives the program. It instantiates all
 * the necessary objects to build the game and run it.
 * @author Marcus Bartlett
 */

import Game from "./game.js";

/** The ID of the canvas element. */
export const CANVAS_ID = "Canvas";

/** The canvas's width in pixels */
export const SCREEN_WIDTH = 640;

/** The canvas's height in pixels. */
export const SCREEN_HEIGHT = 480;

/** The FOV slider input element's ID. */
export const FOV_ID = "FOV";

/** The minimum allowed FOV in degrees. */
export const FOV_MIN = 60;

/** The maximum allowed FOV in degrees. */
export const FOV_MAX = 90;

/** Drives the program. */
function main() {
    setUpCanvas();
    setUpFOVSlider();
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

/** Sets up the FOV according to minimum and maximum specified in constants. */
function setUpFOVSlider() {
    const input = document.querySelector(`#${FOV_ID}`);
    input.setAttribute("min", FOV_MIN);
    input.setAttribute("max", FOV_MAX);
    input.setAttribute("value", Math.floor((FOV_MIN + FOV_MAX) / 2));
}

main();