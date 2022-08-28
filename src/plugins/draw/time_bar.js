import * as PIXI from "pixi.js";
import { DropShadowFilter, TiltShiftAxisFilter } from "pixi-filters";

export class TimeBar extends PIXI.Container {
    constructor(x, y, width, height, time = 0, startTime = 0, endTime = 10) {
        super();
        this.pX = x;
        this.pY = y;
        this.pWidth = width;
        this.pHeight = height;
        this.pTime = time;
        this.pStartTime = startTime;
        this.pEndTime = endTime;

        this.pRangeSelection = null
        this.pRangeSelectedColor = 0xd99090;

        this.pMask = new PIXI.Graphics();
        this.pMask.beginFill(0xffffff);
        this.pMask.drawRoundedRect(0, 0, width, height, 5);

        this.pMask.x = x;
        this.pMask.y = y;
        this.mask = this.pMask;
        this.addChild(this.pMask);

        const handleWidth = 10;
        const handleHeight = 10;

        const timeX = this.timeToX(time);
        this.pCursor = new PIXI.Graphics()
            .lineStyle(1, 0xae1313, 1)
            .beginFill(0xae1313)
            .moveTo(0, height)
            .lineTo(0, handleHeight)
            .lineTo(handleWidth, 0)
            .lineTo(-handleWidth, 0)
            .lineTo(0, handleHeight)
            .closePath()
            .endFill();
        this.pCursor.x = timeX;
        this.pCursor.y = 25;
        this.addChild(this.pCursor);

        let shadow = new DropShadowFilter();
        shadow.color = 0x0000;
        shadow.distance = 2;
        shadow.alpha = 0.4;
        shadow.rotation = 90;
        shadow.blur = 1;
        this.pCursor.filters = [shadow];
    }
    get timeScale() {
        return this.pWidth / (this.pEndTime - this.pStartTime);
    }
    timeToX(time) {
        return this.pX + this.timeScale * (time - this.pStartTime);
    }
    scaleSegment() {
        this.pCursor.x = this.timeToX(this.pTime);
    }
    selectRange(start, end) {
        if (this.pRangeSelection) {
            this.pRangeSelection.destroy()
            this.pRangeSelection = null;
        }

        const selectionRect = new PIXI.Graphics();

        const x = this.timeToX(start);

        const width = this.timeToX(end) - this.timeToX(start);
        const height = this.pHeight;
        selectionRect.lineStyle(2, this.pRangeSelectedColor, 1);

        selectionRect.beginFill(this.pRangeSelectedColor, 0.4);
        selectionRect.drawRoundedRect(0, 25, width, height - 60, 1);
        selectionRect.x = x

        this.pRangeSelection = selectionRect;
        this.addChild(selectionRect)
    }
    removeSelectRange() {
        if (this.pRangeSelection) {
            this.pRangeSelection.destroy()
            this.pRangeSelection = null;
        }
    }
    set startTime(time) {
        this.pStartTime = time;
        this.scaleSegment();
    }
    get startTime() {
        return this.pStartTime;
    }
    set endTime(time) {
        this.pEndTime = time;
        this.scaleSegment();
    }
    get endTime() {
        return this.pEndTime;
    }
    set time(time) {
        this.pTime = time;
        this.scaleSegment();
    }
    get time() {
        return this.pTime;
    }
}