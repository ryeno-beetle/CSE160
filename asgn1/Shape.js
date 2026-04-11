class Shape {
    constructor(point, size, rgba) {
        this.point = point;
        this.size = size;
        this.rgba = rgba;
        this.vertices = point;
    }

    makeGLBuffer(gl, a_Position, vertices) {
        // Create a buffer object
        var vertexBuffer = gl.createBuffer();
        if (!vertexBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }

        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        // Write date into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

        // Assign the buffer object to a_Position variable
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

        // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);
    }

    drawTriangle(gl, a_Position, u_PointSize, u_FragColor, triVertices) {
        let vertices = new Float32Array(triVertices);

        this.makeGLBuffer(gl, a_Position, vertices);

        // Pass the size of a point to u_PointSize variable
        gl.uniform1f(u_PointSize, this.size);
        // Pass the color of the triangle to u_FragColor variable
        gl.uniform4f(u_FragColor, this.rgba[0], this.rgba[1], this.rgba[2], this.rgba[3]);
        // draw triangle
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
}