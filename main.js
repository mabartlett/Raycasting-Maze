/**
 * @file Contains the main function that drives the program. It instantiates all
 * the necessary objects to build the game and run it.
 * @author Marcus Bartlett
 */

import Game from "./game.js";
import World from "./world.js";
import Ray from "./ray.js";

/** The ID of the canvas element. */
export const CANVAS_ID = "Canvas";

/** The canvas's width in pixels */
export const SCREEN_WIDTH = 640;

/** The canvas's height in pixels. */
export const SCREEN_HEIGHT = 480;

/**
 * The "resolution" of the tiles in world units. Lower numbers mean higher
 * performance but lower visual accuracy.
 */
export const TILE_SIZE = 2;

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