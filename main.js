/**
 * @file Contains the main function that drives the program. It instantiates all
 * the necessary objects to build the game and run it.
 * @author Marcus Bartlett
 */

import Game from "./game.js";

/** The ID of the canvas element. */
export const CANVAS_ID = "Canvas";

/** The smallest allowed screen height or width in pixels. */
export const SCREEN_MIN = 320;

/** The largest allowed screen height or width in pixels. */
export const SCREEN_MAX = 3840;

/** The canvas's default width in pixels */
export const SCREEN_WIDTH = 640;

/** The canvas's default height in pixels. */
export const SCREEN_HEIGHT = 480;

/** The ID of the width slider input element. */
export const WIDTH_ID = "Width";

/** The ID of the height slider input element. */
export const HEIGHT_ID = "Height";

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
    setUpDimensionSliders();
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

function setUpDimensionSliders() {
    const width_slider = document.querySelector(`#${WIDTH_ID}`);
    width_slider.setAttribute("value", SCREEN_WIDTH);
    const height_slider = document.querySelector(`#${HEIGHT_ID}`);
    height_slider.setAttribute("value", SCREEN_HEIGHT);
}

main();