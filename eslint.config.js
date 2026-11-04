const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*'],
  },
  {
    // UI text must go through src/components/Text so `fontWeight` maps onto the right Inter
    // file (static fonts ignore fontWeight). See docs/osmium/DESIGN_SYSTEM_V2.md §4.
    files: ['app/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}'],
    ignores: ['src/components/Text.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              importNames: ['Text', 'TextInput'],
              message: "Import Text/TextInput from 'src/components/Text' so the OSMIUM fonts apply.",
            },
          ],
        },
      ],
    },
  },
];
