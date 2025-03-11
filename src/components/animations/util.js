import { Skia, StrokeCap, StrokeJoin } from '@shopify/react-native-skia';

// Returns a random element from an array
export const sample = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

// Returns a random integer between min and max (inclusive)
export const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Creates an array of points along the stroked text path for the given string.
export const makePointsFromString = (str, font, density, stageWidth, stageHeight) => {
  const textWidth = font.getTextWidth(str);
  const textPath = Skia.Path.MakeFromText(
    str,
    (stageWidth - textWidth) / 2,
    (stageHeight + font.getSize() / 2) / 2,
    font
  );

  // If the path could not be created, return an empty array.
  if (!textPath) {
    return [];
  }

  // Stroke the path and apply a dash pattern
  textPath.stroke({
    width: 1,
    cap: StrokeCap.Round,
    join: StrokeJoin.Round,
    miter_limit: 1,
    precision: 1,
  });
  textPath.dash(density, density, 0);

  const count = textPath.countPoints();
  const points = [];
  for (let i = 0; i < count; i++) {
    points.push(textPath.getPoint(i));
  }
  return points;
};

// Creates a particle starting at a random point from the provided array of points.
export const makeParticle = (stringPoints) => {
  const stringPoint = sample(stringPoints);
  return {
    x: stringPoint.x,
    y: stringPoint.y,
    savedX: stringPoint.x,
    savedY: stringPoint.y,
    vx: 0,
    vy: 0,
  };
};
