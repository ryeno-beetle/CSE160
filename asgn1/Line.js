class Line extends Shape {
    constructor(point, size, color) {
        super(point, size / (canvas.width/2), color);
        this.calculateVertices(this.point[0], this.point[1]);
    }

    calculateVertices(x2, y2) {
        // get vector for direction and length of line
        let [x1, y1] = this.point;
        let v1 = new Vector3([x2-x1, y2-y1, 0]);
        // get vector for end of line direction - cross of v1 and <0, 0, 1> to get perpendicular vector
        let v2 = new Vector3([y2-y1, x1-x2, 0]);
        v2.normalize();
        // multiply by size/2 to get vector for one half of the end of line
        v2.mul(this.size/2);

        // vertices in rectangle shape, with ends centered on points
        let newVertices = [
            x1 + v2.elements[0], y1 + v2.elements[1], // bottom left
            x1 - v2.elements[0], y1 - v2.elements[1], // bottom right
            x1 + v1.elements[0] + v2.elements[0], y1 + v1.elements[1] + v2.elements[1], // top left
            x1 + v1.elements[0] - v2.elements[0], y1 + v1.elements[1] - v2.elements[1]]; // top right
        this.vertices = newVertices;
    }

    render(gl, a_Position, u_PointSize, u_FragColor) {
        this.makeGLBuffer(gl, a_Position, new Float32Array(this.vertices));

        // Pass the size of line to u_PointSize variable
        gl.uniform1f(u_PointSize, this.size);
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, this.rgba[0], this.rgba[1], this.rgba[2], this.rgba[3]);
        // Draw
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
}