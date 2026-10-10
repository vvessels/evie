import { evieIcon } from '@/lib/appIcon';

// The icon iPhone uses on the home screen.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return evieIcon(size.width);
}
