import { DetectedField, SupportedFieldType } from '../types';

/**
 * Extracts the most relevant human-readable label from the DOM for an input element.
 */
export function getFieldLabel(element: HTMLElement): string {
  // 1. Explicit <label for="id">
  if (element.id) {
    const labelElem = document.querySelector(`label[for="${CSS.escape(element.id)}"]`);
    if (labelElem && labelElem.textContent) {
      return labelElem.textContent.trim();
    }
  }

  // 2. Enclosing <label>
  const parentLabel = element.closest('label');
  if (parentLabel && parentLabel.textContent) {
    return parentLabel.textContent.trim();
  }

  // 3. aria-label or aria-labelledby
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) {
    return ariaLabel.trim();
  }

  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const labelledByElem = document.getElementById(ariaLabelledBy);
    if (labelledByElem && labelledByElem.textContent) {
      return labelledByElem.textContent.trim();
    }
  }

  // 4. aria-describedby
  const ariaDescribedBy = element.getAttribute('aria-describedby');
  if (ariaDescribedBy) {
    const describedByElem = document.getElementById(ariaDescribedBy);
    if (describedByElem && describedByElem.textContent && describedByElem.textContent.length < 80) {
      return describedByElem.textContent.trim();
    }
  }

  // 5. Preceding sibling label or span
  const prevSibling = element.previousElementSibling;
  if (prevSibling && prevSibling.textContent && prevSibling.textContent.length < 60) {
    return prevSibling.textContent.trim();
  }

  // 6. Parent container header or label (e.g. Bootstrap/Tailwind form-group, MUI floating label)
  const container = element.closest('.form-group, .form-field, .input-group, .field, div');
  if (container) {
    const innerLabel = container.querySelector('label, .form-label, .label, legend');
    if (innerLabel && innerLabel.textContent && innerLabel !== element) {
      return innerLabel.textContent.trim();
    }
  }

  return '';
}

/**
 * Normalizes text by separating punctuation, splitting camelCase, and trimming.
 */
export function normalizeSignals(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[._\-\/\\:,;]/g, ' ')
    .toLowerCase()
    .trim();
}

interface MatchRule {
  type: SupportedFieldType;
  regex: RegExp;
  baseConfidence: number;
}

/**
 * Comprehensive dictionary of Romanized Nepali, Devanagari, and English form field patterns.
 */
const PATTERN_RULES: MatchRule[] = [
  // 1. Password
  {
    type: 'password',
    regex: /(?:\b(password|pwd|passcode|secret)\b|गोप्य\s*शब्द)/i,
    baseConfidence: 0.99,
  },

  // 2. Email
  {
    type: 'email',
    regex: /(?:\b(email|e\s*mail|mail)\b|विद्युतीय\s*डाक|इमेल|ईमेल)/i,
    baseConfidence: 0.98,
  },

  // 3. Identification (PAN, VAT, National ID, Citizenship)
  {
    type: 'vatNumber',
    regex: /(?:\b(vat\s*(no|number|num)?)\b|मूल्य\s*अभिवृद्धि\s*कर|भ्याट)/i,
    baseConfidence: 0.95,
  },
  {
    type: 'panNumber',
    regex: /(?:\b(pan\s*(no|number|num)?|sthayi\s*lekha)\b|स्थायी\s*लेखा|प्यान)/i,
    baseConfidence: 0.95,
  },
  {
    type: 'citizenshipNumber',
    regex: /(?:\b(citizenship\s*(no|number|num)?|nagrikta\s*(no|num|number)?)\b|नागरिकता\s*नं|नागरिकता\s*नम्बर)/i,
    baseConfidence: 0.96,
  },
  {
    type: 'nationalId',
    regex: /(?:\b(national\s*id|nid\s*(no|num|number)?|rastriya\s*parichayapatra)\b|राष्ट्रिय\s*परिचयपत्र\s*नं)/i,
    baseConfidence: 0.96,
  },

  // 4. Telephone / Landline
  {
    type: 'telephone',
    regex: /(?:\b(telephone|landline|durvasa|tel\s*(no|num|number)?)\b|टेलिफोन|स्थानीय\s*फोन)/i,
    baseConfidence: 0.96,
  },

  // 5. Mobile / Phone
  {
    type: 'phone',
    regex: /(?:\b(mobile|cell|cellphone|phone|contact\s*(no|num|number)?|chalbhasa|samparka)\b|मोबाइल|फोन|सम्पर्क\s*नम्बर|ह्वाट्सएप)/i,
    baseConfidence: 0.95,
  },

  // 6. Student & Academic attributes
  {
    type: 'studentId',
    regex: /(?:\b(student\s*id|roll\s*(no|num|number)?|symbol\s*no|registration\s*(no|num|number)?|reg\s*no)\b|विद्यार्थी\s*नं|रोल\s*नं)/i,
    baseConfidence: 0.94,
  },
  {
    type: 'guardianPhone',
    regex: /(?:\b(guardian\s*(phone|mobile|contact)|abhibhavak\s*samparka)\b|अभिभावक\s*सम्पर्क)/i,
    baseConfidence: 0.95,
  },
  {
    type: 'guardianName',
    regex: /(?:\b(guardian\s*name|guardian|abhibhavak|baba\s*buwa|aama)\b|अभिभावक(\s*नाम)?)/i,
    baseConfidence: 0.94,
  },
  {
    type: 'school',
    regex: /(?:\b(school|college|campus|university|vidhyalaya|shikshan\s*sanstha)\b|विद्यालय|कलेज|क्याम्पस|विश्वविद्यालय)/i,
    baseConfidence: 0.92,
  },
  {
    type: 'faculty',
    regex: /(?:\b(faculty|stream|academic\s*stream|shankaay)\b|संकाय|अध्ययन\s*संकाय)/i,
    baseConfidence: 0.93,
  },
  {
    type: 'grade',
    regex: /(?:\b(grade|class|level|semester|standard|kaksha|taha|shreni)\b|कक्षा|तह|श्रेणी|सेमेस्टर)/i,
    baseConfidence: 0.92,
  },
  {
    type: 'subject',
    regex: /(?:\b(subject|discipline|course|vishaya)\b|विषय)/i,
    baseConfidence: 0.91,
  },

  // 7. Corporate, Employment & Agriculture
  {
    type: 'employeeId',
    regex: /(?:\b(employee\s*id|emp\s*id|staff\s*id|badge\s*no)\b|कर्मचारी\s*परिचयपत्र|कर्मचारी\s*नं)/i,
    baseConfidence: 0.94,
  },
  {
    type: 'salary',
    regex: /(?:\b(salary|income|remuneration|pay|ctc|wages|talab|aamdani|aaya)\b|तलब|मासिक\s*तलब|आम्दानी|पारिश्रमिक|आयस्रोत)/i,
    baseConfidence: 0.94,
  },
  {
    type: 'businessName',
    regex: /(?:\b(business\s*name|firm\s*name|enterprise|byawasaya\s*naam)\b|व्यवसाय(को)?\s*नाम|फर्मको\s*नाम)/i,
    baseConfidence: 0.93,
  },
  {
    type: 'businessType',
    regex: /(?:\b(business\s*type|firm\s*type|registration\s*type|entity\s*type)\b|व्यवसायको\s*प्रकार|फर्मको\s*प्रकार)/i,
    baseConfidence: 0.93,
  },
  {
    type: 'cooperative',
    regex: /(?:\b(cooperative|co\s*operative|sahakari)\b|सहकारी|कृषि\s*सहकारी)/i,
    baseConfidence: 0.93,
  },
  {
    type: 'cropType',
    regex: /(?:\b(crop|crop\s*type|crop\s*name|produce|baali|fasal)\b|बाली|मुख्य\s*बाली|फसल|उत्पादन)/i,
    baseConfidence: 0.92,
  },
  {
    type: 'designation',
    regex: /(?:\b(designation|job\s*title|position|post|rank|pad)\b|पद|ओहोदा)/i,
    baseConfidence: 0.92,
  },
  {
    type: 'department',
    regex: /(?:\b(department|dept|division|shakha|karyalay)\b|शाखा|विभाग)/i,
    baseConfidence: 0.92,
  },
  {
    type: 'occupation',
    regex: /(?:\b(occupation|profession|pesha|byawasaya|rojgari)\b|पेशा|व्यवसाय|रोजगारी)/i,
    baseConfidence: 0.92,
  },
  {
    type: 'companyName',
    regex: /(?:\b(company|organization|organisation|employer|workplace|sanstha)\b|संस्था|कम्पनी|रोजगारदाता)/i,
    baseConfidence: 0.91,
  },

  // 8. Date of Birth (BS & AD) & Age
  {
    type: 'dateOfBirthBS',
    regex: /(?:\b(dob\s*bs|birth\s*date\s*bs|bs\s*dob|janma\s*miti\s*bs)\b|जन्म\s*मिति\s*\(?वि\.?\s*सं\.?\)?|वि\.?\s*सं\.?\s*जन्म\s*मिति)/i,
    baseConfidence: 0.98,
  },
  {
    type: 'dateOfBirth',
    regex: /(?:\b(dob|birth\s*date|date\s*of\s*birth|birth\s*day|janma\s*miti|janma\s*darta)\b|जन्म\s*मिति|जन्ममिति)/i,
    baseConfidence: 0.95,
  },
  {
    type: 'age',
    regex: /(?:\b(age|umar|umer)\b|उमेर)/i,
    baseConfidence: 0.90,
  },

  // 9. Gender
  {
    type: 'gender',
    regex: /(?:\b(gender|sex|linga|ling)\b|लिङ्ग)/i,
    baseConfidence: 0.95,
  },

  // 10. Name (First, Middle, Last, Full)
  {
    type: 'firstName',
    regex: /(?:\b(first\s*name|given\s*name|fname|pahilo\s*naam|pehelo\s*naam)\b|पहिलो\s*नाम)/i,
    baseConfidence: 0.95,
  },
  {
    type: 'middleName',
    regex: /(?:\b(middle\s*name|mname|bichko\s*naam)\b|बीचको\s*नाम)/i,
    baseConfidence: 0.95,
  },
  {
    type: 'lastName',
    regex: /(?:\b(last\s*name|surname|family\s*name|lname|thar|upanam)\b|थर|उपनाम)/i,
    baseConfidence: 0.95,
  },
  {
    type: 'fullName',
    regex: /(?:\b(full\s*name|your\s*name|applicant\s*name|customer\s*name|employee\s*name|pura\s*naam|purna\s*naam|^name$)\b|नाम\s*थर|पूरा\s*नाम)/i,
    baseConfidence: 0.90,
  },

  // 11. Nepal Address Components
  {
    type: 'province',
    regex: /(?:\b(province|pradesh|state|rajya)\b|प्रदेश)/i,
    baseConfidence: 0.95,
  },
  {
    type: 'district',
    regex: /(?:\b(district|jilla|zila)\b|जिल्ला)/i,
    baseConfidence: 0.95,
  },
  {
    type: 'municipality',
    regex: /(?:\b(municipality|nagarpalika|gaupalika|metro|sub\s*metro|local\s*level)\b|नगरपालिका|गाउँपालिका|महानगरपालिका|उपमहानगरपालिका|स्थानीय\s*तह)/i,
    baseConfidence: 0.95,
  },
  {
    type: 'ward',
    regex: /(?:\b(ward|wada|ward\s*no|wada\s*no)\b|वडा|वडा\s*नं)/i,
    baseConfidence: 0.95,
  },
  {
    type: 'tole',
    regex: /(?:\b(tole|chowk|street|road|marga|bato)\b|टोल|चौक|मार्ग)/i,
    baseConfidence: 0.92,
  },
  {
    type: 'address',
    regex: /(?:\b(address|thegana|location|sthayi\s*thegana|asthayi\s*thegana|residential\s*address|permanent\s*address|temporary\s*address)\b|ठेगाना|स्थायी\s*ठेगाना|अस्थायी\s*ठेगाना)/i,
    baseConfidence: 0.92,
  },

  // 12. General test types
  {
    type: 'username',
    regex: /(?:\b(username|user\s*id|login\s*id|handle)\b|प्रयोगकर्ता\s*नाम)/i,
    baseConfidence: 0.92,
  },
  {
    type: 'url',
    regex: /(?:\b(website|url|homepage|web\s*link)\b|साइट)/i,
    baseConfidence: 0.90,
  },
  {
    type: 'referenceNumber',
    regex: /(?:\b(ref\s*no|reference\s*(no|num|number|code)|cust\s*ref)\b|संकेत\s*नं)/i,
    baseConfidence: 0.88,
  },
];


/**
 * Autocomplete attribute direct mapping matrix.
 */
const AUTOCOMPLETE_MAP: Record<string, SupportedFieldType> = {
  name: 'fullName',
  'given-name': 'firstName',
  'additional-name': 'middleName',
  'family-name': 'lastName',
  email: 'email',
  tel: 'phone',
  'tel-national': 'phone',
  'address-level1': 'province',
  'address-level2': 'district',
  'street-address': 'address',
  'current-password': 'password',
  'new-password': 'password',
  username: 'username',
  organization: 'companyName',
  'organization-title': 'jobTitle',
  bday: 'dateOfBirth',
  url: 'url',
};

/**
 * Multi-Signal Scoring Engine:
 * Weighs signals across attributes (type, autocomplete, label, name, id, placeholder, surrounding context)
 * and determines the best field type with confidence.
 */
export function detectFieldType(element: HTMLElement): DetectedField {
  const tagName = element.tagName.toLowerCase();
  const role = element.getAttribute('role') || '';
  const inputType = (
    element.getAttribute('type') ||
    (role === 'checkbox' ? 'checkbox' : role === 'radio' ? 'radio' : role === 'combobox' ? 'combobox' : tagName === 'textarea' ? 'textarea' : 'text')
  ).toLowerCase();
  const autocomplete = (element.getAttribute('autocomplete') || '').toLowerCase().trim();
  const label = getFieldLabel(element);
  const name = element.getAttribute('name') || undefined;
  const id = element.getAttribute('id') || undefined;
  const placeholder = element.getAttribute('placeholder') || '';
  const title = element.getAttribute('title') || '';

  // 1. Direct autocomplete signal (Highest precedence if matched)
  if (autocomplete && AUTOCOMPLETE_MAP[autocomplete]) {
    return {
      element,
      type: AUTOCOMPLETE_MAP[autocomplete],
      confidence: 0.98,
      label,
      name,
      id,
    };
  }

  // 2. Direct HTML5 input type shortcuts
  if (inputType === 'password') {
    return { element, type: 'password', confidence: 0.99, label, name, id };
  }
  if (inputType === 'email') {
    return { element, type: 'email', confidence: 0.98, label, name, id };
  }

  // 3. Multi-Signal Scoring across weighted channels
  const scores: Map<SupportedFieldType, number> = new Map();

  const addScore = (type: SupportedFieldType, weight: number) => {
    scores.set(type, (scores.get(type) || 0) + weight);
  };

  const signals = {
    label: normalizeSignals(label),
    name: normalizeSignals(name || ''),
    id: normalizeSignals(id || ''),
    placeholder: normalizeSignals(placeholder),
    title: normalizeSignals(title),
  };

  // Evaluate against all patterns
  for (const rule of PATTERN_RULES) {
    // Label match (weight 1.0)
    if (signals.label && rule.regex.test(signals.label)) {
      addScore(rule.type, rule.baseConfidence * 1.0);
    }
    // Name match (weight 0.9)
    if (signals.name && rule.regex.test(signals.name)) {
      addScore(rule.type, rule.baseConfidence * 0.9);
    }
    // ID match (weight 0.85)
    if (signals.id && rule.regex.test(signals.id)) {
      addScore(rule.type, rule.baseConfidence * 0.85);
    }
    // Placeholder match (weight 0.8)
    if (signals.placeholder && rule.regex.test(signals.placeholder)) {
      addScore(rule.type, rule.baseConfidence * 0.8);
    }
    // Title match (weight 0.7)
    if (signals.title && rule.regex.test(signals.title)) {
      addScore(rule.type, rule.baseConfidence * 0.7);
    }
  }

  // Find candidate with maximum cumulative score
  let bestType: SupportedFieldType | null = null;
  let maxScore = 0;

  for (const [candidateType, score] of scores.entries()) {
    if (score > maxScore) {
      maxScore = score;
      bestType = candidateType;
    }
  }

  // Confidence threshold: at least 0.50
  if (bestType && maxScore >= 0.5) {
    const normalizedConfidence = Math.min(0.99, Math.round((maxScore / 1.5) * 100) / 100);
    return {
      element,
      type: bestType,
      confidence: normalizedConfidence,
      label,
      name,
      id,
    };
  }

  // 4. Fallback based on HTML5 element types
  if (inputType === 'tel') {
    return { element, type: 'phone', confidence: 0.75, label, name, id };
  }
  if (inputType === 'number') {
    return { element, type: 'number', confidence: 0.65, label, name, id };
  }
  if (inputType === 'date') {
    return { element, type: 'date', confidence: 0.65, label, name, id };
  }
  if (inputType === 'url') {
    return { element, type: 'url', confidence: 0.75, label, name, id };
  }
  if (tagName === 'textarea') {
    return { element, type: 'textarea', confidence: 0.6, label, name, id };
  }
  if (inputType === 'checkbox') {
    return { element, type: 'text', confidence: 0.6, label, name, id };
  }
  if (inputType === 'radio') {
    return { element, type: 'gender', confidence: 0.6, label, name, id };
  }
  if (inputType === 'text') {
    return { element, type: 'text', confidence: 0.4, label, name, id };
  }

  return { element, type: 'unknown', confidence: 0.0, label, name, id };
}

/**
 * Scans the DOM tree for all active, interactive form fields.
 */
export function scanFormFields(root: Document | HTMLElement = document): DetectedField[] {
  const selector =
    'input:not([type="hidden"]):not([type="submit"]):not([type="reset"]):not([type="button"]):not([disabled]), ' +
    'textarea:not([disabled]), ' +
    'select:not([disabled]), ' +
    '[role="checkbox"]:not([aria-disabled="true"]):not(input), ' +
    '[role="radio"]:not([aria-disabled="true"]):not(input), ' +
    '[role="combobox"]:not([aria-disabled="true"]):not(input):not(select)';
  const elements = Array.from(root.querySelectorAll<HTMLElement>(selector));

  return elements.map(detectFieldType);
}
