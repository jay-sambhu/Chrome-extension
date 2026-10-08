import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { queryDeepFormElements, scanFormFields, getFieldLabel } from '../src/content/detector';
import { fillPage, revertForm, clearForm, clearSnapshot } from '../src/content/filler';
import { generateSyntheticPerson } from '../src/generator/personGenerator';
import { FillOptions } from '../src/types';

describe('Phase 2.4 — Shadow DOM & <iframe> Form Filling', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    clearSnapshot();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    clearSnapshot();
    vi.restoreAllMocks();
  });

  describe('Deep DOM Traversal: Open Shadow DOM Roots', () => {
    it('detects form fields inside an open Shadow DOM root', () => {
      // Create a custom element with open shadow root
      const hostElement = document.createElement('div');
      hostElement.id = 'custom-user-card';
      document.body.appendChild(hostElement);

      const shadowRoot = hostElement.attachShadow({ mode: 'open' });
      shadowRoot.innerHTML = `
        <div class="shadow-form">
          <label for="shadow_name">Full Name</label>
          <input type="text" id="shadow_name" name="full_name" />
          <input type="tel" id="shadow_phone" name="mobile_number" />
        </div>
      `;

      const deepElements = queryDeepFormElements(document);
      expect(deepElements.length).toBe(2);

      const detected = scanFormFields(document);
      expect(detected.length).toBe(2);

      const nameField = detected.find((f) => f.name === 'full_name');
      expect(nameField).toBeTruthy();
      expect(nameField?.type).toBe('fullName');

      const phoneField = detected.find((f) => f.name === 'mobile_number');
      expect(phoneField).toBeTruthy();
      expect(phoneField?.type).toBe('phone');
    });

    it('resolves labels correctly when labels are inside the shadowRoot', () => {
      const hostElement = document.createElement('div');
      document.body.appendChild(hostElement);

      const shadowRoot = hostElement.attachShadow({ mode: 'open' });
      shadowRoot.innerHTML = `
        <label for="cit_num">Citizenship Certificate Number</label>
        <input type="text" id="cit_num" name="cit_num" />
      `;

      const input = shadowRoot.querySelector('#cit_num') as HTMLElement;
      expect(input).toBeTruthy();

      const label = getFieldLabel(input);
      expect(label).toBe('Citizenship Certificate Number');

      const detected = scanFormFields(shadowRoot);
      expect(detected[0].type).toBe('citizenshipNumber');
    });

    it('traverses nested open Shadow DOM roots (component inside component)', () => {
      const outerHost = document.createElement('div');
      outerHost.id = 'outer-host';
      document.body.appendChild(outerHost);

      const outerShadow = outerHost.attachShadow({ mode: 'open' });
      const innerHost = document.createElement('div');
      innerHost.id = 'inner-host';
      outerShadow.appendChild(innerHost);

      const innerShadow = innerHost.attachShadow({ mode: 'open' });
      innerShadow.innerHTML = `
        <input type="email" id="nested_email" name="user_email" />
        <input type="text" id="nested_pan" name="pan_number" />
      `;

      const detected = scanFormFields(document);
      expect(detected.length).toBe(2);

      const emailField = detected.find((f) => f.name === 'user_email');
      const panField = detected.find((f) => f.name === 'pan_number');

      expect(emailField?.type).toBe('email');
      expect(panField?.type).toBe('panNumber');
    });

    it('fills and reverts fields inside an open Shadow DOM root', () => {
      const hostElement = document.createElement('div');
      document.body.appendChild(hostElement);

      const shadowRoot = hostElement.attachShadow({ mode: 'open' });
      shadowRoot.innerHTML = `
        <input type="text" id="cust_name" name="full_name" value="Initial State" />
        <input type="text" id="cust_phone" name="phone" value="9800000000" />
      `;

      const person = generateSyntheticPerson('employee');
      const options: FillOptions = {
        profile: 'employee',
        fillScript: 'en',
        fillCategories: { personal: true, contact: true, address: true, professional: true },
      };

      // 1. Fill fields across document (including shadowRoot)
      const fillResult = fillPage(person, options, document);
      expect(fillResult.fieldsFilledCount).toBe(2);

      const nameInput = shadowRoot.querySelector('#cust_name') as HTMLInputElement;
      const phoneInput = shadowRoot.querySelector('#cust_phone') as HTMLInputElement;

      expect(nameInput.value).toBe(person.fullName);
      expect(phoneInput.value).toBe(person.phone);

      // 2. Revert fields back to initial state
      const undoResult = revertForm(document);
      expect(undoResult.revertedCount).toBe(2);
      expect(nameInput.value).toBe('Initial State');
      expect(phoneInput.value).toBe('9800000000');
    });
  });

  describe('Embedded <iframe> Form Fields & Cross-Frame Support', () => {
    it('penetrates accessible embedded <iframe> to detect payment fields (eSewa / Khalti)', () => {
      // Create an embedded modal iframe (like eSewa or Khalti checkout dialogue)
      const iframe = document.createElement('iframe');
      iframe.id = 'esewa-payment-frame';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      expect(iframeDoc).toBeTruthy();

      if (iframeDoc) {
        iframeDoc.body.innerHTML = `
          <div class="esewa-modal">
            <h3>eSewa Mobile Wallet Payment</h3>
            <label for="esewa_id">eSewa ID / Mobile Number</label>
            <input type="text" id="esewa_id" name="esewa_id" />
            <input type="password" id="esewa_pwd" name="mpin" placeholder="MPIN" />
          </div>
        `;

        const detected = scanFormFields(document);
        expect(detected.length).toBe(2);

        const esewaField = detected.find((f) => f.name === 'esewa_id');
        expect(esewaField).toBeTruthy();
        expect(esewaField?.type).toBe('esewaId');

        const mpinField = detected.find((f) => f.name === 'mpin');
        expect(mpinField).toBeTruthy();
        expect(mpinField?.type).toBe('password');
      }
    });

    it('fills form fields inside an embedded accessible <iframe> directly from main document', () => {
      const iframe = document.createElement('iframe');
      iframe.id = 'khalti-payment-frame';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.body.innerHTML = `
          <form id="khalti-form">
            <input type="text" id="khalti_mobile" name="khalti_id" />
            <input type="password" id="khalti_pin" name="transaction_pin" />
          </form>
        `;

        const person = generateSyntheticPerson('general');
        const options: FillOptions = {
          profile: 'general',
          fillScript: 'en',
          fillCategories: { personal: true, contact: true, address: true, professional: true },
        };

        const result = fillPage(person, options, document);
        expect(result.fieldsFilledCount).toBe(2);

        const khaltiInput = iframeDoc.querySelector('#khalti_mobile') as HTMLInputElement;
        expect(khaltiInput.value).toBe(person.esewaId || person.phone);

        // Clear form in document also clears iframe inputs
        const clearRes = clearForm(document);
        expect(clearRes.revertedCount).toBeGreaterThanOrEqual(1);
        expect(khaltiInput.value).toBe('');
      }
    });

    it('handles cross-frame postMessage events cleanly for subframes', () => {
      // Simulate subframe message listener
      let frameFilled = false;
      const subframeListener = (event: MessageEvent) => {
        if (event.data?.__nepal_filler_cross_frame__ && event.data.action === 'FILL_PAGE') {
          frameFilled = true;
        }
      };

      window.addEventListener('message', subframeListener);

      const person = generateSyntheticPerson('general');
      window.postMessage(
        {
          __nepal_filler_cross_frame__: true,
          action: 'FILL_PAGE',
          person,
          options: { profile: 'general', fillScript: 'en', fillCategories: { personal: true } },
        },
        '*'
      );

      // Verify dispatch
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(frameFilled).toBe(true);
          window.removeEventListener('message', subframeListener);
          resolve();
        }, 50);
      });
    });
  });
});
