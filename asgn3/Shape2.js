class Shape2 {
    constructor(wgl, vertices, rgba) {
        this.wgl = wgl;
        this.rgba = rgba;
        this.vertices = new Float32Array(vertices);
        this.vertexBuffer = null;
    }

    makeGLBuffer3D() {
        // Create a buffer object
        this.vertexBuffer = this.wgl.gl.createBuffer();
       
        if (!this.vertexBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }
    }

    render() {
        if (!this.vertexBuffer) {
            this.makeGLBuffer3D();
        }

        // Enable the assignment to a_Position variable
        this.wgl.gl.enableVertexAttribArray(this.wgl.a_Position);
        
        // Bind the buffer object to target
        this.wgl.gl.bindBuffer(this.wgl.gl.ARRAY_BUFFER, this.vertexBuffer);

        // Write date into the buffer object
        this.wgl.gl.bufferData(this.wgl.gl.ARRAY_BUFFER, this.vertices, this.wgl.gl.STATIC_DRAW);

        // Assign the buffer object to aPosition variable
        this.wgl.gl.vertexAttribPointer(this.wgl.a_Position, 3, this.wgl.gl.FLOAT, false, 0, 0);
        
        // Pass the color of the triangle to u_FragColor variable
        this.wgl.gl.uniform4f(this.wgl.u_FragColor, this.rgba[0], this.rgba[1], this.rgba[2], 1);

        this.wgl.gl.drawArrays(this.wgl.gl.TRIANGLES, 0, this.vertices.length / 3);
    }
}