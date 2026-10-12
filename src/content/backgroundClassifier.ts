import { ClassificationResult } from '../types';
import { FieldClassifier } from './filler';

/**
 * Routes AI field classification through the service worker so the API key and the
 * Gemini request never enter the page's context or network log.
 */
export const classifyViaBackground: FieldClassifier = async (payload) => {
  const res = await chrome.runtime.sendMessage({ action: 'CLASSIFY_FIELD', payload });
  if (res?.status === 'ok' && res.result) return res.result as ClassificationResult;
  return { fieldType: 'unknown', confidence: 0 };
};
