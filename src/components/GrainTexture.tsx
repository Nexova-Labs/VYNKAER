import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, FeColorMatrix, Filter, FeTurbulence, Rect } from 'react-native-svg';

// A near-invisible noise field over the Obsidian base — the brand bible's
// "scratched steel / soot-black surfaces" register. Opacity is intentionally
// low (0.05) so it reads as material, not decoration; pointerEvents none so
// it never intercepts touches.
export function GrainTexture() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <Filter id="grain">
            <FeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} stitchTiles="stitch" />
            <FeColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0" />
          </Filter>
        </Defs>
        <Rect width="100%" height="100%" filter="url(#grain)" />
      </Svg>
    </View>
  );
}
