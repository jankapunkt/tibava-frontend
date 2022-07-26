import * as PIXI from "pixi.js";
import { DropShadowFilter, TiltShiftAxisFilter } from "pixi-filters";

import * as Time from "../time.js";

export class TimeScale extends PIXI.Container {
    constructor(x, y, width, height, startTime = 0, endTime = 10) {
        super();
        this.pX = x;
        this.pY = y;
        this.pWidth = width;
        this.pHeight = height;
        this.pStartTime = startTime;
        this.pEndTime = endTime;

        PIXI.BitmapFont.from(
            "scale_font",
            {
                fill: "#333333",
                fontSize: 10,
            },
            {
                chars: [["a", "z"], ["0", "9"], ["A", "Z"], " \\|/:.-^%$&*()!?"],
                // fontWeight: 'bold',
            }
        );

        this.pRect = null;
        this._drawBox();

        this.pBars_graphics = null;
        this._drawBars();
    }
    _drawBox() {
        if (this.pRect) {
            this.pRect.destroy();
        }
        this.pRect = new PIXI.Graphics();
        this.pRect.beginFill(0xffffff);
        this.pRect.drawRoundedRect(0, 0, this.pWidth, this.pHeight, 5);
        this.pRect.x = this.pX;
        this.pRect.y = this.pY;

        this.pMask = new PIXI.Graphics();
        this.pMask.beginFill(0xffffff);
        this.pMask.drawRoundedRect(0, 0, this.pWidth, this.pHeight, 5);
        this.pRect.mask = this.pMask;
        this.pRect.addChild(this.pMask);

        let shadow = new DropShadowFilter();
        shadow.color = 0x0000;
        shadow.distance = 2;
        shadow.alpha = 0.4;
        shadow.rotation = 90;
        shadow.blur = 1;
        this.pRect.filters = [shadow];

        this.addChild(this.pRect);
    }
    _drawBars() {
        if (this.pBars_graphics) {
            this.pBars_graphics.destroy();
        }
        this.pBars_graphics = new PIXI.Container();
        this.pBars = [];

        const visibleDuration = Math.round(
            1000 * (this.pEndTime - this.pStartTime)
        );
        const visibleDurationDigits = Math.floor(
            Math.log(visibleDuration) * Math.LOG10E
        );

        const majorStroke = Math.pow(10, visibleDurationDigits);
        const minorStroke = Math.pow(10, visibleDurationDigits - 1);

        const timestemps = Array(Math.ceil(this.pEndTime * 10))
            .fill(0)
            .map((_, i) => i);

        timestemps.forEach((time100, index) => {
            const timeFraction = Math.round(time100);
            const time = timeFraction / 10;
            const timeCode = Time.get_timecode(time);
            let bar = {
                timeCode: timeCode,
                time: time,
                stroke: null,
                text: null,
            };
            if (this.pStartTime <= time && time <= this.pEndTime) {
                if ((time * 1000) % majorStroke == 0) {
                    bar.stroke = this._drawStroke(time);
                    bar.text = this._drawTime(time, timeCode);
                    bar.stroke.height = this.pHeight - 25;

                    bar.stroke.mask = this.pMask;
                    bar.text.mask = this.pMask;

                    this.pBars_graphics.addChild(bar.stroke);
                    this.pBars_graphics.addChild(bar.text);
                } else if ((time * 1000) % minorStroke == 0) {
                    bar.stroke = this._drawStroke(time);
                    bar.stroke.height = this.pHeight - 35;

                    bar.stroke.mask = this.pMask;

                    this.pBars_graphics.addChild(bar.stroke);
                }
            }

            this.pBars.push(bar);
        });

        this.addChild(this.pBars_graphics);
    }
    _drawTime(time, timeCode) {
        const x = this.timeToX(time);
        const text = new PIXI.BitmapText(timeCode, { fontName: "scale_font" });
        text.x = x;
        text.y = 5;
        return text;
    }
    _drawStroke(time) {
        const x = this.timeToX(time);
        const path = new PIXI.Graphics()
            .lineStyle(1, 0x000000, 1)
            .lineTo(0, 25)
            .closePath();
        path.x = x;
        path.y = 25;
        return path;
    }
    timeToX(time) {
        return this.pX + this.timeScale * (time - this.pStartTime);
    }
    get timeScale() {
        return this.pWidth / (this.pEndTime - this.pStartTime);
    }
    _scale() {
        const visibleDuration = Math.round(
            1000 * (this.pEndTime - this.pStartTime)
        );

        const visibleDurationDigits = Math.floor(
            Math.log(visibleDuration) * Math.LOG10E
        );

        const majorStroke = Math.pow(10, visibleDurationDigits);
        const minorStroke = Math.pow(10, visibleDurationDigits - 1);

        var largestX = 0;
        this.pBars.forEach((e, i) => {
            const time = e.time;

            if (this.pStartTime <= time && time <= this.pEndTime) {
                const x = this.timeToX(time);
                if ((time * 1000) % majorStroke == 0) {
                    if (!e.text) {
                        e.text = this._drawTime(time, e.timeCode);
                        e.text.mask = this.pMask;

                        this.pBars_graphics.addChild(e.text);
                    }
                    e.text.x = x;

                    if (!e.stroke) {
                        e.stroke = this._drawStroke(time);
                        e.stroke.mask = this.pMask;
                        this.pBars_graphics.addChild(e.stroke);
                    }
                    e.stroke.x = x;
                    e.stroke.height = this.pHeight - 25;
                } else if ((time * 1000) % minorStroke == 0) {
                    if (e.text) {
                        e.text.destroy();
                        e.text = null;
                    }

                    if (!e.stroke) {
                        e.stroke = this._drawStroke(time);
                        e.stroke.mask = this.pMask;
                        this.pBars_graphics.addChild(e.stroke);
                    }
                    e.stroke.x = x;
                    e.stroke.height = this.pHeight - 35;
                } else {
                    if (e.stroke) {
                        e.stroke.destroy();
                        e.stroke = null;
                    }
                    if (e.text) {
                        e.text.destroy();
                        e.text = null;
                    }
                }
                if (e.text && e.text.x <= largestX) {
                    e.text.destroy();
                    e.text = null;
                }

                if (e.text) {
                    largestX = e.text.x + e.text.width;
                }
            } else {
                if (e.stroke) {
                    e.stroke.destroy();
                    e.stroke = null;
                }
                if (e.text) {
                    e.text.destroy();
                    e.text = null;
                }
            }
        });
    }
    set startTime(time) {
        this.pStartTime = time;
        this._scale();
    }
    set endTime(time) {
        this.pEndTime = time;
        this._scale();
    }
}