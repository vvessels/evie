import { evieIcon } from '@/lib/appIcon';

// The icon the manifest points to (used when installing).
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return evieIcon(size.width);
}
