// TODO: add physics to make this nicer

class CameraControl {
    constructor(target, sprite, THREE) {
        this.target = target;
        this.sprite = sprite;
        this.speed = 1;
        // this.keys = {
        //     forward: "w",
        //     backward: "s",
        //     left: "a",
        //     right: "d"
        // }
        // this.keys = ["w", "a", "s", "d"];
        this.dir = new THREE.Vector2(0, 0);
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
        this.dir = this.dir.normalize();
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
        this.dir = this.dir.normalize();
    }



    // move rotation of target based on direction
    move(deltaTime) {
        if (this.target != null) {
            this.target.rotation.y -= deltaTime * this.dir.x / 500;
            this.target.rotation.x -= deltaTime * this.dir.y / 500;
        }
    }
}