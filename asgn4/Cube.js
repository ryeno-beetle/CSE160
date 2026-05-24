class Cube {
    constructor(rgba, textureKey, colorTextureRatio = 0, shiny = 0) {
        this.rgba = this.convertRGB(rgba);
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.vertexBuffers = null;
        this.allVertices = []; // list of all vertice lists
        this.textureKey = textureKey;
        this.colorTextureRatio = colorTextureRatio;
        this.shiny = shiny;
        this.makeFaces();
    }

    convertRGB(arr) {
        arr = arr.map((e) => e/255.0);
        arr.push(1);
        return arr;
    }

    // copied from Body.js (sorry..)
    transformVertices(matrix, vertices) {
        for (let i = 0; i < vertices.length; i += 3) {
            let v = new Vector3([vertices[i], vertices[i+1], vertices[i+2]]);
            v = matrix.multiplyVector3(v);
            vertices[i] = v.elements[0];
            vertices[i+1] = v.elements[1];
            vertices[i+2] = v.elements[2];
        }
    }

    setOrigin(point) {
        let m = new Matrix4();
        m.translate(-point[0], -point[1], -point[2]);
        for (let i = 0; i < this.allVertices.length; i++) {
            this.transformVertices(m, this.allVertices[i]);
        }
        let i = 0;
        for (const [f, s] of Object.entries(this.faces)) {
            s.vertices = new Float32Array(this.allVertices[i]);
            i++;
        }
    }

    makeFaces() {
        // front
        let v_front = [
            0, 0, 0,  1, 0, 0,  1, 1, 0,
            0, 0, 0,  1, 1, 0,  0, 1, 0];
        let n_front = [
            0, 0, -1,  0, 0, -1,  0, 0, -1,  
            0, 0, -1,  0, 0, -1,  0, 0, -1];

        // top
        let v_top = [
            0, 1, 0,  0, 1, 1,  1, 1, 1,
            0, 1, 0,  1, 1, 1,  1, 1, 0];
        let n_top = [
            0, 1, 0,  0, 1, 0,  0, 1, 0,  
            0, 1, 0,  0, 1, 0,  0, 1, 0];

        // right side
        let v_right = [
            1, 0, 0,  1, 0, 1,  1, 1, 1,
            1, 0, 0,  1, 1, 1,  1, 1, 0];
        let n_right = [
            1, 0, 0,  1, 0, 0,  1, 0, 0,  
            1, 0, 0,  1, 0, 0,  1, 0, 0];
        
        let v_left = [
            0, 0, 0,  0, 0, 1,  0, 1, 1,
            0, 0, 0,  0, 1, 1,  0, 1, 0];
        let n_left = [
            -1, 0, 0,  -1, 0, 0,  -1, 0, 0,  
            -1, 0, 0,  -1, 0, 0,  -1, 0, 0];

        let v_back = [
            0, 0, 1,  1, 0, 1,  1, 1, 1,
            0, 0, 1,  1, 1, 1,  0, 1, 1];
        let n_back = [
            0, 0, 1,  0, 0, 1,  0, 0, 1,  
            0, 0, 1,  0, 0, 1,  0, 0, 1];
        
        let v_bottom = [
            0, 0, 0,  1, 0, 0,  1, 0, 1,
            0, 0, 0,  1, 0, 1,  0, 0, 1];
        let n_bottom = [
            0, -1, 0,  0, -1, 0,  0, -1, 0,  
            0, -1, 0,  0, -1, 0,  0, -1, 0];

        let uv_coords = [
            0, 0,  1, 0,  1, 1,
            0, 0,  1, 1,  0, 1
        ]
        
        this.allVertices = [v_front, v_top, v_right, v_left, v_back, v_bottom];
        this.faces = {
            front: new Shape(v_front, n_front, uv_coords, this.rgba, this.textureKey, this.colorTextureRatio),
            top: new Shape(v_top, n_top, uv_coords, this.rgba, this.textureKey, this.colorTextureRatio),
            right: new Shape(v_right, n_right, uv_coords, this.rgba, this.textureKey, this.colorTextureRatio),
            left: new Shape(v_left, n_left, uv_coords, this.rgba, this.textureKey, this.colorTextureRatio),
            back: new Shape(v_back, n_back, uv_coords, this.rgba, this.textureKey, this.colorTextureRatio),
            bottom: new Shape(v_bottom, n_bottom, uv_coords, this.rgba, this.textureKey, this.colorTextureRatio),
        }
    }

    render() {
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        if (this.normalMatrix === new Matrix4()) {
            this.normalMatrix.setInverseOf(this.matrix).transpose();
        }

        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);
        
        gl.uniform1i(u_Shiny, this.shiny);
        for (const [f, s] of Object.entries(this.faces)) {
            //console.log(s);
            s.render();
        }
    }

}