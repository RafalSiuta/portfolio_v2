export const convertColor = (colors, opacity = 1) => {
  const rgbMatch = colors.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  let rgbaColor = colors;

  if (rgbMatch) {
    const [, r, g, b] = rgbMatch.map((hex) => parseInt(hex, 16));
    rgbaColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
  } else if (colors.startsWith("rgb")) {
    // If the color is already rgb(...) or rgba(...), replace its alpha channel
    rgbaColor = colors.replace(/rgba?\(([^)]+),?\s*\d?\.?\d*\)$/, `rgba($1, ${opacity})`);
  }

  return rgbaColor;
};
