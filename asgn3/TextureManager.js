class TextureManager {
    constructor() {
        this.textures = {};
    }

    initTexture(key, path, texUnit, texUnitVar) {
        var image = new Image();  // Create the image object
        if (!image) {
            console.log('Failed to create the image object');
            return false;
        }
        // Register the event handler to be called on loading an image
        image.onload = () => { this.sendTextureToTextureUnit(image, texUnit, texUnitVar); };
        // Tell the browser to load an image
        image.src = path;
        this.textures[key] = texUnit;
        // console.log(this.textures);
        return true;
    }

    sendTextureToTextureUnit(image, texUnit, texUnitVar) {
        var texture = gl.createTexture();   // Create a texture object
        if (!texture) {
            console.log('Failed to create the texture object');
            return false;
        }

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
        // Enable texture unit0
        gl.activeTexture(texUnitVar);
        // Bind the texture object to the target
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set the texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        // Set the texture image
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    }

    setSampler(key) {
        // Set the texture unit 0 to the sampler
        gl.uniform1i(u_Sampler, this.textures[key]);
        // console.log(key);
    }
}