import { fillPageAsync, fillSingleField, revertForm } from './filler';
import { FillOptions, SyntheticPerson } from '../types';
import { classifyViaBackground } from './backgroundClassifier';
import { getDomainMapping } from '../services/domainMapping';
import {
  getSessionPersona,
  setSessionPersona,
  getSessionOptions,
  setSessionOptions,
} from '../services/sessionPersona';

let isBadgeEnabled = true;
let activeTargetElement: HTMLElement | null = null;
let badgeContainer: HTMLElement | null = null;
let menuContainer: HTMLElement | null = null;
let styleTag: HTMLStyleElement | null = null;
let hideTimeout: ReturnType<typeof setTimeout> | null = null;
let isInteractingWithBadge = false;
let repositionFrame = 0;
let storageListener: ((changes: Record<string, chrome.storage.StorageChange>, area: string) => void) | null = null;

const BADGE_ID = '__nepal_filler_floating_badge';
const MENU_ID = '__nepal_filler_floating_menu';
const STYLE_ID = '__nepal_filler_floating_style';
const BADGE_SIZE = 22;
const MENU_WIDTH = 220;

// Types where an overlay would cover browser or page affordances (password reveal,
// search clear, pickers) or where "test data" makes no sense.
const SKIPPED_INPUT_TYPES = [
  'hidden', 'submit', 'reset', 'button', 'image', 'file',
  'password', 'search', 'range', 'color', 'checkbox', 'radio',
];

/**
 * Checks whether an element is a text-like form field that should get the badge.
 */
function isFillableField(element: Element | null): element is HTMLElement {
  if (!element || !(element instanceof HTMLElement)) return false;
  if (element.closest('[data-nepal-filler-ui]')) return false;

  const tagName = element.tagName.toLowerCase();
  if (tagName === 'textarea' || tagName === 'select') {
    return !element.hasAttribute('disabled') && !element.hasAttribute('readonly');
  }

  if (tagName === 'input') {
    const input = element as HTMLInputElement;
    const type = (input.type || 'text').toLowerCase();
    return !SKIPPED_INPUT_TYPES.includes(type) && !input.disabled && !input.readOnly;
  }

  if (element.getAttribute('role') === 'combobox') {
    return element.getAttribute('aria-disabled') !== 'true';
  }

  return false;
}

/**
 * Resolves the persona to use: the one retained for this tab's wizard, else the one
 * shown in the popup, else a freshly generated one for the user's active preset.
 */
async function getStoredOptions(): Promise<{ options: FillOptions; person: SyntheticPerson }> {
  // Loaded on demand: the generator and its datasets are large, and the content script
  // runs on every page and frame, so they must not be part of the initial bundle.
  const { generatePersonForSettings, loadCurrentPerson, loadFillSettings, saveCurrentPerson, toFillOptions } =
    await import('../services/settings');
  const settings = await loadFillSettings().catch(() => null);
  const options = getSessionOptions() || (settings ? toFillOptions(settings) : null) || {
    profile: 'general' as const,
    fillScript: 'en' as const,
    fillCategories: { personal: true, contact: true, address: true, professional: true },
  };
  // Re-read the live AI toggle; the retained session options may predate it.
  options.enableAiClassification = settings?.aiEnabled ?? false;

  let person = getSessionPersona() || (await loadCurrentPerson().catch(() => null));
  if (!person) {
    person = await generatePersonForSettings(settings || (await loadFillSettings()));
    await saveCurrentPerson(person).catch(() => undefined);
  }
  setSessionPersona(person);
  setSessionOptions(options);
  return { options, person };
}

function badgeIconHtml(): string {
  const url = typeof chrome !== 'undefined' && chrome.runtime?.getURL ? chrome.runtime.getURL('icons/icon-32.png') : '';
  return url ? `<img src="${url}" alt="" width="16" height="16" style="display:block;width:16px;height:16px">` : 'NP';
}

function injectStyles() {
  if (styleTag?.isConnected) return;
  styleTag = document.createElement('style');
  styleTag.id = STYLE_ID;
  styleTag.textContent = `
    #${BADGE_ID}, #${MENU_ID} { all: initial; box-sizing: border-box; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
    #${BADGE_ID} *, #${MENU_ID} * { all: unset; box-sizing: border-box; font-family: inherit; }
    #${BADGE_ID} {
      position: fixed; z-index: 2147483646; width: ${BADGE_SIZE}px; height: ${BADGE_SIZE}px;
      display: none; align-items: center; justify-content: center; cursor: pointer; user-select: none;
      border-radius: 6px; background: #1c1917; color: #fff; font-size: 10px; font-weight: 700; line-height: 1;
      border: 1px solid rgba(217, 38, 68, 0.55); box-shadow: 0 2px 8px rgba(0,0,0,0.22);
      opacity: 0.9; transition: transform .12s ease, opacity .12s ease, background-color .2s ease;
    }
    #${BADGE_ID}:hover { opacity: 1; transform: scale(1.08); border-color: #d92644; }
    #${BADGE_ID}[data-state="done"] { background: #15803d; border-color: #15803d; }
    #${MENU_ID} {
      position: fixed; z-index: 2147483647; width: ${MENU_WIDTH}px; display: none; flex-direction: column;
      padding: 4px; border-radius: 10px; background: #1c1917; color: #fafaf9; font-size: 12px;
      border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 28px rgba(0,0,0,0.4);
    }
    #${MENU_ID} .__nepal_menu_header {
      display: flex; align-items: center; gap: 6px; padding: 6px 8px; margin-bottom: 2px;
      font-size: 11px; font-weight: 600; color: #a8a29e; border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    #${MENU_ID} .__nepal_menu_item {
      display: flex; align-items: center; gap: 10px; width: 100%; padding: 7px 8px; border-radius: 6px;
      cursor: pointer; color: #fafaf9; text-align: left;
    }
    #${MENU_ID} .__nepal_menu_item:hover, #${MENU_ID} .__nepal_menu_item:focus-visible { background: rgba(217,38,68,0.2); }
    #${MENU_ID} .__nepal_menu_icon { width: 16px; text-align: center; font-size: 13px; flex-shrink: 0; }
    #${MENU_ID} .__nepal_menu_text { display: flex; flex-direction: column; gap: 1px; line-height: 1.3; }
    #${MENU_ID} .__nepal_menu_text strong { font-size: 12px; font-weight: 600; }
    #${MENU_ID} .__nepal_menu_text small { font-size: 10.5px; color: #a8a29e; }
  `;
  (document.head || document.documentElement).appendChild(styleTag);
}

/**
 * Creates the floating badge DOM element.
 */
function createBadgeElement(): HTMLElement {
  const existing = document.getElementById(BADGE_ID);
  if (existing) return existing;
  injectStyles();

  const badge = document.createElement('div');
  badge.id = BADGE_ID;
  badge.setAttribute('data-nepal-filler-ui', '');
  badge.setAttribute('role', 'button');
  badge.setAttribute('aria-label', 'Nepal Test Filler quick actions');
  badge.title = 'Nepal Test Filler';
  badge.innerHTML = `<span class="__nepal_badge_icon">${badgeIconHtml()}</span>`;

  // Keep focus on the page's field; a focus change would fire its blur/validation handlers.
  badge.addEventListener('mousedown', (e) => e.preventDefault());
  badge.addEventListener('mouseenter', () => {
    isInteractingWithBadge = true;
    cancelHide();
  });
  badge.addEventListener('mouseleave', () => {
    isInteractingWithBadge = false;
    if (!isMenuOpen()) scheduleHide();
  });
  badge.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });

  (document.body || document.documentElement).appendChild(badge);
  return badge;
}

/**
 * Creates the floating quick-action popup menu.
 */
function createMenuElement(): HTMLElement {
  const existing = document.getElementById(MENU_ID);
  if (existing) return existing;
  injectStyles();

  const menu = document.createElement('div');
  menu.id = MENU_ID;
  menu.setAttribute('data-nepal-filler-ui', '');
  menu.setAttribute('role', 'menu');
  menu.innerHTML = `
    <div class="__nepal_menu_header">${badgeIconHtml()}<span>Nepal Test Filler</span></div>
    <button type="button" role="menuitem" class="__nepal_menu_item" data-action="fill-form">
      <span class="__nepal_menu_icon">⚡</span>
      <span class="__nepal_menu_text"><strong>Fill entire form</strong><small>All detected fields</small></span>
    </button>
    <button type="button" role="menuitem" class="__nepal_menu_item" data-action="fill-field">
      <span class="__nepal_menu_icon">✎</span>
      <span class="__nepal_menu_text"><strong>Fill this field</strong><small>Only the selected input</small></span>
    </button>
    <button type="button" role="menuitem" class="__nepal_menu_item" data-action="revert-form">
      <span class="__nepal_menu_icon">↺</span>
      <span class="__nepal_menu_text"><strong>Undo fill</strong><small>Restore previous values</small></span>
    </button>
  `;

  menu.addEventListener('mousedown', (e) => e.preventDefault());
  menu.addEventListener('mouseenter', () => {
    isInteractingWithBadge = true;
    cancelHide();
  });
  menu.addEventListener('mouseleave', () => {
    isInteractingWithBadge = false;
  });

  menu.addEventListener('click', async (e) => {
    e.stopPropagation();
    const btn = (e.target as HTMLElement).closest('.__nepal_menu_item');
    if (!btn) return;

    const action = btn.getAttribute('data-action');
    const target = activeTargetElement;
    hideMenu();

    const targetRoot =
      target?.closest('form') ||
      ((target?.getRootNode ? target.getRootNode() : null) as ShadowRoot | Document | null) ||
      document;

    try {
      if (action === 'revert-form') {
        revertForm(targetRoot);
        flashBadgeSuccess();
        return;
      }

      const { options, person } = await getStoredOptions();
      const domainConfig = await getDomainMapping(window.location.hostname || 'localhost').catch(() => null);
      const rules = domainConfig?.rules || [];

      if (action === 'fill-form') {
        await fillPageAsync(person, options, undefined, targetRoot, rules, options.enableAiClassification ? classifyViaBackground : undefined);
        flashBadgeSuccess();
      } else if (action === 'fill-field' && target) {
        fillSingleField(target, person, options, rules);
        flashBadgeSuccess();
      }
    } catch {
      // A page-specific failure must never surface as an uncaught error on the host page.
    }
  });

  (document.body || document.documentElement).appendChild(menu);
  return menu;
}

/**
 * Briefly turns the badge green to confirm the action.
 */
function flashBadgeSuccess() {
  if (!badgeContainer) return;
  const icon = badgeContainer.querySelector('.__nepal_badge_icon');
  if (icon) icon.textContent = '✓';
  badgeContainer.setAttribute('data-state', 'done');

  setTimeout(() => {
    if (!badgeContainer) return;
    const ic = badgeContainer.querySelector('.__nepal_badge_icon');
    if (ic) ic.innerHTML = badgeIconHtml();
    badgeContainer.removeAttribute('data-state');
  }, 1200);
}

/**
 * Positions the badge just outside the right edge of the field, in viewport coordinates,
 * so it never covers the page's own in-field icons.
 */
function positionBadge(element: HTMLElement) {
  if (!badgeContainer) badgeContainer = createBadgeElement();

  const rect = element.getBoundingClientRect();
  const viewportW = window.innerWidth || document.documentElement.clientWidth;
  const viewportH = window.innerHeight || document.documentElement.clientHeight;
  const offscreen = rect.bottom < 0 || rect.top > viewportH;
  if ((rect.width === 0 && rect.height === 0) || rect.height < 12 || offscreen) {
    badgeContainer.style.display = 'none';
    hideMenu();
    return;
  }

  let left = rect.right + 4;
  if (left + BADGE_SIZE > viewportW - 2) left = rect.right - BADGE_SIZE - 4;
  const top = rect.top + Math.min(rect.height, 40) / 2 - BADGE_SIZE / 2;

  badgeContainer.style.top = `${Math.round(Math.max(0, top))}px`;
  badgeContainer.style.left = `${Math.round(Math.max(0, left))}px`;
  badgeContainer.style.display = 'flex';
}

function isMenuOpen(): boolean {
  return menuContainer?.style.display === 'flex';
}

function toggleMenu() {
  if (isMenuOpen()) hideMenu();
  else showMenu();
}

function showMenu() {
  if (!menuContainer) menuContainer = createMenuElement();
  if (!badgeContainer) return;

  menuContainer.style.display = 'flex';
  const badgeRect = badgeContainer.getBoundingClientRect();
  const menuHeight = menuContainer.offsetHeight || 150;
  const viewportW = window.innerWidth || document.documentElement.clientWidth;
  const viewportH = window.innerHeight || document.documentElement.clientHeight;

  let left = badgeRect.right - MENU_WIDTH;
  left = Math.min(Math.max(8, left), Math.max(8, viewportW - MENU_WIDTH - 8));
  let top = badgeRect.bottom + 6;
  if (top + menuHeight > viewportH - 8 && badgeRect.top - menuHeight - 6 > 8) {
    top = badgeRect.top - menuHeight - 6;
  }

  menuContainer.style.top = `${Math.round(top)}px`;
  menuContainer.style.left = `${Math.round(left)}px`;
}

function hideMenu() {
  if (menuContainer) menuContainer.style.display = 'none';
}

function cancelHide() {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
}

function scheduleHide() {
  cancelHide();
  hideTimeout = setTimeout(() => {
    if (!isInteractingWithBadge && !isMenuOpen()) hideBadge();
  }, 250);
}

export function hideBadge() {
  if (badgeContainer) badgeContainer.style.display = 'none';
  hideMenu();
  activeTargetElement = null;
}

/**
 * Keeps the badge attached to its field on scroll (including inner scroll containers)
 * and resize, at most once per animation frame.
 */
function handleViewportChange() {
  if (repositionFrame) return;
  repositionFrame = requestAnimationFrame(() => {
    repositionFrame = 0;
    if (activeTargetElement?.isConnected && isFillableField(activeTargetElement)) {
      positionBadge(activeTargetElement);
      if (isMenuOpen()) showMenu();
    } else if (activeTargetElement) {
      hideBadge();
    }
  });
}

function eventTarget(e: Event): Element | null {
  const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
  return (path[0] || e.target) as Element | null;
}

/**
 * After the extension is updated or reloaded, content scripts already in open tabs are
 * orphaned and every chrome.* call throws. Remove the stale badge instead of erroring.
 */
function isExtensionContextAlive(): boolean {
  try {
    return typeof chrome === 'undefined' || !chrome.runtime || Boolean(chrome.runtime.id);
  } catch {
    return false;
  }
}

function handleFocusIn(e: FocusEvent) {
  if (!isExtensionContextAlive()) {
    destroyFloatingBadge();
    return;
  }
  if (!isBadgeEnabled) return;
  const target = eventTarget(e);
  if (isFillableField(target)) {
    cancelHide();
    if (target !== activeTargetElement) hideMenu();
    activeTargetElement = target;
    positionBadge(target);
  }
}

function handleFocusOut(e: FocusEvent) {
  const next = e.relatedTarget as Element | null;
  if (next && (isFillableField(next) || next.closest?.('[data-nepal-filler-ui]'))) return;
  if (!isMenuOpen()) scheduleHide();
}

function handlePointerDown(e: Event) {
  const target = eventTarget(e);
  if (target?.closest?.('[data-nepal-filler-ui]')) return;
  if (isMenuOpen()) hideMenu();
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isMenuOpen()) hideMenu();
}

/**
 * Sets badge enabled/disabled state dynamically.
 */
export function setFloatingBadgeEnabled(enabled: boolean): void {
  isBadgeEnabled = enabled;
  if (!enabled) hideBadge();
}

export function isFloatingBadgeActive(): boolean {
  return isBadgeEnabled;
}

/**
 * Initializes floating badge event listeners on the active document.
 * The badge appears on focus only, never on hover, so browsing a page is not disturbed.
 */
export function initFloatingBadge(root: Document | HTMLElement = document): void {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    chrome.storage.local.get(['enableFloatingBadge'], (res: Record<string, unknown>) => {
      if (typeof res?.enableFloatingBadge === 'boolean') setFloatingBadgeEnabled(res.enableFloatingBadge);
    });

    storageListener = (changes, area) => {
      if (area !== undefined && area !== 'local') return;
      if (changes.enableFloatingBadge !== undefined) {
        setFloatingBadgeEnabled(changes.enableFloatingBadge.newValue !== false);
      }
    };
    chrome.storage.onChanged.addListener(storageListener);
  }

  root.addEventListener('focusin', handleFocusIn as EventListener, true);
  root.addEventListener('focusout', handleFocusOut as EventListener, true);
  root.addEventListener('pointerdown', handlePointerDown, true);
  root.addEventListener('keydown', handleKeyDown as EventListener, true);
  document.addEventListener('scroll', handleViewportChange, { capture: true, passive: true });
  window.addEventListener('resize', handleViewportChange, { passive: true });
}

/**
 * Destroys floating badge and removes elements and listeners.
 */
export function destroyFloatingBadge(): void {
  hideBadge();
  cancelHide();
  badgeContainer?.remove();
  badgeContainer = null;
  menuContainer?.remove();
  menuContainer = null;
  styleTag?.remove();
  styleTag = null;
  if (repositionFrame) cancelAnimationFrame(repositionFrame);
  repositionFrame = 0;

  if (storageListener && typeof chrome !== 'undefined') {
    chrome.storage?.onChanged?.removeListener(storageListener);
    storageListener = null;
  }

  document.removeEventListener('focusin', handleFocusIn as EventListener, true);
  document.removeEventListener('focusout', handleFocusOut as EventListener, true);
  document.removeEventListener('pointerdown', handlePointerDown, true);
  document.removeEventListener('keydown', handleKeyDown as EventListener, true);
  document.removeEventListener('scroll', handleViewportChange, { capture: true });
  window.removeEventListener('resize', handleViewportChange);
}
