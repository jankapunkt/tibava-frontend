import * as PIXI from "pixi.js";
import palette from "google-palette";

// import { magma, seismic, jet } from "./palette.js";

var colors = palette("tol-dv", 101);

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

export function scalarToHex(s, invert = false) {
    // maps a scalar [0, 1] to a color value
    if (invert) {
        s = 1 - s;
    }
    return PIXI.utils.string2hex(colors[Math.round(s * 100)]);
}

export function resampleApprox({ data, targetSize = 1024 }) {
    const stepsize = 2 ** Math.max(Math.ceil(Math.log2(data.length) - Math.log2(targetSize)), 0)
    const filteredData = data.filter((e, i) => i % stepsize == 0)
    return filteredData
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