/**
 * @file Contains the camera class and associated constants.
 * @author Marcus Bartlett
 */

import { CANVAS_ID, SCREEN_WIDTH, SCREEN_HEIGHT, TILE_SIZE } from "./main.js";
import Ray from "./ray.js";

/** The colors of the faces of the walls. */
const COLORS = ["#000000", "#004400", "#008800", "#00cc00"];

/** The amount the angle changes per second when a key is down. */
const ANGLE_DELTA = Math.PI;

/** The amount the position changes per second when a key is down. */
const POS_DELTA = 24;

/** The maximum allowed length of the ray in world units. */
const DRAW_DISTANCE = 256;

/** The ratio of tilesize to bounding box radius. */
const BOUND_RATIO = 0.3;

/** The length of world units to "slide" out of collision boundaries. */
const SLIDE = 0.1;

/** Whether to draw a top-down view of the world and rays instead of columns. */
const DEBUG = true;

/** Describes a camera. */
export default class Camera {
    /**
     * Constructs a Camera instance.
     * @param theRay {Ray} - The camera's position and angle.
     */
    constructor(theRay) {
        if (theRay === null) {
            throw new Error("Camera's constructor passed null Ray argument.");
        } else if (typeof theRay !== "object") {
            throw new Error("Camera's contructor must be passed an object.");
        } else {
            /** The camera's position and rotation. */
            this._cam_ray = theRay;
            /** The ray that loops across the screen to draw the columns. */
            this._draw_ray = new Ray(theRay.x, theRay.y, theRay.theta,
                    theRay.world, DRAW_DISTANCE);
            /**
             * Since the camera is the only object responding to keyboard input,
             * I thought I'd get away with putting this here.
             */
            this._keymap = {"ArrowLeft": false, "ArrowUp": false,
                            "ArrowRight": false, "ArrowDown": false};
        }
    }

    /** Draws the vertical lines onto the canvas. */
    updateCanvas() {
        const canvas = document.querySelector(`#${CANVAS_ID}`);
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        if (DEBUG) {
            this._cam_ray.world.drawWorld();
            ctx.fillStyle = "#00ff00";
            ctx.strokeStyle = "#ff0000";
            ctx.beginPath();
            ctx.moveTo(this._cam_ray.x, this._cam_ray.y);
            let size = this._cam_ray.world.tilesize * BOUND_RATIO;
            ctx.arc(this._cam_ray.x, this._cam_ray.y,
                    this._cam_ray.world.tilesize * BOUND_RATIO, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(this._cam_ray.x, this._cam_ray.y);
            ctx.lineTo(this._cam_ray.x + (size * Math.cos(this._cam_ray.theta)),
                    this._cam_ray.y + (size * Math.sin(this._cam_ray.theta)));
            ctx.stroke();
            // Draw dots where rays hit walls.
            const w_to_px = SCREEN_WIDTH / TILE_SIZE;
            for (let i = 0; i < SCREEN_WIDTH; i++) {
                let nmtor = i - (0.5 * SCREEN_WIDTH);
                let angle = Math.atan(nmtor / (0.5 * TILE_SIZE * w_to_px));
                this._draw_ray.theta = angle + this._cam_ray.theta;
                let collision = this._draw_ray.seekCollision();
                let distance = 0;
                if (collision[0] !== null && collision[1] !== null) {                
                    distance = Math.hypot(this._draw_ray.x - collision[0], 
                            this._draw_ray.y - collision[1]);
                }
                ctx.fillStyle = "#ff0000";
                ctx.fillRect(collision[0], collision[1], 1, 1);
            }
        } else {
            ctx.fillStyle = "#aaaaaa";
            ctx.fillRect(0, SCREEN_HEIGHT / 2, SCREEN_WIDTH, SCREEN_HEIGHT / 2);
            ctx.lineWidth = 1;
            // The conversion multiplier for world units to screen pixels.
            const w_to_px = SCREEN_WIDTH / TILE_SIZE;
            // Loop across the width of the screen.
            for (let i = 0; i < SCREEN_WIDTH; i++) {
                const nmtor = i - (0.5 * SCREEN_WIDTH);
                const angle = Math.atan(nmtor / (0.5 * TILE_SIZE * w_to_px));
                this._draw_ray.theta = angle + this._cam_ray.theta;
                const collision = this._draw_ray.seekCollision();
                let distance = 0;
                if (collision[0] !== null && collision[1] !== null) {
                    const x_comp = this._draw_ray.x - collision[0];
                    const y_comp = this._draw_ray.y - collision[1];
                    distance = Math.hypot(x_comp, y_comp);
                }
                // I'm not sure where the 4 came from but it works.
                const line_height = SCREEN_WIDTH * TILE_SIZE / 
                        (Math.cos(angle) * 4 * distance);
                ctx.beginPath();
                ctx.strokeStyle = COLORS[collision[2]];
                ctx.moveTo(i + 0.5, (SCREEN_HEIGHT / 2) - line_height);
                ctx.lineTo(i + 0.5, (SCREEN_HEIGHT / 2) + line_height);
                ctx.stroke();
            }
        }
    }

    /**
     * Handles input.
     * @param theEvent {Event} - The event that this function is handling.
     * @param theBool {boolean} - Whether the key was pressed (true) or released
     * (false).
     */
    handleInput(theEvent, theBool) {
        if (theEvent.key in this._keymap) {
            theEvent.preventDefault();
            this._keymap[theEvent.key] = theBool;
        }
    }

    /**
     * Called every frame.
     * @param theDelta {number} - The time (in seconds) since the last frame.
     */
    update(theDelta) {
        // Handle input.
        if (this._keymap["ArrowLeft"]) {
            this._cam_ray.theta -= ANGLE_DELTA * theDelta;
        }
        if (this._keymap["ArrowRight"]) {
            this._cam_ray.theta += ANGLE_DELTA * theDelta;
        }
        if (this._keymap["ArrowUp"]) {
            let x_comp = POS_DELTA * (Math.cos(this._cam_ray.theta)) * theDelta;
            let y_comp = POS_DELTA * (Math.sin(this._cam_ray.theta)) * theDelta;
            this.move(x_comp, y_comp);
        }
        if (this._keymap["ArrowDown"]) {
            let x_comp = -POS_DELTA * (Math.cos(this._cam_ray.theta)) * theDelta;
            let y_comp = -POS_DELTA * (Math.sin(this._cam_ray.theta)) * theDelta;
            this.move(x_comp, y_comp);
        }
        // Draw screen.
        this.updateCanvas();
    }

    /**
     * Moves the camera to a new position relative to its current one.
     * @param theX {number} - The displacement on the x-axis.
     * @param theY {number} - The displacement on the y-axis.
     */
    move(theX, theY) {
        if (typeof(theX) !== "number" || typeof(theY) !== "number") {
            throw new Error("Camera.move passed non-numeric type.");
        } else if (theX === null || theY === null) {
            throw new Error("Camera.move passed null type.");
        }
        // Give world an alias for more readable code.
        const w = this._cam_ray.world;
        const size = w.tilesize * BOUND_RATIO;
        // If the new position is not free...
        if (w.checkCollCirc(this.x + theX, this.y + theY, size)) {
            // Find the position where the bounding box no longer collides.
            let t_x = 0;
            let t_y = 0;
            let x_flag = true;
            let y_flag = true;
            while (x_flag || y_flag) {
                let u = SLIDE * Math.sign(theX);
                let v = SLIDE * Math.sign(theY);
                if (u != 0 && Math.abs(t_x + u) <= Math.abs(theX) &&
                        !w.checkCollCirc(this.x + t_x + u, this.y + t_y, size)) {
                    t_x += u;
                } else {
                    x_flag = false;
                }
                if (v != 0 && Math.abs(t_y + v) <= Math.abs(theY) &&
                        !w.checkCollCirc(this.x + t_x, this.y + t_y + v, size)) {
                    t_y += v;
                } else {
                    y_flag = false;
                }
            }
            // Move to that position.
            this.x += t_x;
            this.y += t_y;
        // If the new position is free...
        } else {
            this.x += theX;
            this.y += theY;
        }
    }

    /** @returns The camera's x-coordinate. */
    get x() {
        return this._cam_ray.x;
    }

    /** @param theX {number} - The new x-coordinate. */
    set x(theX) {
        this._cam_ray.x = theX;
        this._draw_ray.x = theX;
    }

    /** @returns The camera's y-coordinate. */
    get y() {
        return this._cam_ray.y;
    }

    /** @param theY {number} - The new y-coordinate. */
    set y(theY) {
        this._cam_ray.y = theY;
        this._draw_ray.y = theY;
    }

    debugFunction() {
        const w_to_px = SCREEN_WIDTH / TILE_SIZE;
        console.clear(); 
        for (let i = 0; i < SCREEN_WIDTH; i++) {
            let nmtor = i - (0.5 * SCREEN_WIDTH);
            let angle = Math.atan(nmtor / (0.5 * TILE_SIZE * w_to_px));
            this._draw_ray.theta = angle + this._cam_ray.theta;
            const collision = this._draw_ray.seekCollision();
            const snap = this._draw_ray.nearestGrid();
            console.log(`face: ${collision[2]}, ` + 
                        `x: ${collision[0]}, y: ${collision[1]}`);
        }
    }
}
