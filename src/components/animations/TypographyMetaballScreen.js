import React, { useCallback } from 'react';
import {
  Blur,
  Canvas,
  ColorMatrix,
  Group,
  Paint,
  Skia,
  useFont,
} from '@shopify/react-native-skia';
import { useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  makeParticle,
  makePointsFromString,
  randomInt,
  sample,
} from './util';

const TOTAL_PARTICLES = 500;
const FRICTION = 0.88;
const MOVE_SPEED = 0.92;

export const TypographyMetaballScreen = () => {
  // Always call hooks at the top
  const { width: stageWidth, height: stageHeight } = useWindowDimensions();
  const fontSize = stageWidth;
  const fontStyle = require('../../ui/screens/submodulesView/mindMapSubmodule/Hind-Bold.ttf')
  const font = useFont(fontStyle, fontSize);

  // Prepare variables that depend on the font.
  // If font is not loaded, we can still define them (as empty arrays or defaults)
  const strings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const stringPointsList = font
    ? strings.map((str) =>
      makePointsFromString(str, font, 15, stageWidth, stageHeight)
    )
    : [];

  // Note: Using a regular variable here is fine if you’re sure it won’t cause extra re-renders.
  // Alternatively, you could use useMemo.
  let sequence = 0;
  const particles = font
    ? [...Array(TOTAL_PARTICLES)].map(() =>
      makeParticle(stringPointsList[sequence])
    )
    : [];

  const updateSequence = () => {
    sequence = randomInt(0, stringPointsList.length - 1);
  };

  const updateParticles = () => {
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      const stringPoint = sample(stringPointsList[sequence]);
      particle.savedX = stringPoint.x;
      particle.savedY = stringPoint.y;
      const dx = particle.x - particle.savedX;
      const dy = particle.y - particle.savedY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const tx = particle.savedX + Math.cos(angle) * dist;
      const ty = particle.savedY + Math.sin(angle) * dist;
      const ax = tx - particle.savedX;
      const ay = ty - particle.savedY;
      particle.vx += ax;
      particle.vy += ay;
    }
  };

  const tap = Gesture.Tap()
  .runOnJS(true)
  .onEnd(() => {
    updateSequence();
    updateParticles();
  });

  // Define the onDraw callback hook unconditionally.
  const onDraw = useCallback(
    (canvas, paint) => {
      // If for some reason onDraw is called before the font is loaded,
      // you can simply return early.
      if (!font) {
        return;
      }
      paint.setColor(Skia.Color('#f4c129'));
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];

        particle.x += (particle.savedX - particle.x) * MOVE_SPEED;
        particle.y += (particle.savedY - particle.y) * MOVE_SPEED;

        particle.vx *= FRICTION;
        particle.vy *= FRICTION;

        particle.x += particle.vx;
        particle.y += particle.vy;

        canvas.drawCircle(particle.x, particle.y, 15, paint);
      }
    },
    [particles, font]
  );

  // Now, after all hooks are declared, you can conditionally render.
  if (!font) {
    return null; // or return a loading indicator
  }

  return (
    <GestureDetector gesture={tap}>
      <Canvas
        mode="continuous"
        style={{
          width: stageWidth,
          height: stageHeight,
          backgroundColor: '#297F2E',
        }}
        onDraw={onDraw}
      >
        <Group
          layer={
            <Paint>
              <Blur blur={8} />
              <ColorMatrix
                matrix={[
                  1, 0, 0, 0, 0,
                  0, 1, 0, 0, 0,
                  0, 0, 1, 0, 0,
                  0, 0, 0, 0, 60,
                  -40,
                ]}
              />
            </Paint>
          }
        />
      </Canvas>
    </GestureDetector>
  );
};
