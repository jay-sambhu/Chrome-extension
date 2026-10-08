import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initFloatingBadge,
  destroyFloatingBadge,
  setFloatingBadgeEnabled,
  isFloatingBadgeActive,
} from '../src/content/floatingBadge';
import { clearSnapshot } from '../src/content/filler';

describe('Phase 2.2 — Inline Floating Quick-Fill Trigger (Badge)', () => {
  let mockStorage: Record<string, any> = {};

  beforeEach(() => {
    document.body.innerHTML = '';
    clearSnapshot();
    mockStorage = {
      enableFloatingBadge: true,
      selectedProfile: 'general',
      fillScript: 'en',
    };

    // Mock chrome storage
    (global as any).chrome = {
      storage: {
        local: {
          get: vi.fn((keys, callback) => {
            const result: Record<string, any> = {};
            if (Array.isArray(keys)) {
              keys.forEach((k) => (result[k] = mockStorage[k]));
            } else if (typeof keys === 'string') {
              result[keys] = mockStorage[keys];
            } else if (typeof keys === 'object' && keys !== null) {
              Object.keys(keys).forEach((k) => (result[k] = mockStorage[k] ?? keys[k]));
            }
            if (callback) callback(result);
            return Promise.resolve(result);
          }),
          set: vi.fn((data, callback) => {
            Object.assign(mockStorage, data);
            if (callback) callback();
            return Promise.resolve();
          }),
        },
        onChanged: {
          addListener: vi.fn(),
          removeListener: vi.fn(),
        },
      },
    };

    initFloatingBadge(document);
  });

  afterEach(() => {
    destroyFloatingBadge();
    vi.restoreAllMocks();
  });

  describe('Enable / Disable State Management', () => {
    it('initializes as enabled by default', () => {
      expect(isFloatingBadgeActive()).toBe(true);
    });

    it('can be disabled and re-enabled dynamically', () => {
      setFloatingBadgeEnabled(false);
      expect(isFloatingBadgeActive()).toBe(false);

      setFloatingBadgeEnabled(true);
      expect(isFloatingBadgeActive()).toBe(true);
    });

    it('hides badge when disabled', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'full_name';
      document.body.appendChild(input);

      input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      const badge = document.getElementById('__nepal_filler_floating_badge');
      expect(badge).toBeTruthy();

      setFloatingBadgeEnabled(false);
      expect(badge?.style.display).toBe('none');
    });

    it('does not display badge on focus when disabled', () => {
      setFloatingBadgeEnabled(false);

      const input = document.createElement('input');
      input.type = 'text';
      document.body.appendChild(input);

      input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      const badge = document.getElementById('__nepal_filler_floating_badge');
      if (badge) {
        expect(badge.style.display).toBe('none');
      }
    });
  });

  describe('Field Hover & Focus Interactions', () => {
    it('displays badge when a text input receives focus', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'citizen_name';
      document.body.appendChild(input);

      // Mock bounding rect
      vi.spyOn(input, 'getBoundingClientRect').mockReturnValue({
        top: 100,
        right: 300,
        bottom: 140,
        left: 100,
        width: 200,
        height: 40,
        x: 100,
        y: 100,
        toJSON: () => {},
      });

      input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

      const badge = document.getElementById('__nepal_filler_floating_badge');
      expect(badge).toBeTruthy();
      expect(badge?.style.display).toBe('flex');
    });

    it('displays badge on mouseover for fillable form fields', () => {
      const textarea = document.createElement('textarea');
      textarea.name = 'address';
      document.body.appendChild(textarea);

      vi.spyOn(textarea, 'getBoundingClientRect').mockReturnValue({
        top: 200,
        right: 400,
        bottom: 280,
        left: 200,
        width: 200,
        height: 80,
        x: 200,
        y: 200,
        toJSON: () => {},
      });

      textarea.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

      const badge = document.getElementById('__nepal_filler_floating_badge');
      expect(badge).toBeTruthy();
      expect(badge?.style.display).toBe('flex');
    });

    it('ignores disabled or readonly inputs', () => {
      const disabledInput = document.createElement('input');
      disabledInput.type = 'text';
      disabledInput.disabled = true;
      document.body.appendChild(disabledInput);

      disabledInput.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      const badge = document.getElementById('__nepal_filler_floating_badge');
      if (badge) {
        expect(badge.style.display).not.toBe('flex');
      }
    });

    it('ignores non-fillable input types (hidden, submit, button)', () => {
      const submitBtn = document.createElement('input');
      submitBtn.type = 'submit';
      document.body.appendChild(submitBtn);

      submitBtn.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      const badge = document.getElementById('__nepal_filler_floating_badge');
      if (badge) {
        expect(badge.style.display).not.toBe('flex');
      }
    });
  });

  describe('Quick Actions Menu and Execution', () => {
    it('opens floating quick actions menu when badge is clicked', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'phone';
      document.body.appendChild(input);

      vi.spyOn(input, 'getBoundingClientRect').mockReturnValue({
        top: 50,
        right: 250,
        bottom: 80,
        left: 50,
        width: 200,
        height: 30,
        x: 50,
        y: 50,
        toJSON: () => {},
      });

      input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

      const badge = document.getElementById('__nepal_filler_floating_badge');
      expect(badge).toBeTruthy();

      badge?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      const menu = document.getElementById('__nepal_filler_floating_menu');
      expect(menu).toBeTruthy();
      expect(menu?.style.display).toBe('flex');
    });

    it('fills entire form when "Fill Entire Form" is selected', async () => {
      const form = document.createElement('form');
      form.innerHTML = `
        <input type="text" name="full_name" id="name" />
        <input type="email" name="email" id="email" />
        <input type="tel" name="phone" id="phone" />
      `;
      document.body.appendChild(form);

      const nameInput = form.querySelector('#name') as HTMLInputElement;
      vi.spyOn(nameInput, 'getBoundingClientRect').mockReturnValue({
        top: 50,
        right: 250,
        bottom: 80,
        left: 50,
        width: 200,
        height: 30,
        x: 50,
        y: 50,
        toJSON: () => {},
      });

      nameInput.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

      const badge = document.getElementById('__nepal_filler_floating_badge');
      badge?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      const fillFormBtn = document.querySelector('[data-action="fill-form"]') as HTMLElement;
      expect(fillFormBtn).toBeTruthy();

      fillFormBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      // Allow async fill handlers
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(nameInput.value).not.toBe('');
      expect((form.querySelector('#email') as HTMLInputElement).value).not.toBe('');
      expect((form.querySelector('#phone') as HTMLInputElement).value).not.toBe('');
    });

    it('fills only the active target field when "Fill This Field Only" is clicked', async () => {
      const form = document.createElement('form');
      form.innerHTML = `
        <input type="text" name="citizenship_number" id="cit" />
        <input type="text" name="pan_number" id="pan" />
      `;
      document.body.appendChild(form);

      const citInput = form.querySelector('#cit') as HTMLInputElement;
      const panInput = form.querySelector('#pan') as HTMLInputElement;

      vi.spyOn(citInput, 'getBoundingClientRect').mockReturnValue({
        top: 50,
        right: 250,
        bottom: 80,
        left: 50,
        width: 200,
        height: 30,
        x: 50,
        y: 50,
        toJSON: () => {},
      });

      citInput.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

      const badge = document.getElementById('__nepal_filler_floating_badge');
      badge?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      const fillFieldBtn = document.querySelector('[data-action="fill-field"]') as HTMLElement;
      expect(fillFieldBtn).toBeTruthy();

      fillFieldBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(citInput.value).not.toBe('');
      expect(panInput.value).toBe(''); // untouched
    });

    it('reverts the form when "Revert / Undo" is clicked', async () => {
      const form = document.createElement('form');
      form.innerHTML = `
        <input type="text" name="full_name" id="name" value="Original Value" />
      `;
      document.body.appendChild(form);

      const input = form.querySelector('#name') as HTMLInputElement;
      vi.spyOn(input, 'getBoundingClientRect').mockReturnValue({
        top: 50,
        right: 250,
        bottom: 80,
        left: 50,
        width: 200,
        height: 30,
        x: 50,
        y: 50,
        toJSON: () => {},
      });

      input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

      // 1. Fill entire form
      const badge = document.getElementById('__nepal_filler_floating_badge');
      badge?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      const fillFormBtn = document.querySelector('[data-action="fill-form"]') as HTMLElement;
      fillFormBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(input.value).not.toBe('Original Value');

      // 2. Open menu and click Revert / Undo
      badge?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      const revertBtn = document.querySelector('[data-action="revert-form"]') as HTMLElement;
      revertBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(input.value).toBe('Original Value');
    });
  });

  describe('Cleanup and Destruction', () => {
    it('removes badge and menu elements upon destroyFloatingBadge', () => {
      const input = document.createElement('input');
      input.type = 'text';
      document.body.appendChild(input);

      input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      expect(document.getElementById('__nepal_filler_floating_badge')).toBeTruthy();

      destroyFloatingBadge();

      expect(document.getElementById('__nepal_filler_floating_badge')).toBeNull();
      expect(document.getElementById('__nepal_filler_floating_menu')).toBeNull();
    });
  });
});
