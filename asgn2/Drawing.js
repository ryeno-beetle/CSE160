class Drawing extends Shape {
    constructor() {
        super([0, 0], 1, '#ffffff');    

        let skyColor = [171, 221, 255];
        let hillColor = [164, 171, 113];
        let cloudColor = [250, 251, 255];
        let snufkinClothesColor = [138, 126, 90];
        let snufkinLighterClothesColor = [161, 146, 114];
        let snufkinHairColor = [130, 67, 57];
        let snufkinSkinColor = [237, 175, 175];

        this.colors = [skyColor, hillColor, cloudColor, snufkinClothesColor, snufkinLighterClothesColor, snufkinHairColor, snufkinSkinColor];
        this.colors = this.colors.map((e) => this.convertRGB(e));
        //this.skyColor = this.convertRGB(this.skyColor);

        this.sky = [
            -1, -1,  -1, 1,  1, 1,
            1, 1,  1, -1, -1, -1,
        ]
        this.hill = [
            -1, -1,  -1, -0.8,  -0.2, -0.8,
            -1, -1,  -0.2, -0.8,  -0.2, -1,
            -0.8, -0.8,  -0.2, -0.6,  -0.2, -0.8,
            -0.2, -1,  -0.2, -0.6,  1, -0.6,
            -0.2, -1,  1, -0.6,  1, -1,
            0.8, -0.6,  1, -0.5,  1, -0.6
        ]
        this.clouds = [
            // R
            -0.8, 0,  -0.8, 0.3,  -0.7, 0.3,
            -0.8, 0,  -0.7, 0.3,  -0.7, 0,
            -0.7, 0.1,  -0.7, 0.3,  -0.5, 0.3,
            -0.7, 0.1,  -0.5, 0.3,  -0.5, 0.1,
            -0.7, 0.1,  -0.6, 0.1,  -0.6, 0,
            // D
            -0.4, -0.1,  -0.4, 0.2,  -0.3, 0.2,
            -0.4, -0.1,  -0.3, 0.2,  -0.3, -0.1,
            -0.3, 0.05,  -0.3, 0.2,  -0.2, 0.1,
            -0.3, 0.05,  -0.2, 0.1,  -0.2, 0,
            -0.3, -0.1,  -0.3, 0.05,  -0.2, 0,
            // LEFT CLOUD
            -0.8, 0.6,  -0.7, 0.7,  -0.7, 0.6,
            -0.7, 0.6,  -0.7, 0.7,  -0.4, 0.7,
            -0.7, 0.6,  -0.4, 0.7,  -0.4, 0.6,
            -0.8, 0.5,  -0.8, 0.6,  -0.4, 0.6,
            -0.8, 0.5,  -0.4, 0.6,  -0.4, 0.5,
            -0.6, 0.7,  -0.4, 0.9,  -0.4, 0.7,

            -0.4, 0.6,  -0.4, 0.9,  -0.1, 0.9,
            -0.4, 0.6,  -0.1, 0.9,  -0.1, 0.6,
            -0.4, 0.5,  -0.4, 0.6,  -0.3, 0.6,
            -0.4, 0.5,  -0.3, 0.6,  -0.3, 0.5,
            -0.3, 0.5,  -0.3, 0.6,  -0.2, 0.6,

            -0.1, 0.8,  -0.1, 0.9,  0, 0.8,
            -0.1, 0.6,  -0.1, 0.8,  0.2, 0.8,
            -0.1, 0.6,  0.2, 0.8,  0.2, 0.6,
            // didn't draw 15/16/17
            0.2, 0.7,  0.2, 0.8,  0.3, 0.7,
            0.2, 0.6,  0.2, 0.7,  0.3, 0.7,
            0.2, 0.6,  0.3, 0.7,  0.3, 0.6,
            // RIGHT CLOUD
            0.7, 0.8,  0.9, 0.9,  0.9, 0.8,
            0.9, 0.8,  0.9, 1,  1, 1,
            0.9, 0.8,  1, 1,  1, 0.8,
            0.7, 0.6,  0.7, 0.8,  1, 0.8,
            0.7, 0.6,  1, 0.8,  1, 0.6
        ]
        this.snufkinClothes = [
            // HAT
            0.2, 0.3,  0.5, 0.7,  0.6, 0.3,
            0.2, 0.3,  0.4, 0.3,  0.3, 0.2,
            0.3, 0.2,  0.4, 0.3,  0.5, 0.2,
            0.4, 0.3,  0.6, 0.3,  0.5, 0.2,
            // DRESS
            0.2, -0.6,  0.2, 0,  0.6, 0,
            0.2, -0.6,  0.6, 0,  0.6, -0.6,
            0.1, -0.1,  0.2, 0,  0.2, -0.1,
            0.6, -0.1,  0.6, 0,  0.7, -0.1,
            0, -0.6,  0, -0.3,  0.1, -0.3,
            -0.1, -0.6,  0, -0.3,  0, -0.6
        ]
        this.snufkinLighterClothes = [
            // BRIM OF HAT
            0, 0.2,  0.1, 0.3,  0.2, 0.1,
            0.1, 0.3,  0.2, 0.3,  0.2, 0.1,
            0.2, 0.1,  0.2, 0.3,  0.3, 0.2,
            0.2, 0.1,  0.3, 0.2,  0.4, 0.1,
            0.3, 0.2,  0.5, 0.2,  0.4, 0.1,
            0.4, 0.1,  0.5, 0.2,  0.6, 0.1,
            0.5, 0.2,  0.6, 0.3,  0.6, 0.1,
            0.6, 0.1,  0.6, 0.3,  0.7, 0.3,
            0.6, 0.1,  0.7, 0.3,  0.8, 0.2,
            // LEFT SLEEVE
            0.1, -0.3,  0.1, -0.1,  0.2, -0.1,
            0.1, -0.3,  0.2, -0.1,  0.2, -0.3,
            0.1, -0.3,  0.2, -0.3,  0.2, -0.6,
            0, -0.6,  0.1, -0.3,  0.2, -0.6,
            0, -0.6,  0.2, -0.6,  0.2, -0.7,
            // RIGHT SLEEVE
            0.6, -0.7,  0.6, -0.1,  0.7, -0.1,
            0.6, -0.7,  0.7, -0.1,  0.7, -0.7,
            0.7, -0.7,  0.7, -0.1,  0.8, -0.6
        ]
        this.snufkinHair = [
            0.2, 0.1,  0.4, 0.1,  0.3, 0,
            0.3, 0,  0.4, 0.1,  0.5, 0,
            0.4, 0.1,  0.6, 0.1,  0.5, 0
        ]
        this.snufkinSkin = [
            // FACE
            0.15, 0.05,  0.15, 0.125,  0.2, 0.1,
            0.15, 0.05,  0.2, 0.1,  0.2, 0,
            0.2, 0,  0.2, 0.1,  0.3, 0,
            // LEFT HAND
            0, -0.7,  0, -0.6,  0.2, -0.7,
            0, -0.8,  0, -0.7,  0.2, -0.7,
            0, -0.8,  0.2, -0.7,  0.2, -0.8,
            // RIGHT HAND
            0.7, -0.7,  0.8, -0.6,  0.8, -0.7,
            0.8, -0.7,  0.8, -0.6,  0.9, -0.6,
            0.8, -0.7,  0.9, -0.6,  0.9, -0.7
        ]
    }

    convertRGB(arr) {
        arr = arr.map((e) => e/255.0);
        arr.push(1);
        return arr;
    }

    render(gl, a_Position, u_PointSize, u_FragColor) {
        // SKY
        for (let i = 0; i < this.sky.length/6; i++) {
            let triVertices = this.sky.slice(i*6, i*6 + 6);
            this.drawTriangle(gl, a_Position, u_PointSize, u_FragColor, triVertices, this.colors[0]);
        }
        //HILL
        for (let i = 0; i < this.hill.length/6; i++) {
            let triVertices = this.hill.slice(i*6, i*6 + 6);
            this.drawTriangle(gl, a_Position, u_PointSize, u_FragColor, triVertices, this.colors[1]);
        }
        // CLOUDS 
        for (let i = 0; i < this.clouds.length/6; i++) {
            let triVertices = this.clouds.slice(i*6, i*6 + 6);
            this.drawTriangle(gl, a_Position, u_PointSize, u_FragColor, triVertices, this.colors[2]);
        }
        // SNUFKIN NORMAL CLOTHES 
        for (let i = 0; i < this.snufkinClothes.length/6; i++) {
            let triVertices = this.snufkinClothes.slice(i*6, i*6 + 6);
            this.drawTriangle(gl, a_Position, u_PointSize, u_FragColor, triVertices, this.colors[3]);
        }
        // SNUFKIN LIGHTER CLOTHES 
        for (let i = 0; i < this.snufkinLighterClothes.length/6; i++) {
            let triVertices = this.snufkinLighterClothes.slice(i*6, i*6 + 6);
            this.drawTriangle(gl, a_Position, u_PointSize, u_FragColor, triVertices, this.colors[4]);
        }
        // SNUFKIN HAIR
        for (let i = 0; i < this.snufkinHair.length/6; i++) {
            let triVertices = this.snufkinHair.slice(i*6, i*6 + 6);
            this.drawTriangle(gl, a_Position, u_PointSize, u_FragColor, triVertices, this.colors[5]);
        }
        // SNUFKIN SKIN
        for (let i = 0; i < this.snufkinSkin.length/6; i++) {
            let triVertices = this.snufkinSkin.slice(i*6, i*6 + 6);
            this.drawTriangle(gl, a_Position, u_PointSize, u_FragColor, triVertices, this.colors[6]);
        }
    }
}