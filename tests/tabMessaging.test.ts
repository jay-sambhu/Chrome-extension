import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendToTab } from '../src/services/tabMessaging';

const noReceiver = () => Promise.reject(new Error('Could not establish connection. Receiving end does not exist.'));

describe('sendToTab', () => {
  let sendMessage: ReturnType<typeof vi.fn>;
  let executeScript: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useRealTimers();
    sendMessage = vi.fn();
    executeScript = vi.fn(() => Promise.resolve([]));
    (globalThis as any).chrome = {
      tabs: { sendMessage },
      scripting: { executeScript },
      runtime: { getManifest: () => ({ content_scripts: [{ js: ['assets/loader.js'] }] }) },
    };
  });

  it('returns the reply directly when the content script is ready', async () => {
    sendMessage.mockResolvedValue({ status: 'ok' });
    expect(await sendToTab(1, { action: 'PING' })).toEqual({ status: 'ok' });
    expect(executeScript).not.toHaveBeenCalled();
  });

  it('injects once and keeps retrying while the content script is still loading', async () => {
    sendMessage
      .mockImplementationOnce(noReceiver)
      .mockImplementationOnce(noReceiver)
      .mockImplementationOnce(noReceiver)
      .mockResolvedValue({ status: 'ok' });
    expect(await sendToTab(1, { action: 'FILL_PAGE' })).toEqual({ status: 'ok' });
    expect(executeScript).toHaveBeenCalledTimes(1);
    expect(executeScript.mock.calls[0][0]).toEqual({ target: { tabId: 1, allFrames: true }, files: ['assets/loader.js'] });
    expect(sendMessage).toHaveBeenCalledTimes(4);
  });

  it('gives up immediately on other errors', async () => {
    sendMessage.mockRejectedValue(new Error('The tab was closed.'));
    expect(await sendToTab(1, { action: 'PING' })).toBeUndefined();
    expect(sendMessage).toHaveBeenCalledTimes(1);
  });

  it('targets only the top frame when asked', async () => {
    sendMessage.mockResolvedValue({ status: 'ok' });
    await sendToTab(7, { action: 'GET_PAGE_FIELDS' }, true);
    expect(sendMessage).toHaveBeenCalledWith(7, { action: 'GET_PAGE_FIELDS' }, { frameId: 0 });
  });
});
