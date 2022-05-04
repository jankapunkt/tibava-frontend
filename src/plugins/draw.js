import * as PIXI from "pixi.js";
import { DropShadowFilter } from "pixi-filters";
import * as Time from "./time.js";

export function hex2luminance(string) {
  const rgb = PIXI.utils.hex2rgb(string);
  return Math.sqrt(
    0.299 * Math.pow(rgb[0], 2) +
    0.587 * Math.pow(rgb[1], 2) +
    0.114 * Math.pow(rgb[2], 2)
  );
}

export function linspace(startValue, stopValue, cardinality) {
  var arr = [];
  var step = (stopValue - startValue) / (cardinality - 1);
  for (var i = 0; i < cardinality; i++) {
    arr.push(startValue + step * i);
  }
  return arr;
}

export class AnnotationBadge extends PIXI.Container {
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

export class AnnotationSegment extends PIXI.Container {
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
        console.log(JSON.stringify(a))
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

export class ScalarTimeline extends PIXI.Container {
  constructor(
    timeline,
    x,
    y,
    width,
    height,
    startTime = 0,
    endTime = 10,
    data = null,
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
    this.pData = data;

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

    this.path = new PIXI.Graphics()
      .lineStyle(1, 0xae1313, 1)
      .moveTo(0, 0)
    this.pData.time.forEach((t, i) => {
      this.path.lineTo(this._timeToX(t), this.pData.y[i] * this.pHeight / 2)
    })
    console.log('done')
    this.path.closePath();

    this.path.y = this.pHeight / 2;
    this.pRect.addChild(this.path);
  }
  get timeScale() {
    return this.pWidth / (this.pEndTime - this.pStartTime);
  }
  _timeToX(time) {
    return this.timeScale * (time - this.pStartTime);
  }
  scalePath() {
    if (this.path) {
      const width = this._timeToX(this.pData.time[this.pData.time.length - 1]) - this._timeToX(this.pData.time[0]);
      const x = this._timeToX(this.pData.time[0]);
      this.path.x = x;
      this.path.width = width;
    }
  }
  set startTime(time) {
    this.pStartTime = time;
    this.scalePath();
  }
  set endTime(time) {
    this.pEndTime = time;
    this.scalePath();
  }
  set selected(value) {
    this.pSelected = value;
  }
  get segments() {
    return this.pSegmentList;
  }
}


export class AnnotationTimeline extends PIXI.Container {
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

export class TimelineHeader extends PIXI.Container {
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

export class TimeScale extends PIXI.Container {
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
      path.y = 25;

      const timeCode = Time.get_timecode(time);
      const text = new PIXI.Text(timeCode, {
        fill: 0x000000,
        fontSize: 14,
        // fontWeight: 'bold',
      });
      text.x = x;
      text.y = 5;
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
        path.height = this.pHeight - 25;
      } else if ((time * 1000) % minorStroke == 0) {
        path.visible = true;
        text.visible = false;
        path.height = this.pHeight - 35;
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
        e.stroke.height = this.pHeight - 25;
      } else if ((time * 1000) % minorStroke == 0) {
        e.stroke.visible = true;
        e.text.visible = false;
        e.stroke.height = this.pHeight - 35;
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

    this.pMask = new PIXI.Graphics();
    this.pMask.beginFill(0xffffff);
    this.pMask.drawRoundedRect(0, 0, width, height, 5);

    this.pMask.x = x;
    this.pMask.y = y;
    this.mask = this.pMask;
    this.addChild(this.pMask);

    const handleWidth = 10;
    const handleHeight = 10;

    const timeX = this._timeToX(time);
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
  _timeToX(time) {
    return this.pX + this.timeScale * (time - this.pStartTime);
  }
  scaleSegment() {
    this.pCursor.x = this._timeToX(this.pTime);
  }
  set startTime(time) {
    this.pStartTime = time;
    this.scaleSegment();
  }
  set endTime(time) {
    this.pEndTime = time;
    this.scaleSegment();
  }
  set time(time) {
    this.pTime = time;
    this.scaleSegment();
  }
}

export class Button extends PIXI.Container {
  constructor(x, y, width, height, icon) {
    super();
    this.pX = x;
    this.pY = y;
    this.pMargin = 2;
    this.pWidth = width;
    this.pHeight = height;
    this.pSprite = PIXI.Sprite.from(icon);
    this.pSprite.x = this.pMargin;
    this.pSprite.y = this.pMargin;

    this.pBoxWidth = this.pSprite.width + 2 * this.pMargin;
    this.pBoxHeight = this.pSprite.height + 2 * this.pMargin;

    this.pRect = new PIXI.Graphics();
    this.pRect.beginFill(0xffffff);
    this.pRect.drawRoundedRect(0, 0, this.pBoxWidth, this.pBoxHeight, 5);
    this.pRect.x = x;
    this.pRect.y = y;

    this.pRect.addChild(this.pSprite);
    // this.pMask = new PIXI.Graphics();
    // this.pMask.beginFill(0xffffff);
    // this.pMask.drawRoundedRect(0, 0, this.pBoxWidth, this.pBoxHeight, 5);

    // this.pRect.mask = this.pMask;

    let shadow = new DropShadowFilter();
    shadow.color = 0x0000;
    shadow.distance = 2;
    shadow.alpha = 0.4;
    shadow.rotation = 90;
    shadow.blur = 1;
    this.pRect.filters = [shadow];

    this.addChild(this.pRect);
    this.pRect.interactive = true;
    this.pRect.buttonMode = true;
    this.pRect.on("pointerover", this.onButtonOver);
    this.pRect.on("pointerout", this.onButtonOut);

    this.pRect.on("pointerdown", this.onButtonDown);
    this.pRect.on("pointerup", this.onButtonUp);
    this.pRect.on("pointerupoutside", this.onButtonUp);
    this.pRect.on("click", this.onClick);
  }
  onButtonOver = () => {
    this.pIsOver = true;
    if (this.pIsDown) {
      return;
    }
    this.pRect.clear();
    this.pRect.beginFill(0xeeeeee);
    this.pRect.drawRoundedRect(0, 0, this.pBoxWidth, this.pBoxHeight, 5);
  };
  onButtonOut = () => {
    this.pIsOver = false;
    if (this.pIsDown) {
      return;
    }
    this.pRect.clear();
    this.pRect.beginFill(0xffffff);
    this.pRect.drawRoundedRect(0, 0, this.pBoxWidth, this.pBoxHeight, 5);
  };
  onButtonUp = () => {
    this.pIsDown = false;

    let shadow = new DropShadowFilter();
    shadow.color = 0x0000;
    shadow.distance = 2;
    shadow.alpha = 0.4;
    shadow.rotation = 90;
    shadow.blur = 1;
    this.pRect.filters = [shadow];
  };
  onButtonDown = (event) => {
    this.pIsDown = true;

    let shadow = new DropShadowFilter();
    shadow.color = 0x0000;
    shadow.distance = 0;
    shadow.alpha = 0.4;
    shadow.rotation = 90;
    shadow.blur = 1;
    this.pRect.filters = [shadow];
  };
  onClick = (event) => {
    this.emit("click", event);
  };
}
