class Circle extends Shape {
    constructor(point, size, rgba, segmentCount) {
        super(point, size/1.7/(canvas.width/2), rgba);
        this.segmentCount = segmentCount;
        this.vertices = this.calculateVertices();
    }

    calculateVertices() {
        let vertices = [];
        let angle = (2 * Math.PI) / this.segmentCount;
        let x = this.point[0];
        let y = this.point[1];
        for (let a = 0; a < (2 * Math.PI); a += angle) {
            let tri = [x, y, 
                x + Math.cos(a) * this.size, y + Math.sin(a) * this.size, 
                x + Math.cos(a + angle) * this.size, y + Math.sin(a + angle) * this.size];
            vertices.push(...tri);
        }
        return vertices;
    }

    render(gl, a_Position, u_PointSize, u_FragColor) {
        for (let i = 0; i < this.segmentCount; i++) {
            let triVertices = this.vertices.slice(i*6, i*6 + 6);
            this.drawTriangle(gl, a_Position, u_PointSize, u_FragColor, triVertices, this.rgba);
        }
    }

}