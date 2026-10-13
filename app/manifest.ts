import type { MetadataRoute } from 'next';

// Tells the phone this site can be added to the home screen and open like an app, without a browser bar.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Evie',
    short_name: 'Evie',
    description: 'Evie’s shared puppy log',
    start_url: '/',
    display: 'standalone',
    background_color: '#f2f2ef',
    theme_color: '#f2f2ef',
    icons: [{ src: '/icon', sizes: '512x512', type: 'image/png' }],
  };
}
