class Shape {
    constructor(wgl, vertices, uvCoords, rgba) {
        this.wgl = wgl;
        this.rgba = rgba;
        this.vertices = new Float32Array(vertices);
        this.uvCoords = new Float32Array(uvCoords);
        this.vertexBuffer = null;
        this.uvBuffer = null;
        this.initTextures();
    }

    initBuffers() {
        this.vertexBuffer = gl.createBuffer();
        this.uvBuffer = gl.createBuffer();

        if (!this.vertexBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }
        if (!this.uvBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }
    }

    initTextures() {
        var image = new Image();  // Create the image object
        if (!image) {
            console.log('Failed to create the image object');
            return false;
        }
        // Register the event handler to be called on loading an image
        image.onload = () => { this.sendTextureToTEXTURE0(image); };
        // Tell the browser to load an image
        image.src = 'theodore.png';

        return true;
    }

    sendTextureToTEXTURE0(image) {
        var texture = gl.createTexture();   // Create a texture object
        if (!texture) {
            console.log('Failed to create the texture object');
            return false;
        }

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
        // Enable texture unit0
        gl.activeTexture(gl.TEXTURE0);
        // Bind the texture object to the target
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set the texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        // Set the texture image
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        
        // Set the texture unit 0 to the sampler
        gl.uniform1i(u_Sampler, 0);
    }

    sendDataToWebGL() {
        // VERTICE POSITION
        // Bind the buffer object to target and Write date into the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
        // Enable the assignment to a_Position 
        gl.enableVertexAttribArray(a_Position);
        // Assign the buffer object to aPosition
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

        // UV COORDS
        // Bind the buffer object to target and Write date into the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.uvCoords, gl.DYNAMIC_DRAW);
        // Enable the assignment to a_UVCoord
        gl.enableVertexAttribArray(a_UVCoord);
        // Assign the buffer object to a_UVCoord
        gl.vertexAttribPointer(a_UVCoord, 2, gl.FLOAT, false, 0, 0);

        // Pass the color to u_FragColor variable
        gl.uniform4f(u_FragColor, this.rgba[0], this.rgba[1], this.rgba[2], 1);
        
        // Pass the color/texture weight to u_texColorWeight variable
        gl.uniform1f(u_texColorWeight, 0.5);
    }

    render() {
        if (!this.vertexBuffer) {
            this.initBuffers();
        }
        this.sendDataToWebGL();
        gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3);
    }
}