import { generateSyntheticPerson } from '../generator/personGenerator';
import { fillPage, fillSingleField, revertForm } from './filler';
import { FillOptions, ProfileType, SyntheticPerson } from '../types';
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
let hideTimeout: ReturnType<typeof setTimeout> | null = null;
let isInteractingWithBadge = false;

const BADGE_ID = '__nepal_filler_floating_badge';
const MENU_ID = '__nepal_filler_floating_menu';

/**
 * Checks whether an element is an interactive, fillable form field.
 */
function isFillableField(element: Element | null): element is HTMLElement {
  if (!element || !(element instanceof HTMLElement)) return false;
  if (element.closest(`#${BADGE_ID}, #${MENU_ID}`)) return false;

  const tagName = element.tagName.toLowerCase();
  if (tagName === 'textarea' || tagName === 'select') {
    return !element.hasAttribute('disabled') && !element.hasAttribute('readonly');
  }

  if (tagName === 'input') {
    const input = element as HTMLInputElement;
    const type = (input.type || 'text').toLowerCase();
    const nonFillable = ['hidden', 'submit', 'reset', 'button', 'image', 'file'];
    return !nonFillable.includes(type) && !input.disabled && !input.readOnly;
  }

  const role = element.getAttribute('role');
  if (role === 'checkbox' || role === 'radio' || role === 'combobox') {
    return element.getAttribute('aria-disabled') !== 'true';
  }

  return false;
}

/**
 * Retrieves the user's stored preferences or provides realistic defaults.
 */
async function getStoredOptions(): Promise<{ options: FillOptions; person: SyntheticPerson }> {
  // Check if this tab session already has an active retained persona (e.g. from prior wizard steps)
  const retainedPerson = getSessionPersona();
  const retainedOptions = getSessionOptions();

  let profile: ProfileType = 'general';
  let fillScript: 'en' | 'np' = 'en';
  let fillCategories = { personal: true, contact: true, address: true, professional: true };

  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    try {
      const data = (await chrome.storage.local.get([
        'selectedProfile',
        'fillScript',
        'fillCategories',
        'lastGeneratedPerson',
      ])) as Record<string, any>;

      if (data.selectedProfile) profile = data.selectedProfile;
      if (data.fillScript === 'en' || data.fillScript === 'np') fillScript = data.fillScript;
      if (data.fillCategories) fillCategories = data.fillCategories;

      if (retainedPerson) {
        return {
          options: retainedOptions || { profile, fillScript, fillCategories },
          person: retainedPerson,
        };
      }

      const person = data.lastGeneratedPerson || generateSyntheticPerson(profile);
      setSessionPersona(person);
      setSessionOptions({ profile, fillScript, fillCategories });

      return {
        options: { profile, fillScript, fillCategories },
        person,
      };
    } catch {
      // Fallback
    }
  }

  if (retainedPerson) {
    return {
      options: retainedOptions || { profile, fillScript, fillCategories },
      person: retainedPerson,
    };
  }

  const generated = generateSyntheticPerson(profile);
  setSessionPersona(generated);
  setSessionOptions({ profile, fillScript, fillCategories });

  return {
    options: { profile, fillScript, fillCategories },
    person: generated,
  };
}

/**
 * Creates the floating badge DOM element.
 */
function createBadgeElement(): HTMLElement {
  let badge = document.getElementById(BADGE_ID);
  if (badge) return badge;

  badge = document.createElement('div');
  badge.id = BADGE_ID;
  badge.setAttribute('role', 'button');
  badge.setAttribute('tabindex', '-1');
  badge.setAttribute('aria-label', 'Nepal Test Filler Quick Actions');
  badge.title = 'Nepal Test Filler: Click to fill form (Alt+Shift+F)';

  badge.innerHTML = `
    <div class="__nepal_badge_icon">🇳🇵</div>
  `;

  Object.assign(badge.style, {
    position: 'absolute',
    zIndex: '2147483646',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#1c1917',
    border: '1px solid rgba(217, 38, 68, 0.4)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.08)',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    fontSize: '13px',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
    opacity: '0.85',
  });

  badge.addEventListener('mouseenter', () => {
    isInteractingWithBadge = true;
    if (badge) {
      badge.style.opacity = '1';
      badge.style.transform = 'scale(1.1)';
      badge.style.borderColor = '#d92644';
      badge.style.boxShadow = '0 4px 12px rgba(217, 38, 68, 0.35)';
    }
    cancelHide();
  });

  badge.addEventListener('mouseleave', () => {
    isInteractingWithBadge = false;
    if (badge) {
      badge.style.opacity = '0.85';
      badge.style.transform = 'scale(1)';
      badge.style.borderColor = 'rgba(217, 38, 68, 0.4)';
      badge.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.25)';
    }
    scheduleHide();
  });

  badge.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });

  document.body.appendChild(badge);
  return badge;
}

/**
 * Creates the floating quick-action popup menu.
 */
function createMenuElement(): HTMLElement {
  let menu = document.getElementById(MENU_ID);
  if (menu) return menu;

  menu = document.createElement('div');
  menu.id = MENU_ID;
  menu.setAttribute('role', 'menu');

  menu.innerHTML = `
    <div class="__nepal_menu_header">
      <span class="__nepal_menu_flag">🇳🇵</span>
      <span class="__nepal_menu_title">Nepal Test Filler</span>
    </div>
    <div class="__nepal_menu_items">
      <button type="button" class="__nepal_menu_item" data-action="fill-form">
        <span class="__nepal_menu_icon">⚡</span>
        <div class="__nepal_menu_text">
          <strong>Fill Entire Form</strong>
          <small>Populate all detected fields</small>
        </div>
      </button>
      <button type="button" class="__nepal_menu_item" data-action="fill-field">
        <span class="__nepal_menu_icon">✨</span>
        <div class="__nepal_menu_text">
          <strong>Fill This Field Only</strong>
          <small>Populate selected input</small>
        </div>
      </button>
      <button type="button" class="__nepal_menu_item __nepal_menu_revert" data-action="revert-form">
        <span class="__nepal_menu_icon">↺</span>
        <div class="__nepal_menu_text">
          <strong>Revert / Undo</strong>
          <small>Restore pre-fill state (Alt+Shift+U)</small>
        </div>
      </button>
    </div>
  `;

  Object.assign(menu.style, {
    position: 'absolute',
    zIndex: '2147483647',
    width: '210px',
    backgroundColor: '#1c1917',
    color: '#fafaf9',
    borderRadius: '10px',
    border: '1px solid rgba(217, 119, 6, 0.25)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(217, 119, 6, 0.1)',
    display: 'none',
    flexDirection: 'column',
    overflow: 'hidden',
    fontSize: '12px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '4px',
  });

  // Inject scoped styles for menu elements
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    #__nepal_filler_floating_menu .__nepal_menu_header {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 8px 4px 8px;
      font-size: 11px;
      font-weight: 700;
      color: #a8a29e;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      margin-bottom: 4px;
    }
    #__nepal_filler_floating_menu .__nepal_menu_items {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    #__nepal_filler_floating_menu .__nepal_menu_item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      background: transparent;
      border: none;
      color: #fafaf9;
      border-radius: 6px;
      cursor: pointer;
      text-align: left;
      font-size: 12px;
      transition: background 0.15s ease, color 0.15s ease;
      width: 100%;
    }
    #__nepal_filler_floating_menu .__nepal_menu_item:hover {
      background: rgba(217, 38, 68, 0.18);
      color: #ffffff;
    }
    #__nepal_filler_floating_menu .__nepal_menu_revert:hover {
      background: rgba(239, 68, 68, 0.18);
      color: #fca5a5;
    }
    #__nepal_filler_floating_menu .__nepal_menu_icon {
      font-size: 14px;
      flex-shrink: 0;
    }
    #__nepal_filler_floating_menu .__nepal_menu_text {
      display: flex;
      flex-direction: column;
      line-height: 1.25;
    }
    #__nepal_filler_floating_menu .__nepal_menu_text strong {
      font-size: 11.5px;
      font-weight: 600;
    }
    #__nepal_filler_floating_menu .__nepal_menu_text small {
      font-size: 10px;
      color: #94a3b8;
    }
  `;
  document.head.appendChild(styleTag);

  menu.addEventListener('mouseenter', () => {
    isInteractingWithBadge = true;
    cancelHide();
  });

  menu.addEventListener('mouseleave', () => {
    isInteractingWithBadge = false;
    scheduleHide();
  });

  menu.addEventListener('click', async (e) => {
    const btn = (e.target as HTMLElement).closest('.__nepal_menu_item');
    if (!btn) return;

    const action = btn.getAttribute('data-action');
    hideMenu();

    const { options, person } = await getStoredOptions();

    if (action === 'fill-form') {
      const targetRoot =
        activeTargetElement?.closest('form') ||
        ((activeTargetElement?.getRootNode ? activeTargetElement.getRootNode() : null) as ShadowRoot | Document) ||
        document;
      fillPage(person, options, targetRoot);
      flashBadgeSuccess();
    } else if (action === 'fill-field' && activeTargetElement) {
      fillSingleField(activeTargetElement, person, options);
      flashBadgeSuccess();
    } else if (action === 'revert-form') {
      const targetRoot =
        activeTargetElement?.closest('form') ||
        ((activeTargetElement?.getRootNode ? activeTargetElement.getRootNode() : null) as ShadowRoot | Document) ||
        document;
      revertForm(targetRoot);
      flashBadgeSuccess();
    }
  });

  document.body.appendChild(menu);
  return menu;
}

/**
 * Flashes the badge green temporarily to provide visual feedback of success.
 */
function flashBadgeSuccess() {
  if (!badgeContainer) return;
  const icon = badgeContainer.querySelector('.__nepal_badge_icon');
  if (icon) icon.textContent = '✓';
  badgeContainer.style.borderColor = '#10b981';
  badgeContainer.style.backgroundColor = '#064e3b';

  setTimeout(() => {
    if (badgeContainer) {
      const ic = badgeContainer.querySelector('.__nepal_badge_icon');
      if (ic) ic.textContent = '🇳🇵';
      badgeContainer.style.borderColor = 'rgba(220, 20, 60, 0.4)';
      badgeContainer.style.backgroundColor = '#0f172a';
    }
  }, 1200);
}

/**
 * Positions the badge relative to the target element.
 */
function positionBadge(element: HTMLElement) {
  if (!badgeContainer) badgeContainer = createBadgeElement();

  const rect = element.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    hideBadge();
    return;
  }

  const scrollX = window.scrollX || window.pageXOffset || 0;
  const scrollY = window.scrollY || window.pageYOffset || 0;

  // Place badge inside the right edge of input if input is wide enough (>= 120px)
  // Otherwise place it immediately outside to the right
  let top = rect.top + scrollY + (rect.height - 24) / 2;
  let left = rect.right + scrollX - 28;

  if (rect.width < 120) {
    left = rect.right + scrollX + 4;
  }

  // Boundary check
  if (left < 0) left = 0;
  if (top < 0) top = 0;

  badgeContainer.style.top = `${Math.round(top)}px`;
  badgeContainer.style.left = `${Math.round(left)}px`;
  badgeContainer.style.display = 'flex';
}

/**
 * Toggles the visibility of the popup action menu.
 */
function toggleMenu() {
  if (!menuContainer) menuContainer = createMenuElement();

  if (menuContainer.style.display === 'flex') {
    hideMenu();
  } else {
    showMenu();
  }
}

function showMenu() {
  if (!menuContainer) menuContainer = createMenuElement();
  if (!badgeContainer) return;

  const badgeRect = badgeContainer.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset || 0;
  const scrollY = window.scrollY || window.pageYOffset || 0;

  let top = badgeRect.bottom + scrollY + 4;
  let left = badgeRect.left + scrollX - 180; // align menu to the left of badge

  if (left < 10) left = 10;

  menuContainer.style.top = `${Math.round(top)}px`;
  menuContainer.style.left = `${Math.round(left)}px`;
  menuContainer.style.display = 'flex';
}

function hideMenu() {
  if (menuContainer) {
    menuContainer.style.display = 'none';
  }
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
    if (!isInteractingWithBadge) {
      hideBadge();
    }
  }, 400);
}

export function hideBadge() {
  if (badgeContainer) {
    badgeContainer.style.display = 'none';
  }
  hideMenu();
  activeTargetElement = null;
}

/**
 * Updates badge position if target is still active on scroll/resize.
 */
function handleViewportChange() {
  if (activeTargetElement && isFillableField(activeTargetElement)) {
    positionBadge(activeTargetElement);
    if (menuContainer && menuContainer.style.display === 'flex') {
      showMenu();
    }
  }
}

/**
 * Handles element focus and hover interactions.
 */
function handleFocusIn(e: FocusEvent) {
  if (!isBadgeEnabled) return;
  const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
  const target = (path[0] || e.target) as Element | null;
  if (isFillableField(target)) {
    cancelHide();
    activeTargetElement = target;
    positionBadge(target);
  }
}

function handleMouseOver(e: MouseEvent) {
  if (!isBadgeEnabled) return;
  const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
  const rawTarget = (path[0] || e.target) as Element | null;
  const target = rawTarget?.closest
    ? rawTarget.closest('input, textarea, select, [role="checkbox"], [role="radio"]')
    : rawTarget;
  if (isFillableField(target)) {
    cancelHide();
    activeTargetElement = target;
    positionBadge(target);
  }
}

function handleFocusOut(e: FocusEvent) {
  const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
  const related = (path[0] || e.relatedTarget) as Element | null;
  if (related && isFillableField(related)) {
    return;
  }
  scheduleHide();
}

/**
 * Sets badge enabled/disabled state dynamically.
 */
export function setFloatingBadgeEnabled(enabled: boolean): void {
  isBadgeEnabled = enabled;
  if (!enabled) {
    hideBadge();
  }
}

export function isFloatingBadgeActive(): boolean {
  return isBadgeEnabled;
}

/**
 * Initializes floating badge event listeners on the active document.
 */
export function initFloatingBadge(root: Document | HTMLElement = document): void {
  // Check stored preference
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    chrome.storage.local.get(['enableFloatingBadge'], (res: Record<string, any>) => {
      if (typeof res.enableFloatingBadge === 'boolean') {
        isBadgeEnabled = res.enableFloatingBadge;
      }
    });

    // Listen to storage changes
    chrome.storage.onChanged.addListener((changes: Record<string, chrome.storage.StorageChange>) => {
      if (changes.enableFloatingBadge !== undefined) {
        setFloatingBadgeEnabled(Boolean(changes.enableFloatingBadge.newValue));
      }
    });
  }

  root.addEventListener('focusin', handleFocusIn as EventListener, true);
  root.addEventListener('focusout', handleFocusOut as EventListener, true);
  root.addEventListener('mouseover', handleMouseOver as EventListener, true);

  window.addEventListener('scroll', handleViewportChange, { passive: true });
  window.addEventListener('resize', handleViewportChange, { passive: true });
}

/**
 * Destroys floating badge and removes elements from DOM.
 */
export function destroyFloatingBadge(): void {
  hideBadge();
  if (badgeContainer) {
    badgeContainer.remove();
    badgeContainer = null;
  }
  if (menuContainer) {
    menuContainer.remove();
    menuContainer = null;
  }

  document.removeEventListener('focusin', handleFocusIn as EventListener, true);
  document.removeEventListener('focusout', handleFocusOut as EventListener, true);
  document.removeEventListener('mouseover', handleMouseOver as EventListener, true);
  window.removeEventListener('scroll', handleViewportChange);
  window.removeEventListener('resize', handleViewportChange);
}
