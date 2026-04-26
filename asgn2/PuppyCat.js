class PuppyCat {
    constructor(wgl) {
        this.wgl = wgl;
        this.angles = {
            body: [0, 0, 0],
            leg_left_top: [0, 0, 0],
            leg_left_bottom: [0, 0, 0],
            foot_left: [0, 0, 0],
            leg_right_top: [0, 0, 0],
            leg_right_bottom: [0, 0, 0],
            foot_right: [0, 0, 0],
        }
        this.makeParts();
        this.anims = {};
        this.makeWalkAnim();
        this.animating = false;
    }

    makeParts() {
        let white = [255, 232, 232, 1];
        let brown = [138, 66, 82, 1];
        this.parts = {
            body: new Body(this.wgl, white),
            head: new Body(this.wgl, white),
            // LEFT LEG
            leg_left_top: new Cube(this.wgl, white),
            leg_left_bottom: new Cube(this.wgl, white),
            foot_left: new Cube(this.wgl, brown),
            // RIGHT LEG
            leg_right_top: new Cube(this.wgl, white),
            leg_right_bottom: new Cube(this.wgl, white),
            foot_right: new Cube(this.wgl, brown),
        }
        this.parts.leg_left_top.setOrigin([0.5, 1, 0.5]);
        this.parts.leg_left_bottom.setOrigin([0.5, 1, 0]);
        this.parts.foot_left.setOrigin([0.5, 1, 0.5]);

        this.parts.leg_right_top.setOrigin([0.5, 1, 0.5]);
        this.parts.leg_right_bottom.setOrigin([0.5, 1, 0]);
        this.parts.foot_right.setOrigin([0.5, 1, 0.5]);

        this.transformParts();
    }

    transformParts() {
        //remember: Translate then Rotate then Save then Scale

        // BODY TRANSFORMS
        // reset and save ref to matrix
        this.parts.body.resetMatrix();
        let m_body = this.parts.body.matrix;
        // apply current rotation
        this.rotatePart(m_body, 'body');
        // translate to be centered around origin!!
        m_body.translate(-0.34 * 0.9, -0.34 * 0.9, -0.4 * 0.9);
        // save copy of matrix
        let tm_body = new Matrix4(m_body); // translation matrix for body
        //m_body.scale(0.9, 0.9, 0.9);

        // HEAD TRANSFORMS
        this.parts.head.matrix = new Matrix4(tm_body); // head dependent on body translation matrix
        let m_head = this.parts.head.matrix;
        m_head.translate(0.02, 0.6, 0.02);
        m_head.scale(0.9, 0.7, 0.9);

        // LEG TRANSFORMS
        // LEFT LEG
        // LEFT LEG TOP
        this.parts.leg_left_top.matrix = new Matrix4(tm_body);
        let m_leg_left_top = this.parts.leg_left_top.matrix;
        m_leg_left_top.translate(0.46, 0.1, 0.3);
        this.rotatePart(m_leg_left_top, 'leg_left_top');
        let tm_leg_left_top = new Matrix4(m_leg_left_top);
        m_leg_left_top.scale(0.27, 0.2, 0.27);

        // LEFT LEG BOTTOM
        this.parts.leg_left_bottom.matrix = new Matrix4(tm_leg_left_top);
        let m_leg_left_bottom = this.parts.leg_left_bottom.matrix;
        m_leg_left_bottom.translate(0, -0.2, -0.135);
        this.rotatePart(m_leg_left_bottom, 'leg_left_bottom');
        let tm_leg_left_bottom = new Matrix4(m_leg_left_bottom);
        m_leg_left_bottom.scale(0.27, 0.12, 0.27);

        // LEFT FOOT
        this.parts.foot_left.matrix = new Matrix4(tm_leg_left_bottom);
        let m_foot_left = this.parts.foot_left.matrix;
        m_foot_left.translate(0, -0.08, 0.1);
        this.rotatePart(m_foot_left, 'foot_left');
        m_foot_left.scale(0.3, 0.15, 0.35);

        // RIGHT LEG
        // RIGHT LEG TOP
        this.parts.leg_right_top.matrix = new Matrix4(tm_body);
        let m_leg_right_top = this.parts.leg_right_top.matrix;
        m_leg_right_top.translate(0.15, 0.1, 0.3);
        this.rotatePart(m_leg_right_top, 'leg_right_top');
        let tm_leg_right_top = new Matrix4(m_leg_right_top);
        m_leg_right_top.scale(0.27, 0.2, 0.27);

        // RIGHT LEG BOTTOM
        this.parts.leg_right_bottom.matrix = new Matrix4(tm_leg_right_top);
        let m_leg_right_bottom = this.parts.leg_right_bottom.matrix;
        m_leg_right_bottom.translate(0, -0.2, -0.135);
        this.rotatePart(m_leg_right_bottom, 'leg_right_bottom');
        let tm_leg_right_bottom = new Matrix4(m_leg_right_bottom);
        m_leg_right_bottom.scale(0.27, 0.12, 0.27);

        // RIGHT FOOT
        this.parts.foot_right.matrix = new Matrix4(tm_leg_right_bottom);
        let m_foot_right = this.parts.foot_right.matrix;
        m_foot_right.translate(0, -0.08, 0.1);
        this.rotatePart(m_foot_right, 'foot_right');
        m_foot_right.scale(0.3, 0.15, 0.35);

    }

    // apply xyz axis rotations based on the angles we've set
    // for that part in this.angles
    rotatePart(mat, part) {
        let angles = this.angles[part];
        let axis = [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ];
        for (let i = 0; i < angles.length; i++) {
            let a = angles[i];
            if (a != 0 && a/360 != 1) {
                mat.rotate(a, ...axis[i]);
            }
        }
    }

    makeWalkAnim() {
        this.anims.walkAnim = {
            duration: 1000, // in ms
            keyframes: [0, 0.25, 0.5, 0.75, 1], // fractions of dur where an angle will be keyed
            values: {
                leg_left_top: [
                    [0, 0, 0],
                    [-20, 0, 0],
                    [0, 0, 0],
                    [20, 0, 0],
                    [0, 0, 0],
                ],
                leg_left_bottom: [
                    [0, 0, 0],
                    [0, 0, 0],
                    [-20, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0],
                ],
                foot_left: [
                    [0, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0],
                ],
                leg_right_top: [
                    [0, 0, 0],
                    [20, 0, 0],
                    [0, 0, 0],
                    [-20, 0, 0],
                    [0, 0, 0],
                ],
                leg_right_bottom: [
                    [-20, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0],
                ],
                foot_right: [
                    [0, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0],
                ]
            }
        }
        // this.anims.walkAnim = {
        //     duration: 2000, // in ms
        //     keyframes: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1], // fractions of dur where an angle will be keyed
        //     values: {
        //         leg_left_top: [
        //             [10, 0, 0],
        //             [15, 0, 0],
        //             [0, 0, 0],
        //             [-5, 0, 0],
        //             [-10, 0, 0],
        //             [-15, 0, 0],
        //             [0, 0, 0],
        //             [10, 0, 0],
        //             [10, 0, 0],
        //         ],
        //         leg_left_bottom: [
        //             [0, 0, 0],
        //             [0, 0, 0],
        //             [0, 0, 0],
        //             [0, 0, 0],
        //             [0, 0, 0],
        //             [-20, 0, 0],
        //             [-30, 0, 0],
        //             [-20, 0, 0],
        //             [0, 0, 0],
        //         ],
        //         foot_left: [
        //             [0, 0, 0],
        //             [0, 0, 0],
        //             [0, 0, 0],
        //             [0, 0, 0],
        //             [10, 0, 0],
        //             [5, 0, 0],
        //             [10, 0, 0],
        //             [5, 0, 0],
        //             [0, 0, 0],
        //         ]
        //     }
        // }
    }

    // lerp two arrays
    lerp(a, b, ratio) {
        let c = [];
        for (let i = 0; i < a.length; i++) {
            c.push(a[i] + ratio * (b[i] - a[i]));
        }
        return c;
    }

    animate(animKey, timeStart, timeCurrent) {
        let anim = this.anims[animKey];
        let fracProgressed = ((timeCurrent - timeStart) % anim.duration) / anim.duration;
        // ratio of key1 and key2 values to lerp
        let ratio = 1;
        // the keyframes we are in between
        let keyIndex1 = 0;
        let keyIndex2 = 1;
        // find keyIndex1 and keyIndex2 and calculate ratio
        for (let i = 0; i < anim.keyframes.length - 1; i++) {
            let key1 = anim.keyframes[i];
            let key2 = anim.keyframes[i+1];

            // if fraction progressed is between key1 and key2, set indices
            if (key1 <= fracProgressed && fracProgressed <= key2) {
                keyIndex1 = i;
                keyIndex2 = i+1;
                ratio = (key2 - fracProgressed) / (key2 - key1);
            }
        }        

        // for each body part we are animating,
        // get values we are lerping between,
        // lerp them,
        // and set the part's rotation
        for (const [part, values] of Object.entries(anim.values)) {
            let v1 = values[keyIndex1];
            let v2 = values[keyIndex2];
            let v = this.lerp(v2, v1, ratio);
            this.angles[part] = v;
            // console.log("%: ", fracProgressed);
            // console.log(Math.round(v[0]));
        }
    }

    render(timeStart, timeCurrent) {
        if (this.animating) {
            this.animate('walkAnim', timeStart, timeCurrent);
        }
        // update shape positions
        this.transformParts();
        for (const [p, s] of Object.entries(this.parts)) {
            s.render();
        }
        //this.parts.leg_left_top.render();
    }
}