import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { generateSyntheticPerson } from '../generator/personGenerator';
import { FillOptions, FillScript, PageFieldInspection, SupportedFieldType, SyntheticPerson } from '../types';
import {
  Check,
  RefreshCw,
  RotateCcw,
  Zap,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Bot,
  Settings,
  Eye,
  EyeOff,
  Trash2,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import { clearClassificationCache, getCacheStats } from '../services/classificationCache';
import {
  deleteDomainRule,
  FieldMappingRule,
  getDomainMapping,
  normalizeDomain,
  saveDomainRule,
} from '../services/domainMapping';
import { VALID_FIELD_TYPES } from '../services/geminiClassifier';

export const App: React.FC = () => {
  const [person, setPerson] = useState<SyntheticPerson>(() => generateSyntheticPerson());
  const [profile, setProfile] = useState<FillOptions['profile']>('general');
  const [script, setScript] = useState<FillScript>('en');
  const [categories, setCategories] = useState<FillOptions['fillCategories']>({
    personal: true,
    contact: true,
    address: true,
    professional: true,
  });
  const [status, setStatus] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);
  const [isFilling, setIsFilling] = useState(false);
  const [isReverting, setIsReverting] = useState(false);

  // Tab State: 'fill' | 'mappings'
  const [activeTab, setActiveTab] = useState<'fill' | 'mappings'>('fill');

  // Website Mapping & Inspector State
  const [activeDomain, setActiveDomain] = useState<string>('localhost');
  const [inspectedFields, setInspectedFields] = useState<PageFieldInspection[]>([]);
  const [domainRules, setDomainRules] = useState<FieldMappingRule[]>([]);
  const [isInspecting, setIsInspecting] = useState(false);
  const [selectedOverrides, setSelectedOverrides] = useState<Record<string, SupportedFieldType>>({});

  // Gemini AI Settings State
  const [showAiSettings, setShowAiSettings] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-3.5-flash-lite');
  const [showKey, setShowKey] = useState(false);
  const [cacheCount, setCacheCount] = useState(0);
  const [aiSaveMsg, setAiSaveMsg] = useState<string | null>(null);

  // Load preferences from chrome.storage
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(
        ['selectedProfile', 'fillCategories', 'fillScript', 'geminiApiKey', 'geminiAiClassificationEnabled', 'geminiModel'],
        (res: Record<string, any>) => {
          if (res.selectedProfile) setProfile(res.selectedProfile);
          if (res.fillCategories) setCategories(res.fillCategories);
          if (res.fillScript === 'en' || res.fillScript === 'np') setScript(res.fillScript);
          if (res.geminiApiKey) setGeminiApiKey(res.geminiApiKey);
          if (typeof res.geminiAiClassificationEnabled === 'boolean') {
            setAiEnabled(res.geminiAiClassificationEnabled);
          }
          if (res.geminiModel) setGeminiModel(res.geminiModel);
        }
      );
    }

    getCacheStats().then((stats) => setCacheCount(stats.count));
  }, []);

  const toggleScript = (newScript: FillScript) => {
    setScript(newScript);
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ fillScript: newScript });
    }
  };

  const handleSaveAiSettings = () => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set(
        {
          geminiApiKey,
          geminiAiClassificationEnabled: aiEnabled,
          geminiModel,
        },
        () => {
          setAiSaveMsg('Saved successfully!');
          setTimeout(() => setAiSaveMsg(null), 2500);
        }
      );
    } else {
      setAiSaveMsg('Saved locally.');
      setTimeout(() => setAiSaveMsg(null), 2500);
    }
  };

  const handleClearCache = async () => {
    await clearClassificationCache();
    setCacheCount(0);
    setAiSaveMsg('Cache cleared!');
    setTimeout(() => setAiSaveMsg(null), 2500);
  };

  const loadActiveDomainAndInspect = useCallback(async () => {
    setIsInspecting(true);
    try {
      if (typeof chrome === 'undefined' || !chrome.tabs) {
        setActiveDomain('localhost');
        const mapping = await getDomainMapping('localhost');
        setDomainRules(mapping?.rules || []);
        setIsInspecting(false);
        return;
      }

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.url || !tab.id) {
        setIsInspecting(false);
        return;
      }

      const domain = normalizeDomain(tab.url);
      setActiveDomain(domain);

      const mapping = await getDomainMapping(domain);
      setDomainRules(mapping?.rules || []);

      chrome.tabs.sendMessage(tab.id, { action: 'GET_PAGE_FIELDS' }, (res: any) => {
        if (chrome.runtime.lastError || !res) {
          setInspectedFields([]);
        } else if (res?.status === 'ok') {
          setInspectedFields(res.fields || []);
        }
        setIsInspecting(false);
      });
    } catch {
      setIsInspecting(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'mappings') {
      loadActiveDomainAndInspect();
    }
  }, [activeTab, loadActiveDomainAndInspect]);

  const handleSaveOverride = async (fieldIdentifier: string, targetType: SupportedFieldType) => {
    await saveDomainRule(activeDomain, {
      selectorOrName: fieldIdentifier,
      targetType,
      description: `Mapped on ${activeDomain}`,
    });
    await loadActiveDomainAndInspect();
  };

  const handleDeleteRule = async (selectorOrName: string) => {
    await deleteDomainRule(activeDomain, selectorOrName);
    await loadActiveDomainAndInspect();
  };

  const handleProfileChange = (newProfile: FillOptions['profile']) => {
    setProfile(newProfile);
    const newPerson = generateSyntheticPerson(newProfile);
    setPerson(newPerson);
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ selectedProfile: newProfile });
    }
  };

  const toggleCategory = (cat: keyof FillOptions['fillCategories']) => {
    setCategories((prev) => {
      const updated = { ...prev, [cat]: !prev[cat] };
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.set({ fillCategories: updated });
      }
      return updated;
    });
  };

  const handleRegenerate = () => {
    const newPerson = generateSyntheticPerson(profile);
    setPerson(newPerson);
    setStatus(null);
  };


  const handleFillPage = async () => {
    setIsFilling(true);
    setStatus(null);

    try {
      if (typeof chrome === 'undefined' || !chrome.tabs) {
        // Fallback for non-extension preview / test environment
        setStatus({ type: 'warning', message: 'Chrome extension environment not detected.' });
        setIsFilling(false);
        return;
      }

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        setStatus({ type: 'error', message: 'No active browser tab found.' });
        setIsFilling(false);
        return;
      }

      // Check if we can inject or message content script
      const options: FillOptions = {
        profile,
        fillScript: script,
        fillCategories: categories,
        enableAiClassification: aiEnabled,
      };

      chrome.tabs.sendMessage(tab.id, { action: 'FILL_PAGE', person, options }, async (response: any) => {
        const lastError = chrome.runtime.lastError;
        if (lastError || !response) {
          // Attempt on-demand injection if content script wasn't active
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id! },
              files: ['src/content/index.ts'],
            });

            // Retry sending message after script injection
            setTimeout(() => {
              chrome.tabs.sendMessage(tab.id!, { action: 'FILL_PAGE', person, options }, (retryResponse: any) => {
                if (retryResponse?.status === 'ok') {
                  const count = retryResponse.result?.fieldsFilledCount ?? 0;
                  setStatus({
                    type: 'success',
                    message: `Successfully filled ${count} field${count === 1 ? '' : 's'}!`,
                  });
                } else {
                  setStatus({
                    type: 'warning',
                    message: 'Page opened is restricted or does not contain fillable forms.',
                  });
                }
                setIsFilling(false);
              });
            }, 100);
          } catch {
            setStatus({
              type: 'error',
              message: 'Cannot fill form on this tab (e.g. chrome:// or restricted page).',
            });
            setIsFilling(false);
          }
          return;
        }

        if (response.status === 'ok') {
          const count = response.result?.fieldsFilledCount ?? 0;
          setStatus({
            type: 'success',
            message: `Successfully filled ${count} field${count === 1 ? '' : 's'}!`,
          });
        } else {
          setStatus({
            type: 'error',
            message: response.message || 'Error occurred while filling the form.',
          });
        }
        setIsFilling(false);
      });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Failed to communicate with tab.' });
      setIsFilling(false);
    }
  };

  const handleUndoFill = async () => {
    setIsReverting(true);
    setStatus(null);

    try {
      if (typeof chrome === 'undefined' || !chrome.tabs) {
        setStatus({ type: 'warning', message: 'Chrome extension environment not detected.' });
        setIsReverting(false);
        return;
      }

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        setStatus({ type: 'error', message: 'No active browser tab found.' });
        setIsReverting(false);
        return;
      }

      chrome.tabs.sendMessage(tab.id, { action: 'UNDO_FILL' }, (response: any) => {
        const lastError = chrome.runtime.lastError;
        if (lastError || !response || response.status !== 'ok') {
          setStatus({
            type: 'warning',
            message: 'Could not revert form. Please ensure the page has form fields.',
          });
        } else {
          const count = response.result?.revertedCount ?? 0;
          const action = response.result?.action;
          setStatus({
            type: 'success',
            message:
              action === 'reverted'
                ? `Reverted ${count} field${count === 1 ? '' : 's'} to pre-fill state!`
                : `Cleared ${count} field${count === 1 ? '' : 's'}!`,
          });
        }
        setIsReverting(false);
      });
    } catch (err) {
      console.error('Undo fill error:', err);
      setStatus({ type: 'error', message: 'Failed to communicate with tab.' });
      setIsReverting(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-brand">
          <span className="flag-badge" role="img" aria-label="Nepal Flag">🇳🇵</span>
          <div>
            <div className="brand-title">
              Nepal Test Filler
              <span className="brand-badge">MVP</span>
            </div>
            <div className="brand-subtitle">Realistic Synthetic Test Data</div>
          </div>
        </div>
        <button
          type="button"
          className={`btn-icon-header ${showAiSettings ? 'active' : ''}`}
          onClick={() => setShowAiSettings(!showAiSettings)}
          title="Gemini AI Settings"
        >
          <Settings size={16} />
        </button>
      </header>

      {/* Mode Indicator Pill */}
      <div className="mode-pill-row">
        <span className={`mode-pill ${aiEnabled && geminiApiKey ? 'ai-active' : 'offline'}`}>
          {aiEnabled && geminiApiKey ? (
            <>
              <Bot size={12} />
              AI Unknown Field Fallback Active
            </>
          ) : (
            <>
              <ShieldCheck size={12} />
              100% Offline Local Engine
            </>
          )}
        </span>
      </div>

      {/* Collapsible AI Settings Panel */}
      {showAiSettings && (
        <div className="ai-settings-card">
          <div className="ai-settings-header">
            <div className="ai-settings-title">
              <Bot size={14} />
              <span>Gemini AI Field Classifier</span>
            </div>
            <span className="privacy-tag">Optional</span>
          </div>

          <p className="ai-settings-desc">
            Classifies non-standard fields that fail local heuristic rules. Form filling operates 100% locally by default.
          </p>

          <label className="toggle-label-row">
            <span>Enable Unknown Field Classification</span>
            <input
              type="checkbox"
              className="custom-toggle"
              checked={aiEnabled}
              onChange={(e) => setAiEnabled(e.target.checked)}
            />
          </label>

          {aiEnabled && (
            <div className="ai-config-fields">
              <div className="input-group-label">Google Gemini API Key</div>
              <div className="api-key-input-wrapper">
                <input
                  type={showKey ? 'text' : 'password'}
                  className="settings-input"
                  placeholder="AIzaSy..."
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-toggle-key"
                  onClick={() => setShowKey(!showKey)}
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              <div className="input-group-label">Gemini Model</div>
              <select
                className="settings-select"
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
              >
                <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (Fast & Lightweight)</option>
                <option value="gemini-3.8-flash">gemini-3.8-flash (Balanced)</option>
              </select>

              <div className="cache-info-row">
                <span className="cache-count-label">
                  Cached fields: <strong>{cacheCount}</strong>
                </span>
                {cacheCount > 0 && (
                  <button type="button" className="btn-clear-cache" onClick={handleClearCache}>
                    <Trash2 size={12} /> Clear Cache
                  </button>
                )}
              </div>

              <div className="privacy-notice">
                <ShieldCheck size={12} />
                <span>Payloads are strictly sanitized (name, label, id only). Webpage content is never transmitted.</span>
              </div>
            </div>
          )}

          <div className="ai-settings-actions">
            {aiSaveMsg && <span className="save-status-msg">{aiSaveMsg}</span>}
            <button type="button" className="btn-save-settings" onClick={handleSaveAiSettings}>
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="popup-tab-bar">
        <button
          type="button"
          className={`popup-tab-btn ${activeTab === 'fill' ? 'active' : ''}`}
          onClick={() => setActiveTab('fill')}
        >
          <Zap size={13} />
          <span>Fill Form</span>
        </button>
        <button
          type="button"
          className={`popup-tab-btn ${activeTab === 'mappings' ? 'active' : ''}`}
          onClick={() => setActiveTab('mappings')}
        >
          <Globe size={13} />
          <span>Site Mappings</span>
        </button>
      </div>

      {activeTab === 'fill' ? (
        <>
          {/* Profile Selector */}
          <div className="section-block">
            <label htmlFor="profile-select" className="section-label">Target Profile</label>
            <div className="select-wrapper">
              <select
                id="profile-select"
                className="custom-select"
                value={profile}
                onChange={(e) => handleProfileChange(e.target.value as FillOptions['profile'])}
              >
                <option value="general">General Person</option>
                <option value="student">Student</option>
                <option value="employee">Employee</option>
                <option value="business">Business Owner</option>
                <option value="teacher">Teacher</option>
                <option value="farmer">Farmer</option>
              </select>
            </div>
          </div>

          {/* Script Selection (English vs Devanagari) */}
          <div className="section-block">
            <div className="section-label-row">
              <span className="section-label">Fill Script / भाषा लिपि</span>
              <span className="script-badge-tag">{script === 'np' ? 'नेपाली (युनिकोड)' : 'English'}</span>
            </div>
            <div className="script-toggle-group">
              <button
                type="button"
                className={`script-btn ${script === 'en' ? 'active' : ''}`}
                onClick={() => toggleScript('en')}
              >
                English (Romanized)
              </button>
              <button
                type="button"
                className={`script-btn ${script === 'np' ? 'active' : ''}`}
                onClick={() => toggleScript('np')}
              >
                नेपाली (Devanagari)
              </button>
            </div>
          </div>

          {/* Data Categories */}
          <div className="section-block">
            <div className="section-label">Included Categories</div>
            <div className="category-grid">
              {(['personal', 'contact', 'address', 'professional'] as const).map((cat) => (
                <div
                  key={cat}
                  className={`category-chip ${categories[cat] ? 'active' : ''}`}
                  onClick={() => toggleCategory(cat)}
                >
                  <div className="checkbox-indicator">
                    {categories[cat] && <Check size={10} strokeWidth={3} />}
                  </div>
                  <span style={{ textTransform: 'capitalize' }}>{cat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Synthetic Person Preview Card */}
          <div className="preview-card">
            <div className="preview-header">
              <div className="preview-name">
                {script === 'np' && person.devanagari
                  ? `${person.devanagari.honorific} ${person.devanagari.fullName}`
                  : `${person.honorific} ${person.fullName}`}
              </div>
              <div className="preview-gender-badge">
                {person.profileType.toUpperCase()} •{' '}
                {script === 'np' && person.devanagari ? person.devanagari.gender : person.gender},{' '}
                {person.age}y
              </div>
            </div>

            <div className="preview-row">
              <Phone size={12} className="preview-icon" />
              <span className="preview-text">{person.phone} {person.telephone ? `• Tel: ${person.telephone}` : ''}</span>
            </div>

            <div className="preview-row">
              <Mail size={12} className="preview-icon" />
              <span className="preview-text">{person.workEmail || person.email}</span>
            </div>

            <div className="preview-row">
              <MapPin size={12} className="preview-icon" />
              <span className="preview-text">
                {script === 'np' && person.devanagari
                  ? person.devanagari.fullAddress
                  : person.address.fullAddress}
              </span>
            </div>

            <div className="preview-row">
              <Briefcase size={12} className="preview-icon" />
              <span className="preview-text">
                {script === 'np' && person.devanagari
                  ? `${person.devanagari.occupation} • ${person.devanagari.companyName}`
                  : person.school
                  ? `${person.grade || 'Student'} • ${person.school}`
                  : person.businessName
                  ? `${person.jobTitle} • ${person.businessName}`
                  : person.cropType
                  ? `${person.occupation} • ${person.cropType}`
                  : `${person.occupation} • ${person.companyName}`}
              </span>
            </div>
          </div>

          {/* Status banner */}
          {status && (
            <div className={`status-banner ${status.type}`}>
              <span>{status.message}</span>
            </div>
          )}

          {/* Actions */}
          <div className="button-group">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleFillPage}
              disabled={isFilling}
            >
              {isFilling ? (
                <>
                  <Sparkles size={16} className="animate-spin" />
                  Filling Page...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Fill Page
                </>
              )}
            </button>

            <div className="button-subgroup">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleRegenerate}
                title="Generate a fresh synthetic person"
              >
                <RefreshCw size={13} />
                Generate New
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-undo"
                onClick={handleUndoFill}
                disabled={isReverting}
                title="Undo fill and restore pre-fill state or clear (Alt+Shift+U)"
              >
                <RotateCcw size={13} className={isReverting ? 'animate-spin' : ''} />
                {isReverting ? 'Reverting...' : 'Revert Form'}
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Website Specific Mappings Tab */
        <div className="mappings-container">
          <div className="mappings-domain-header">
            <div className="domain-info">
              <Globe size={14} className="domain-icon" />
              <span className="domain-title">{activeDomain}</span>
            </div>
            <button
              type="button"
              className="btn-refresh-inspect"
              onClick={loadActiveDomainAndInspect}
              disabled={isInspecting}
              title="Re-scan active page fields"
            >
              <RefreshCw size={12} className={isInspecting ? 'animate-spin' : ''} />
              Scan
            </button>
          </div>

          {/* Saved Domain Overrides */}
          <div className="section-block">
            <div className="section-label">Custom Overrides on this Domain</div>
            {domainRules.length === 0 ? (
              <div className="empty-rules-hint">
                No custom overrides saved for {activeDomain}. Fields use rule-based detection or AI classification.
              </div>
            ) : (
              <div className="rules-list">
                {domainRules.map((rule) => (
                  <div key={rule.selectorOrName} className="rule-item-row">
                    <div className="rule-info">
                      <code className="rule-key">{rule.selectorOrName}</code>
                      <span className="rule-arrow">➔</span>
                      <span className="rule-target">{rule.targetType}</span>
                    </div>
                    <button
                      type="button"
                      className="btn-delete-rule"
                      onClick={() => handleDeleteRule(rule.selectorOrName)}
                      title="Delete override rule"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Page Field Inspector */}
          <div className="section-block">
            <div className="section-label">
              Active Page Fields ({inspectedFields.length})
            </div>

            {isInspecting ? (
              <div className="loading-hint">Inspecting inputs on {activeDomain}...</div>
            ) : inspectedFields.length === 0 ? (
              <div className="empty-rules-hint">
                No interactive inputs found on the active page, or page is restricted. Click Scan to refresh.
              </div>
            ) : (
              <div className="inspected-fields-list">
                {inspectedFields.map((field) => {
                  const fieldKey = field.name || field.id || `field_${field.index}`;
                  const currentSelected = selectedOverrides[fieldKey] || field.detectedType;

                  return (
                    <div key={`${fieldKey}_${field.index}`} className="inspected-field-card">
                      <div className="field-card-top">
                        <div className="field-name-block">
                          <span className="field-identifier">{fieldKey}</span>
                          {field.label && <span className="field-label-text">({field.label})</span>}
                        </div>
                        <span className={`source-badge ${field.source}`}>
                          {field.source === 'domain_override' && 'Override'}
                          {field.source === 'heuristic' && 'Heuristic'}
                          {field.source === 'ai_cached' && 'AI Cached'}
                          {field.source === 'unmapped' && 'Unmapped'}
                        </span>
                      </div>

                      <div className="override-action-row">
                        <select
                          className="mapping-select"
                          value={currentSelected}
                          onChange={(e) =>
                            setSelectedOverrides({
                              ...selectedOverrides,
                              [fieldKey]: e.target.value as SupportedFieldType,
                            })
                          }
                        >
                          <option value="unknown">Unmapped / Ignore</option>
                          {VALID_FIELD_TYPES.filter((t) => t !== 'unknown').map((ft) => (
                            <option key={ft} value={ft}>
                              {ft}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn-apply-override"
                          onClick={() => handleSaveOverride(fieldKey, currentSelected)}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
