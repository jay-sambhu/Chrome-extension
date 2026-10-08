import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest(() => ({
  manifest_version: 3,
  name: 'Nepal Test Filler',
  version: '0.1.0',
  description: 'Automatically fills web forms with realistic synthetic Nepal-focused test data.',
  icons: {
    '16': 'icons/icon-16.png',
    '48': 'icons/icon-48.png',
    '128': 'icons/icon-128.png',
  },
  action: {
    default_popup: 'src/popup/index.html',
    default_title: 'Nepal Test Filler',
    default_icon: {
      '16': 'icons/icon-16.png',
      '48': 'icons/icon-48.png',
      '128': 'icons/icon-128.png',
    },
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/index.ts'],
    },
  ],
  permissions: ['storage', 'activeTab', 'scripting', 'contextMenus'],
  commands: {
    'quick-fill': {
      suggested_key: {
        default: 'Alt+Shift+F',
        mac: 'Alt+Shift+F',
      },
      description: 'Instantly fill active form with Nepali test data',
    },
    'regenerate-fill': {
      suggested_key: {
        default: 'Alt+Shift+R',
        mac: 'Alt+Shift+R',
      },
      description: 'Regenerate synthetic person and refill form',
    },
  },
  options_ui: {
    page: 'src/options/index.html',
    open_in_tab: true,
  },
}));
