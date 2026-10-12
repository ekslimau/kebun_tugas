import { SvgXml } from 'react-native-svg';
import { tugi, plants, icons } from './assets';

export const Tugi = ({ size = 120 }: { size?: number }) => <SvgXml xml={tugi} width={size} height={size} />;
export const Plant = ({ stage, size = 72 }: { stage: keyof typeof plants; size?: number }) => (
  <SvgXml xml={plants[stage]} width={size} height={size} />
);
// Ikon: warna diganti lewat replace stroke (default #2A2358 "Tinta")
export const Icon = ({ name, size = 24, color = '#2A2358' }: { name: keyof typeof icons; size?: number; color?: string }) => (
  <SvgXml xml={icons[name].replace(/#2A2358/g, color)} width={size} height={size} />
);
