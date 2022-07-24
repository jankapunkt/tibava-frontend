import * as PIXI from "pixi.js";
import { DropShadowFilter, TiltShiftAxisFilter } from "pixi-filters";

import { Timeline } from "./timeline";

export class ScalarLineTimeline extends Timeline {
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

    this.path = this.renderGraph(renderer, resolution);

    // this.path.y = this.pHeight / 2;

    this.addChild(this.path);
  }

  renderGraph(renderer, resolution) {
    const renderWidth = Math.ceil(this.pDuration / resolution);

    const brt = new PIXI.BaseRenderTexture(
      renderWidth,
      this.pHeight,
      PIXI.SCALE_MODES.NEAREST,
      1
    );
    const rt = new PIXI.RenderTexture(brt);

    const sprite = new PIXI.Sprite(rt);

    const path = new PIXI.Graphics().lineStyle(1, 0xae1313, 1);

    this.pData.time.forEach((t, i) => {
      if (i == 0) {
        path.moveTo(
          t / resolution,
          this.pHeight - this.pData.y[i] * this.pHeight
        );
      }
      path.lineTo(
        t / resolution,
        this.pHeight - this.pData.y[i] * this.pHeight
      );
    });

    renderer.render(path, rt);
    return sprite;
  }

  scaleContainer() {
    if (this.path) {
      const width = this.timeToX(this.pDuration) - this.timeToX(0);
      const x = this.timeToX(0);
      this.path.x = x;
      this.path.width = width;
    }
  }
}
