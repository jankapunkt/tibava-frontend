import * as PIXI from "pixi.js";
import * as d3 from "d3";

var colormaps = new Map([
  ["RdYlBu", d3.interpolateRdYlBu],
  ["RdYlGn", d3.interpolateRdYlGn],
  ["Blues", d3.interpolateBlues],
  ["Greens", d3.interpolateGreens],
  ["Reds", d3.interpolateReds],
  ["TIBReds", d3.interpolateRgb("white", "rgb(174, 19, 19)")],
  ["Greys", d3.interpolateGreys],
  ["YlGnBu", d3.interpolateYlGnBu],
  ["YlOrRd", d3.interpolateYlOrRd],
]);

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

export function scalarToHex(s, invert = false, colorPalette = "TIBReds") {
  // maps a scalar [0, 1] to a color value
  if (invert) {
    s = 1 - s;
  }

  const cm = colormaps.get(colorPalette);
  var color = cm(s);
  return PIXI.utils.string2hex(d3.color(color).formatHex());
}

export function resampleApprox({ data, targetSize = 1024 }) {
  const stepsize =
    2 ** Math.max(Math.ceil(Math.log2(data.length) - Math.log2(targetSize)), 0);
  const filteredData = data.filter((e, i) => i % stepsize == 0);
  return filteredData;
}

export function generateFont() {
  PIXI.BitmapFont.from(
    "default_font",
    {
      fill: "#333333",
      fontSize: 10,
    },
    {
      chars: [["a", "z"], ["0", "9"], ["A", "Z"], " \\|/:.-^%$&*()!?"],
      // fontWeight: 'bold',
    }
  );
  PIXI.BitmapFont.from(
    "default_white_font",
    {
      fill: "#FFFFFF",
      fontSize: 10,
    },
    {
      chars: [["a", "z"], ["0", "9"], ["A", "Z"], " \\|/:.-^%$&*()!?"],
      // fontWeight: 'bold',
    }
  );
}
