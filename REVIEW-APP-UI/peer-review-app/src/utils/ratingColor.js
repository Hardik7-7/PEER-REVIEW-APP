// utils/ratingColor.js

// Interpolate between two hex colors based on a 0 to 1 factor
export const interpolateColor = (color1, color2, factor) => {
  const hexToRgb = (hex) => hex.match(/\w\w/g).map((x) => parseInt(x, 16));
  const rgbToHex = (r, g, b) =>
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("");

  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  const r = Math.round(c1[0] + factor * (c2[0] - c1[0]));
  const g = Math.round(c1[1] + factor * (c2[1] - c1[1]));
  const b = Math.round(c1[2] + factor * (c2[2] - c1[2]));

  return rgbToHex(r, g, b);
};

// Main function to return a smooth rating color from red → yellow → green
export const getSmoothRatingColor = (rating) => {
  const red = "#ef4444";     // red-500
  const yellow = "#facc15";  // yellow-400
  const green = "#22c55e";   // green-500

  if (rating <= 5) {
    const factor = (rating - 1) / 4;
    return interpolateColor(red, yellow, factor);
  } else {
    const factor = (rating - 5) / 5;
    return interpolateColor(yellow, green, factor);
  }
};
