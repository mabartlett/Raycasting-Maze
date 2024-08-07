/**
 * @file Contains the ray class.
 * @author Marcus Bartlett
 */

import { World } from "./world.js";

/** The color of the ray when drawn with drawRay. */
const COLOR = "#00ff00";

/** A class describing a ray. */
export class Ray {
    /**
     * Constructs a Ray object.
     * @param theX {number} - The tail's x-coordinate.
     * @param theY {number} - The tail's y-coordinate.
     * @param theTheta {number} - The ray's angle in radians.
     * @param theWorld {World} - The game world.
     * @param theDist {number} - The length of the ray.
     */
    constructor(theX, theY, theTheta, theWorld, theDist) {
        if (theX === null || theY === null || theTheta === null ||
                theWorld === null) {
            throw new Error("Ray passed null argument.");
        } else if (typeof theX !== "number") {
            throw new Error("Ray's constructor passed non-numeric x-value");
        } else if (typeof theY !== "number") {
            throw new Error("Ray's constructor passed non-numeric y-value");
        } else if (typeof theTheta !== "number") {
            throw new Error("Ray passed non-numeric theta value.");
        } else if (!(theWorld instanceof World)) {
            throw new Error("Ray not passed a World-type argument.");
        } else {
            this._x = theX;
            this._y = theY;
            this._theta = theTheta;
            this._world = theWorld;
            this._dist = theDist;
        }
    }

    /** Draws a top-down representation of the ray to the canvas */
    drawRay() {
        const canvas = document.querySelector("canvas");
        const ctx = canvas.getContext("2d", {alpha: "false"});
        ctx.beginPath();
        ctx.strokeStyle = COLOR;
        ctx.moveTo(this._x + 0.5, this._y + 0.5);
        const x2 = this._x + this._dist * Math.cos(this._theta);
        const y2 = this._y + this._dist * Math.sin(this._theta);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    /**
     * The big one. Checks where the ray first collides with a wall.
     * @returns A three-element array in which the first two elements are the x-
     * and y-coordinates (these coordinates are in global space) of where the
     * ray collides with a wall and the third element is a number representing
     * the face of the wall that the ray hit:
     * _3_
     * 2█0
     * _1_
     * If there is no collision, all elements will be null.
     */
    seekCollision() {
        let rv_x = null;
        let rv_y = null
        let rv_face = null;
        let short_flag = true;
        let collide_flag = false;
        let tip_x = this._x;
        let tip_y = this._y;
        const sign_sin = Math.sign(Math.sin(this._theta));
        const sign_cos = Math.sign(Math.cos(this._theta));
        let distance = 0;
        let test_x = 0;
        let test_y = 0;
        while (short_flag && !collide_flag) {
            let x_near = this.nearestGrid(tip_x, tip_y, this._theta, false);
            let y_near = this.nearestGrid(tip_x, tip_y, this._theta, true);
            let x_dist = Math.hypot(tip_x - x_near[0], tip_y - x_near[1]);
            let y_dist = Math.hypot(tip_x - y_near[0], tip_y - y_near[1]);
            if (y_dist === 0 || x_dist < y_dist) {
                tip_x = x_near[0];
                tip_y = x_near[1];
                distance += x_dist;
            } else {
                tip_x = y_near[0];
                tip_y = y_near[1];
                distance += y_dist;
            }
            if (distance >= this._dist) {
                short_flag = false;
            } else {
                /* This system of rounding is in place to prevent rays from
                 * skipping over wall corners. One must be subtracted in 
                 * some directions to prevent the wrong square from being
                 * checked. */
                if (sign_cos === -1) {
                    test_x = Math.ceil(tip_x - 1);
                } else {
                    test_x = Math.floor(tip_x);
                }
                if (sign_sin === -1) {
                    test_y = Math.ceil(tip_y - 1);
                } else {
                    test_y = Math.floor(tip_y);
                }
                if (this._world.checkCollision(test_x, test_y)) {
                    rv_x = tip_x;
                    rv_y = tip_y;
                    rv_face = this.determineFace(tip_x, tip_y, sign_cos, 
                                                 sign_sin);
                    collide_flag = true;
                }
            }
        }
        return [rv_x, rv_y, rv_face];
    }
    
    /*
     * A helper function that determines which face of a wall the ray hit. (Note
     * that the x- and y-coordinates supplied here are where the tip actually is
     * and not where the ray is checking for collisions.)
     * @param theX {number} - The x-coordinate of the ray's tip.
     * @param theY {number} - The y-coordinate of the ray's tip.
     * @param theSignCos {number} - The sign of the cosine of the ray's angle.
     * @param theSignSin {number} - The sign of the sine of the ray's angle.
     * @return {number} - A number representing the face of the wall (see 
     * documentation for seekCollision for details).
     */
    determineFace(theX, theY, theSignCos, theSignSin) {
        let rv = 0;
        if (typeof theX !== "number" || typeof theY !== "number" || 
                typeof theSignCos !== "number" || 
                typeof theSignSin !== "number") {
            throw new Error("determineFace must be passed only numeric types.");
        } else if (theSignCos !== -1 && theSignCos !== 0 && theSignCos !== 1) {
            throw new Error("theSignCos must equal -1, 0, or 1");
        } else if (theSignSin !== -1 && theSignSin !== 0 && theSignSin !== 1) {
            throw new Error("theSignSin must equal -1, 0, or 1");
        } else if (Number.isInteger(theX) && Number.isInteger(theY)) {
            if (this._world.checkCollision(theX, theY)) {
                if (this._world.checkCollision(theX - 1, theY)) {
                    rv = 3;
                } else {
                    rv = 2;
                }
            } else {
                if (this._world.checkCollision(theX - 1, theY)) {
                    rv = 0;
                } else {
                    rv = 1;
                }
            }
        } else if (Number.isInteger(theX)) {            
            if (theSignCos === -1) {
                rv = 0;
            } else {
                rv = 2;
            }
        } else if (Number.isInteger(theY)) {
            if (theSignSin === -1) {
                rv = 1
            } else {
                rv = 3;
            }
        }
        return rv;
    }

    /** 
     * Finds the ray's nearest intersection with the grid.
     * @param theX {number} - The tip's current x-coordinate.
     * @param theY {number} - The tip's current y-coordinate.
     * @param theTheta {number} - The ray's angle in radians.
     * @param theYSnap {boolean} - Whether to snap to the y-coordinate.
     * @returns {number[]} - A length 2 array for the intersecting coordinates.
     */
    nearestGrid(theX, theY, theTheta, theYSnap) {
        let rv_x = theX;
        let rv_y = theY;
        const b = (theY - Math.tan(theTheta) * theX);
        const sin = Math.sin(theTheta);
        const cos = Math.cos(theTheta);
        if (theYSnap) {
            if (Number.isInteger(theY)) {
                rv_y = theY + Math.sign(sin);
            } else {
                if (sin < 0) {
                    rv_y = Math.floor(theY);
                } else {
                    rv_y = Math.ceil(theY);
                }
            }
            if (!Number.isInteger(theY) || theTheta != 0) {
                rv_x = (rv_y - b) / Math.tan(theTheta);
            }
        } else {
            if (Number.isInteger(theX)) {
                rv_x = theX + Math.sign(cos);
            } else {
                if (cos < 0) {
                    rv_x = Math.floor(theX);
                } else {
                    rv_x = Math.ceil(theX);
                }
            }
            rv_y = (Math.tan(theTheta) * rv_x) + b;
        }
        return [rv_x, rv_y];
    }

    /** @returns {number} The ray's angle. */
    get theta() {
        return this._theta;
    }

    /**
     * Sets the ray's angle.
     * @param theTheta {number} - The new angle value in radians.
     */
    set theta(theTheta) {
        if (typeof theTheta !== "number") {
            throw new Error("A ray's angle must be a number.");
        } else {
            this._theta = theTheta;
        }
    }

    /** @returns {number} The x-coordinate. */
    get x() {
        return this._x;
    }

    /**
     * Sets the new x-coordinate.
     * @param theX {number} - The new x-coordinate.
     */
    set x(theX) {
        if (typeof theX !== "number") {
            throw new Error("Ray's new x value assigned non-numeric type.");
        } else {
            this._x = theX;
        }
    }

    /** @returns {number} The y-coordinate. */
    get y() {
        return this._y;
    }

    /**
     * Sets the new y-coordinate.
     * @param theY {number} - The new y-coordinate.
     */
    set y(theY) {
        if (typeof theY !== "number") {
            throw new Error("Ray's new y value assigned non-numeric type.");
        } else {
            this._y = theY;
        }
    }

    /** @returns {World} The world. */
    get world() {
        return this._world;
    }

    /** @returns {number} The draw distance. */
    get dist() {
        return this._dist;
    }
}
