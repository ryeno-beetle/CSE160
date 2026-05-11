class Ray {
    constructor(delta_x, delta_y, delta_z, x, y, z, step) {
        this.delta_x = delta_x;
        this.delta_y = delta_y;
        this.delta_z = delta_z;
        this.x = x;
        this.y = y;
        this.z = z;
        // console.log(this.y);
        this.step = step;
    }
    

    getPointFromX(x) {
        let t = (x - this.x) / this.delta_x;
        console.log(t);
        console.log(this.y);
        let y = this.y + (this.delta_y * t);
        let z = this.z + (this.delta_z * t);
        return ([x, y, z]);
    }
    getPointFromY(y) {
        let t = (y - this.y) / this.delta_y;
        let x = this.x + (this.delta_x * t);
        let z = this.z + (this.delta_z * t);
        return ([x, y, z]);
    }
    getPointFromZ(z) {
        let t = (z - this.z) / this.delta_z;
        let x = this.x + (this.delta_x * t);
        let y = this.y + (this.delta_y * t);
        return ([x, y, z]);
    }

    getPoint() {
        return ([this.x, this.y, this.z]);
    }
    setPoint(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}