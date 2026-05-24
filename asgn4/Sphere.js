class Sphere {
    constructor(rgba, shiny = 0) {
        this.rgba = this.convertRGB(rgba);
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.vertexBuffers = null;
        this.makeFaces();
        this.shiny = shiny;
        this.allVertices = [this.vertices];
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
        this.vertices = [];
        let d = Math.PI / 10;
        let dd = Math.PI / 10;

        for (let t=0; t < Math.PI; t += d) {
            for (let p = 0; p < 2*Math.PI; p += d) {
                let p1 = [Math.sin(t) * Math.cos(p), Math.sin(t) * Math.sin(p), Math.cos(t)];
                let p2 = [Math.sin(t + dd) * Math.cos(p), Math.sin(t + dd) * Math.sin(p), Math.cos(t + dd)];
                let p3 = [Math.sin(t) * Math.cos(p + dd), Math.sin(t) * Math.sin(p + dd), Math.cos(t)];
                let p4 = [Math.sin(t + dd) * Math.cos(p + dd), Math.sin(t + dd) * Math.sin(p + dd), Math.cos(t + dd)];
                
                this.vertices.push(...p1, ...p2, ...p4, ...p1, ...p4, ...p3);
            }
        }

        this.shape = new Shape2(this.vertices, this.vertices, this.rgba);
    }

    render() {
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        this.normalMatrix.setInverseOf(this.matrix).transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);

        gl.uniform1i(u_Shiny, this.shiny);
        this.shape.render();
    }

}