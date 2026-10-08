import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Briefcase,
  Building2,
  BookOpen,
  Wheat,
  Key,
  Database,
  Keyboard,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  Save,
  Globe,
  RefreshCw,
} from 'lucide-react';
import { ProfileType, FillScript, SyntheticPerson } from '../types';
import { generateSyntheticPerson } from '../generator/personGenerator';
import {
  getAllDomainMappings,
  deleteDomainRule,
  saveDomainRule,
  DomainMappingConfig,
} from '../services/domainMapping';
import {
  getCacheStats,
  clearClassificationCache,
} from '../services/classificationCache';
import './App.css';

type SettingsTab = 'profiles' | 'mappings' | 'ai' | 'shortcuts' | 'backup';

const PROFILES: Array<{ id: ProfileType; label: string; desc: string; icon: React.ReactNode }> = [
  { id: 'general', label: 'General Citizen', desc: 'Standard Nepali citizen with full geographic address', icon: <User size={18} /> },
  { id: 'student', label: 'Student', desc: 'Roll numbers, colleges, academic faculty & guardian contacts', icon: <GraduationCap size={18} /> },
  { id: 'employee', label: 'Employee', desc: 'Corporate email, staff ID, PAN number & salary', icon: <Briefcase size={18} /> },
  { id: 'business', label: 'Business Owner', desc: 'Enterprise registration, VAT/PAN & registered office', icon: <Building2 size={18} /> },
  { id: 'teacher', label: 'Teacher / Faculty', desc: 'Academic departments, subjects & lecturer credentials', icon: <BookOpen size={18} /> },
  { id: 'farmer', label: 'Farmer / Agriculture', desc: 'Rural municipality focus, cooperatives & crop specialties', icon: <Wheat size={18} /> },
];

export function App() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profiles');
  const [defaultProfile, setDefaultProfile] = useState<ProfileType>('general');
  const [defaultScript, setDefaultScript] = useState<FillScript>('en');
  const [fillCategories, setFillCategories] = useState({
    personal: true,
    contact: true,
    address: true,
    professional: true,
  });
  const [enableFloatingBadge, setEnableFloatingBadge] = useState<boolean>(true);

  // AI settings
  const [aiEnabled, setAiEnabled] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [cacheCount, setCacheCount] = useState(0);

  // Domain mappings
  const [allMappings, setAllMappings] = useState<Record<string, DomainMappingConfig>>({});

  // Preview synthetic person
  const [previewPerson, setPreviewPerson] = useState<SyntheticPerson>(generateSyntheticPerson('general'));

  // Notification feedback
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    loadSettings();
    refreshCacheCount();
    loadDomainMappings();
  }, []);

  const loadSettings = async () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const data = (await chrome.storage.local.get([
        'selectedProfile',
        'fillScript',
        'fillCategories',
        'aiEnabled',
        'geminiApiKey',
        'enableFloatingBadge',
      ])) as Record<string, any>;

      if (data.selectedProfile) {
        setDefaultProfile(data.selectedProfile);
        setPreviewPerson(generateSyntheticPerson(data.selectedProfile));
      }
      if (data.fillScript === 'en' || data.fillScript === 'np') {
        setDefaultScript(data.fillScript);
      }
      if (data.fillCategories) {
        setFillCategories(data.fillCategories);
      }
      if (data.enableFloatingBadge !== undefined) {
        setEnableFloatingBadge(Boolean(data.enableFloatingBadge));
      }
      if (data.aiEnabled !== undefined) {
        setAiEnabled(Boolean(data.aiEnabled));
      }
      if (data.geminiApiKey) {
        setApiKey(data.geminiApiKey);
      }
    }
  };

  const loadDomainMappings = async () => {
    const mappings = await getAllDomainMappings();
    setAllMappings(mappings);
  };

  const refreshCacheCount = async () => {
    const stats = await getCacheStats();
    setCacheCount(stats.count);
  };

  const saveGeneralSettings = async () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({
        selectedProfile: defaultProfile,
        fillScript: defaultScript,
        fillCategories,
        enableFloatingBadge,
      });
      showToast('General preferences saved successfully!');
    }
  };

  const saveAiSettings = async () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({
        aiEnabled,
        geminiApiKey: apiKey.trim(),
      });
      showToast('AI classification settings updated!');
    }
  };

  const handleClearCache = async () => {
    await clearClassificationCache();
    await refreshCacheCount();
    showToast('Classification cache cleared.');
  };

  const handleProfileSelect = (p: ProfileType) => {
    setDefaultProfile(p);
    setPreviewPerson(generateSyntheticPerson(p));
  };

  const handleDeleteRule = async (domain: string, selectorOrName: string) => {
    await deleteDomainRule(domain, selectorOrName);
    await loadDomainMappings();
    showToast(`Removed rule from ${domain}`);
  };

  const handleExportBackup = () => {
    const backupData = {
      version: '0.1.0',
      exportedAt: new Date().toISOString(),
      defaultProfile,
      fillCategories,
      enableFloatingBadge,
      aiEnabled,
      domainMappings: allMappings,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nepal-test-filler-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Settings exported to JSON.');
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        if (parsed.defaultProfile) setDefaultProfile(parsed.defaultProfile);
        if (parsed.fillCategories) setFillCategories(parsed.fillCategories);
        if (parsed.enableFloatingBadge !== undefined) setEnableFloatingBadge(Boolean(parsed.enableFloatingBadge));
        if (parsed.aiEnabled !== undefined) setAiEnabled(parsed.aiEnabled);

        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          await chrome.storage.local.set({
            selectedProfile: parsed.defaultProfile || defaultProfile,
            fillCategories: parsed.fillCategories || fillCategories,
            enableFloatingBadge: parsed.enableFloatingBadge !== undefined ? parsed.enableFloatingBadge : enableFloatingBadge,
            aiEnabled: parsed.aiEnabled !== undefined ? parsed.aiEnabled : aiEnabled,
          });

          // Import domain mappings
          if (parsed.domainMappings && typeof parsed.domainMappings === 'object') {
            for (const domain of Object.keys(parsed.domainMappings)) {
              const config = parsed.domainMappings[domain];
              const rules = config.rules || (Array.isArray(config) ? config : []);
              for (const r of rules) {
                await saveDomainRule(domain, r);
              }
            }
          }
        }

        await loadDomainMappings();
        showToast('Settings successfully restored from backup!');
      } catch (err) {
        alert('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="options-container">
      {/* Header */}
      <header className="options-header">
        <div className="options-brand">
          <div className="options-logo">🇳🇵</div>
          <div>
            <h1>Nepal Test Filler</h1>
            <p>Comprehensive Preferences, Archetype Profiles & Shortcuts</p>
          </div>
        </div>
        <div className="options-badge">v0.1.0 • Manifest V3</div>
      </header>

      {/* Main Layout */}
      <div className="options-body">
        {/* Navigation Sidebar */}
        <aside className="options-sidebar">
          <button
            className={`nav-btn ${activeTab === 'profiles' ? 'active' : ''}`}
            onClick={() => setActiveTab('profiles')}
          >
            <User size={16} /> Specialized Profiles
          </button>
          <button
            className={`nav-btn ${activeTab === 'mappings' ? 'active' : ''}`}
            onClick={() => setActiveTab('mappings')}
          >
            <Globe size={16} /> Domain Mappings
          </button>
          <button
            className={`nav-btn ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            <Key size={16} /> Gemini AI & Cache
          </button>
          <button
            className={`nav-btn ${activeTab === 'shortcuts' ? 'active' : ''}`}
            onClick={() => setActiveTab('shortcuts')}
          >
            <Keyboard size={16} /> Keyboard Shortcuts
          </button>
          <button
            className={`nav-btn ${activeTab === 'backup' ? 'active' : ''}`}
            onClick={() => setActiveTab('backup')}
          >
            <Database size={16} /> Backup & Restore
          </button>
        </aside>

        {/* Tab Content */}
        <main className="options-content">
          {notification && (
            <div className="options-toast">
              <CheckCircle2 size={16} /> {notification}
            </div>
          )}

          {/* TAB 1: Specialized Profiles */}
          {activeTab === 'profiles' && (
            <div className="tab-pane">
              <h2>Default Test Profile & Generation</h2>
              <p className="tab-subtitle">
                Select your default persona archetype for 1-click filling and view synthetic attributes.
              </p>

              <div className="profile-grid">
                {PROFILES.map((p) => (
                  <div
                    key={p.id}
                    className={`profile-card ${defaultProfile === p.id ? 'selected' : ''}`}
                    onClick={() => handleProfileSelect(p.id)}
                  >
                    <div className="profile-card-header">
                      <div className="profile-card-icon">{p.icon}</div>
                      <h3>{p.label}</h3>
                    </div>
                    <p>{p.desc}</p>
                  </div>
                ))}
              </div>

              <div className="section-divider" />

              <h3>Default Field Categories to Fill</h3>
              <div className="categories-grid">
                {(['personal', 'contact', 'address', 'professional'] as const).map((cat) => (
                  <label key={cat} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={fillCategories[cat]}
                      onChange={(e) =>
                        setFillCategories({ ...fillCategories, [cat]: e.target.checked })
                      }
                    />
                    <span>{cat.charAt(0).toUpperCase() + cat.slice(1)} Information</span>
                  </label>
                ))}
              </div>

              <div className="section-divider" />

              <h3>Inline Quick Fill Trigger</h3>
              <div className="setting-card">
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={enableFloatingBadge}
                    onChange={(e) => setEnableFloatingBadge(e.target.checked)}
                  />
                  <span><strong>Enable Inline Floating Badge (🇳🇵) on Form Fields</strong></span>
                </label>
                <p className="help-text">
                  Displays a discreet 1-click floating icon beside focused or hovered form inputs to quickly fill the form, fill a single field, or undo without opening the popup.
                </p>
              </div>

              <div className="section-divider" />

              <div className="preview-header">
                <h3>Live Persona Preview ({defaultProfile.toUpperCase()})</h3>
                <button
                  className="secondary-btn"
                  onClick={() => setPreviewPerson(generateSyntheticPerson(defaultProfile))}
                >
                  <RefreshCw size={14} /> Re-generate
                </button>
              </div>

              <div className="preview-panel">
                <div className="preview-row">
                  <span className="lbl">Full Name:</span>
                  <span className="val">{previewPerson.fullName} ({previewPerson.gender})</span>
                </div>
                <div className="preview-row">
                  <span className="lbl">Date of Birth:</span>
                  <span className="val">{previewPerson.dateOfBirth} (AD) • {previewPerson.dateOfBirthBS} (BS)</span>
                </div>
                <div className="preview-row">
                  <span className="lbl">Citizenship / NID:</span>
                  <span className="val">{previewPerson.citizenshipNumber} • NID: {previewPerson.nationalId}</span>
                </div>
                <div className="preview-row">
                  <span className="lbl">Phone / Mobile:</span>
                  <span className="val">{previewPerson.phone} • Landline: {previewPerson.telephone}</span>
                </div>
                <div className="preview-row">
                  <span className="lbl">Full Address:</span>
                  <span className="val">{previewPerson.address.fullAddress}</span>
                </div>

                {defaultProfile === 'student' && (
                  <>
                    <div className="preview-row">
                      <span className="lbl">Student ID / Roll:</span>
                      <span className="val">{previewPerson.studentId} • {previewPerson.grade}</span>
                    </div>
                    <div className="preview-row">
                      <span className="lbl">School & Faculty:</span>
                      <span className="val">{previewPerson.school} ({previewPerson.faculty})</span>
                    </div>
                    <div className="preview-row">
                      <span className="lbl">Guardian:</span>
                      <span className="val">{previewPerson.guardianName} ({previewPerson.guardianPhone})</span>
                    </div>
                  </>
                )}

                {defaultProfile === 'employee' && (
                  <>
                    <div className="preview-row">
                      <span className="lbl">Employee ID:</span>
                      <span className="val">{previewPerson.employeeId} • Salary: {previewPerson.salary}</span>
                    </div>
                    <div className="preview-row">
                      <span className="lbl">Designation & Org:</span>
                      <span className="val">{previewPerson.designation} at {previewPerson.companyName}</span>
                    </div>
                    <div className="preview-row">
                      <span className="lbl">Work Email & PAN:</span>
                      <span className="val">{previewPerson.workEmail} • PAN: {previewPerson.panNumber}</span>
                    </div>
                  </>
                )}

                {defaultProfile === 'business' && (
                  <>
                    <div className="preview-row">
                      <span className="lbl">Business Name:</span>
                      <span className="val">{previewPerson.businessName} ({previewPerson.businessType})</span>
                    </div>
                    <div className="preview-row">
                      <span className="lbl">VAT & PAN:</span>
                      <span className="val">{previewPerson.vatNumber} • PAN: {previewPerson.panNumber}</span>
                    </div>
                  </>
                )}

                {defaultProfile === 'farmer' && (
                  <>
                    <div className="preview-row">
                      <span className="lbl">Agriculture Produce:</span>
                      <span className="val">{previewPerson.cropType}</span>
                    </div>
                    <div className="preview-row">
                      <span className="lbl">Local Cooperative:</span>
                      <span className="val">{previewPerson.cooperative}</span>
                    </div>
                  </>
                )}

                {defaultProfile === 'teacher' && (
                  <>
                    <div className="preview-row">
                      <span className="lbl">Subject & Faculty:</span>
                      <span className="val">{previewPerson.subject} ({previewPerson.faculty})</span>
                    </div>
                    <div className="preview-row">
                      <span className="lbl">Institution:</span>
                      <span className="val">{previewPerson.school}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="btn-group">
                <button className="primary-btn" onClick={saveGeneralSettings}>
                  <Save size={16} /> Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Domain Mappings */}
          {activeTab === 'mappings' && (
            <div className="tab-pane">
              <h2>Saved Website-Specific Field Mappings</h2>
              <p className="tab-subtitle">
                Rules configured to map custom form selectors on specific domains to synthetic data fields.
              </p>

              {Object.keys(allMappings).length === 0 ? (
                <div className="empty-state">
                  <Globe size={40} />
                  <p>No domain mappings configured yet.</p>
                  <span className="help-text">
                    Open the extension popup on any webpage and navigate to "Site Mappings" to create your first rule!
                  </span>
                </div>
              ) : (
                <div className="mappings-list">
                  {Object.entries(allMappings).map(([domain, config]) => (
                    <div key={domain} className="domain-group">
                      <div className="domain-header">
                        <Globe size={16} />
                        <h4>{domain}</h4>
                        <span className="rule-badge">{config.rules.length} rule{config.rules.length > 1 ? 's' : ''}</span>
                      </div>
                      <div className="rules-table">
                        {config.rules.map((rule) => (
                          <div key={rule.selectorOrName} className="rule-row">
                            <span className="rule-target">🎯 {rule.targetType}</span>
                            <span className="rule-matcher">
                              <span className="rule-type-badge">{rule.matchType || 'name_or_id'}</span> {rule.selectorOrName}
                            </span>
                            <button
                              className="icon-btn delete-btn"
                              title="Delete Rule"
                              onClick={() => handleDeleteRule(domain, rule.selectorOrName)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Gemini AI & Cache */}
          {activeTab === 'ai' && (
            <div className="tab-pane">
              <h2>Gemini AI & Unknown Field Cache</h2>
              <p className="tab-subtitle">
                Local-first privacy architecture: Gemini is only invoked for unknown fields when enabled.
              </p>

              <div className="setting-card">
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={aiEnabled}
                    onChange={(e) => setAiEnabled(e.target.checked)}
                  />
                  <span><strong>Enable AI Classifier for Unrecognized Form Fields</strong></span>
                </label>
                <p className="help-text">
                  When enabled, unclassified fields send an anonymized fingerprint (field name, id, label)
                  to Gemini Flash to predict the appropriate Nepal test data category.
                </p>
              </div>

              <div className="setting-card">
                <label><strong>Google Gemini API Key:</strong></label>
                <input
                  type="password"
                  className="input-text"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="help-text">
                  Your key is saved exclusively in your browser’s local storage (`chrome.storage.local`).
                </p>
              </div>

              <div className="setting-card">
                <div className="cache-header">
                  <div>
                    <strong>Local Hash-Based Classification Cache</strong>
                    <p className="help-text">
                      Stores previously classified field fingerprints so duplicate fields never make repeated API calls.
                    </p>
                  </div>
                  <span className="cache-pill">{cacheCount} Cached Pattern{cacheCount !== 1 ? 's' : ''}</span>
                </div>
                <button className="secondary-btn danger-btn" onClick={handleClearCache}>
                  <Trash2 size={14} /> Clear Cache
                </button>
              </div>

              <div className="btn-group">
                <button className="primary-btn" onClick={saveAiSettings}>
                  <Save size={16} /> Save AI Configuration
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Keyboard Shortcuts */}
          {activeTab === 'shortcuts' && (
            <div className="tab-pane">
              <h2>Keyboard Productivity Shortcuts</h2>
              <p className="tab-subtitle">
                Supercharge QA workflows with instant 1-click filling without opening the extension popup.
              </p>

              <div className="shortcut-card">
                <div className="shortcut-keys">
                  <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd>
                </div>
                <div className="shortcut-info">
                  <h4>Quick Fill Active Tab</h4>
                  <p>Instantly identifies all fields on the current webpage and fills them using your default test persona.</p>
                </div>
              </div>

              <div className="shortcut-card">
                <div className="shortcut-keys">
                  <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd>
                </div>
                <div className="shortcut-info">
                  <h4>Regenerate & Refill Active Tab</h4>
                  <p>Generates a brand-new synthetic Nepali citizen profile and re-fills the active form immediately.</p>
                </div>
              </div>

              <div className="shortcut-card">
                <div className="shortcut-keys">
                  <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>U</kbd>
                </div>
                <div className="shortcut-info">
                  <h4>Undo / Revert Form Fields</h4>
                  <p>Restores previously filled inputs back to their initial original values or clears them.</p>
                </div>
              </div>

              <div className="shortcut-card">
                <div className="shortcut-keys">
                  <span style={{ fontSize: '18px' }}>🇳🇵</span>
                </div>
                <div className="shortcut-info">
                  <h4>In-Field Floating Badge</h4>
                  <p>Click the discreet floating flag icon inside any focused or hovered form field to fill the whole form, populate that field only, or undo.</p>
                </div>
              </div>

              <div className="shortcut-card">
                <div className="shortcut-keys">
                  <kbd>Right Click</kbd>
                </div>
                <div className="shortcut-info">
                  <h4>Context Menu Action</h4>
                  <p>Right-click on any input or form area and choose <em>"Fill with Nepali Test Data"</em>.</p>
                </div>
              </div>

              <div className="tip-box">
                💡 <strong>Custom Keybindings:</strong> You can customize these shortcuts anytime at <code>chrome://extensions/shortcuts</code>.
              </div>
            </div>
          )}

          {/* TAB 5: Backup & Restore */}
          {activeTab === 'backup' && (
            <div className="tab-pane">
              <h2>Backup & Data Management</h2>
              <p className="tab-subtitle">
                Export all your domain rules, preferences, and custom mappings or import them across workstations.
              </p>

              <div className="backup-actions">
                <div className="backup-box">
                  <Download size={28} />
                  <h3>Export Configuration</h3>
                  <p>Download a JSON backup of your default profile, categories, and all custom domain mapping rules.</p>
                  <button className="primary-btn" onClick={handleExportBackup}>
                    <Download size={16} /> Export JSON Backup
                  </button>
                </div>

                <div className="backup-box">
                  <Upload size={28} />
                  <h3>Restore from Backup</h3>
                  <p>Select a previously exported JSON backup file to restore all settings and rules.</p>
                  <label className="upload-btn">
                    <Upload size={16} /> Select Backup File
                    <input type="file" accept=".json" onChange={handleImportBackup} />
                  </label>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
