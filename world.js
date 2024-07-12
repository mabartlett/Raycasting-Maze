/**
 * @file Contains the world class.
 * @author Marcus Bartlett
 */

/** The colors of the world when drawn top-down. */
const TOP_DOWN_COLORS = ["#000000", "#0000ff"];

/** How width and height, in pixels, to draw each square on screen in pixels. */
const DRAW_SIZE = 16;

/** Describes the game world. */
export class World {
    /**
     * Constructs a world.
     * @param {Array} theTilemap - A 2D array of numbers representing the tiles.
     * units.
     */
    constructor(theTilemap) {
        if (theTilemap === null) {
            throw new Error("World constructor passed null argument(s).");
        } else if (!Array.isArray(theTilemap)) {
            throw new Error("World constructor not passed array.");
        } else {
            this._tilemap = new Array(theTilemap.length);
            // Make a deep copy of theTilemap.
            for (let i = 0; i < theTilemap.length; i++) {
                this._tilemap[i] = new Array(theTilemap[i].length);
                for (let j = 0; j < theTilemap[i].length; j++) {
                    this._tilemap[i][j] = theTilemap[i][j];
                }
            }
        }
    }
    
    /**
     * Draws a top-down view of the world to the canvas.
     */
    drawWorld() {
        const canvas = document.querySelector("canvas");
        const ctx = canvas.getContext("2d", {alpha: "false"});
        for (let i = 0; i < this._tilemap.length; i++) {
            for (let j = 0; j < this._tilemap[i].length; j++) {
                if (this._tilemap[i][j] !== 0) {
                    ctx.fillStyle = TOP_DOWN_COLORS[this._tilemap[i][j]];
                    ctx.fillRect(j * DRAW_SIZE, i * DRAW_SIZE, DRAW_SIZE, 
                                 DRAW_SIZE);
                }
            }
        }
    }
    
    /**
     * Checks a coordinate for a wall.
     * @param {number} theX - The x-coordinate to test.
     * @param {number} theY - The y-coordinate to test.
     * @returns {boolean} Whether the coordinate has a wall. Returns false if
     * the provided coordinates are out of bounds.
     */
    checkCollision(theX, theY) {
        let rv = false;
        if (typeof theX !== "number" || typeof theY !== "number") {
            throw new Error("world.checkCollision passed non-numeric" + 
                    "argument.");
        } else {        
            if (theX >= 0 && theY >= 0 && theY < this._tilemap.length && 
                    theX < this._tilemap[0].length &&
                    this._tilemap[Math.floor(theY)][Math.floor(theX)] === 1) {
                rv = true;
            }
        }
        return rv;
    }
    
    /**
     * Determines whether a given circle is colliding with (inside) a wall.
     * @param {number} theX - The x-coordinate of the circle's center.
     * @param {number} theY - The y-coordinate of the circle's center.
     * @param {number} theRad - The circle's radius.
     * @returns {boolean} - Whether the circle is inside a wall.
     */
    checkCollCirc(theX, theY, theRad) {
        let rv = false;
        let i = 0;
        let j = 0;
        let flag = true;
        while (i < this._tilemap.length && flag) {
            j = 0;
            while (j < this._tilemap[i].length && flag) {
                if (this._tilemap[i][j] !== 0) {
                    let x = j;
                    let y = i;
                    let x2 = x + 1;
                    let y2 = y + 1;
                    let between_x = x <= theX && theX <= x2;
                    let between_y = y <= theY && theY <= y2;
                    // If the center is inside the box...
                    if (between_x && between_y) {
                        rv = true;
                        flag = false;
                    // If the circle is less than a radius away from an edge...
                    } else if ((between_x && (Math.abs(y - theY) < theRad || 
                            Math.abs(theY - y2) < theRad)) || 
                            (between_y && (Math.abs(x - theX) < theRad || 
                            Math.abs(theX - x2) < theRad))) {
                        rv = true;
                        flag = false;
                    // Finally, check to see if it's near a corner.
                    } else {
                        let near1 = Math.hypot(x - theX, y - theY) < theRad;
                        let near2 = Math.hypot(x - theX, y2 - theY) < theRad;
                        let near3 = Math.hypot(x2 - theX, y - theY) < theRad;
                        let near4 = Math.hypot(x2 - theX, y2 - theY) < theRad;
                        if (near1 || near2 || near3 || near4) {
                            rv = true;
                            flag = false;
                        }
                    }
                }
                j++;
            }
            i++;
        }
        return rv;
    }
}