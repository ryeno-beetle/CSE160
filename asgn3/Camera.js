class Camera {
    constructor() {
        this.eye = new Vector3([0, 0, 3]);
        this.at = new Vector3([0, 0, -100]);
        this.up = new Vector3([0, 1, 0]);
        this.viewMat = new Matrix4();
        this.setUpProjMat();
        this.setUpKeyEvents();
    }

    setUpKeyEvents() {
        this.keysPressed = new Set();
        // movement keys
        this.keys = {
            w: 'move_forward',
            s: 'move_backward',
            a: 'move_left',
            d: 'move_right',
            q: 'turn_left',
            e: 'turn_right',
        }
        // // add key press to keyspressed list if it's one of our movement keys
        // document.onkeydown = (ev) => { 
        //     if (Object.keys(this.keys).includes(ev.key)) {
        //         this.keysPressed.add(ev.key);
        //     }
        // }
        // // remove it on keyup event
        // document.onkeyup = (ev) => {
        //     if (this.keysPressed.has(ev.key)) {
        //         this.keysPressed.delete(ev.key);
        //     }
        // }
    }

    onKeyDown(ev) {
        // add key press to keyspressed list if it's one of our movement keys
        if (Object.keys(this.keys).includes(ev.key)) {
            this.keysPressed.add(ev.key);
        }
    }
    onKeyUp(ev) {
        // remove it on keyup event
        if (this.keysPressed.has(ev.key)) {
            this.keysPressed.delete(ev.key);
        }
    }

    // moveForward() {
    //     let d = new Vector3(this.at.elements).sub(this.eye);
    //     d.normalize();
    //     d.div(10);
    //     this.eye.add(d);
    //     this.at.add(d);
    // }
    // moveBackward() {
    //     let d = new Vector3(this.at.elements).sub(this.eye);
    //     d.normalize();
    //     d.div(10);
    //     this.eye.sub(d);
    //     this.at.sub(d);
    // }
    // moveLeft() {
    //     let d = new Vector3(this.at.elements).sub(this.eye);
    //     let left = Vector3.cross(d, this.up);
    //     left.normalize();
    //     left.div(10);
    //     this.eye.sub(left);
    //     this.at.sub(left);
    // }
    // moveRight() {
    //     let d = new Vector3(this.at.elements).sub(this.eye);
    //     let left = Vector3.cross(d, this.up);
    //     left.normalize();
    //     left.div(10);
    //     this.eye.add(left);
    //     this.at.add(left);
    // }

    turnCamera(angle_h, angle_v) {
        let d = new Vector3(this.at.elements).sub(this.eye);
        let x = d.elements[0];
        let y = d.elements[1];
        let z = d.elements[2];
        let r = Math.sqrt(x * x + z * z + y * y);
        let theta = Math.atan(z / x);
        let phi = Math.acos(y / r);
        // atan range -pi/2, pi/2
        if (x < 0) {
            theta += Math.PI;
        }
        theta += angle_h;
        phi += angle_v;
        // console.log("BEFORE");
        // console.log("x:"+ x + ", z:" + z + ", r:" + r + ", theta:" + theta);
        x = r * Math.cos(theta) * Math.sin(phi);
        z = r * Math.sin(theta) * Math.sin(phi);
        y = r * Math.cos(phi);
        // console.log("AFTER");
        // console.log("x: " + x + ", z: " + z);
        d = new Vector3([x, y, z]);
        // make d length 100
        d.normalize();
        d.mul(100);
        this.at = new Vector3(this.eye.elements).add(d);
    }

    move(movement) {
        let d = new Vector3(this.at.elements).sub(this.eye);
        d.elements[1] = 0;
        if (movement === 'move_forward' || movement === 'move_backward') {
            d.normalize();
            d.div(10);
            if (movement === 'move_forward') {
                this.eye.add(d);
                this.at.add(d);
            } else {
                this.eye.sub(d);
                this.at.sub(d);
            }
        } else if (movement === 'move_left' || movement === "move_right") {
            let right = Vector3.cross(d, this.up);
            right.normalize();
            right.div(10);
            if (movement === "move_left") {
                this.eye.sub(right);
                this.at.sub(right);
            } else {
                this.eye.add(right);
                this.at.add(right);
            }
        } else if (movement === 'turn_left') {
            this.turnCamera(Math.PI/50);
        } else if (movement === 'turn_right') {
            this.turnCamera(-Math.PI/50);
        }
    }

    getDirectionVector() {
        let d = new Vector3(this.at.elements).sub(this.eye);
        d.normalize();
        return d;
    }
    getEyeVector() {
        let e = new Vector3(this.eye.elements);
        return e;
    }

    checkKeysPressed() {
        for (const k of this.keysPressed.keys()) {
            this.move(this.keys[k]);
        }
    }

    updateAndSendViewMat() {
        this.checkKeysPressed();
        this.viewMat.setLookAt(...this.eye.elements,  ...this.at.elements, ...this.up.elements); // (eye, at, up)
        gl.uniformMatrix4fv(u_ViewMatrix, false, this.viewMat.elements);
    }

    setUpProjMat() {
        this.projMat = new Matrix4();
        this.projMat.setPerspective(60, canvas.width / canvas.height, 0.1, 200);
    }

    sendProjMat() {
        gl.uniformMatrix4fv(u_ProjectionMatrix, false, this.projMat.elements);
    }
}