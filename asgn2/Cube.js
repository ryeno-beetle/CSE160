class Cube {
    constructor(wgl, rgba) {
        this.wgl = wgl;
        this.rgba = rgba;
        this.matrix = new Matrix4();
        this.vertexBuffers = null;
        this.makeFaces();
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

        // side
        let v_right = [
            1, 0, 0,  1, 0, 1,  1, 1, 1,
            1, 0, 0,  1, 1, 1,  1, 1, 0];
        
        this.faces = {
            front: new Polygon(this.wgl, v_front, this.rgba.map((c) => { return c * 0.9 })),
            top: new Polygon(this.wgl, v_top, this.rgba.map((c) => { return c * 0.7 })),
            right: new Polygon(this.wgl, v_right, this.rgba.map((c) => { return c * 0.8 }))
        }
        // let v = [
        //     // FRONT
        //     0, 0, 0,  1, 1, 0,  1, 0, 0,
        //     0, 0, 0,  0, 1, 0,  1, 1, 0,
        //     // TOP
        //     0, 1, 0,  0, 1, 1,  1, 1, 1,
        //     0, 1, 0,  1, 1, 1,  1, 1, 0,
        //     // SIDE
        //     1, 0, 0,  1, 0, 1,  1, 1, 1,
        //     1, 0, 0,  1, 1, 1,  1, 1, 0
        // ]
    }

    render() {
        this.wgl.gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        for (const [f, s] of Object.entries(this.faces)) {
            //console.log(s);
            s.render();
        }
    }

}