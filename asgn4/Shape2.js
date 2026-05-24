class Shape2 {
    constructor(vertices, normals, rgba) {
        this.rgba = rgba;
        this.vertices = new Float32Array(vertices);
        this.normals = new Float32Array(normals);
        this.uvCoords = new Float32Array(this.vertices.slice(0, 2 * (this.vertices.length / 3)));
        this.vertexBuffer = null;
        this.normalBuffer = null;
        this.uvBuffer = null;
    }

    makeGLBuffer3D() {
        // Create a buffer object
        this.vertexBuffer = gl.createBuffer();
       
        if (!this.vertexBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }

        this.normalBuffer = gl.createBuffer();
       
        if (!this.normalBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }

        this.uvBuffer = gl.createBuffer();
       
        if (!this.uvBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }
    }

    render() {
        if (!this.vertexBuffer) {
            this.makeGLBuffer3D();
        }

        // VERTICE POSITION
        // Bind the buffer object to target and Write date into the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
        // Enable the assignment to a_Position 
        gl.enableVertexAttribArray(a_Position);
        // Assign the buffer object to aPosition
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

        // NORMALS
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(a_Normal);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);

        // normals on
        gl.uniform1f(u_NormalsOn, g_normalOn);

        // UV COORDS
        // Bind the buffer object to target and Write date into the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.uvCoords, gl.DYNAMIC_DRAW);
        // Enable the assignment to a_UVCoord
        gl.enableVertexAttribArray(a_UVCoord);
        // Assign the buffer object to a_UVCoord
        gl.vertexAttribPointer(a_UVCoord, 2, gl.FLOAT, false, 0, 0);

        // default texture since it won't matter
        tex.setSampler(Object.keys(tex.textures)[0]);
        // Pass the color/texture weight to u_texColorWeight variable
        gl.uniform1f(u_texColorWeight, 0);

        // Pass the color to u_FragColor variable
        gl.uniform4f(u_FragColor, this.rgba[0], this.rgba[1], this.rgba[2], 1);

        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
    }
}