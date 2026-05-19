import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pilatesafe.app',
  appName: 'PilateSafe',
  webDir: 'www',
  bundledWebRuntime: false,
  plugins: {
    Keyboard: {
      resize: 'none',
      scrollAssist: false
    }
  }
};

export default config;
