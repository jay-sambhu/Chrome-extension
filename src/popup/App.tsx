import React, { useState, useEffect } from 'react';
import './App.css';
import { generateSyntheticPerson } from '../generator/personGenerator';
import { FillOptions, SyntheticPerson } from '../types';
import { Check, RefreshCw, Zap, Sparkles, MapPin, Phone, Mail, Briefcase } from 'lucide-react';

export const App: React.FC = () => {
  const [person, setPerson] = useState<SyntheticPerson>(() => generateSyntheticPerson());
  const [profile, setProfile] = useState<FillOptions['profile']>('general');
  const [categories, setCategories] = useState<FillOptions['fillCategories']>({
    personal: true,
    contact: true,
    address: true,
    professional: true,
  });
  const [status, setStatus] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);
  const [isFilling, setIsFilling] = useState(false);

  // Load preferences from chrome.storage
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['selectedProfile', 'fillCategories'], (res: Record<string, any>) => {
        if (res.selectedProfile) setProfile(res.selectedProfile);
        if (res.fillCategories) setCategories(res.fillCategories);
      });
    }
  }, []);

  const handleProfileChange = (newProfile: FillOptions['profile']) => {
    setProfile(newProfile);
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
    const newPerson = generateSyntheticPerson();
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
      const options: FillOptions = { profile, fillCategories: categories };

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
      </header>

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
          <div className="preview-name">{person.fullName}</div>
          <div className="preview-gender-badge">{person.gender}, {person.age}y</div>
        </div>

        <div className="preview-row">
          <Phone size={12} className="preview-icon" />
          <span className="preview-text">{person.phone}</span>
        </div>

        <div className="preview-row">
          <Mail size={12} className="preview-icon" />
          <span className="preview-text">{person.email}</span>
        </div>

        <div className="preview-row">
          <MapPin size={12} className="preview-icon" />
          <span className="preview-text">{person.address.fullAddress}</span>
        </div>

        <div className="preview-row">
          <Briefcase size={12} className="preview-icon" />
          <span className="preview-text">{person.occupation}</span>
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
          className="btn btn-secondary"
          onClick={handleRegenerate}
          title="Generate a fresh synthetic person"
        >
          <RefreshCw size={14} />
          Generate New Data
        </button>

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
      </div>
    </div>
  );
};
