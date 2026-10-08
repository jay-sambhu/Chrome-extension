import { scanFormFields } from './detector';
import { fillPageAsync } from './filler';
import { ExtensionMessage, GeminiConfig } from '../types';
import { classifyUnknownField } from '../services/geminiClassifier';

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

    if (message.action === 'CLASSIFY_FIELD') {
      (async () => {
        try {
          const store = (await chrome.storage.local.get([
            'geminiApiKey',
            'geminiAiClassificationEnabled',
            'geminiModel',
          ])) as Record<string, any>;
          const config: GeminiConfig = {
            apiKey: String(store.geminiApiKey || ''),
            enabled: Boolean(store.geminiAiClassificationEnabled),
            model: String(store.geminiModel || 'gemini-3.5-flash-lite'),
          };
          const result = await classifyUnknownField(message.payload, config);
          sendResponse({ status: 'ok', result });
        } catch (err) {
          sendResponse({ status: 'error', message: String(err) });
        }
      })();
      return true;
    }

    if (message.action === 'FILL_PAGE') {
      (async () => {
        try {
          let geminiConfig: GeminiConfig | undefined;
          if (message.options?.enableAiClassification) {
            const store = (await chrome.storage.local.get([
              'geminiApiKey',
              'geminiAiClassificationEnabled',
              'geminiModel',
            ])) as Record<string, any>;
            geminiConfig = {
              apiKey: String(store.geminiApiKey || ''),
              enabled: Boolean(store.geminiAiClassificationEnabled),
              model: String(store.geminiModel || 'gemini-3.5-flash-lite'),
            };
          }

          const result = await fillPageAsync(message.person, message.options, geminiConfig);
          console.log(`[Nepal Test Filler] Successfully filled ${result.fieldsFilledCount} fields.`);
          sendResponse({ status: 'ok', result });
        } catch (err) {
          console.error('[Nepal Test Filler] Fill error:', err);
          sendResponse({ status: 'error', message: String(err) });
        }
      })();
      return true;
    }

    return false;
  }
);

