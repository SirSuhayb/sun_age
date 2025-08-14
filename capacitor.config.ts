import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.solara.app',
  appName: 'Solara',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    url: process.env.NODE_ENV === 'development' ? 'http://localhost:3000/mobile' : undefined
  },
  ios: {
    scheme: 'Solara',
    path: 'ios'
  }
};

export default config;