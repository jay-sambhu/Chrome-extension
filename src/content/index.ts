import { scanFormFields } from './detector';
import { fillPage } from './filler';
import { ExtensionMessage } from '../types';

console.log('[Nepal Test Filler] Content script active.');

chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void
  ) => {
  if (message.action === 'PING') {
    sendResponse({ status: 'ok', version: '0.1.0' });
    return false;
  }

  if (message.action === 'SCAN_PAGE') {
    try {
      const detected = scanFormFields();
      const count = detected.length;
      const types = detected.map((f) => f.type);
      sendResponse({ status: 'ok', count, types });
    } catch (err) {
      console.error('[Nepal Test Filler] Scan error:', err);
      sendResponse({ status: 'error', message: String(err) });
    }
    return false;
  }

  if (message.action === 'FILL_PAGE') {
    try {
      const result = fillPage(message.person, message.options);
      console.log(`[Nepal Test Filler] Successfully filled ${result.fieldsFilledCount} fields.`);
      sendResponse({ status: 'ok', result });
    } catch (err) {
      console.error('[Nepal Test Filler] Fill error:', err);
      sendResponse({ status: 'error', message: String(err) });
    }
    return false;
  }

  return false;
});
