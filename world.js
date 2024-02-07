/**
 * @file Contains the world class.
 * @author Marcus Bartlett
 */

/** The colors of the world when drawn top-down. */
const TOP_DOWN_COLORS = ["#000000", "#0000ff"];

/** Describes the game world. */
export default class World {
    /**
     * Constructs a world.
     * @param theTilemap {Array} - A 2D array of numbers representing the tiles.
     * @param theSize {Number} - The "resolution" of each tile in world 
     * units.
     */
    constructor(theTilemap, theSize) {
        if (theTilemap === null || theSize === null) {
            throw new Error("World constructor passed null argument(s).");
        } else if (!Array.isArray(theTilemap)) {
            throw new Error("World constructor not passed array.");
        } else if (typeof theSize !== "number") {
            throw new Error("World constructor not passed number.");
        } else {
            this._tilemap = new Array(theTilemap.length * theSize);
            this._tilesize = theSize;
            /** Warning: this field is a reference! */
            this._array = theTilemap;
            for (let i = 0; i < theTilemap.length; i++) {
                if (theTilemap[i].length != theTilemap[0].length) {
                    throw new Error("World constructor passed a jagged array.");
                } else {
                    // Form the first of a set of new rows.
                    this._tilemap[i * theSize] = new Array(theTilemap[i].length * 
                            theSize);
                    for (let j = 0; j < theTilemap[i].length; j++) {
                        for (let k = 0; k < theSize; k++) {
                            this._tilemap[i * theSize][j * theSize + k] = 
                                    theTilemap[i][j];
                        }
                    }
                    // Duplicate that row.
                    for (let j = i * theSize + 1; j < (i + 1) * theSize; j++) {
                        this._tilemap[j] = new Array(this._tilemap[0].length);
                        for (let k = 0; k < this._tilemap[0].length; k++) {
                            this._tilemap[j][k] = this._tilemap[j - 1][k];
                        }
                    }
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
        const s = this._tilesize;
        for (let i = 0; i < this._array.length; i++) {
            for (let j = 0; j < this._array[i].length; j++) {
                if (this._array[i][j] !== 0) {
                    ctx.fillStyle = TOP_DOWN_COLORS[this._array[i][j]];
                    ctx.fillRect(j * s, i * s, s, s);
                }
            }
        }
    }
    
    /**
     * Checks a coordinate for a wall.
     * @param theX {number} - The x-coordinate to test.
     * @param theY {number} - The y-coordinate to test.
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
     * @param theX {number} - The x-coordinate of the circle's center.
     * @param theY {number} - The y-coordinate of the circle's center.
     * @param theRad {number} - The circle's radius.
     * @returns {boolean} - Whether the circle is inside a wall.
     */
    checkCollCirc(theX, theY, theRad) {
        let rv = false;
        let i = 0;
        let j = 0;
        let flag = true;
        while (i < this._array.length && flag) {
            j = 0;
            while (j < this._array[i].length && flag) {
                if (this._array[i][j] !== 0) {
                    let x = j * this._tilesize;
                    let y = i * this._tilesize;
                    let x2 = x + this._tilesize;
                    let y2 = y + this._tilesize;
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
    
    /** @returns {number} - The tilesize. */
    get tilesize() {
        return this._tilesize;
    }
}