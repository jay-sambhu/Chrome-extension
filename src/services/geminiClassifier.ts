import {
  ClassificationResult,
  FieldClassificationPayload,
  GeminiConfig,
  SupportedFieldType,
} from '../types';
import { getCachedClassification, saveCachedClassification } from './classificationCache';

export const VALID_FIELD_TYPES: readonly SupportedFieldType[] = [
  'fullName',
  'firstName',
  'middleName',
  'lastName',
  'gender',
  'dateOfBirth',
  'age',
  'email',
  'phone',
  'telephone',
  'province',
  'district',
  'municipality',
  'ward',
  'tole',
  'address',
  'occupation',
  'jobTitle',
  'department',
  'companyName',
  'username',
  'password',
  'studentId',
  'school',
  'guardianName',
  'guardianPhone',
  'employeeId',
  'panNumber',
  'vatNumber',
  'businessName',
  'designation',
  'subject',
  'citizenshipNumber',
  'nationalId',
  'referenceNumber',
  'number',
  'date',
  'text',
  'textarea',
  'url',
  'unknown',
];

/**
 * Validates and sanitizes the outgoing payload so that ONLY minimal
 * form element metadata (name, id, placeholder, label, type, domain) is sent.
 * Absolutely no webpage content, cookies, tokens, or user data is included.
 */
export function sanitizePayload(raw: FieldClassificationPayload): FieldClassificationPayload {
  return {
    domain: (raw.domain || 'unknown').slice(0, 100),
    name: (raw.name || '').slice(0, 80),
    id: (raw.id || '').slice(0, 80),
    placeholder: (raw.placeholder || '').slice(0, 100),
    label: (raw.label || '').slice(0, 120),
    type: (raw.type || 'text').slice(0, 30),
  };
}

/**
 * Builds the structured classification prompt for Gemini.
 */
export function buildClassificationPrompt(payload: FieldClassificationPayload): string {
  const allowedList = VALID_FIELD_TYPES.filter((t) => t !== 'unknown').join(', ');

  return `You are a field classification engine for synthetic form filling in Nepal.
Your task is to classify an ambiguous or unknown web form input field into the single most accurate field category from this allowed list:
[${allowedList}].

Field Metadata:
- Host domain: "${payload.domain}"
- Input name: "${payload.name || ''}"
- Input ID: "${payload.id || ''}"
- Input placeholder: "${payload.placeholder || ''}"
- Input label / context: "${payload.label || ''}"
- HTML input type: "${payload.type || 'text'}"

Instructions:
1. Choose the best matching type from the allowed list. If none match or you cannot determine it with reasonable confidence, return "unknown".
2. If the field is a reference code, transaction ID, customer ID, or application number, classify it as "referenceNumber".
3. If the field is a Nepali citizenship number or nagrikta, classify as "citizenshipNumber".
4. If the field is a National Identity Card (Rastriya Parichayapatra), classify as "nationalId".
5. Return strictly a JSON object with this exact shape:
{
  "fieldType": "<one of the allowed types>",
  "confidence": <float between 0.0 and 1.0>,
  "reasoning": "<brief 1-sentence reason>"
}`;
}

/**
 * Normalizes a raw string response into a valid SupportedFieldType.
 */
export function normalizeFieldType(rawType?: string): SupportedFieldType {
  if (!rawType) return 'unknown';
  const clean = rawType.trim();

  // Direct match
  if (VALID_FIELD_TYPES.includes(clean as SupportedFieldType)) {
    return clean as SupportedFieldType;
  }

  // Common aliases
  const lower = clean.toLowerCase().replace(/[_\-\s]/g, '');
  if (lower.includes('customerreference') || lower.includes('reference') || lower.includes('tracking')) {
    return 'referenceNumber';
  }
  if (lower.includes('citizen') || lower.includes('nagrikta')) {
    return 'citizenshipNumber';
  }
  if (lower.includes('nationalid') || lower.includes('nid') || lower.includes('parichaya')) {
    return 'nationalId';
  }
  if (lower.includes('dob') || lower.includes('birth')) {
    return 'dateOfBirth';
  }
  if (lower.includes('mobile') || lower.includes('cell')) {
    return 'phone';
  }

  return 'unknown';
}

/**
 * Classifies an unknown form field using Gemini with persistent caching and strict privacy sanitization.
 * Form filling operates completely offline if Gemini is disabled or unconfigured.
 */
export async function classifyUnknownField(
  rawPayload: FieldClassificationPayload,
  config: GeminiConfig,
  fetchFn: typeof fetch = fetch
): Promise<ClassificationResult> {
  const sanitized = sanitizePayload(rawPayload);

  // 1. Check local cache first (avoids repeated network calls)
  const cached = await getCachedClassification(sanitized);
  if (cached) {
    return cached;
  }

  // 2. If Gemini is not enabled or no API key, return unknown immediately without error
  if (!config.enabled || !config.apiKey) {
    return {
      fieldType: 'unknown',
      confidence: 0,
      reasoning: 'Gemini classification is disabled or no API key provided.',
    };
  }

  // 3. Request classification from Gemini API
  const model = config.model || 'gemini-3.5-flash-lite';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
    config.apiKey
  )}`;

  const prompt = buildClassificationPrompt(sanitized);

  try {
    const response = await fetchFn(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
    });

    if (!response.ok) {
      console.warn(`[Nepal Test Filler] Gemini API responded with status ${response.status}`);
      return {
        fieldType: 'unknown',
        confidence: 0,
        reasoning: `API error: HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return { fieldType: 'unknown', confidence: 0, reasoning: 'Empty response from model' };
    }

    let parsed: any;
    try {
      parsed = JSON.parse(candidateText);
    } catch {
      // Fallback regex extraction if response had markdown backticks
      const match = candidateText.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        return { fieldType: 'unknown', confidence: 0, reasoning: 'Failed to parse JSON response' };
      }
    }

    const detectedType = normalizeFieldType(parsed?.fieldType);
    const confidence = typeof parsed?.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.8;
    const reasoning = parsed?.reasoning || 'Classified via Gemini';

    const result: ClassificationResult = {
      fieldType: detectedType,
      confidence,
      reasoning,
    };

    // 4. Save to persistent cache if confidence is reasonable
    if (detectedType !== 'unknown' && confidence >= 0.5) {
      await saveCachedClassification(sanitized, result);
    }

    return result;
  } catch (err) {
    console.warn('[Nepal Test Filler] Gemini classification request failed:', err);
    return {
      fieldType: 'unknown',
      confidence: 0,
      reasoning: `Network or fetch exception: ${String(err)}`,
    };
  }
}

export interface GeminiConnectionTestResult {
  success: boolean;
  status: 'valid' | 'invalid_key' | 'quota_exhausted' | 'model_not_found' | 'network_error' | 'error';
  message: string;
  model: string;
  latencyMs?: number;
}

/**
 * Validates a Gemini API key and checks model responsiveness and quota balance
 * by issuing a minimal generation request.
 */
export async function testGeminiConnection(
  apiKey: string,
  modelName: string = 'gemini-3.5-flash-lite',
  fetchFn: typeof fetch = fetch
): Promise<GeminiConnectionTestResult> {
  const trimmedKey = (apiKey || '').trim();
  const selectedModel = (modelName || '').trim() || 'gemini-3.5-flash-lite';

  if (!trimmedKey) {
    return {
      success: false,
      status: 'invalid_key',
      message: 'API key is missing. Please enter your Google Gemini API key.',
      model: selectedModel,
    };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    selectedModel
  )}:generateContent?key=${encodeURIComponent(trimmedKey)}`;

  const startTime = Date.now();

  try {
    const response = await fetchFn(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: 'ping' }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 1,
          temperature: 0,
        },
      }),
    });

    const latencyMs = Date.now() - startTime;

    if (response.ok) {
      return {
        success: true,
        status: 'valid',
        message: `Connection verified! Gemini API key is valid and quota is available (${latencyMs}ms).`,
        model: selectedModel,
        latencyMs,
      };
    }

    let errorData: any = null;
    let errorMsg = '';
    try {
      errorData = await response.json();
      errorMsg = errorData?.error?.message || '';
    } catch {
      // response might not be json
    }

    const errorStatus = String(errorData?.error?.status || '').toUpperCase();
    const rawMsg = errorMsg.toLowerCase();

    // 400 or 403: Invalid Key / Permission
    if (
      response.status === 400 ||
      response.status === 403 ||
      errorStatus === 'INVALID_ARGUMENT' ||
      errorStatus === 'PERMISSION_DENIED' ||
      rawMsg.includes('api key') ||
      rawMsg.includes('invalid')
    ) {
      return {
        success: false,
        status: 'invalid_key',
        message: `Invalid API key: ${errorMsg || 'Please check your Gemini API key from Google AI Studio.'}`,
        model: selectedModel,
        latencyMs,
      };
    }

    // 429: Quota exhausted / Resource exhausted
    if (
      response.status === 429 ||
      errorStatus === 'RESOURCE_EXHAUSTED' ||
      rawMsg.includes('quota') ||
      rawMsg.includes('exhausted')
    ) {
      return {
        success: false,
        status: 'quota_exhausted',
        message: `Quota exceeded (HTTP 429): ${errorMsg || 'Your Gemini API quota limit has been reached.'}`,
        model: selectedModel,
        latencyMs,
      };
    }

    // 404: Model not found
    if (response.status === 404 || errorStatus === 'NOT_FOUND' || rawMsg.includes('not found')) {
      return {
        success: false,
        status: 'model_not_found',
        message: `Model not found (HTTP 404): Model '${selectedModel}' was not found or is unavailable.`,
        model: selectedModel,
        latencyMs,
      };
    }

    return {
      success: false,
      status: 'error',
      message: `Gemini API error (HTTP ${response.status}): ${errorMsg || response.statusText || 'Unexpected response'}`,
      model: selectedModel,
      latencyMs,
    };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      status: 'network_error',
      message: `Network error: Unable to connect to Gemini API (${err instanceof Error ? err.message : String(err)}).`,
      model: selectedModel,
      latencyMs,
    };
  }
}
