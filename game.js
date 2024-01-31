/**
 * @file Contains the game class.
 * @author Marcus Bartlett
 */

import Camera from "./camera.js";
import Ray from "./ray.js";
import { TILE_SIZE } from "./main.js";
import World from "./world.js";

/** A 2D array of tiles. A 0 represents emptiness and 1 represents a wall. */
const ROOM = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

/** The x-coordinate of where the camera starts. */
const START_X = 7;

/** The y-coordinate of where the camera starts. */
const START_Y = 7;

/** Describes a game class, which starts and updates the game and objects. */
export default class Game {
    /** Constructs a game instance. */
    constructor() {
        let w = new World(ROOM, TILE_SIZE);
        let c_x = Math.floor((START_X + 0.5) * TILE_SIZE);
        let c_y = Math.floor((START_Y + 0.5) * TILE_SIZE);
        let c_a = 0;
        /** The camera that does the looking and--yes--the drawing. */
        this._cam = new Camera(new Ray(c_x, c_y, c_a, w, TILE_SIZE *
                                       ROOM.length));
        /** The time at which the previous frame was drawn. */
        this._prev_frame = 0;
    }

    /** Starts the game by adding event listeners and starting the game loop. */
    start() {
        this._cam.updateCanvas();
        this._prev_frame = document.timeline.currentTime;
        /* Note to self: use this pattern when adding event listeners to bind
           "this" to the object containing the event handler. */
        document.addEventListener("keydown", (event) => {
            this._cam.handleInput(event, true);
        });
        document.addEventListener("keyup", (event) => {
            this._cam.handleInput(event, false);
        });
        // The same goes for requestAnimationFrame.
        window.requestAnimationFrame((time) => {
            this.updateGame(time);
        });
    }

    /**
     * This function is the main game loop.
     * @param theTime {number} - The timestamp of the end of the previous frame.
     */
    updateGame(theTime) {
        this._cam.update((theTime - this._prev_frame) / 1000);
        this._prev_frame = theTime;
        window.requestAnimationFrame((time) => {
            this.updateGame(time);
        });
    }
}
