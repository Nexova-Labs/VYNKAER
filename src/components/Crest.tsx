import React from 'react';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { colors } from '../theme';

interface CrestProps {
  size?: number;
  tone?: 'copper' | 'ash' | 'bloodOath';
  style?: object;
}

// The VYNKÆR mark: a single tapered blade over a fractured cross-guard —
// "weapon-like vertical geometry" per the brand bible's Logo Hierarchy.
// Built from two solid fills (not thin strokes) so it stays a legible
// silhouette from a distance, per the bible's own print test.
export function Crest({ size = 48, tone = 'copper', style }: CrestProps) {
  const strokeColor = tone === 'copper' ? colors.accentSoft : tone === 'bloodOath' ? colors.bloodOath : colors.textPrimary;

  return (
    <Svg width={size} height={size * 1.5} viewBox="0 0 60 90" fill="none" style={style}>
      <Defs>
        <LinearGradient id="crestFade" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={strokeColor} stopOpacity="1" />
          <Stop offset="0.55" stopColor={strokeColor} stopOpacity="1" />
          <Stop offset="1" stopColor={strokeColor} stopOpacity="0.4" />
        </LinearGradient>
      </Defs>

      {/* Tapered blade: point at top, widening slightly through the guard line */}
      <Path
        d="M30 2 L34.5 44 L30 78 L25.5 44 Z"
        fill="url(#crestFade)"
      />

      {/* Fractured cross-guard */}
      <Path d="M8 30 L52 30 L44 34 L16 34 Z" fill={strokeColor} fillOpacity={0.85} />

      {/* Base sigil — small diamond anchor */}
      <Path d="M30 78 L34 84 L30 90 L26 84 Z" fill={strokeColor} fillOpacity={0.85} />
    </Svg>
  );
}
