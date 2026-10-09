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
  Activity,
  AlertCircle,
  Plus,
  Edit3,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { ProfileType, FillScript, SyntheticPerson } from '../types';
import { generateSyntheticPerson } from '../generator/personGenerator';
import {
  PersonaPreset,
  getPersonaPresets,
  savePersonaPreset,
  deletePersonaPreset,
  resetDefaultPresets,
  generatePersonFromPreset,
} from '../services/personaPresets';
import { COMMERCIAL_BANKS } from '../generator/bankingDetails';
import { NepalDataEngine } from '../generator/nepalDataEngine';
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
import {
  testGeminiConnection,
  GeminiConnectionTestResult,
  SUPPORTED_GEMINI_MODELS,
  DEFAULT_GEMINI_MODEL,
  FALLBACK_GEMINI_MODEL,
  resolveGeminiModel,
} from '../services/geminiClassifier';
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
  const [enableSessionPersistence, setEnableSessionPersistence] = useState<boolean>(true);

  // AI settings
  const [aiEnabled, setAiEnabled] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_GEMINI_MODEL);
  const [cacheCount, setCacheCount] = useState(0);
  const [testStatus, setTestStatus] = useState<GeminiConnectionTestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Domain mappings
  const [allMappings, setAllMappings] = useState<Record<string, DomainMappingConfig>>({});

  // Preview synthetic person
  const [previewPerson, setPreviewPerson] = useState<SyntheticPerson>(generateSyntheticPerson('general'));

  // Persona presets state
  const [presets, setPresets] = useState<PersonaPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [isEditingPreset, setIsEditingPreset] = useState(false);
  const [editingPreset, setEditingPreset] = useState<Partial<PersonaPreset>>({
    baseProfile: 'employee',
    gender: 'Random',
    preferredScript: 'en',
  });

  // Notification feedback
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    loadSettings();
    loadPresets();
    refreshCacheCount();
    loadDomainMappings();
  }, []);

  const loadPresets = async () => {
    const list = await getPersonaPresets();
    setPresets(list);
  };

  const loadSettings = async () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const data = (await chrome.storage.local.get([
        'selectedProfile',
        'fillScript',
        'fillCategories',
        'aiEnabled',
        'geminiApiKey',
        'geminiModel',
        'enableFloatingBadge',
        'enableSessionPersistence',
        'selectedPresetId',
      ])) as Record<string, any>;

      if (data.selectedPresetId) {
        setSelectedPresetId(data.selectedPresetId);
      }

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
      if (data.enableSessionPersistence !== undefined) {
        setEnableSessionPersistence(Boolean(data.enableSessionPersistence));
      }
      if (data.aiEnabled !== undefined) {
        setAiEnabled(Boolean(data.aiEnabled));
      }
      if (data.geminiApiKey) {
        setApiKey(data.geminiApiKey);
      }
      if (data.geminiModel) {
        setSelectedModel(resolveGeminiModel(data.geminiModel));
      }
    }
  };

  const loadDomainMappings = async () => {
    const mappings = await getAllDomainMappings();
    setAllMappings(mappings);
  };

  const handleStartCreatePreset = () => {
    setEditingPreset({
      name: '',
      description: '',
      baseProfile: 'employee',
      gender: 'Random',
      preferredScript: 'en',
      province: '',
      district: '',
      municipality: '',
      companyName: '',
      designation: '',
      department: '',
      school: '',
      faculty: '',
      grade: '',
      businessName: '',
      businessType: '',
      bloodGroup: undefined,
      bankName: '',
      emailDomain: '',
    });
    setIsEditingPreset(true);
  };

  const handleStartEditPreset = (preset: PersonaPreset) => {
    setEditingPreset({ ...preset });
    setIsEditingPreset(true);
  };

  const handleSavePreset = async () => {
    if (!editingPreset.name || editingPreset.name.trim() === '') {
      alert('Please enter a name for the persona preset.');
      return;
    }
    const saved = await savePersonaPreset({
      ...editingPreset,
      name: editingPreset.name.trim(),
      baseProfile: editingPreset.baseProfile || 'general',
    });
    await loadPresets();
    setIsEditingPreset(false);
    showToast(`Saved preset "${saved.name}" successfully!`);
  };

  const handleDeletePreset = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete preset "${name}"?`)) return;
    const ok = await deletePersonaPreset(id);
    if (ok) {
      await loadPresets();
      showToast(`Deleted preset "${name}".`);
    } else {
      alert('Cannot delete built-in presets.');
    }
  };

  const handleResetPresets = async () => {
    if (!confirm('Reset all presets to default built-ins? Any custom presets will be lost.')) return;
    await resetDefaultPresets();
    await loadPresets();
    showToast('Reset presets to default successfully.');
  };

  const handleTestPreset = (preset: PersonaPreset) => {
    const p = generatePersonFromPreset(preset);
    setSelectedPresetId(preset.id);
    setPreviewPerson(p);
    setDefaultProfile(preset.baseProfile);
    showToast(`Generated live preview from "${preset.name}"!`);
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
        enableSessionPersistence,
      });
      showToast('General preferences saved successfully!');
    }
  };

  const saveAiSettings = async () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({
        aiEnabled,
        geminiAiClassificationEnabled: aiEnabled,
        geminiApiKey: apiKey.trim(),
        geminiModel: selectedModel,
      });
      showToast('AI classification settings updated!');
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestStatus(null);
    try {
      const res = await testGeminiConnection(apiKey, selectedModel);
      setTestStatus(res);
    } catch (err) {
      setTestStatus({
        success: false,
        status: 'error',
        message: `Connection test failed: ${err instanceof Error ? err.message : String(err)}`,
        model: selectedModel,
      });
    } finally {
      setIsTesting(false);
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
      enableSessionPersistence,
      aiEnabled,
      domainMappings: allMappings,
      personaPresets: presets,
      selectedPresetId,
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
        if (parsed.enableSessionPersistence !== undefined) setEnableSessionPersistence(Boolean(parsed.enableSessionPersistence));
        if (parsed.aiEnabled !== undefined) setAiEnabled(parsed.aiEnabled);

        if (parsed.personaPresets && Array.isArray(parsed.personaPresets)) {
          setPresets(parsed.personaPresets);
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            await chrome.storage.local.set({ personaPresets: parsed.personaPresets });
          }
        }

        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          await chrome.storage.local.set({
            selectedProfile: parsed.defaultProfile || defaultProfile,
            fillCategories: parsed.fillCategories || fillCategories,
            enableFloatingBadge: parsed.enableFloatingBadge !== undefined ? parsed.enableFloatingBadge : enableFloatingBadge,
            enableSessionPersistence: parsed.enableSessionPersistence !== undefined ? parsed.enableSessionPersistence : enableSessionPersistence,
            aiEnabled: parsed.aiEnabled !== undefined ? parsed.aiEnabled : aiEnabled,
            selectedPresetId: parsed.selectedPresetId || selectedPresetId,
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
        await loadPresets();
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

              {/* Custom Persona Presets Section */}
              <div className="preset-section-header">
                <div>
                  <h3>Custom QA Persona Presets</h3>
                  <p className="tab-subtitle" style={{ marginBottom: 0 }}>
                    Configure and save customized test personas (e.g. QA SuperAdmin, Biratnagar Retailer, Pokhara Foreign Student) with geographic or professional constraints.
                  </p>
                </div>
                <div className="preset-header-actions">
                  <button className="primary-btn" onClick={handleStartCreatePreset}>
                    <Plus size={16} /> New Persona Preset
                  </button>
                  <button className="secondary-btn" onClick={handleResetPresets} title="Reset all presets back to defaults">
                    <RotateCcw size={14} /> Reset Built-ins
                  </button>
                </div>
              </div>

              {isEditingPreset && (
                <div className="preset-editor-card">
                  <h3>{editingPreset.id ? 'Edit Persona Preset' : 'Create New Persona Preset'}</h3>
                  <div className="preset-form-grid">
                    <div className="form-field-group">
                      <label>Preset Name *</label>
                      <input
                        type="text"
                        placeholder="e.g., QA SuperAdmin, Biratnagar Retailer"
                        value={editingPreset.name || ''}
                        onChange={(e) => setEditingPreset({ ...editingPreset, name: e.target.value })}
                      />
                    </div>

                    <div className="form-field-group">
                      <label>Base Archetype *</label>
                      <select
                        value={editingPreset.baseProfile || 'general'}
                        onChange={(e) => setEditingPreset({ ...editingPreset, baseProfile: e.target.value as ProfileType })}
                      >
                        <option value="general">General Citizen</option>
                        <option value="student">Student</option>
                        <option value="employee">Employee</option>
                        <option value="business">Business Owner</option>
                        <option value="teacher">Teacher / Faculty</option>
                        <option value="farmer">Farmer / Agriculture</option>
                      </select>
                    </div>

                    <div className="form-field-group">
                      <label>Description / QA Notes</label>
                      <input
                        type="text"
                        placeholder="Purpose of this persona preset"
                        value={editingPreset.description || ''}
                        onChange={(e) => setEditingPreset({ ...editingPreset, description: e.target.value })}
                      />
                    </div>

                    <div className="form-field-group">
                      <label>Preferred Gender</label>
                      <select
                        value={editingPreset.gender || 'Random'}
                        onChange={(e) => setEditingPreset({ ...editingPreset, gender: e.target.value as any })}
                      >
                        <option value="Random">Random</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-field-group">
                      <label>Preferred Script</label>
                      <select
                        value={editingPreset.preferredScript || 'en'}
                        onChange={(e) => setEditingPreset({ ...editingPreset, preferredScript: e.target.value as FillScript })}
                      >
                        <option value="en">English (Romanized)</option>
                        <option value="np">नेपाली (Devanagari Unicode)</option>
                      </select>
                    </div>

                    <div className="form-field-group">
                      <label>Target Province</label>
                      <select
                        value={editingPreset.province || ''}
                        onChange={(e) => {
                          const prov = e.target.value;
                          setEditingPreset({ ...editingPreset, province: prov, district: '' });
                        }}
                      >
                        <option value="">Any / Random Province</option>
                        {NepalDataEngine.provinces.map((pr) => (
                          <option key={pr.name} value={pr.name}>
                            {pr.name} ({pr.nepaliName})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field-group">
                      <label>Target District</label>
                      <select
                        value={editingPreset.district || ''}
                        onChange={(e) => setEditingPreset({ ...editingPreset, district: e.target.value })}
                      >
                        <option value="">Any / Random District</option>
                        {(editingPreset.province
                          ? NepalDataEngine.getDistrictsByProvince(editingPreset.province)
                          : NepalDataEngine.districts
                        ).map((d) => (
                          <option key={d.name} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field-group">
                      <label>Target Municipality (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Biratnagar Metropolitan City"
                        value={editingPreset.municipality || ''}
                        onChange={(e) => setEditingPreset({ ...editingPreset, municipality: e.target.value })}
                      />
                    </div>

                    <div className="form-field-group">
                      <label>Designation / Job Title</label>
                      <input
                        type="text"
                        placeholder="e.g. QA Super Administrator, Merchant"
                        value={editingPreset.designation || ''}
                        onChange={(e) => setEditingPreset({ ...editingPreset, designation: e.target.value })}
                      />
                    </div>

                    <div className="form-field-group">
                      <label>Company / Organization Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Nepal Enterprise QA Cloud"
                        value={editingPreset.companyName || ''}
                        onChange={(e) => setEditingPreset({ ...editingPreset, companyName: e.target.value })}
                      />
                    </div>

                    <div className="form-field-group">
                      <label>School / College (Student)</label>
                      <input
                        type="text"
                        placeholder="e.g. Prithvi Narayan Campus"
                        value={editingPreset.school || ''}
                        onChange={(e) => setEditingPreset({ ...editingPreset, school: e.target.value })}
                      />
                    </div>

                    <div className="form-field-group">
                      <label>Faculty / Grade (Student)</label>
                      <input
                        type="text"
                        placeholder="e.g. Science & Technology / Bachelor 3rd Year"
                        value={editingPreset.faculty || ''}
                        onChange={(e) => setEditingPreset({ ...editingPreset, faculty: e.target.value })}
                      />
                    </div>

                    <div className="form-field-group">
                      <label>Business Name (Business Owner)</label>
                      <input
                        type="text"
                        placeholder="e.g. Birat Trade Syndicate"
                        value={editingPreset.businessName || ''}
                        onChange={(e) => setEditingPreset({ ...editingPreset, businessName: e.target.value })}
                      />
                    </div>

                    <div className="form-field-group">
                      <label>Custom Email Domain</label>
                      <input
                        type="text"
                        placeholder="e.g. superadmin.qa or testcompany.np"
                        value={editingPreset.emailDomain || ''}
                        onChange={(e) => setEditingPreset({ ...editingPreset, emailDomain: e.target.value })}
                      />
                    </div>

                    <div className="form-field-group">
                      <label>Blood Group</label>
                      <select
                        value={editingPreset.bloodGroup || ''}
                        onChange={(e) => setEditingPreset({ ...editingPreset, bloodGroup: (e.target.value as any) || undefined })}
                      >
                        <option value="">Any / Random</option>
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-field-group">
                      <label>Bank Name</label>
                      <select
                        value={editingPreset.bankName || ''}
                        onChange={(e) => setEditingPreset({ ...editingPreset, bankName: e.target.value })}
                      >
                        <option value="">Any / Random Bank</option>
                        {COMMERCIAL_BANKS.map((b) => (
                          <option key={b.shortName} value={b.shortName}>
                            {b.shortName} ({b.nameNp})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="preset-form-actions">
                    <button className="primary-btn" onClick={handleSavePreset}>
                      <Save size={16} /> Save Preset
                    </button>
                    <button className="secondary-btn" onClick={() => setIsEditingPreset(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="preset-grid">
                {presets.map((preset) => (
                  <div key={preset.id} className="preset-card">
                    <div className="preset-card-top">
                      <div className="preset-card-title-row">
                        <h4 className="preset-card-title">{preset.name}</h4>
                        <div className="preset-badges">
                          <span className="badge-profile">{preset.baseProfile}</span>
                          <span className={preset.isBuiltin ? 'badge-builtin' : 'badge-custom'}>
                            {preset.isBuiltin ? 'Built-in' : 'Custom'}
                          </span>
                        </div>
                      </div>
                      {preset.description && <p className="preset-desc">{preset.description}</p>}

                      <div className="preset-details-list">
                        {(preset.province || preset.district) && (
                          <div className="preset-detail-item">
                            <span className="lbl">Location:</span>
                            <span className="val">
                              {[preset.district, preset.province].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                        {preset.designation && (
                          <div className="preset-detail-item">
                            <span className="lbl">Designation:</span>
                            <span className="val">{preset.designation}</span>
                          </div>
                        )}
                        {preset.companyName && (
                          <div className="preset-detail-item">
                            <span className="lbl">Company:</span>
                            <span className="val">{preset.companyName}</span>
                          </div>
                        )}
                        {preset.school && (
                          <div className="preset-detail-item">
                            <span className="lbl">School:</span>
                            <span className="val">{preset.school}</span>
                          </div>
                        )}
                        {preset.businessName && (
                          <div className="preset-detail-item">
                            <span className="lbl">Business:</span>
                            <span className="val">{preset.businessName}</span>
                          </div>
                        )}
                        {preset.emailDomain && (
                          <div className="preset-detail-item">
                            <span className="lbl">Email Domain:</span>
                            <span className="val">@{preset.emailDomain}</span>
                          </div>
                        )}
                        {preset.bankName && (
                          <div className="preset-detail-item">
                            <span className="lbl">Bank:</span>
                            <span className="val">{preset.bankName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="preset-card-actions">
                      <button
                        className="preset-btn-test"
                        onClick={() => handleTestPreset(preset)}
                        title="Generate and view live persona in preview"
                      >
                        <Sparkles size={13} /> Test Generate
                      </button>
                      <button
                        className="preset-btn-action"
                        onClick={() => handleStartEditPreset(preset)}
                        title="Edit preset settings"
                      >
                        <Edit3 size={13} />
                      </button>
                      {!preset.isBuiltin && (
                        <button
                          className="preset-btn-action danger"
                          onClick={() => handleDeletePreset(preset.id, preset.name)}
                          title="Delete custom preset"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
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

              <h3>Multi-Step Wizard & SPA Persistence</h3>
              <div className="setting-card">
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={enableSessionPersistence}
                    onChange={(e) => setEnableSessionPersistence(e.target.checked)}
                  />
                  <span><strong>Retain Persona Across Multi-Step Forms & SPA (Session Storage)</strong></span>
                </label>
                <p className="help-text">
                  Keeps the same synthetic citizen in tab memory across multi-step forms (Step 1: Personal → Step 2: Address → Step 3: Education) instead of generating new random individuals on each page.
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
                <div className="api-key-input-row">
                  <input
                    type="password"
                    className="input-text"
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      if (testStatus) setTestStatus(null);
                    }}
                  />
                  <button
                    type="button"
                    className="secondary-btn test-conn-btn"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    title="Validate API key format and quota balance with Gemini API"
                  >
                    <Activity size={14} className={isTesting ? 'animate-spin' : ''} />
                    {isTesting ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>
                <p className="help-text">
                  Your key is saved exclusively in your browser’s local storage (`chrome.storage.local`).
                </p>

                {testStatus && (
                  <div className={`connection-feedback-card ${testStatus.success ? 'success' : 'error'}`}>
                    {testStatus.success ? (
                      <CheckCircle2 size={16} className="status-icon" />
                    ) : (
                      <AlertCircle size={16} className="status-icon" />
                    )}
                    <div className="feedback-content">
                      <strong>{testStatus.success ? 'Connection Verified' : 'Validation Error'}</strong>
                      <p>{testStatus.message}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="setting-card">
                <label><strong>Gemini Model:</strong></label>
                <select
                  className="input-select"
                  value={selectedModel}
                  onChange={(e) => {
                    setSelectedModel(e.target.value);
                    if (testStatus) setTestStatus(null);
                  }}
                >
                  {SUPPORTED_GEMINI_MODELS.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.id} — {model.description}
                    </option>
                  ))}
                </select>
                <p className="help-text">
                  Select model for unknown field classification. Automatically falls back to {FALLBACK_GEMINI_MODEL} if the selected model is unavailable.
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
