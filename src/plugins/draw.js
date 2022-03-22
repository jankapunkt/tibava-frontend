import * as PIXI from "pixi.js";
import { DropShadowFilter } from "pixi-filters";

class AnnotationTimeline {
    constructor({
      timeline,
      x,
      y,
      width,
      height,
      fill = 0xffffff,
      startTime = 0,
      endTime = 10,
    }) {
      this._timeline = timeline;
      this._x = x;
      this._y = y;
      this._width = width;
      this._height = height;
      this._startTime = startTime;
      this._endTime = endTime;
      this._container = new PIXI.Container();
  
      this._rect = new PIXI.Graphics();
      this._rect.beginFill(fill);
      this._rect.drawRoundedRect(0, 0, width, height, 5);
      this._rect.x = x;
      this._rect.y = y;
      this._rect.interactive = true;
      this._rect.buttonMode = true;
      this._rect.on('pointerdown', (ev) => {
        console.log(ev)
      });
  
      this._mask = new PIXI.Graphics();
      this._mask.beginFill(0xffffff);
      this._mask.drawRoundedRect(0, 0, width, height, 5);
      this._rect.mask = this._mask;
      this._rect.addChild(this._mask);
  
      let shadow = new DropShadowFilter();
      shadow.color = 0x0000;
      shadow.distance = 2;
      shadow.alpha = 0.4;
      shadow.rotation = 90;
      shadow.blur = 1;
      this._rect.filters = [shadow];
  
      this._container.addChild(this._rect);
  
      this._segments = new PIXI.Container();
      if (this._timeline.segments) {
        this._timeline.segments.forEach((s, i) => {
          const x = this.timeToX(s.start);
          const y = this._y;
          const width = this.timeToX(s.end) - this.timeToX(s.start);
          const height = this._height;
  
          let segmentE = new PIXI.Graphics();
          segmentE.beginFill(0xff00ff);
          segmentE.drawRoundedRect(0, 0, width, height, 1);
          segmentE.x = x;
          segmentE.y = y;
  
          segmentE.mask = this._mask;
          
          // segmentE.mask = this._mask;
          this._segments.addChild(segmentE);
        });
        this._container.addChild(this._segments);
      }
    }
    get element() {
      return this._container;
    }
    get scale() {
      return this._width / (this._endTime - this._startTime);
    }
    timeToX(time) {
      return this._x + this.scale * (time - this._startTime);
    }
    scaleSegment() {
      if (this._timeline.segments) {
        this._timeline.segments.forEach((s, i) => {
          const width = this.timeToX(s.end) - this.timeToX(s.start);
          const x = this.timeToX(s.start);
          this._segments.getChildAt(i).x = x;
          this._segments.getChildAt(i).width = width;
        });
      }
    }
    set startTime(time) {
      this._startTime = time;
      this.scaleSegment();
    }
    set endTime(time) {
      this._endTime = time;
      this.scaleSegment();
    }
  }

export { AnnotationTimeline };