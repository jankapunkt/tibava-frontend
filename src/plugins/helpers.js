
export function keyInObj(key, obj) {
  if (typeof obj !== 'object') return false;
  return Object.prototype.hasOwnProperty.call(obj, key);
}
export function isEqual(x, y) {
  return JSON.stringify(x) === JSON.stringify(y);
}
export function lsplit(x, sep, maxsplit) {
  x = x.split(sep);
  const result = x.splice(0, maxsplit);
  if (x.length) result.push(x.join(sep));
  return result;
}
export function getHash(x) {
  const md5 = require('crypto').createHash('md5');
  return md5.update(JSON.stringify(x)).digest('hex');
}
export function repPlace(x, y) {
  const string = y.replace(
    /{(\w+)}/g,
    (withDelimiters, withoutDelimiters) =>
    keyInObj(withoutDelimiters, x) ?
      x[withoutDelimiters] : withDelimiters
  );
  return string;
}
export function isMobile() {
  const devices = [
    'Android', 'webOS', 'iPhone', 'iPod',
    'BlackBerry', 'IEMobile', 'Opera Mini',
  ];
  const filter = new RegExp(devices.join('|'), 'i');
  if (filter.test(navigator.userAgent)) {
    return true;
  }
  return false;
}
export function get_display_time(seconds) {
  var h = Math.floor(seconds / 3600);
  var m = Math.floor((seconds % 3600) / 60);
  var s = Math.floor((seconds % 3600) % 60);

  var hDisplay = h > 0 ? h + (h == 1 ? " h " : " h ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " min " : " min ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " sec" : " sec") : "";
  return hDisplay + mDisplay + sDisplay;
}
export function get_timecode(seconds) {
  var h = Math.floor(seconds / 3600);
  var m = Math.floor((seconds % 3600) / 60);
  var s = Math.round((seconds % 3600) % 60);
  // var s = Math.floor((seconds % 3600) % 60);
  // var ms = Math.round(1000 * (((seconds % 3600) % 60) % 1))

  const zeroPad = (num, places) => String(num).padStart(places, '0')
  return zeroPad(h, 2) + ":" + zeroPad(m, 2) + ":" + zeroPad(s, 2) 
  // return zeroPad(h, 2) + ":" + zeroPad(m, 2) + ":" + zeroPad(s, 2) + "." + zeroPad(ms, 3);
}