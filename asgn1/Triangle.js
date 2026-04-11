class Triangle extends Shape {
    constructor(point, size, rgba) {
        super(point, size*1.2 / (canvas.width/2), rgba);
        this.vertices = this.calculateVertices();
    }

    calculateVertices() {
        // for equilateral triangle with bottom left corner at cursor: 
        // [0, 0, g_PointSize, 0, g_PointSize/2, g_PointSize * (Math.sqrt(3)/2)]
        // shift by size/2 to put cursor at center:
        let w = (this.size / 2);
        let h = ((this.size * (Math.sqrt(3)/2))/2);
        let x = this.point[0];
        let y = this.point[1];
        let vertices = [x + w, y -h, x -w, y -h, x, y + h];
        return vertices;
    }

    render(gl, a_Position, u_PointSize, u_FragColor) {
        this.drawTriangle(gl, a_Position, u_PointSize, u_FragColor, this.vertices);
    }

}