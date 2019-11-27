import { EventDispatcher, Clock, Vector2 } from "https://unpkg.com/three@0.110.0/build/three.module.js";

export default class MaskControls {
    constructor(camera, canvas, object) {
        this.camera = camera;
        this.canvas = canvas;
        this.object = object;

        this.clock = new Clock();

        this.mouseStarted = false;
        canvas.addEventListener("mousedown", () => this.mouseStarted = true);
        canvas.addEventListener("mouseup", this.onMouseLeave.bind(this));
        canvas.addEventListener("mouseleave", this.onMouseLeave.bind(this));
        canvas.addEventListener("mousemove", this.onMouseMove.bind(this));

        this.touch = null;
        this.lastVector = new Vector2();
        this.newVector = new Vector2();
        this.deltaVector = new Vector2();
        canvas.addEventListener("touchstart", e => {
            if(!this.touch) {
                this.touch = e.touches.item(0);
                this.lastVector.set(this.touch.pageX, this.touch.pageY);
            }
        });
        canvas.addEventListener("touchmove", this.onTouchMove.bind(this));
        canvas.addEventListener("touchend", this.onTouchLeave.bind(this));
        canvas.addEventListener("touchcancel", this.onTouchLeave.bind(this));
    }

    /**
     * Triggered with mouse movement
     * @param {MouseEvent} ev 
     */
    onMouseMove(ev) {
        if(!this.mouseStarted) return;

        ev.preventDefault();
        this.object.rotation.y += 2 * Math.PI * ev.movementX / this.canvas.width;
        this.object.rotation.x += 2 * Math.PI * ev.movementY / this.canvas.width;
        this.dispatchEvent({ type: "move" });
    }

    onMouseLeave() {
        this.mouseStarted = false;
        this.clock.getDelta();
        requestAnimationFrame(this.updateRotation.bind(this));
    }

    /**
     * Triggered with finger movement
     * @param {TouchEvent} ev 
     */
    onTouchMove(ev) {
        ev.preventDefault();
        for(const touch of ev.changedTouches) {
            if(touch.identifier !== this.touch.identifier) continue;
            this.newVector.set(touch.pageX, touch.pageY);
            this.deltaVector.subVectors(this.newVector, this.lastVector);
            this.object.rotation.y += 2 * Math.PI * this.deltaVector.x / this.canvas.width;
            this.object.rotation.x += 2 * Math.PI * this.deltaVector.y / this.canvas.width;
            this.lastVector.copy(this.newVector);
            break;
        }
        this.dispatchEvent({ type: "move" });
    }

    /**
     * Triggered with a finger leaving the element
     * @param {TouchEvent} ev 
     */
    onTouchLeave(ev) {
        let found = false;
        for(const touch of ev.touches) {
            if(touch.identifier === this.touch.identifier) found = true;
        }
        if(!found) this.touch = null;
        if(ev.touches.length > 0) {
            this.touch = ev.touches.item(0);
            this.lastVector.set(this.touch.pageX, this.touch.pageY);
            return;
        }
        this.clock.getDelta();
        requestAnimationFrame(this.updateRotation.bind(this));
    }

    updateRotation() {
        if(this.mouseStarted || this.touch) return;
        const clone = this.object.quaternion.clone();
        if(clone.x == 0 && clone.z == 0) return;
        clone.x = 0, clone.z = 0;
        this.object.quaternion.slerp(clone, this.clock.getDelta() * 2);
        requestAnimationFrame(this.updateRotation.bind(this));
    
        this.dispatchEvent({ type: "move" });
    }
}

Object.assign(MaskControls.prototype, EventDispatcher.prototype);