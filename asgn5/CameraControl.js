// TODO: add physics to make this nicer

class CameraControl {
    constructor(target, sprite, spriteAnimInfo, THREE) {
        this.THREE = THREE;
        this.target = target;
        this.sprite = sprite;
        this.spriteAnimInfo = spriteAnimInfo;
        this.speed = 1;
        // this.keys = {
        //     forward: "w",
        //     backward: "s",
        //     left: "a",
        //     right: "d"
        // }
        // this.keys = ["w", "a", "s", "d"];
        this.dir = new THREE.Vector2(0, 0);
        this.moveVector = new THREE.Vector2(0, 0);

        this.spriteAngle = sprite.rotation;
    }

    onKeyDown(ev) {
        if (ev.key === "w") { // FORWARD
            this.dir.y = 1;
        } else if (ev.key === "s") { // BACKWARD
            this.dir.y = -1;
        } else if (ev.key === "a") { // LEFT
            this.dir.x = -1;
        } else if (ev.key === "d") { // RIGHT
            this.dir.x = 1;
        }
        // console.log(this.dir);
        this.moveVector.x = this.dir.x;
        this.moveVector.y = this.dir.y;
        this.moveVector = this.moveVector.normalize();
        // this.dir = this.dir.normalize();
        // this.spriteAngle.y = this.dir.angle();
    }

    onKeyUp(ev) {
        if (ev.key === "w" && this.dir.y > 0) { // FORWARD
            this.dir.y = 0;
        } else if (ev.key === "s" && this.dir.y < 0) { // BACKWARD
            this.dir.y = 0;
        } else if (ev.key === "a" && this.dir.x < 0) { // LEFT
            this.dir.x = 0;
        } else if (ev.key === "d" && this.dir.x > 0) { // RIGHT
            this.dir.x = 0;
        }
        // console.log(this.dir);
        this.moveVector.x = this.dir.x;
        this.moveVector.y = this.dir.y;
        this.moveVector = this.moveVector.normalize();
        // this.dir = this.dir.normalize();
        // this.spriteAngle.y = this.dir.angle();
    }

    updateSpriteAngle() {
        let angle_cur = this.spriteAngle.y;
        let angle_new = this.dir.angle();
        if (angle_cur < angle_new - 0.1) { // threshold
            if (angle_cur - angle_new < - Math.PI) {
                this.spriteAngle.y += Math.PI * 2;
                this.spriteAngle.y -= 0.1;
            } else {
                this.spriteAngle.y += 0.1;
            }
        } else if (angle_cur > angle_new + 0.1) { // threshold
            if (angle_cur - angle_new > Math.PI) {
                this.spriteAngle.y -= Math.PI * 2;
                this.spriteAngle.y += 0.1;
            } else {
                this.spriteAngle.y -= 0.1;
            }
        }
    }



    // move rotation of target based on direction
    move(deltaTime) {
        if (this.target != null) {
            this.target.rotateOnWorldAxis(new this.THREE.Vector3(0, -1, 1), this.moveVector.x / 200);
            this.target.rotateOnWorldAxis(new this.THREE.Vector3(1, 0, 0), this.moveVector.y / 130);
            // this.target.rotation.y -= deltaTime * this.moveVector.x / 500;
            // this.target.rotation.z += deltaTime * this.moveVector.y / 500;
        }
        if (this.sprite != null && this.dir.length() > 0) {
            this.updateSpriteAngle();
            
            // update animation
            if (!this.spriteAnimInfo.anims[0].isRunning()) {
                this.spriteAnimInfo.mixer.stopAllAction();
                this.spriteAnimInfo.anims[0].play();
            }
            this.spriteAnimInfo.mixer.update( 1/36 );
        } else {
            if (!this.spriteAnimInfo.anims[1].isRunning()) {
                this.spriteAnimInfo.mixer.stopAllAction();
                this.spriteAnimInfo.anims[1].play();
            }
            this.spriteAnimInfo.mixer.update( 1/100 );
        }
    }
}