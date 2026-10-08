import { generateSyntheticPerson } from '../generator/personGenerator';
import { ProfileType, SyntheticPerson, FillOptions } from '../types';

console.log('[Nepal Test Filler] Service worker initialized.');

let cachedPerson: SyntheticPerson | null = null;

async function executeFillOnActiveTab(regenerate = false) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id || !tab.url || tab.url.startsWith('chrome://')) return;

    const data = (await chrome.storage.local.get([
      'selectedProfile',
      'fillScript',
      'fillCategories',
      'aiEnabled',
      'lastGeneratedPerson',
    ])) as Record<string, any>;

    const profile: ProfileType = data.selectedProfile || 'general';
    const fillScript = data.fillScript || 'en';
    const fillCategories = data.fillCategories || {
      personal: true,
      contact: true,
      address: true,
      professional: true,
    };
    const enableAiClassification = Boolean(data.aiEnabled);

    if (regenerate || !cachedPerson) {
      cachedPerson = generateSyntheticPerson(profile);
      await chrome.storage.local.set({ lastGeneratedPerson: cachedPerson });
    }

    const options: FillOptions = {
      profile,
      fillScript,
      fillCategories,
      enableAiClassification,
    };

    chrome.tabs.sendMessage(
      tab.id,
      {
        action: 'FILL_PAGE',
        person: cachedPerson,
        options,
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.warn('[Nepal Test Filler] Could not send message to tab:', chrome.runtime.lastError.message);
        } else {
          console.log('[Nepal Test Filler] Shortcut fill result:', response);
        }
      }
    );
  } catch (err) {
    console.error('[Nepal Test Filler] Error in executeFillOnActiveTab:', err);
  }
}

async function executeUndoOnActiveTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id || !tab.url || tab.url.startsWith('chrome://')) return;

    chrome.tabs.sendMessage(
      tab.id,
      { action: 'UNDO_FILL' },
      (response) => {
        if (chrome.runtime.lastError) {
          console.warn('[Nepal Test Filler] Could not send undo to tab:', chrome.runtime.lastError.message);
        } else {
          console.log('[Nepal Test Filler] Undo result:', response);
        }
      }
    );
  } catch (err) {
    console.error('[Nepal Test Filler] Error in executeUndoOnActiveTab:', err);
  }
}

// Commands listener (Keyboard shortcuts)
chrome.commands?.onCommand?.addListener((command: string) => {
  if (command === 'quick-fill') {
    executeFillOnActiveTab(false);
  } else if (command === 'regenerate-fill') {
    executeFillOnActiveTab(true);
  } else if (command === 'undo-fill') {
    executeUndoOnActiveTab();
  }
});

// Context Menus
chrome.runtime.onInstalled.addListener(async (details: chrome.runtime.InstalledDetails) => {
  if (details.reason === 'install') {
    console.log('[Nepal Test Filler] Extension installed for the first time.');
    await chrome.storage.local.set({
      selectedProfile: 'general',
      fillScript: 'en',
      fillCategories: {
        personal: true,
        contact: true,
        address: true,
        professional: true,
      },
      aiEnabled: false,
    });
  }

  // Create context menu items
  if (chrome.contextMenus) {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: 'nepal-test-filler-quick-fill',
        title: 'Fill with Nepali Test Data (Alt+Shift+F)',
        contexts: ['editable', 'page'],
      });
      chrome.contextMenus.create({
        id: 'nepal-test-filler-regenerate-fill',
        title: 'Regenerate & Refill (Alt+Shift+R)',
        contexts: ['editable', 'page'],
      });
      chrome.contextMenus.create({
        id: 'nepal-test-filler-undo-fill',
        title: 'Undo / Revert Form (Alt+Shift+U)',
        contexts: ['editable', 'page'],
      });
    });
  }
});

chrome.contextMenus?.onClicked?.addListener((info: chrome.contextMenus.OnClickData) => {
  if (info.menuItemId === 'nepal-test-filler-quick-fill') {
    executeFillOnActiveTab(false);
  } else if (info.menuItemId === 'nepal-test-filler-regenerate-fill') {
    executeFillOnActiveTab(true);
  } else if (info.menuItemId === 'nepal-test-filler-undo-fill') {
    executeUndoOnActiveTab();
  }
});

