const RETRY_DELAY_MS = 300;
const MAX_WAIT_MS = 6000;

function isNoReceiverError(err: unknown): boolean {
  return /Receiving end does not exist|Could not establish connection/i.test(String(err));
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sends a message to a tab's content script, coping with two situations:
 * - The tab was open before the extension was installed or updated, so it has no content
 *   script: inject the declared one once.
 * - The content script is still loading (on heavy pages Chrome can take seconds): keep
 *   retrying briefly instead of failing on the first attempt.
 */
export async function sendToTab<T = any>(tabId: number, message: unknown, topFrameOnly = false): Promise<T | undefined> {
  const opts = topFrameOnly ? { frameId: 0 } : {};
  const deadline = Date.now() + MAX_WAIT_MS;
  let injected = false;

  for (;;) {
    try {
      return await chrome.tabs.sendMessage(tabId, message, opts);
    } catch (err) {
      if (!isNoReceiverError(err) || Date.now() > deadline) return undefined;
    }

    if (!injected) {
      injected = true;
      const files = chrome.runtime.getManifest().content_scripts?.[0]?.js;
      if (files?.length) {
        try {
          await chrome.scripting.executeScript({ target: { tabId, allFrames: true }, files });
        } catch {
          // Restricted page (chrome://, Web Store) or no access; retrying will report the failure.
        }
      }
    }
    await sleep(RETRY_DELAY_MS);
  }
}
