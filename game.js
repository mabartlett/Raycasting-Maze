/**
 * @file Contains the game class.
 * @author Marcus Bartlett
 */

import { FOV_ID, WIDTH_ID, HEIGHT_ID, CANVAS_ID, SCREEN_MIN, 
         SCREEN_MAX, TEXTURED_ID } from "./main.js";
import Camera from "./camera.js";
import Ray from "./ray.js";
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
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

/** The x-coordinate of where the camera starts. */
const START_X = 7;

/** The y-coordinate of where the camera starts. */
const START_Y = 7;

/** Describes a game class, which starts and updates the game and objects. */
export default class Game {
    /** 
     * Constructs a game instance. 
     * @param {HTMLImageElement} theTexture - The brick texture.
     */
    constructor(theTexture) {
        let w = new World(ROOM);
        let c_x = START_X + 0.5;
        let c_y = START_Y + 0.5;
        let c_a = 0;
        /** The camera that does the looking and--yes--the drawing. */
        this._cam = new Camera(new Ray(c_x, c_y, c_a, w, ROOM.length), 
                               theTexture);
        /** The time at which the previous frame was drawn. */
        this._prev_frame = 0;
    }

    /** Starts the game by adding event listeners and starting the game loop. */
    start() {
        this._cam.updateCanvas();
        this._prev_frame = document.timeline.currentTime;
        /* Note to self: use this pattern when adding event listeners to bind
           "this" to the object containing the event handler. */
        document.addEventListener("keydown", (theEvent) => {
            this._cam.handleInput(theEvent, true);
        });
        document.addEventListener("keyup", (theEvent) => {
            this._cam.handleInput(theEvent, false);
        });
        document.querySelector(`#${FOV_ID}`).
                addEventListener("change", (theEvent) => {
            this._cam.fov = Number(theEvent.target.value);
            this._cam.updateCanvas();
        });
        document.querySelector(`#${WIDTH_ID}`).
                addEventListener("change", (theEvent) => {
            this.changeDimension(Number(theEvent.target.value), "width");
        });
        document.querySelector(`#${HEIGHT_ID}`).
                addEventListener("change", (theEvent) => {
            this.changeDimension(Number(theEvent.target.value), "height");
        });
        document.querySelector(`#${TEXTURED_ID}`).
                addEventListener("change", (theEvent) => {
            if (theEvent.target.checked) {
                this._cam.textured = true;
            } else {
                this._cam.textured = false;
            }
            this._cam.updateCanvas();
        });
        // The same goes for requestAnimationFrame.
        window.requestAnimationFrame((theTime) => {
            this.updateGame(theTime);
        });
    }

    /**
     * This function is the main game loop.
     * @param {number} theTime - The timestamp of the end of the previous frame.
     */
    updateGame(theTime) {
        this._cam.update((theTime - this._prev_frame) / 1000);
        this._prev_frame = theTime;
        window.requestAnimationFrame((theTheTime) => {
            this.updateGame(theTheTime);
        });
    }

    /**
     * Changes the screen dimensions.
     * @param {number} theNum - The new width or height of the screen.
     * @param {string} theDim - Which dimension to change.
     */
    changeDimension(theNum, theDim) {
        if (theNum < SCREEN_MIN) {
            theNum = SCREEN_MIN
        } else if (theNum > SCREEN_MAX) {
            theNum = SCREEN_MAX;
        }
        if (theDim === "width") {
            this._cam.sw = theNum;
        } else if (theDim === "height") {
            this._cam.sh = theNum;
        } else {
            throw new Error("Dimension must be 'width' or 'height.'");
        }
        document.querySelector(`#${CANVAS_ID}`)["style"][theDim] = `${theNum}px`;
        document.querySelector(`#${CANVAS_ID}`).setAttribute(theDim, theNum);
        this._cam.updateCanvas();
    }
}
