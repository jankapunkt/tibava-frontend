import * as PIXI from "pixi.js";
import { DropShadowFilter } from "pixi-filters";
import * as Time from "./time.js";

function hex2luminance(string) {
  const rgb = PIXI.utils.hex2rgb(string);
  return Math.sqrt(
    0.299 * Math.pow(rgb[0], 2) +
      0.587 * Math.pow(rgb[1], 2) +
      0.114 * Math.pow(rgb[2], 2)
  );
}

function linspace(startValue, stopValue, cardinality) {
  var arr = [];
  var step = (stopValue - startValue) / (cardinality - 1);
  for (var i = 0; i < cardinality; i++) {
    arr.push(startValue + step * i);
  }
  return arr;
}

class AnnotationBadge extends PIXI.Container {
  constructor(x, y, text, padding = 2, color = 0xffffff) {
    super();

    const textColor = hex2luminance(color) > 0.5 ? 0x000000 : 0xffffff;

    this.pText = new PIXI.Text(text, {
      fill: textColor,
      fontSize: 14,
      // fontWeight: 'bold',
    });

    const textRect = new PIXI.Graphics();
    textRect.beginFill(color);
    textRect.drawRoundedRect(
      0,
      0,
      this.pText.width + 2 * padding,
      this.pText.height + 2 * padding,
      2
    );

    // let shadow = new DropShadowFilter();
    // shadow.color = 0x0000;
    // shadow.distance = 2;
    // shadow.alpha = 0.4;
    // shadow.rotation = 90;
    // shadow.blur = 1;
    // textRect.filters = [shadow];

    this.addChild(textRect);
    textRect.addChild(this.pText);
    this.pText.x = padding;
    this.pText.y = padding;
    this.x = x;
    this.y = y;
  }
}

class AnnotationSegment extends PIXI.Container {
  constructor(
    segment,
    x,
    y,
    width,
    height,
    color = 0xdddddd,
    selectedColor = 0xd99090,
    padding = 2,
    gap = 2
  ) {
    super();
    this.pPadding = padding;
    this.pGap = gap;
    this.pSegment = segment;
    this.x = x;
    this.y = y;
    this.pSelected = false;
    this.pSelectedColor = selectedColor;
    this.pColor = color;

    this.pWidth = width;
    this.pHeight = height;

    this.pRect = new PIXI.Graphics();
    this.drawBox();

    this.pMask = new PIXI.Graphics();
    this.pMask.beginFill(0xffffff);
    this.pMask.drawRoundedRect(0, 0, width, height, 1);
    this.pRect.mask = this.pMask;
    this.pRect.addChild(this.pMask);

    this.addChild(this.pRect);
    this.badges = [];
    if (this.pSegment.annotations) {
      var badgeX = this.pGap;
      var badgeY = this.pGap;
      var badgeXIndex = 0;
      this.pSegment.annotations.forEach((a) => {
        const text = new AnnotationBadge(
          badgeX,
          badgeY,
          a.annotation.name,
          padding,
          PIXI.utils.string2hex(a.annotation.color)
        );
        badgeX += text.width + this.pGap;
        if (badgeX > this.pRect.width && badgeXIndex > 0) {
          badgeY += text.height + this.pGap;
          badgeX = text.width + 2 * this.pGap;
          text.x = this.pGap;
          text.y = badgeY;
          badgeXIndex = 1;
        } else {
          badgeXIndex += 1;
        }
        text.mask = this.pMask;
        this.addChild(text);
        this.badges.push(text);
      });
    }
  }
  drawBox() {
    if (this.pSelected) {
      this.pRect.lineStyle(2, this.pSelectedColor, 1);
    }
    this.pRect.beginFill(this.pColor);
    this.pRect.drawRoundedRect(0, 0, this.pWidth, this.pHeight, 1);
  }
  set width(value) {
    this.pRect.width = value;

    var badgeX = this.pGap;
    var badgeY = this.pGap;
    var badgeXIndex = 0;
    this.badges.forEach((e) => {
      e.x = badgeX;
      e.y = badgeY;
      badgeX += e.width + this.pGap;
      if (badgeX > this.pRect.width && badgeXIndex > 0) {
        badgeY += e.height + this.pGap;
        badgeX = e.width + 2 * this.pGap;
        e.x = this.pGap;
        e.y = badgeY;
        badgeXIndex = 1;
      } else {
        badgeXIndex += 1;
      }
    });
  }
  get segment() {
    return this.pSegment;
  }
  set selected(value) {
    this.pSelected = value;
    this.pRect.clear();
    this.drawBox();
  }
}

class AnnotationTimeline extends PIXI.Container {
  constructor(
    timeline,
    x,
    y,
    width,
    height,
    startTime = 0,
    endTime = 10,
    fill = 0xffffff
  ) {
    super();
    this.pTimeline = timeline;
    this.pSegmentList = [];
    this.pX = x;
    this.pY = y;
    this.pWidth = width;
    this.pHeight = height;
    this.pStartTime = startTime;
    this.pEndTime = endTime;

    this.pRect = new PIXI.Graphics();
    this.pRect.beginFill(fill);
    this.pRect.drawRoundedRect(0, 0, width, height, 5);
    this.pRect.x = x;
    this.pRect.y = y;

    this.pMask = new PIXI.Graphics();
    this.pMask.beginFill(0xffffff);
    this.pMask.drawRoundedRect(0, 0, width, height, 5);
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

    this.pSegments = new PIXI.Container();
    if (this.pTimeline.segments) {
      this.pTimeline.segments.forEach((s, i) => {
        const x = this._timeToX(s.start);
        const y = this.pY;
        const width = this._timeToX(s.end) - this._timeToX(s.start);
        const height = this.pHeight;

        let segmentE = new AnnotationSegment(s, x, y, width, height);

        segmentE.interactive = true;
        segmentE.buttonMode = true;
        segmentE.on("rightdown", (ev) => {
          this.emit("segmentRightDown", {
            event: ev,
            segment: segmentE,
          });
          ev.stopPropagation();
        });

        segmentE.on("click", (ev) => {
          this.emit("segmentClick", {
            event: ev,
            segment: segmentE,
          });
          ev.stopPropagation();
        });

        segmentE.mask = this.pMask;

        this.pSegments.addChild(segmentE);
        this.pSegmentList.push(segmentE);
      });
      this.addChild(this.pSegments);
    }
  }
  get timeScale() {
    return this.pWidth / (this.pEndTime - this.pStartTime);
  }
  _timeToX(time) {
    return this.pX + this.timeScale * (time - this.pStartTime);
  }
  scaleSegment() {
    if (this.pTimeline.segments) {
      this.pTimeline.segments.forEach((s, i) => {
        const width = this._timeToX(s.end) - this._timeToX(s.start);
        const x = this._timeToX(s.start);
        this.pSegments.getChildAt(i).x = x;
        this.pSegments.getChildAt(i).width = width;
      });
    }
  }
  set startTime(time) {
    this.pStartTime = time;
    this.scaleSegment();
  }
  set endTime(time) {
    this.pEndTime = time;
    this.scaleSegment();
  }
  set selected(value) {
    this.pSelected = value;
  }
  get segments() {
    return this.pSegmentList;
  }
}

class TimelineHeader extends PIXI.Container {
  constructor(timeline, x, y, width, height, fill = 0xffffff) {
    super();
    this.pTimeline = timeline;
    this.pX = x;
    this.pY = y;
    this.pWidth = width;
    this.pHeight = height;

    const padding = 2;
    const gap = 4;

    this.pRect = new PIXI.Graphics();
    this.pRect.beginFill(fill);
    this.pRect.drawRoundedRect(0, 0, width, height, 5);
    this.pRect.x = x;
    this.pRect.y = y;

    this.pMask = new PIXI.Graphics();
    this.pMask.beginFill(0xffffff);
    this.pMask.drawRoundedRect(0, 0, width, height, 5);
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
    this.pText = new PIXI.Text(timeline.name, {
      fill: 0x000000,
      fontSize: 16,
      // fontWeight: 'bold',
    });
    this.pText.x = gap;
    this.pText.y = gap;
    this.pText.mask = this.pMask;

    this.pRect.addChild(this.pText);

    this.interactive = true;
    this.buttonMode = true;
    this.on("rightdown", (ev) => {
      this.emit("timelineRightDown", {
        event: ev,
        timeline: this,
      });
      ev.stopPropagation();
    });

    this.on("click", (ev) => {
      this.emit("timelineClick", {
        event: ev,
        timeline: this,
      });
      ev.stopPropagation();
    });
  }

  set width(value) {
    this.pRect.width = value;
  }
  get timeline() {
    return this.pTimeline;
  }
}

class TimeScale extends PIXI.Container {
  constructor(x, y, width, height, startTime = 0, endTime = 10) {
    super();
    this.pX = x;
    this.pY = y;
    this.pWidth = width;
    this.pHeight = height;
    this.pStartTime = startTime;
    this.pEndTime = endTime;

    this.pRect = new PIXI.Graphics();
    this.pRect.beginFill(0xffffff);
    this.pRect.drawRoundedRect(0, 0, width, height, 5);
    this.pRect.x = x;
    this.pRect.y = y;

    this.pMask = new PIXI.Graphics();
    this.pMask.beginFill(0xffffff);
    this.pMask.drawRoundedRect(0, 0, width, height, 5);
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

      let x = this._timeToX(time);
      const path = new PIXI.Graphics()
        .lineStyle(1, 0x000000, 1)
        .lineTo(0, 25)
        .closePath();
      path.x = x;
      path.y = 10;

      const timeCode = Time.get_timecode(time);
      const text = new PIXI.Text(timeCode, {
        fill: 0x000000,
        fontSize: 14,
        // fontWeight: 'bold',
      });
      text.x = x;
      text.y = 35;
      text.resolution = 2;
      path.mask = this.pMask;
      text.mask = this.pMask;
      this.pBars_graphics.addChild(path);
      this.pBars_graphics.addChild(text);
      this.pBars.push({
        time: time,
        stroke: path,
        text: text,
      });

      if ((time * 1000) % majorStroke == 0) {
        path.visible = true;
        text.visible = true;
        path.height = 10;
      } else if ((time * 1000) % minorStroke == 0) {
        path.visible = true;
        text.visible = false;
        path.height = 5;
      } else {
        path.visible = false;
        text.visible = false;
      }
    });

    this.addChild(this.pBars_graphics);
  }
  get timeScale() {
    return this.pWidth / (this.pEndTime - this.pStartTime);
  }
  _timeToX(time) {
    return this.pX + this.timeScale * (time - this.pStartTime);
  }
  scaleSegment() {
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
      const x = this._timeToX(time);

      if ((time * 1000) % majorStroke == 0) {
        e.stroke.visible = true;
        e.text.visible = true;
        e.stroke.height = 10;
      } else if ((time * 1000) % minorStroke == 0) {
        e.stroke.visible = true;
        e.text.visible = false;
        e.stroke.height = 5;
      } else {
        e.stroke.visible = false;
        e.text.visible = false;
      }
      e.stroke.x = x;
      e.text.x = x;
      if (e.text.x <= largestX) {
        e.text.visible = false;
      }

      if (e.text.visible) {
        largestX = e.text.x + e.text.width;
      }
    });
  }
  set startTime(time) {
    this.pStartTime = time;
    this.scaleSegment();
  }
  set endTime(time) {
    this.pEndTime = time;
    this.scaleSegment();
  }
}

export {
  AnnotationTimeline,
  TimelineHeader,
  TimeScale,
  hex2luminance,
  linspace,
};
