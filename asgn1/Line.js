class Line extends Shape {
    constructor(point, size, color) {
        super(point, size, color);
    }

    render(gl, a_Position, u_PointSize, u_FragColor) {
        // disable vertex attrib array
        gl.disableVertexAttribArray(a_Position);
        // Pass the position of a point to a_Position variable
        gl.vertexAttrib3f(a_Position, this.point[0], this.point[1], 0.0);
        // Pass the size of a point to u_PointSize variable
        gl.uniform1f(u_PointSize, this.size);
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, this.rgba[0], this.rgba[1], this.rgba[2], this.rgba[3]);
        // Draw
        gl.drawArrays(gl.LINES, 0, 1);
    }
}