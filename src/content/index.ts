import { scanFormFields } from './detector';
import { clearForm, fillPage, fillPageAsync, inspectPageFields, revertForm } from './filler';
import { ExtensionMessage, GeminiConfig } from '../types';
import { classifyUnknownField } from '../services/geminiClassifier';
import { getDomainMapping } from '../services/domainMapping';
import { initFloatingBadge } from './floatingBadge';
import {
  getSessionPersona,
  setSessionPersona,
  clearSessionPersona,
  getSessionOptions,
  setSessionOptions,
} from '../services/sessionPersona';

console.log('[Nepal Test Filler] Content script active.');

// Initialize inline floating badge
if (typeof document !== 'undefined') {
  initFloatingBadge(document);
}

function broadcastToChildFrames(payload: any) {
  if (typeof document === 'undefined') return;
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach((iframe) => {
    try {
      iframe.contentWindow?.postMessage(payload, '*');
    } catch {
      // ignore cross-domain postMessage errors
    }
  });
}

// Cross-frame listener for embedded subframes (e.g. eSewa / Khalti payment dialogs)
if (typeof window !== 'undefined') {
  window.addEventListener('message', (event: MessageEvent) => {
    if (!event.data || typeof event.data !== 'object') return;
    if (event.data.__nepal_filler_cross_frame__) {
      const { action, person, options } = event.data;
      if (action === 'FILL_PAGE' && person && options) {
        fillPage(person, options, document);
      } else if (action === 'UNDO_FILL') {
        revertForm(document);
      } else if (action === 'CLEAR_FORM') {
        clearForm(document);
      }
    }
  });
}

function showInPageFeedback(text: string) {
  if (typeof document === 'undefined' || !document.body) return;
  const id = '__nepal_filler_toast';
  const existing = document.getElementById(id);
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = id;
  toast.textContent = `🇳🇵 ${text}`;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: '2147483647',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
    border: '1px solid rgba(255,255,255,0.1)',
    pointerEvents: 'none',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    opacity: '0',
    transform: 'translateY(8px)',
  });
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 350);
  }, 2500);
}

// In-page keyboard shortcut for Alt+Shift+U (Undo / Clear Form)
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.altKey && e.shiftKey && (e.key === 'U' || e.key === 'u' || e.code === 'KeyU')) {
      e.preventDefault();
      try {
        const result = revertForm(document);
        console.log(`[Nepal Test Filler] Alt+Shift+U triggered: ${result.action} ${result.revertedCount} fields.`);
        showInPageFeedback(
          result.action === 'reverted'
            ? `Reverted ${result.revertedCount} field${result.revertedCount === 1 ? '' : 's'}`
            : `Cleared ${result.revertedCount} field${result.revertedCount === 1 ? '' : 's'}`
        );
      } catch (err) {
        console.error('[Nepal Test Filler] Shortcut undo error:', err);
      }
    }
  });
}

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

    if (message.action === 'GET_PAGE_FIELDS') {
      (async () => {
        try {
          const domain = window.location.hostname || 'localhost';
          const domainConfig = await getDomainMapping(domain);
          const fields = inspectPageFields(document, domainConfig?.rules || []);
          sendResponse({ status: 'ok', domain, fields });
        } catch (err) {
          console.error('[Nepal Test Filler] Inspect page fields error:', err);
          sendResponse({ status: 'error', message: String(err) });
        }
      })();
      return true;
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

    if (message.action === 'UNDO_FILL') {
      try {
        const result = revertForm(document);
        broadcastToChildFrames({ __nepal_filler_cross_frame__: true, action: 'UNDO_FILL' });
        showInPageFeedback(
          result.action === 'reverted'
            ? `Reverted ${result.revertedCount} field${result.revertedCount === 1 ? '' : 's'}`
            : `Cleared ${result.revertedCount} field${result.revertedCount === 1 ? '' : 's'}`
        );
        sendResponse({ status: 'ok', result });
      } catch (err) {
        console.error('[Nepal Test Filler] Undo error:', err);
        sendResponse({ status: 'error', message: String(err) });
      }
      return false;
    }

    if (message.action === 'CLEAR_FORM') {
      try {
        const result = clearForm(document);
        broadcastToChildFrames({ __nepal_filler_cross_frame__: true, action: 'CLEAR_FORM' });
        showInPageFeedback(`Cleared ${result.revertedCount} field${result.revertedCount === 1 ? '' : 's'}`);
        sendResponse({ status: 'ok', result });
      } catch (err) {
        console.error('[Nepal Test Filler] Clear error:', err);
        sendResponse({ status: 'error', message: String(err) });
      }
      return false;
    }

    if (message.action === 'GET_SESSION_PERSONA') {
      try {
        const person = getSessionPersona();
        const options = getSessionOptions();
        sendResponse({ status: 'ok', person, options });
      } catch (err) {
        sendResponse({ status: 'error', message: String(err) });
      }
      return false;
    }

    if (message.action === 'SET_SESSION_PERSONA') {
      try {
        setSessionPersona(message.person);
        if (message.options) {
          setSessionOptions(message.options);
        }
        sendResponse({ status: 'ok' });
      } catch (err) {
        sendResponse({ status: 'error', message: String(err) });
      }
      return false;
    }

    if (message.action === 'CLEAR_SESSION_PERSONA') {
      try {
        clearSessionPersona();
        sendResponse({ status: 'ok' });
      } catch (err) {
        sendResponse({ status: 'error', message: String(err) });
      }
      return false;
    }

    if (message.action === 'FILL_PAGE') {
      (async () => {
        try {
          // Persist this active persona in sessionStorage for multi-step wizards / SPA persistence
          if (message.person) {
            setSessionPersona(message.person);
          }
          if (message.options) {
            setSessionOptions(message.options);
          }
          const domain = window.location.hostname || 'localhost';
          const domainConfig = await getDomainMapping(domain);

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

          const result = await fillPageAsync(
            message.person,
            message.options,
            geminiConfig,
            document,
            domainConfig?.rules || []
          );

          // Broadcast to embedded payment/dialog iframes (eSewa / Khalti modals)
          broadcastToChildFrames({
            __nepal_filler_cross_frame__: true,
            action: 'FILL_PAGE',
            person: message.person,
            options: message.options,
          });

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


