// Butuh: npx expo install react-native-svg
import Svg, { Ellipse, Path, Circle } from 'react-native-svg';

export default function Tugi({ size = 120 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Ellipse cx="60" cy="110" rx="32" ry="6" fill="#2A2358" opacity={0.12} />
      <Path d="M60 16c28 0 48 20 48 48 0 27-18 46-48 46S12 91 12 64c0-28 20-48 48-48z" fill="#B79CFF" />
      <Path d="M60 18c-2-8 2-14 10-16-1 8-4 14-10 16z" fill="#34D3A5" />
      <Path d="M60 18c2-6-1-11-8-13 0 6 3 11 8 13z" fill="#7BE8C4" />
      <Path d="M36 60q6-8 12 0M72 60q6-8 12 0" stroke="#2A2358" strokeWidth={4} fill="none" strokeLinecap="round" />
      <Circle cx="34" cy="74" r="7" fill="#FF8FA8" opacity={0.7} />
      <Circle cx="86" cy="74" r="7" fill="#FF8FA8" opacity={0.7} />
      <Path d="M52 74q8 9 16 0" stroke="#2A2358" strokeWidth={4} fill="none" strokeLinecap="round" />
    </Svg>
  );
}
