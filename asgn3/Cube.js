class Cube {
    constructor(wgl, rgba) {
        this.wgl = wgl;
        this.rgba = this.convertRGB(rgba);
        this.matrix = new Matrix4();
        this.vertexBuffers = null;
        this.allVertices = []; // list of all vertice lists
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
            0, 0, 0,  1, 1, 0,  1, 0, 0,
            0, 0, 0,  0, 1, 0,  1, 1, 0];

        // top
        let v_top = [
            0, 1, 0,  0, 1, 1,  1, 1, 1,
            0, 1, 0,  1, 1, 1,  1, 1, 0];

        // right side
        let v_right = [
            1, 0, 0,  1, 0, 1,  1, 1, 1,
            1, 0, 0,  1, 1, 1,  1, 1, 0];
        
        let v_left = [
            0, 0, 0,  0, 1, 0,  0, 1, 1,
            0, 0, 0,  0, 1, 1,  0, 0, 1];

        let v_back = [
            0, 0, 1,  1, 0, 1,  1, 1, 1,
            0, 0, 1,  1, 1, 1,  0, 1, 1];
        
        let v_bottom = [
            0, 0, 0,  1, 0, 0,  1, 0, 1,
            0, 0, 0,  1, 0, 1,  0, 0, 1];

        let uv_coords = [
            0, 0,  1, 1,  1, 0,
            0, 0,  0, 1,  1, 1
        ]
        
        this.allVertices = [v_front, v_top, v_right, v_left, v_back, v_bottom];
        this.faces = {
            front: new Shape(this.wgl, v_front, uv_coords, this.rgba.map((c) => { return c * 0.9 })),
            top: new Shape(this.wgl, v_top, uv_coords, this.rgba.map((c) => { return c * 1 })),
            right: new Shape(this.wgl, v_right, uv_coords, this.rgba.map((c) => { return c * 0.8 })),
            left: new Shape(this.wgl, v_left, uv_coords, this.rgba.map((c) => { return c * 0.8 })),
            back: new Shape(this.wgl, v_back, uv_coords, this.rgba.map((c) => { return c * 0.7 })),
            bottom: new Shape(this.wgl, v_bottom, uv_coords, this.rgba.map((c) => { return c * 0.6 })),
        }
    }

    render() {
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        for (const [f, s] of Object.entries(this.faces)) {
            //console.log(s);
            s.render();
        }
    }

}