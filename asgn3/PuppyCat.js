class PuppyCat {
    constructor(wgl) {
        this.wgl = wgl;
        this.angles = {
            body: [0, 0, 0],
            head: [0, 0, 0],
            bell: [0, 0, 0],
            tail_base: [0, 0, 0],
            tail_end: [0, 0, 0],
            arm_left: [0, 0, 0],
            arm_right: [0, 0, 0],
            leg_left_top: [0, 0, 0],
            leg_left_bottom: [0, 0, 0],
            foot_left: [0, 0, 0],
            leg_right_top: [0, 0, 0],
            leg_right_bottom: [0, 0, 0],
            foot_right: [0, 0, 0],
        }
        this.translates = {
            body: [0, 0, 0],
            bell: [0, 0, 0],
        }
        this.makeParts();
        this.anims = {};
        this.makeWalkAnim();
        this.makeTripAnim();
        this.animating = false;
        this.prevAnim = '';
        this.currentAnim = 'walkAnim';
    }

    makeParts() {
        let white = [255, 232, 232, 1];
        let brown = [138, 66, 82, 1];
        let dark_brown = [71, 34, 48, 1];
        let pink = [255, 150, 187, 1];
        let yellow = [255, 188, 94];
        this.parts = {
            body: new Body(this.wgl, white),
            collar: new Body(this.wgl, pink),
            bell: new Body(this.wgl, yellow),
            bell_hole_top: new Cube(this.wgl, brown),
            bell_hole_bottom: new Cube(this.wgl, brown),
            tail_base: new Cube(this.wgl, white),
            tail_end: new Cube(this.wgl, brown),
            // HEAD
            head: new Body(this.wgl, white),
            ear_left: new Body(this.wgl, brown),
            ear_left_inner: new Body(this.wgl, pink),
            ear_right: new Body(this.wgl, brown),
            ear_right_inner: new Body(this.wgl, pink),
            // face
            eye_left: new Cube(this.wgl, dark_brown),
            eye_right: new Cube(this.wgl, dark_brown),
            eyebrow_left: new Cube(this.wgl, brown),
            eyebrow_right: new Cube(this.wgl, brown),
            mouth_right: new Cube(this.wgl, brown),
            mouth_left: new Cube(this.wgl, brown),
            nose: new Cube(this.wgl, brown),
            // LEFT ARM
            arm_left: new Body(this.wgl, white),
            hand_left: new Body(this.wgl, brown),
            // RIGHT ARM
            arm_right: new Body(this.wgl, white),
            hand_right: new Body(this.wgl, brown),
            // LEFT LEG
            leg_left_top: new Body(this.wgl, white),
            leg_left_bottom: new Body(this.wgl, white),
            foot_left: new Body(this.wgl, brown),
            // RIGHT LEG
            leg_right_top: new Body(this.wgl, white),
            leg_right_bottom: new Body(this.wgl, white),
            foot_right: new Body(this.wgl, brown),

            // FLOOR??
            //floor: new Cube(this.wgl, [166, 146, 214, 1])
        }

        this.parts.body.setOrigin([0.34 * 0.9, 0, 0.34 * 0.9]);
        this.parts.head.setOrigin([0.34 * 0.9, 0, 0.34 * 0.9]);

        this.parts.arm_left.setOrigin([0.34, 0, 0.34]);
        this.parts.arm_right.setOrigin([0.34, 0, 0.34]);
        this.parts.hand_left.setOrigin([0.34, 0, 0.34]);
        this.parts.hand_right.setOrigin([0.34, 0, 0.34]);

        this.parts.leg_left_top.setOrigin([0.34, 0, 0.34]);
        this.parts.leg_left_bottom.setOrigin([0.34, 0, 0.34]);
        this.parts.foot_left.setOrigin([0.34, 0.8, 0.34]);

        this.parts.leg_right_top.setOrigin([0.34, 0, 0.34]);
        this.parts.leg_right_bottom.setOrigin([0.34, 0, 0.34]);
        this.parts.foot_right.setOrigin([0.34, 0.8, 0.34]);

        this.parts.tail_base.setOrigin([0.5, 0.5, 0]);
        this.parts.tail_end.setOrigin([0.5, 0, 0]);

        this.transformParts();
    }

    transformParts() {
        //remember: Translate then Rotate then Save then Scale
        // floor
        // this.parts.floor.matrix = new Matrix4();
        // let m_floor = this.parts.floor.matrix;
        // m_floor.translate(-0.5, -1.605, -0.6);

        // BODY TRANSFORMS
        // reset and save ref to matrix
        this.parts.body.resetMatrix();
        let m_body = this.parts.body.matrix;
        // translate to be centered
        m_body.translate(0, -0.34 * 0.9 - 0.1, 0);
        // apply current translation
        this.translatePart(m_body, 'body');
        // apply current rotation
        this.rotatePart(m_body, 'body');
        // save copy of matrix
        let tm_body = new Matrix4(m_body); // translation matrix for body
        // translate everything else to match the body placement
        // since we changed the body's origin
        tm_body.translate(-0.34 * 0.9, 0, -0.34 * 0.9);

        // COLLAR 
        this.parts.collar.matrix = new Matrix4(tm_body);
        let m_collar = this.parts.collar.matrix;
        m_collar.translate(0, 0.43, 0);
        m_collar.scale(1, 0.3, 1);

        // BELL
        // THE BIG ROUND MAIN YELLOW PART
        this.parts.bell.matrix = new Matrix4(tm_body);
        let m_bell = this.parts.bell.matrix;
        m_bell.translate(0.13, 0.45, 0.02);
        this.translatePart(m_bell, 'bell');
        this.rotatePart(m_bell, 'bell');
        let tm_bell = new Matrix4(m_bell);
        m_bell.rotate(-80, 1, 0, 0);
        m_bell.rotate(45, 0, 1, 0);
        m_bell.scale(0.4, 0.25, 0.4);

        // LITTLE ROUND HOLE
        this.parts.bell_hole_top.matrix = new Matrix4(tm_bell);
        let m_bell_hole_top = this.parts.bell_hole_top.matrix;
        m_bell_hole_top.translate(0.119, -0.03, -0.19);
        m_bell_hole_top.rotate(10, 1, 0, 0);
        m_bell_hole_top.scale(0.1, 0.05, 0.05);

        // LONG HOLE
        this.parts.bell_hole_bottom.matrix = new Matrix4(tm_bell);
        let m_bell_hole_bottom = this.parts.bell_hole_bottom.matrix;
        m_bell_hole_bottom.translate(0.145, -0.14, -0.09);
        m_bell_hole_bottom.rotate(-45, 1, 0, 0);
        m_bell_hole_bottom.scale(0.05, 0.15, 0.05);

        // TAIL
        // TAIL BASE
        this.parts.tail_base.matrix = new Matrix4(tm_body);
        let m_tail_base = this.parts.tail_base.matrix;
        m_tail_base.translate(0.3, 0.1, 0.63);
        m_tail_base.rotate(20, 1, 0, 0);
        this.rotatePart(m_tail_base, 'tail_base');
        let tm_tail_base = new Matrix4(m_tail_base);
        m_tail_base.scale(0.05, 0.05, 0.15);

        // TAIL BASE
        this.parts.tail_end.matrix = new Matrix4(tm_tail_base);
        let m_tail_end = this.parts.tail_end.matrix;
        m_tail_end.translate(0, -0.03, 0.16);
        m_tail_end.rotate(-90, 1, 0, 0);
        this.rotatePart(m_tail_end, 'tail_end');
        m_tail_end.scale(0.051, 0.051, 0.12);


        // HEAD TRANSFORMS
        this.parts.head.matrix = new Matrix4(tm_body); // head dependent on body translation matrix
        let m_head = this.parts.head.matrix;
        m_head.translate(0.34*0.9, 0.6, 0.34*0.9);
        this.rotatePart(m_head, 'head');
        let tm_head = new Matrix4(m_head);
        m_head.scale(0.9, 0.7, 0.9);
        tm_head.translate(-0.34 * 0.9*0.9, 0, -0.34 * 0.9*0.9);
        //this.rotatePart(tm_head, 'head');

        // EARS!!
        // LEFT
        // OUTER
        this.parts.ear_left.matrix = new Matrix4(tm_head);
        let m_ear_left = this.parts.ear_left.matrix;
        m_ear_left.translate(0.31, 0.34, 0.2);
        m_ear_left.rotate(-20, 0, 0, 1);
        m_ear_left.scale(0.33, 0.33, 0.3);
        let tm_ear_left = new Matrix4(m_ear_left);

        // INNER
        this.parts.ear_left_inner.matrix = new Matrix4(tm_ear_left);
        let m_ear_left_inner = this.parts.ear_left_inner.matrix;
        m_ear_left_inner.translate(0.08, 0.06, -0.05);
        m_ear_left_inner.scale(0.75, 0.75, 0.5);

        // RIGHT
        // OUTER
        this.parts.ear_right.matrix = new Matrix4(tm_head);
        let m_ear_right = this.parts.ear_right.matrix;
        m_ear_right.translate(0.04, 0.27, 0.2);
        m_ear_right.rotate(20, 0, 0, 1);
        m_ear_right.scale(0.33, 0.33, 0.3);
        let tm_ear_right = new Matrix4(m_ear_right);

        // INNER
        this.parts.ear_right_inner.matrix = new Matrix4(tm_ear_right);
        let m_ear_right_inner = this.parts.ear_right_inner.matrix;
        m_ear_right_inner.translate(0.08, 0.06, -0.05);
        m_ear_right_inner.scale(0.75, 0.75, 0.5);

        // EYES
        // LEFT
        this.parts.eye_left.matrix = new Matrix4(tm_head);
        let m_eye_left = this.parts.eye_left.matrix;
        m_eye_left.translate(0.05, 0.17, 0.06);
        m_eye_left.rotate(45, 0, 1, 0);
        m_eye_left.rotate(15, 1, 0, 0);
        m_eye_left.scale(0.05, 0.05, 0.05);

        // RIGHT
        this.parts.eye_right.matrix = new Matrix4(tm_head);
        let m_eye_right = this.parts.eye_right.matrix;
        m_eye_right.translate(0.47, 0.17, 0.025);
        m_eye_right.rotate(-45, 0, 1, 0);
        m_eye_right.rotate(15, 1, 0, 0);
        m_eye_right.scale(0.05, 0.05, 0.05);

        // EYEBROWS
        // LEFT
        this.parts.eyebrow_left.matrix = new Matrix4(tm_head);
        let m_eyebrow_left = this.parts.eyebrow_left.matrix;
        m_eyebrow_left.translate(0.06, 0.27, 0.09);
        m_eyebrow_left.rotate(45, 0, 1, 0);
        m_eyebrow_left.rotate(15, 1, 0, 0);
        m_eyebrow_left.rotate(-20, 0, 0, 1);
        m_eyebrow_left.scale(0.09, 0.05, 0.05);

        // RIGHT
        this.parts.eyebrow_right.matrix = new Matrix4(tm_head);
        let m_eyebrow_right = this.parts.eyebrow_right.matrix;
        m_eyebrow_right.translate(0.43, 0.24, 0.025);
        m_eyebrow_right.rotate(-45, 0, 1, 0);
        m_eyebrow_right.rotate(15, 1, 0, 0);
        m_eyebrow_right.rotate(20, 0, 0, 1);
        m_eyebrow_right.scale(0.09, 0.05, 0.05);

        // MOUTH
        // LEFT
        this.parts.mouth_left.matrix = new Matrix4(tm_head);
        let m_mouth_left = this.parts.mouth_left.matrix;
        m_mouth_left.translate(0.22, 0.15, -0.05);
        m_mouth_left.rotate(-45, 0, 0, 1);
        m_mouth_left.rotate(15, 1, 0, 0);
        m_mouth_left.scale(0.02, 0.08, 0.05);

        // RIGHT
        this.parts.mouth_right.matrix = new Matrix4(tm_head);
        let m_mouth_right = this.parts.mouth_right.matrix;
        m_mouth_right.translate(0.32, 0.135, -0.05);
        m_mouth_right.rotate(45, 0, 0, 1);
        m_mouth_right.rotate(15, 1, 0, 0);
        m_mouth_right.scale(0.02, 0.08, 0.05);

        // NOSE !!
        this.parts.nose.matrix = new Matrix4(tm_head);
        let m_nose = this.parts.nose.matrix;
        m_nose.translate(0.257, 0.2, -0.03);
        m_nose.rotate(15, 1, 0, 0);
        m_nose.scale(0.04, 0.02, 0.05);


        // ARMS 
        // LEFT ARM
        this.parts.arm_left.matrix = new Matrix4(tm_body);
        let m_arm_left = this.parts.arm_left.matrix;
        m_arm_left.translate(0.5, 0.45, 0.3);
        m_arm_left.rotate(-135, 0, 0, 1);
        this.rotatePart(m_arm_left, 'arm_left');
        let tm_arm_left = new Matrix4(m_arm_left);
        m_arm_left.scale(0.3, 0.6, 0.3);

        // LEFT HAND
        this.parts.hand_left.matrix = new Matrix4(tm_arm_left);
        let m_hand_left = this.parts.hand_left.matrix;
        m_hand_left.translate(0, 0.25, 0);
        let tm_hand_left = new Matrix4(m_hand_left);
        m_hand_left.scale(0.25, 0.25, 0.25);

        // RIGHT ARM
        this.parts.arm_right.matrix = new Matrix4(tm_body);
        let m_arm_right = this.parts.arm_right.matrix;
        m_arm_right.translate(0.12, 0.45, 0.3);
        m_arm_right.rotate(135, 0, 0, 1);
        m_arm_right.rotate(-90, 0, 1, 0);
        this.rotatePart(m_arm_right, 'arm_right');
        let tm_arm_right = new Matrix4(m_arm_right);
        m_arm_right.scale(0.3, 0.6, 0.3);

        // RIGHT HAND
        this.parts.hand_right.matrix = new Matrix4(tm_arm_right);
        let m_hand_right = this.parts.hand_right.matrix;
        m_hand_right.translate(0, 0.25, 0);
        let tm_hand_right = new Matrix4(m_hand_right);
        m_hand_right.scale(0.25, 0.25, 0.25);


        // LEG TRANSFORMS
        // LEFT LEG
        // LEFT LEG TOP
        this.parts.leg_left_top.matrix = new Matrix4(tm_body);
        let m_leg_left_top = this.parts.leg_left_top.matrix;
        m_leg_left_top.translate(0.5, 0.1, 0.3);
        m_leg_left_top.rotate(-90, 0, 1, 0);
        m_leg_left_top.rotate(180, 1, 0, 0);
        this.rotatePart(m_leg_left_top, 'leg_left_top');
        m_leg_left_top.scale(1.1, 1.1, 1.1);
        let tm_leg_left_top = new Matrix4(m_leg_left_top);
        m_leg_left_top.scale(0.33, 0.4, 0.33);

        // LEFT LEG BOTTOM
        this.parts.leg_left_bottom.matrix = new Matrix4(tm_leg_left_top);
        let m_leg_left_bottom = this.parts.leg_left_bottom.matrix;
        m_leg_left_bottom.translate(-0.01, 0.15, -0.005);
        this.rotatePart(m_leg_left_bottom, 'leg_left_bottom');
        let tm_leg_left_bottom = new Matrix4(m_leg_left_bottom);
        m_leg_left_bottom.scale(0.25, 0.3, 0.25);

        // LEFT FOOT
        this.parts.foot_left.matrix = new Matrix4(tm_leg_left_bottom);
        let m_foot_left = this.parts.foot_left.matrix;
        m_foot_left.translate(-0.05, 0.1, -0.017);
        m_foot_left.rotate(90, 0, 1, 0);
        m_foot_left.rotate(-180, 1, 0, 0);
        this.rotatePart(m_foot_left, 'foot_left');
        m_foot_left.scale(0.3, 0.15, 0.35);

        // RIGHT LEG
        // RIGHT LEG TOP
        this.parts.leg_right_top.matrix = new Matrix4(tm_body);
        let m_leg_right_top = this.parts.leg_right_top.matrix;
        m_leg_right_top.translate(0.135, 0.1, 0.3);
        m_leg_right_top.rotate(-90, 0, 1, 0);
        m_leg_right_top.rotate(180, 1, 0, 0);
        this.rotatePart(m_leg_right_top, 'leg_right_top');
        m_leg_right_top.scale(1.1, 1.1, 1.1);
        let tm_leg_right_top = new Matrix4(m_leg_right_top);
        m_leg_right_top.scale(0.33, 0.4, 0.33);

        // RIGHT LEG BOTTOM
        this.parts.leg_right_bottom.matrix = new Matrix4(tm_leg_right_top);
        let m_leg_right_bottom = this.parts.leg_right_bottom.matrix;
        m_leg_right_bottom.translate(-0.01, 0.15, -0.005);
        this.rotatePart(m_leg_right_bottom, 'leg_right_bottom');
        let tm_leg_right_bottom = new Matrix4(m_leg_right_bottom);
        m_leg_right_bottom.scale(0.25, 0.3, 0.25);

        // RIGHT FOOT
        this.parts.foot_right.matrix = new Matrix4(tm_leg_right_bottom);
        let m_foot_right = this.parts.foot_right.matrix;
        m_foot_right.translate(-0.05, 0.1, -0.017);
        m_foot_right.rotate(90, 0, 1, 0);
        m_foot_right.rotate(-180, 1, 0, 0);
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

    // apply translate for a part based on this.translates
    translatePart(mat, part) {
        let trans = this.translates[part];
        mat.translate(...trans);
    }

    makeWalkAnim() {
        this.anims.walkAnim = {
            duration: 1000, // in ms
            loop: true,
            keyframes: [0, 0.25, 0.5, 0.75, 1], // fractions of dur where an angle will be keyed
            angleValues: {
                body: [
                    [0, 0, 0],
                    [0, -5, -3],
                    [0, 0, 0],
                    [0, 5, 3],
                    [0, 0, 0],
                ],
                head: [
                    [0, 0, 0],
                    [-3, 0, 0],
                    [0, 0, 0],
                    [-3, 0, 0],
                    [0, 0, 0],
                ],
                bell: [
                    [0, 0, 0],
                    [-5, 0, 0],
                    [0, 0, 0],
                    [-5, 0, 0],
                    [0, 0, 0],
                ],
                tail_base: [
                    [5, 0, 0],
                    [0, 0, 0],
                    [5, 0, 0],
                    [0, 0, 0],
                    [5, 0, 0],
                ],
                tail_end: [
                    [10, 0, 0],
                    [0, 0, 0],
                    [10, 0, 0],
                    [0, 0, 0],
                    [10, 0, 0],
                ],
                leg_left_top: [
                    [0, 0, 0],
                    [5, 0, -30],
                    [0, 0, 0],
                    [0, 0, 20],
                    [0, 0, 0],
                ],
                leg_left_bottom: [
                    [0, 0, 0],
                    [0, 0, 0],
                    [0, 0, -45],
                    [0, 0, 0],
                    [0, 0, 0],
                ],
                foot_left: [
                    [0, 0, 0],
                    [-20, 0, 0],
                    [20, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0],
                ],
                leg_right_top: [
                    [0, 0, 0],
                    [0, 0, 20],
                    [0, 0, 0],
                    [-5, 0, -30],
                    [0, 0, 0],
                ],
                leg_right_bottom: [
                    [0, 0, -45],
                    [0, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0],
                    [0, 0, -45],
                ],
                foot_right: [
                    [20, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0],
                    [-20, 0, 0],
                    [20, 0, 0],
                ],
                arm_left: [
                    [0, 0, 5],
                    [-20, 0, 0],
                    [0, 0, 5],
                    [20, 0, 0],
                    [0, 0, 5],
                ],
                arm_right: [
                    [-5, 0, 0],
                    [0, 0, -20],
                    [-5, 0, 0],
                    [0, 0, 20],
                    [-5, 0, 0],
                ]
            },
            translateValues: {
                body: [
                    [0, 0.0, 0],
                    [0, 0.01, 0],
                    [0, 0.0, 0],
                    [0, 0.01, 0],
                    [0, 0.0, 0],
                ],
                bell: [
                    [0, 0.0, 0],
                    [0, -0.01, 0],
                    [0, 0.0, 0],
                    [0, -0.01, 0],
                    [0, 0.0, 0],
                ]
            }
        }
    }

    makeTripAnim() {
        this.anims.tripAnim = {
            duration: 2000,
            loop: false,
            keyframes: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.85, 1],
            angleValues: {
                body: [
                    [0, 0, 0],
                    [20, 0, 0], // high point
                    [45, 0, 0], // hits floor
                    [33.75, 0, 0], // bounce (in air)
                    [22.5, 0, 0], // land + sit up
                    [11.25, 0, 0], // sit up
                    [10, 0, 0], // sit still
                    [-10, 0, 0], // lean forward
                    [-20, 0, 0], // stand up
                    [0, 0, 0],
                ],
                head: [
                    [0, 0, 0],
                    [-20, 0, 0], // high point -> forward (lag)
                    [-20, 0, 0], // hits floor -> forward (lag)
                    [-10, 0, 0], // bounce (in air) -> forward less
                    [0, 0, 0], // land + sit up -> normal
                    [0, 0, 0], // sit up -> normal
                    [-10, 0, 0], // sit still -> up
                    [-20, 0, 0], // lean forward -> forward
                    [-20, 0, 0], // stand up -> forward
                    [0, 0, 0], // stood up -> normal
                ],
                tail_base: [
                    [0, 0, 0],
                    [-10, 0, 0], // high point -> up a bit
                    [-30, 0, 0], // hits floor -> up
                    [-20, 0, 0], // bounce (in air) -> down a bit
                    [-30, 0, 0], // land + sit up -> up a bit
                    [-15, 0, 0], // sit up -> down
                    [0, 0, 0], // sit still -> down
                    [0, 0, 0], // lean forward -> normal
                    [20, 0, 0], // stand up -> down
                    [0, 0, 0], // stood up -> normal
                ],
                // ARMS
                arm_left: [
                    [0, 0, 0],
                    [-35, 0, 0], // high pt -> starting to bend (lag)
                    [-70, 0, 0], // hits floor -> arms bent (lag)
                    [-35, 0, 0], // bounce (in air) -> arms less bent (lag)
                    [0, 0, 0], // land + sit up -> arms no longer bent
                    [0, 0, 0], // sit up -> no bend
                    [0, 0, 0], // sit still -> no bend
                    [-22.5, 0, 0], // lean forward -> bend more
                    [-45, 0, 0], // stand up -> bend more
                    [0, 0, 0], // stood up -> un bend
                ],
                arm_right: [
                    [0, 0, 0], // COPIED FROM LEFT ARM (and changed to proper axis/direction)
                    [0, 0, 35], // high pt -> starting to bend (lag)
                    [0, 0, 70], // hits floor -> arms bent (lag)
                    [0, 0, 35], // bounce (in air) -> arms less bent (lag)
                    [0, 0, 0], // land + sit up -> arms no longer bent
                    [0, 0, 0], // sit up -> no bend
                    [0, 0, 0], // sit still -> no bend
                    [0, 0, 22.5], // lean forward -> bend more
                    [0, 0, 45], // stand up -> bend more
                    [0, 0, 0], // stood up -> un bend
                ],
                // LEGS
                leg_left_top: [
                    [0, 0, 0],
                    [0, 0, 22.5], // high pt -> starting to bend (lag)
                    [0, 0, 45], // hits floor -> legs bent (lag)
                    [0, 0, 22.5], // bounce (in air) -> legs less bent (lag)
                    [0, 0, 45], // land + sit up -> legs bent(lag)
                    [0, 0, 70], // sit up -> bend more
                    [0, 0, 70], // sit still -> still legs
                    [0, 0, 135], // lean forward -> bend more (lower legs bending now)
                    [0, 0, 45], // stand up -> partly bent
                    [0, 0, 0],
                ],
                leg_right_top: [
                    [0, 0, 0], // COPIED FROM LEFT LEG
                    [0, 0, 22.5], // high pt -> starting to bend (lag)
                    [0, 0, 45], // hits floor -> legs bent (lag)
                    [0, 0, 22.5], // bounce (in air) -> legs less bent (lag)
                    [0, 0, 45], // land + sit up -> legs bent(lag)
                    [0, 0, 70], // sit up -> bend more
                    [0, 0, 70], // sit still -> still legs
                    [0, 0, 135], // lean forward -> bend more (lower legs bending now)
                    [0, 0, 45], // stand up -> partly bent
                    [0, 0, 0],
                ],
                leg_left_bottom: [
                    [0, 0, 0],
                    [0, 0, 0], // high pt -> locked
                    [0, 0, 0], // hits floor -> locked
                    [0, 0, -22.5], // bounce (in air) -> bend a bit (lag)
                    [0, 0, 0], // land + sit up -> locked
                    [0, 0, 0], // sit up -> locked
                    [0, 0, 0], // sit still -> locked
                    [0, 0, -90], // lean forward -> locked
                    [0, 0, -45], // stand up -> partly bent
                    [0, 0, 0],
                ],
                leg_right_bottom: [
                    [0, 0, 0], // COPIED FROM LEFT LEG
                    [0, 0, 0], // high pt -> locked
                    [0, 0, 0], // hits floor -> locked
                    [0, 0, -22.5], // bounce (in air) -> bend a bit (lag)
                    [0, 0, 0], // land + sit up -> locked
                    [0, 0, 0], // sit up -> locked
                    [0, 0, 0], // sit still -> locked
                    [0, 0, -90], // lean forward -> locked
                    [0, 0, -45], // stand up -> partly bent
                    [0, 0, 0],
                ]
            },
            translateValues: {
                body: [
                    [0, 0, 0],
                    [0, 0.1, 0], // high point
                    [0, -0.1, 0], // on floor
                    [0, -0.03, 0], // bounce??
                    [0, -0.2, 0], // land + sitting up
                    [0, -0.3, 0],
                    [0, -0.3, 0], // sat up
                    [0, -0.3, 0],
                    [0, -0.03, 0],
                    [0, 0, 0],
                ]
            }
        }
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
        // if anim doesn't loop, 
        // check if it's over and play prev anim (if there is one)
        if (!anim.loop && timeCurrent - timeStart > anim.duration) {
            if (this.prevAnim === '') {
                this.stopAnim();
            } else {
                this.playAnim(this.prevAnim);
            }
        }
        
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
        for (const [part, values] of Object.entries(anim.angleValues)) {
            let v1 = values[keyIndex1];
            let v2 = values[keyIndex2];
            let v = this.lerp(v2, v1, ratio);
            this.angles[part] = v;
        }

        // do the same for translation
        for (const [part, values] of Object.entries(anim.translateValues)) {
            let v1 = values[keyIndex1];
            let v2 = values[keyIndex2];
            let v = this.lerp(v2, v1, ratio);
            this.translates[part] = v;
        }
    }

    playAnim(animKey) {
        if (this.animating && !this.anims[animKey].loop) {
            this.prevAnim = this.currentAnim;
        } else {
            this.prevAnim = '';
        }
        this.currentAnim = animKey;
        this.animating = true;
        this.animLoops = 0;
    }
    stopAnim() {
        this.animating = false;
        this.currentAnim = '';
        this.prevAnim = '';
        this.animLoops = 0;
    }

    render(timeStart, timeCurrent) {
        if (this.animating) {
            this.animate(this.currentAnim, timeStart, timeCurrent);
        }
        // update shape positions
        this.transformParts();
        for (const [p, s] of Object.entries(this.parts)) {
            s.render();
        }
        //this.parts.leg_left_top.render();
    }
}