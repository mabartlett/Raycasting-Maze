/**
 * @file Contains the camera class and associated constants.
 * @author Marcus Bartlett
 */

import { CANVAS_ID, SCREEN_MIN, SCREEN_MAX, SCREEN_WIDTH, SCREEN_HEIGHT, 
         FOV_MIN, FOV_MAX} from "./main.js";
import { Ray } from "./ray.js";

/** The colors of the faces of the walls. */
const COLORS = ["#000000", "#004400", "#008800", "#00cc00"];

/** The color of the sky above the horizon. */
const SKY_COLOR = "#00aaff";

/** The color of the ground below the horizon. */
const GROUND_COLOR = "#aaaaaa";

/** The amount the angle changes per second when a key is down. */
const ANGLE_DELTA = Math.PI * 1.25;

/** The camera's speed in tiles per second. */
const POS_DELTA = 1.5;

/** The maximum allowed length of the ray in tiles. */
const DRAW_DISTANCE = 16;

/** The size of the camera's bounding box. */
const BOUND_SIZE = 0.20;

/** The length of world units to "slide" against walls when colliding. */
const SLIDE = 0.0001;

/** Whether to draw a top-down view of the world and rays instead of columns. */
const DEBUG = false;

/** How width and height, in pixels, to draw each square on screen in pixels. */
const DRAW_SIZE = 16;

/** Describes a camera. */
export class Camera {
    /**
     * Constructs a Camera instance.
     * @param {Ray} theRay - The camera's position and angle.
     * @param {HTMLImageElement} theTexture - The brick texture.
     */
    constructor(theRay, theTexture) {
        if (theRay === null) {
            throw new Error("Camera passed null Ray argument.");
        } else if (!(theRay instanceof Ray)) {
            throw new Error("Camera must be passed an object.");
        } else if (!(theTexture instanceof HTMLImageElement)) {
            throw new Error("Camera must be passed HTMLImageElement");
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
            /** The FOV of the camera in degrees. */
            this._fov_d = Math.floor((FOV_MIN + FOV_MAX) / 2);
            /** The screen width in pixels. */
            this._sw = SCREEN_WIDTH;
            /** The screen height in pixels. */
            this._sh = SCREEN_HEIGHT
            /** The brick texture. */
            this._texture = theTexture;
            /** Whether to draw textures (true) or solid colors (false). */
            this._textured = true;
        }
    }

    /** Draws the vertical lines onto the canvas. */
    updateCanvas() {
        const canvas = document.querySelector(`#${CANVAS_ID}`);
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, this._sw, this._sh);
        // Draw a top-down view for debugging.
        if (DEBUG) {
            this._cam_ray.world.drawWorld();
            ctx.fillStyle = "#00ff00";
            ctx.strokeStyle = "#ff0000";
            const x = this._cam_ray.x * DRAW_SIZE;
            const y = this._cam_ray.y * DRAW_SIZE;
            ctx.beginPath();
            ctx.moveTo(x, y);
            const size = DRAW_SIZE * BOUND_SIZE;
            ctx.arc(x, y, DRAW_SIZE * BOUND_SIZE, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + (size * Math.cos(this._cam_ray.theta)),
                      y + (size * Math.sin(this._cam_ray.theta)));
            ctx.stroke();
            // Draw dots where rays hit walls.
            for (let i = 0; i < this._sw; i++) {
                let angle = Math.atan((2 * i / this._sw ) - 1);
                this._draw_ray.theta = angle + this._cam_ray.theta;
                let collision = this._draw_ray.seekCollision();
                let dist = 0;
                if (collision[0] !== null && collision[1] !== null) {                
                    dist = Math.hypot(this._draw_ray.x - collision[0], 
                                      this._draw_ray.y - collision[1]);
                }
                ctx.fillStyle = "#ff0000";
                ctx.fillRect(collision[0] * DRAW_SIZE, collision[1] * DRAW_SIZE, 
                             1, 1);
            }
        // Or draw the actual first-person view for the game.
        } else {
            ctx.fillStyle = SKY_COLOR;
            ctx.fillRect(0, 0, this._sw, this._sh / 2);
            ctx.fillStyle = GROUND_COLOR;
            ctx.fillRect(0, this._sh / 2, this._sw, this._sh / 2);
            ctx.lineWidth = 1;
            const fov_r = (this._fov_d * Math.PI) / 180;
            const vp_disp = 1 / (2 * Math.tan(fov_r / 2));
            // Loop across the width of the screen.
            for (let i = 0; i < this._sw; i++) {
                const angle = Math.atan((i - 0.5 * this._sw) / 
                                        (vp_disp * this._sw));
                this._draw_ray.theta = angle + this._cam_ray.theta;
                const collision = this._draw_ray.seekCollision();
                let dist = 0;
                if (collision[0] !== null && collision[1] !== null) {
                    const x_comp = this._draw_ray.x - collision[0];
                    const y_comp = this._draw_ray.y - collision[1];
                    dist = Math.hypot(x_comp, y_comp);
                }
                // I'm not sure where the 4 came from but it works.
                let line_height = this._sw / (Math.cos(angle) * 4 * dist);
                line_height *= Math.PI / (2 * fov_r);
                // Draw brick wall texture...
                if (this._textured) {
                    let sx = 0;
                    const w = this._texture.naturalWidth;
                    if (collision[2] === 0) {
                        sx = collision[1] - Math.floor(collision[1]);
                        sx = w - Math.ceil(sx * w);
                    } else if (collision[2] === 1) {
                        sx = collision[0] - Math.floor(collision[0]);
                        sx = Math.floor(sx * w);
                    } else if (collision[2] === 2) {
                        sx = collision[1] - Math.floor(collision[1]);
                        sx = Math.floor(sx * w);
                    } else {
                        sx = collision[0] - Math.floor(collision[0]);
                        sx = w - Math.ceil(sx * w);
                    }
                    ctx.drawImage(this._texture, sx, 0, 1, 
                                  this._texture.naturalHeight, i, 
                                  (this._sh / 2) - line_height, 1, 
                                  line_height * 2);
                // ...or draw solid colors.
                } else {
                    ctx.beginPath();
                    ctx.strokeStyle = COLORS[collision[2]];
                    ctx.moveTo(i + 0.5, (this._sh / 2) - line_height);
                    ctx.lineTo(i + 0.5, (this._sh / 2) + line_height);
                    ctx.stroke();
                }
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
            this.updateCanvas();
        }
        if (this._keymap["ArrowRight"]) {
            this._cam_ray.theta += ANGLE_DELTA * theDelta;
            this.updateCanvas();
        }
        if (this._keymap["ArrowUp"]) {
            let x_comp = POS_DELTA * theDelta * (Math.cos(this._cam_ray.theta));
            let y_comp = POS_DELTA * theDelta * (Math.sin(this._cam_ray.theta));
            this.move(x_comp, y_comp);
            this.updateCanvas();
        }
        if (this._keymap["ArrowDown"]) {
            let x_comp = -POS_DELTA * theDelta * (Math.cos(this._cam_ray.theta));
            let y_comp = -POS_DELTA * theDelta * (Math.sin(this._cam_ray.theta));
            this.move(x_comp, y_comp);
            this.updateCanvas();
        }
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
        // If the new position is not free...
        if (w.checkCollCirc(this.x + theX, this.y + theY, BOUND_SIZE)) {
            // Find the position where the bounding box no longer collides.
            let t_x = 0;
            let t_y = 0;
            let x_flag = true;
            let y_flag = true;
            while (x_flag || y_flag) {
                let u = SLIDE * Math.sign(theX);
                let v = SLIDE * Math.sign(theY);
                if (u != 0 && Math.abs(t_x + u) <= Math.abs(theX) &&
                        !w.checkCollCirc(this.x + t_x + u, this.y + t_y, 
                        BOUND_SIZE)) {
                    t_x += u;
                } else {
                    x_flag = false;
                }
                if (v != 0 && Math.abs(t_y + v) <= Math.abs(theY) &&
                        !w.checkCollCirc(this.x + t_x, this.y + t_y + v, 
                        BOUND_SIZE)) {
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

    /** @param theFov {number} - The new FOV (in degrees). */
    set fov(theFov) {
        if (isNaN(theFov) || theFov < FOV_MIN || theFov > FOV_MAX) {
            this._fov_d = Math.floor((FOV_MIN + FOV_MAX) / 2);
        } else {
            this._fov_d = Math.floor(theFov);
        }
    }

    /** @param theSw {number} - The new screen width (in pixels). */
    set sw(theSw) {
        if (isNaN(theSw) || theSw < SCREEN_MIN || theSw > SCREEN_MAX) {
            this._sw = SCREEN_WIDTH;
        } else {
            this._sw = theSw;
        }
    }

    /** @param theSh {number} - The new screen height (in pixels). */
    set sh(theSh) {
        if (isNaN(theSh) || theSh < SCREEN_MIN || theSh > SCREEN_MAX) {
            // TODO: Update to scale with window.visualViewport.width
            this._sh = SCREEN_HEIGHT;
        } else {
            this._sh = theSh;
        }
    }

    /** @param {boolean} theTextured - Whether the game is drawn with textures. */
    set textured(theTextured) {
        if (typeof theTextured !== "boolean") {
            throw new Error("Type must be boolean.");
        } else {
            this._textured = theTextured;
        }
    }
}
