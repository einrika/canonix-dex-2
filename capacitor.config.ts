import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.paxi.dex',
  appName: 'Canonix',
  webDir: 'public',
  server: {
    url: 'https://stalwart-ganache-32b226.netlify.app',
    cleartext: true
  }
};

export default config;
