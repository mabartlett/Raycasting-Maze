/**
 * @file Contains the ray class.
 * @author Marcus Bartlett
 */

/** The color of the ray when drawn with drawRay. */
const COLOR = "#00ff00";

/** A class describing a ray. */
export default class Ray {
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
        } else if (typeof theWorld !== "object" &&
                (!theWorld.hasOwnProperty("tilemap"))) {
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
        // Horizontal multiplier
        let hm = 1;
        // Vertical multiplier
        let vm = 1;
        let tan_tot = 0;
        let cot_tot = 0;
        let short_flag = true;
        let collide_flag = false;
        let tip_x = this._x;
        let tip_y = this._y;
        let abs_tan = Math.abs(Math.tan(this._theta));
        let sign_sin = Math.sign(Math.sin(this._theta));
        let abs_cot = Math.abs(1 / Math.tan(this._theta));
        let sign_cos = Math.sign(Math.cos(this._theta));
        let tan_hyp = Math.sqrt(1 + (abs_tan ** 2));
        let cot_hyp = Math.sqrt(1 + (abs_cot ** 2));
        while (short_flag && !collide_flag) {
            while (tan_tot + tan_hyp <= cot_tot + cot_hyp && short_flag &&
                    !collide_flag) {
                // Add new segment one horizontal unit long and tan(θ) high.
                tip_x = this._x + (hm * sign_cos);
                tip_y = this._y + (hm * abs_tan * sign_sin);
                hm++;
                tan_tot += tan_hyp;
                // Check for length and collision.
                if (tan_tot + 1 >= this._dist) {
                    short_flag = false;
                } else if (this._world.checkCollision(tip_x + sign_cos, tip_y)) {
                    rv_x = tip_x + sign_cos;
                    rv_y = tip_y;
                    rv_face = 2;
                    if (sign_cos === -1) {
                        rv_face = 0;
                    }
                    collide_flag = true;
                }
            }
            while (cot_tot + cot_hyp <= tan_tot + tan_hyp && short_flag &&
                    !collide_flag) {
                // Add new segment one vertical unit high and cot(θ) long.
                tip_x = this._x + (vm * abs_cot * sign_cos);
                tip_y = this._y + (vm * sign_sin);
                vm++;
                cot_tot += cot_hyp;
                // Check for length and collision.
                if (cot_tot + 1 >= this._dist) {
                    short_flag = false;
                } else if (this._world.checkCollision(tip_x, tip_y + sign_sin)) {
                    rv_x = tip_x;
                    rv_y = tip_y + sign_sin;
                    rv_face = 3;
                    if (sign_sin === -1) {
                        rv_face = 1;
                    }
                    collide_flag = true;
                }
            }
        }
        return [rv_x, rv_y, rv_face];
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
