import * as PIXI from "pixi.js";
import { DropShadowFilter, TiltShiftAxisFilter } from "pixi-filters";

import { Timeline } from "./timeline";

import { hex2luminance } from "./utils";

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
  constructor({
    segmentId,
    data,
    width,
    height,
    color = 0xdddddd,
    selectedColor = 0xd99090,
    padding = 2,
    gap = 2,
  }) {
    super();
    this.pSegmentId = segmentId;
    this.pPadding = padding;
    this.pGap = gap;
    this.pSegment = data;
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
  get segmentId() {
    return this.pSegmentId;
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

export class AnnotationTimeline extends Timeline {
  constructor({
    timelineId,
    width,
    height,
    startTime = 0,
    endTime = 10,
    duration = 10,
    data = null,
    fill = 0xffffff,
    selected = null,
  }) {
    super({ timelineId, width, height, startTime, endTime, duration, fill });
    this.pTimeline = data;
    this.pSegmentList = [];

    this.pSegments = new PIXI.Container();
    const colorOdd = 0xeeeeee;
    const colorEven = 0xdddddd;
    if (this.pTimeline.segments) {
      this.pTimeline.segments.forEach((s, i) => {
        const x = this.timeToX(s.start);
        // const y = this.pY;
        const width = this.timeToX(s.end) - this.timeToX(s.start);
        const height = this.pHeight;

        let segmentE = new AnnotationSegment({
          segmentId: s.id,
          data: s,
          color: i % 2 == 0 ? colorOdd : colorEven,
          width: width,
          height: height,
        });
        segmentE.x = x;
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

        segmentE.on("pointerover", (ev) => {
          this.emit("segmentOver", {
            event: ev,
            segment: segmentE,
          });
          ev.stopPropagation();
        });

        segmentE.on("pointerout", (ev) => {
          this.emit("segmentOut", {
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
    if (selected) {
      if (selected instanceof Array) {
        selected.forEach((s) =>
          this.selected({
            selected: true,
            segment: s,
          })
        );
      } else {
        this.selected({
          selected: true,
          segment: selected,
        });
      }
    }
  }
  scaleContainer() {
    if (this.pTimeline.segments) {
      this.pTimeline.segments.forEach((s, i) => {
        const width = this.timeToX(s.end) - this.timeToX(s.start);
        const x = this.timeToX(s.start);
        this.pSegments.getChildAt(i).x = x;
        this.pSegments.getChildAt(i).width = width;
      });
    }
  }
  selected({ selected = true, segment = null }) {
    if (segment) {
      this.pSegmentList
        .filter((e) => segment.id === e.segmentId)
        .forEach((e) => (e.selected = selected));
    }
  }
  get segments() {
    return this.pSegmentList;
  }
}
