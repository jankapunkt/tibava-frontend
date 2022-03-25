import * as PIXI from "pixi.js";
import {
  DropShadowFilter
} from "pixi-filters";

function hex2luminance(string) {
  const rgb = PIXI.utils.hex2rgb()
  return Math.sqrt(0.299 * Math.pow(rgb[0], 2) + 0.587 * Math.pow(rgb[1], 2) + 0.114 * Math.pow(rgb[2], 2))
}



class AnnotationBadge extends PIXI.Container {
  constructor(x, y, text, padding = 2, color = 0xffffff) {
    super()


    const textColor = hex2luminance(color) > 0.5 ? 0x000000 : 0xFFFFFF

    this._i_text = new PIXI.Text(text, {
      fill: textColor,
      fontSize: 14,
      // fontWeight: 'bold',
    });


    const textRect = new PIXI.Graphics();
    textRect.beginFill(color);
    textRect.drawRoundedRect(0, 0, this._i_text.width + 2 * padding, this._i_text.height + 2 * padding, 2);

    let shadow = new DropShadowFilter();
    shadow.color = 0x0000;
    shadow.distance = 2;
    shadow.alpha = 0.4;
    shadow.rotation = 90;
    shadow.blur = 1;
    textRect.filters = [shadow];

    this.addChild(textRect)
    textRect.addChild(this._i_text)
    this._i_text.x = padding;
    this._i_text.y = padding;
    this.x = x;
    this.y = y;
  }
}


class AnnotationSegment extends PIXI.Container {
  constructor(segment,
    x,
    y,
    width,
    height, color = 0xdddddd) {
    super()
    const padding = 2;
    const gap = 4;
    this._i_segment = segment;
    this._i_rect = new PIXI.Graphics();
    this._i_rect.beginFill(color);
    this._i_rect.drawRoundedRect(0, 0, width, height, 1);
    this.x = x;
    this.y = y;


    this._i_mask = new PIXI.Graphics();
    this._i_mask.beginFill(0xffffff);
    this._i_mask.drawRoundedRect(0, 0, width, height, 1);
    this._i_rect.mask = this._i_mask;
    this._i_rect.addChild(this._i_mask);


    this.addChild(this._i_rect);
    // console.log(JSON.stringify(this._i_segment))
    this.badges = []
    if (this._i_segment.annotations) {

      var badgeX = gap;
      var badgeY = gap;
      var badgeXIndex = 0;
      this._i_segment.annotations.forEach((a) => {
        const text = new AnnotationBadge(badgeX, badgeY, a.annotation.name, padding, PIXI.utils.string2hex(a.annotation.color))
        console.log(`${a.annotation.name} ${badgeX} ${badgeY}`)
        badgeX += text.width + gap;
        if (badgeX > this._i_rect.width && badgeXIndex > 0) {
          console.log(`Not fit`)
          badgeY += text.height + gap
          badgeX = text.width + 2 * gap
          text.x = gap;
          text.y = badgeY;
          badgeXIndex = 1;
        } else {
          badgeXIndex += 1;
        }
        text.mask = this._i_mask;
        this.addChild(text);
        this.badges.push(text)
      })
    }
  }
  set width(value) {
    this._i_rect.width = value

    const padding = 2;
    const gap = 4;
    var badgeX = gap;
    var badgeY = gap;
    var badgeXIndex = 0;
    this.badges.forEach((e) => {
      e.x = badgeX
      e.y = badgeY
      badgeX += e.width + gap;
      if (badgeX > this._i_rect.width && badgeXIndex > 0) {
        console.log(`Not fit`)
        badgeY += e.height + gap
        badgeX = e.width + 2 * gap
        e.x = gap;
        e.y = badgeY;
        badgeXIndex = 1;
      } else {
        badgeXIndex += 1;
      }
    })
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
    fill = 0xffffff,
  ) {
    super();
    this._i_timeline = timeline;
    this._i_x = x;
    this._i_y = y;
    this._i_width = width;
    this._i_height = height;
    this._i_startTime = startTime;
    this._i_endTime = endTime;

    this._i_rect = new PIXI.Graphics();
    this._i_rect.beginFill(fill);
    this._i_rect.drawRoundedRect(0, 0, width, height, 5);
    this._i_rect.x = x;
    this._i_rect.y = y;

    this._i_mask = new PIXI.Graphics();
    this._i_mask.beginFill(0xffffff);
    this._i_mask.drawRoundedRect(0, 0, width, height, 5);
    this._i_rect.mask = this._i_mask;
    this._i_rect.addChild(this._i_mask);

    let shadow = new DropShadowFilter();
    shadow.color = 0x0000;
    shadow.distance = 2;
    shadow.alpha = 0.4;
    shadow.rotation = 90;
    shadow.blur = 1;
    this._i_rect.filters = [shadow];

    this.addChild(this._i_rect);

    this._i_segments = new PIXI.Container();
    if (this._i_timeline.segments) {
      this._i_timeline.segments.forEach((s, i) => {
        const x = this._timeToX(s.start);
        const y = this._i_y;
        const width = this._timeToX(s.end) - this._timeToX(s.start);
        const height = this._i_height;

        let segmentE = new AnnotationSegment(s, x, y, width, height)

        segmentE.interactive = true;
        segmentE.buttonMode = true;
        segmentE.on('rightdown', (ev) => {
          this.emit('segmentRightDown', {
            event: ev,
            segment: segmentE
          })
          ev.stopPropagation();
        });



        segmentE.mask = this._i_mask;

        this._i_segments.addChild(segmentE);
      });
      this.addChild(this._i_segments);
    }
  }
  get timeScale() {
    return this._i_width / (this._i_endTime - this._i_startTime);
  }
  _timeToX(time) {
    return this._i_x + this.timeScale * (time - this._i_startTime);
  }
  scaleSegment() {
    if (this._i_timeline.segments) {
      this._i_timeline.segments.forEach((s, i) => {
        const width = this._timeToX(s.end) - this._timeToX(s.start);
        const x = this._timeToX(s.start);
        this._i_segments.getChildAt(i).x = x;
        this._i_segments.getChildAt(i).width = width;
      });
    }
  }
  set startTime(time) {
    this._i_startTime = time;
    this.scaleSegment();
  }
  set endTime(time) {
    this._i_endTime = time;
    this.scaleSegment();
  }
}

export {
  AnnotationTimeline
};