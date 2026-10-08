console.log('[Nepal Test Filler] Service worker initialized.');

chrome.runtime.onInstalled.addListener(async (details: chrome.runtime.InstalledDetails) => {
  if (details.reason === 'install') {
    console.log('[Nepal Test Filler] Extension installed for the first time.');
    // Set default configuration in storage
    await chrome.storage.local.set({
      selectedProfile: 'general',
      fillCategories: {
        personal: true,
        contact: true,
        address: true,
        professional: true,
      },
      aiEnabled: false,
    });
  }
});
