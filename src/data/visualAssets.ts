const audioVisualizerBase =
  "https://xaeneptune.s3.us-east-2.amazonaws.com/images/Audio+Visualizer";
const xaeneptuneBase =
  "https://xaeneptune.s3.us-east-2.amazonaws.com/images/Xaeneptune";

export const visualizerDecorationAssets = [
  `${audioVisualizerBase}/antiheroesCellularVisualizer.webp`,
  `${audioVisualizerBase}/antiheroesFractals.webp`,
  `${audioVisualizerBase}/antiheroesPerlinNoise.webp`,
  `${audioVisualizerBase}/antiheroesSandVisualizer.webp`,
  `${audioVisualizerBase}/antiheroSuperShape.webp`,
] as const;

export const xaeneptunePlanetAssets = Array.from(
  { length: 16 },
  (_, index) => `${xaeneptuneBase}/Xaeneptune${index + 1}.webp`,
);

export const xaeneptuneSecurityAsset =
  `${xaeneptuneBase}/XaeneptuneSECURITY.webp`;
