import * as PIXI from "pixi.js";
import { DropShadowFilter, TiltShiftAxisFilter } from "pixi-filters";

import { Timeline } from "./timeline";

export class ColorTimeline extends Timeline {
    constructor({
        timelineId,
        width = 10,
        height = 10,
        startTime = 0,
        endTime = 10,
        duration = 10,
        data = null,
        fill = 0xffffff,
        renderer = null,
        resolution = 0.01,
    }) {
        super({ timelineId, width, height, startTime, endTime, duration, fill });

        this.pData = data;

        this.pDataMinTime = Math.min(...data.time);
        this.pDataMaxTime = Math.max(...data.time);

        this.cRects = this.renderGraph(renderer, resolution);

        this.addChild(this.cRects);
    }

    renderGraph(renderer, resolution) {
        const renderWidth = Math.ceil(
            (this.pDataMaxTime - this.pDataMinTime) / resolution
        );

        const brt = new PIXI.BaseRenderTexture(
            renderWidth,
            this.pHeight,
            PIXI.SCALE_MODES.LINEAR,
            1
        );
        const rt = new PIXI.RenderTexture(brt);

        const sprite = new PIXI.Sprite(rt);
        var prevX = 0;
        let colorRects = new PIXI.Graphics();
        this.pData.time.forEach((t, i) => {
            let color = PIXI.utils.rgb2hex(this.pData.colors[i]);
            colorRects.beginFill(color);
            colorRects.drawRect(
                t / resolution,
                0,
                (t + this.pData.delta_time) / resolution,
                this.pHeight
            );
            prevX = t / resolution;
        });

        renderer.render(colorRects, rt);
        return sprite;
    }

    scaleContainer() {
        if (this.cRects) {
            const width =
                this.timeToX(this.pData.time[this.pData.time.length - 1]) -
                this.timeToX(this.pData.time[0]);
            const x = this.timeToX(this.pData.time[0]);
            this.cRects.x = x;
            this.cRects.width = width;
        }
    }
}
