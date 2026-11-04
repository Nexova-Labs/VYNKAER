import React from 'react';
import {
  StyleSheet,
  Text as RNText,
  TextInput as RNTextInput,
  type TextInputProps,
  type TextProps,
  type TextStyle,
} from 'react-native';

import { fontFamily } from '../theme';

// Static custom fonts do not honour `fontWeight` (native ignores or fakes it, web faux-bolds),
// so every weight is its own font file. This wrapper picks the right OSMIUM UI file (Inter)
// from the `fontWeight` a style asks for, and drops `fontWeight` so it is never applied twice.
// A style that already names its own `fontFamily` (display serif, mono numerals) is left alone
// apart from the same `fontWeight` strip. Use these instead of react-native's Text/TextInput.
const UI_BY_WEIGHT: Record<string, string> = {
  '100': fontFamily.ui,
  '200': fontFamily.ui,
  '300': fontFamily.ui,
  '400': fontFamily.ui,
  normal: fontFamily.ui,
  '500': fontFamily.uiMedium,
  '600': fontFamily.uiSemiBold,
  '700': fontFamily.uiBold,
  bold: fontFamily.uiBold,
  '800': fontFamily.uiBold,
  '900': fontFamily.uiBold,
};

function resolveStyle(style: TextProps['style']): TextStyle {
  const flat: TextStyle = { ...(StyleSheet.flatten(style) ?? {}) };
  if (!flat.fontFamily) {
    flat.fontFamily = UI_BY_WEIGHT[String(flat.fontWeight ?? '400')] ?? fontFamily.ui;
  }
  delete flat.fontWeight;
  return flat;
}

export const Text = React.forwardRef<RNText, TextProps>(function Text({ style, ...rest }, ref) {
  return <RNText ref={ref} {...rest} style={resolveStyle(style)} />;
});

export const TextInput = React.forwardRef<RNTextInput, TextInputProps>(function TextInput(
  { style, ...rest },
  ref
) {
  return <RNTextInput ref={ref} {...rest} style={resolveStyle(style)} />;
});
