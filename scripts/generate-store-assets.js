import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const outDir = path.resolve('store-assets');
fs.mkdirSync(outDir, { recursive: true });

function captureHtml(html, outputFile, width, height) {
  const tempHtml = path.resolve(outDir, `_temp_${path.basename(outputFile)}.html`);
  fs.writeFileSync(tempHtml, html, 'utf-8');

  try {
    const cmd = `google-chrome --headless --no-sandbox --hide-scrollbars --screenshot="${outputFile}" --window-size=${width},${height} "file://${tempHtml}"`;
    execSync(cmd, { stdio: 'pipe' });
    console.log(`✓ Generated ${outputFile} (${width}x${height})`);
  } finally {
    if (fs.existsSync(tempHtml)) {
      fs.unlinkSync(tempHtml);
    }
  }
}

// Common styles for screenshot mockups
const baseCss = `
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
  body { width: 100vw; height: 100vh; overflow: hidden; background: #070d18; color: #f8fafc; display: flex; flex-direction: column; }
  .canvas { width: 100%; height: 100%; display: flex; flex-direction: column; position: relative; }
  .browser-chrome { background: #131d31; border-bottom: 1px solid #24344d; padding: 12px 18px; display: flex; align-items: center; gap: 14px; }
  .browser-dots { display: flex; gap: 6px; }
  .dot { width: 11px; height: 11px; border-radius: 50%; }
  .dot.red { background: #ef4444; }
  .dot.yellow { background: #f59e0b; }
  .dot.green { background: #10b981; }
  .browser-bar { flex: 1; background: #0b1120; border: 1px solid #24344d; border-radius: 6px; padding: 6px 14px; font-size: 13px; color: #94a3b8; display: flex; align-items: center; gap: 8px; }
  .browser-badge { background: #dc143c; color: #fff; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; }
  .showcase-area { flex: 1; display: flex; padding: 24px; gap: 24px; position: relative; background: radial-gradient(circle at 80% 20%, rgba(220, 20, 60, 0.12) 0%, transparent 60%); }
  .callout-title { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
  .callout-sub { font-size: 14px; color: #94a3b8; margin-top: 4px; max-width: 500px; }
  .tag-pill { display: inline-flex; align-items: center; gap: 6px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
`;

// 1. Screenshot 1: Popup 1-Click Fill & Persona Preview
const screenshot1Html = `<!DOCTYPE html>
<html>
<head><style>${baseCss}
  .popup-card { width: 440px; background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); display: flex; flex-direction: column; gap: 14px; }
  .popup-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 12px; }
  .persona-box { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 14px; }
  .persona-name { font-size: 18px; font-weight: 700; color: #f8fafc; }
  .persona-np { font-size: 14px; color: #38bdf8; font-weight: 500; margin-top: 2px; }
  .persona-attr { font-size: 12px; color: #94a3b8; margin-top: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .btn-fill { background: #dc143c; color: white; border: none; padding: 12px; border-radius: 8px; font-size: 15px; font-weight: 700; text-align: center; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(220, 20, 60, 0.4); }
  .btn-row { display: flex; gap: 8px; }
  .btn-sec { flex: 1; background: #1e293b; border: 1px solid #334155; color: #f8fafc; padding: 8px; border-radius: 6px; font-size: 12px; font-weight: 600; text-align: center; }
</style></head>
<body>
<div class="canvas">
  <div class="browser-chrome">
    <div class="browser-dots"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div></div>
    <div class="browser-bar">🔒 https://example.com/nepal-registration-portal</div>
    <div class="browser-badge">🇳🇵 Extension Active</div>
  </div>
  <div class="showcase-area" style="align-items: center; justify-content: space-around;">
    <div>
      <div class="tag-pill">⚡ Core Feature #1</div>
      <h1 class="callout-title" style="margin-top: 12px;">Instant 1-Click Form Filling</h1>
      <p class="callout-sub">Generates statistically realistic Nepali citizens with matching Devanagari Unicode names, phone numbers, and address hierarchy.</p>
      <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 10px;">
        <div style="display: flex; gap: 10px; align-items: center;"><span style="color: #10b981;">✓</span> <span><strong>Devanagari Unicode & English</strong> script modes</span></div>
        <div style="display: flex; gap: 10px; align-items: center;"><span style="color: #10b981;">✓</span> <span><strong>7 Archetype Profiles</strong> (Citizen, Student, Farmer, etc.)</span></div>
        <div style="display: flex; gap: 10px; align-items: center;"><span style="color: #10b981;">✓</span> <span><strong>Copy Persona as JSON</strong> for Postman & Swagger</span></div>
      </div>
    </div>
    <div class="popup-card">
      <div class="popup-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 24px;">🇳🇵</span>
          <div>
            <div style="font-weight: 700; font-size: 15px;">Nepal Test Filler</div>
            <div style="font-size: 11px; color: #94a3b8;">Synthetic Citizen Generator</div>
          </div>
        </div>
        <div style="background: #1e293b; border: 1px solid #334155; padding: 4px 8px; border-radius: 6px; font-size: 12px;">Dark Theme</div>
      </div>
      <div class="persona-box">
        <div class="persona-name">Bipin Adhikari</div>
        <div class="persona-np">बिपिन अधिकारी (Student Archetype)</div>
        <div class="persona-attr">
          <div>📍 Kathmandu, Bagmati</div>
          <div>📞 +977 9841892301</div>
          <div>🆔 27-01-78-19283</div>
          <div>🩸 Blood Group: O+</div>
        </div>
      </div>
      <button class="btn-fill">⚡ Fill Active Web Page</button>
      <div class="btn-row">
        <div class="btn-sec">🔄 New Persona</div>
        <div class="btn-sec">📋 Copy JSON</div>
        <div class="btn-sec">↩️ Undo Fill</div>
      </div>
    </div>
  </div>
</div>
</body></html>`;

// 2. Screenshot 2: Loksewa Government Form Autofill
const screenshot2Html = `<!DOCTYPE html>
<html>
<head><style>${baseCss}
  .form-container { flex: 1; background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 16px; }
  .fgroup { display: flex; flex-direction: column; gap: 4px; }
  .flabel { font-size: 11px; font-weight: 600; color: #94a3b8; }
  .finput { background: #1e293b; border: 1px solid #3b82f6; color: #f8fafc; padding: 8px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; }
  .floating-badge { position: absolute; top: 180px; right: 50px; background: #131d31; border: 1px solid #dc143c; border-radius: 8px; padding: 12px 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.7); display: flex; align-items: center; gap: 10px; }
</style></head>
<body>
<div class="canvas">
  <div class="browser-chrome">
    <div class="browser-dots"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div></div>
    <div class="browser-bar">🔒 https://psconline.psc.gov.np/civil-service-application</div>
    <div class="browser-badge">🇳🇵 Loksewa Aayog Form</div>
  </div>
  <div class="showcase-area">
    <div class="form-container">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 12px;">
        <div>
          <h2 style="font-size: 18px; font-weight: 700;">लोक सेवा आयोग — दरखास्त फारम (Civil Service Form)</h2>
          <p style="font-size: 12px; color: #94a3b8;">Automatically classified & populated with matching geographic hierarchy</p>
        </div>
        <div style="background: rgba(16, 185, 129, 0.2); color: #34d399; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px;">✓ 14 Fields Autofilled</div>
      </div>
      <div class="grid">
        <div class="fgroup"><div class="flabel">पुरा नाम (नेपाली युनिकोड)</div><div class="finput">आरव शर्मा</div></div>
        <div class="fgroup"><div class="flabel">Full Name (English)</div><div class="finput">Aarav Sharma</div></div>
        <div class="fgroup"><div class="flabel">Gender (लिङ्ग)</div><div class="finput">Male (पुरुष)</div></div>
        <div class="fgroup"><div class="flabel">Date of Birth (Bikram Sambat - BS)</div><div class="finput">2054-08-16</div></div>
        <div class="fgroup"><div class="flabel">Citizenship No. (नागरिकता नं.)</div><div class="finput">27-01-76-04921</div></div>
        <div class="fgroup"><div class="flabel">Citizenship Issue District</div><div class="finput">Kathmandu</div></div>
        <div class="fgroup"><div class="flabel">Permanent Province</div><div class="finput">Bagmati Province</div></div>
        <div class="fgroup"><div class="flabel">Permanent District</div><div class="finput">Kathmandu</div></div>
        <div class="fgroup"><div class="flabel">Municipality (नगरपालिका)</div><div class="finput">Kathmandu Metropolitan City</div></div>
        <div class="fgroup"><div class="flabel">Ward Number (वडा नं.)</div><div class="finput">4</div></div>
        <div class="fgroup"><div class="flabel">Mobile Phone (मोबाइल)</div><div class="finput">9841928475</div></div>
        <div class="fgroup"><div class="flabel">National Identity (NID)</div><div class="finput">9102938471</div></div>
      </div>
    </div>
  </div>
</div>
</body></html>`;

// 3. Screenshot 3: FinTech & Banking
const screenshot3Html = `<!DOCTYPE html>
<html>
<head><style>${baseCss}
  .form-container { width: 560px; background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 16px; }
  .fgroup { display: flex; flex-direction: column; gap: 4px; }
  .flabel { font-size: 11px; font-weight: 600; color: #94a3b8; }
  .finput { background: #1e293b; border: 1px solid #10b981; color: #f8fafc; padding: 8px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; }
</style></head>
<body>
<div class="canvas">
  <div class="browser-chrome">
    <div class="browser-dots"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div></div>
    <div class="browser-bar">🔒 https://payment.esewa.com.np/checkout</div>
    <div class="browser-badge">💳 FinTech Gateway</div>
  </div>
  <div class="showcase-area" style="align-items: center; justify-content: space-around;">
    <div>
      <div class="tag-pill" style="border-color: #10b981; color: #34d399; background: rgba(16, 185, 129, 0.1);">💳 FinTech & Banking</div>
      <h1 class="callout-title" style="margin-top: 12px;">Digital Wallet & Banking Autofill</h1>
      <p class="callout-sub">Accurately fills eSewa/Khalti wallet IDs, commercial banks (Nabil, Global IME, NIC Asia), account numbers, and merchant PAN/VAT credentials.</p>
      <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 10px;">
        <div style="display: flex; gap: 10px; align-items: center;"><span style="color: #10b981;">✓</span> <span>Recognizes all 20 Class-A Commercial Banks in Nepal</span></div>
        <div style="display: flex; gap: 10px; align-items: center;"><span style="color: #10b981;">✓</span> <span>Valid 9-digit PAN & VAT generation</span></div>
        <div style="display: flex; gap: 10px; align-items: center;"><span style="color: #10b981;">✓</span> <span>Automatic wallet detection (eSewa / Khalti / ConnectIPS)</span></div>
      </div>
    </div>
    <div class="form-container">
      <div style="border-bottom: 1px solid #1e293b; padding-bottom: 10px;">
        <h3 style="font-size: 16px;">Fund Transfer & Payment Details</h3>
        <p style="font-size: 12px; color: #94a3b8;">Testing Checkout Form with Realistic Nepali Bank Credentials</p>
      </div>
      <div class="grid">
        <div class="fgroup" style="grid-column: 1 / -1;"><div class="flabel">eSewa ID / Khalti Mobile Number</div><div class="finput">9861948201</div></div>
        <div class="fgroup" style="grid-column: 1 / -1;"><div class="flabel">Destination Bank</div><div class="finput">Global IME Bank Limited</div></div>
        <div class="fgroup" style="grid-column: 1 / -1;"><div class="flabel">Account Number</div><div class="finput">0192837465019283</div></div>
        <div class="fgroup"><div class="flabel">Account Holder Name</div><div class="finput">Prakash Shrestha</div></div>
        <div class="fgroup"><div class="flabel">Branch Name</div><div class="finput">New Road Branch</div></div>
        <div class="fgroup"><div class="flabel">Merchant PAN / VAT</div><div class="finput">601928374</div></div>
        <div class="fgroup"><div class="flabel">Transfer Amount (NPR)</div><div class="finput">5,000</div></div>
      </div>
    </div>
  </div>
</div>
</body></html>`;

// 4. Screenshot 4: Domain Mapping & Settings
const screenshot4Html = `<!DOCTYPE html>
<html>
<head><style>${baseCss}
  .options-mock { flex: 1; background: #0f172a; border: 1px solid #334155; border-radius: 12px; display: flex; overflow: hidden; }
  .sidebar { width: 220px; background: #131d31; border-right: 1px solid #24344d; padding: 18px 12px; display: flex; flex-direction: column; gap: 8px; }
  .sitem { padding: 10px 14px; border-radius: 6px; font-size: 13px; font-weight: 600; color: #94a3b8; }
  .sitem.active { background: #dc143c; color: white; }
  .content { flex: 1; padding: 24px; }
  .rule-card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 14px; margin-top: 14px; }
</style></head>
<body>
<div class="canvas">
  <div class="browser-chrome">
    <div class="browser-dots"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div></div>
    <div class="browser-bar">🔒 chrome-extension://nepal-test-filler/options.html</div>
    <div class="browser-badge">⚙️ Extension Options</div>
  </div>
  <div class="showcase-area">
    <div class="options-mock">
      <div class="sidebar">
        <div class="sitem">👤 Default Profiles</div>
        <div class="sitem active">🌐 Domain Mappings</div>
        <div class="sitem">🤖 Gemini AI & Cache</div>
        <div class="sitem">⌨️ Keyboard Shortcuts</div>
        <div class="sitem">💾 Backup & Restore</div>
      </div>
      <div class="content">
        <h2 style="font-size: 20px; font-weight: 700;">Domain-Specific Rules & Field Overrides</h2>
        <p style="font-size: 13px; color: #94a3b8;">Override heuristic field detection for tricky single-page apps or non-standard selectors.</p>
        
        <div class="rule-card">
          <div style="display: flex; justify-content: space-between; font-weight: 700; color: #38bdf8;">
            <span>portal.tu.edu.np (Tribhuvan University)</span>
            <span style="color: #10b981;">3 Custom Rules</span>
          </div>
          <div style="font-size: 12px; color: #94a3b8; margin-top: 8px;">
            <div>• <code>#tu_stud_roll</code> → Mapped to <strong>Roll Number</strong></div>
            <div>• <code>input[name="stu_faculty"]</code> → Mapped to <strong>Academic Faculty</strong></div>
            <div>• <code>#guardian_cell</code> → Mapped to <strong>Phone Number</strong></div>
          </div>
        </div>

        <div class="rule-card">
          <div style="display: flex; justify-content: space-between; font-weight: 700; color: #38bdf8;">
            <span>ebilling.ird.gov.np (Inland Revenue Dept)</span>
            <span style="color: #10b981;">2 Custom Rules</span>
          </div>
          <div style="font-size: 12px; color: #94a3b8; margin-top: 8px;">
            <div>• <code>#merchant_pan_num</code> → Mapped to <strong>PAN Number</strong></div>
            <div>• <code>#vat_amount_field</code> → Mapped to <strong>Currency Number</strong></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</body></html>`;

// 5. Screenshot 5: Dark and Light Theme Comparison
const screenshot5Html = `<!DOCTYPE html>
<html>
<head><style>${baseCss}
  .theme-box-dark { flex: 1; background: #1c1917; border: 1px solid #44403c; border-radius: 12px; padding: 24px; color: #fafaf9; }
  .theme-box-light { flex: 1; background: #fbf8f4; border: 1px solid #e6ded3; border-radius: 12px; padding: 24px; color: #261c14; }
  .pill-dark { background: #292524; border: 1px solid #44403c; padding: 6px 12px; border-radius: 6px; font-size: 12px; color: #f59e0b; display: inline-block; margin-bottom: 12px; font-weight: 600; }
  .pill-light { background: #ffffff; border: 1px solid #ded3c5; padding: 6px 12px; border-radius: 6px; font-size: 12px; color: #d97706; display: inline-block; margin-bottom: 12px; font-weight: 600; box-shadow: 0 1px 3px rgba(120,53,15,0.06); }
  .card-d { background: #292524; border: 1px solid #44403c; border-radius: 8px; padding: 14px; margin-top: 12px; }
  .card-l { background: #ffffff; border: 1px solid #e6ded3; border-radius: 8px; padding: 14px; margin-top: 12px; box-shadow: 0 2px 8px rgba(120,53,15,0.04); }
</style></head>
<body>
<div class="canvas">
  <div class="browser-chrome">
    <div class="browser-dots"><div class="dot red"></div><div class="dot yellow"></div><div class="dot green"></div></div>
    <div class="browser-bar">🎨 Nepal Test Filler — Warm Design Themes</div>
    <div class="browser-badge">☀️ Warm Light & 🌙 Warm Espresso Dark</div>
  </div>
  <div class="showcase-area" style="gap: 24px;">
    <div class="theme-box-dark">
      <div class="pill-dark">🌙 Warm Espresso Dark</div>
      <h2 style="font-size: 20px; font-weight: 700;">Engineered for Low Light</h2>
      <p style="font-size: 13px; color: #a8a29e; margin-top: 4px;">Deep warm obsidian stone with glowing amber accents and rhododendron crimson.</p>
      <div class="card-d">
        <div style="font-weight: 700;">QA SuperAdmin Preset</div>
        <div style="font-size: 12px; color: #f59e0b; margin-top: 2px;">Lead QA Automation Engineer • Nepal Tech</div>
        <div style="font-size: 11px; color: #a8a29e; margin-top: 6px;">📍 Kathmandu • 📞 9841000000 • 🆔 27-01-70-11111</div>
      </div>
    </div>

    <div class="theme-box-light">
      <div class="pill-light">☀️ Warm Cream Daylight</div>
      <h2 style="font-size: 20px; font-weight: 700;">Rich Inviting Daytime Palette</h2>
      <p style="font-size: 13px; color: #78716c; margin-top: 4px;">Warm Himalayan cream canvas, crisp cards, sand borders, and golden amber accents.</p>
      <div class="card-l">
        <div style="font-weight: 700; color: #261c14;">Biratnagar Retailer Preset</div>
        <div style="font-size: 12px; color: #d97706; margin-top: 2px;">Koshi Wholesalers • Merchant Account</div>
        <div style="font-size: 11px; color: #78716c; margin-top: 6px;">📍 Morang, Koshi • 📞 9802000000 • 🆔 12-01-72-22222</div>
      </div>
    </div>
  </div>
</div>
</body></html>`;

// 6. Small Promo Banner: 440x280
const promoSmallHtml = `<!DOCTYPE html>
<html>
<head><style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  body { width: 440px; height: 280px; overflow: hidden; background: linear-gradient(135deg, #0b1120 0%, #1e1122 50%, #dc143c 140%); color: #fff; padding: 22px; display: flex; flex-direction: column; justify-content: space-between; }
  .badge-row { display: flex; align-items: center; justify-content: space-between; }
  .flag-badge { font-size: 28px; line-height: 1; }
  .title { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; line-height: 1.1; margin-top: 10px; }
  .tagline { font-size: 13px; color: #cbd5e1; margin-top: 6px; line-height: 1.4; }
  .features { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
  .f-pill { background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.2); padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
  .offline-badge { font-size: 11px; color: #34d399; font-weight: 700; display: flex; align-items: center; gap: 4px; }
</style></head>
<body>
  <div class="badge-row">
    <span class="flag-badge">🇳🇵</span>
    <span class="offline-badge">🔒 100% Offline & Private</span>
  </div>
  <div>
    <h1 class="title">Nepal Test Filler</h1>
    <p class="tagline">1-Click Synthetic Nepali Test Data for Developers & QA Teams.</p>
    <div class="features">
      <div class="f-pill">Devanagari Unicode</div>
      <div class="f-pill">Bikram Sambat BS</div>
      <div class="f-pill">7 Provinces & Wards</div>
    </div>
  </div>
  <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">
    Chrome Web Store Developer Tool
  </div>
</body></html>`;

// 7. Large Marquee Promo Banner: 920x680
const promoMarqueeHtml = `<!DOCTYPE html>
<html>
<head><style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  body { width: 920px; height: 680px; overflow: hidden; background: radial-gradient(circle at 80% 20%, #450a1c 0%, #0b1120 70%); color: #fff; padding: 48px; display: flex; flex-direction: column; justify-content: space-between; }
  .header-tag { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 700; color: #ff6b81; }
  .hero-title { font-size: 48px; font-weight: 900; letter-spacing: -1px; line-height: 1.1; margin-top: 14px; }
  .hero-subtitle { font-size: 20px; color: #cbd5e1; margin-top: 12px; max-width: 650px; line-height: 1.4; }
  .grid-features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 32px; }
  .fcard { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.12); padding: 18px; border-radius: 12px; }
  .fcard-h { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .fcard-p { font-size: 13px; color: #94a3b8; line-height: 1.4; }
  .footer-row { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 20px; font-size: 14px; color: #94a3b8; }
</style></head>
<body>
  <div>
    <div class="header-tag">
      <span style="font-size: 32px;">🇳🇵</span>
      <span>OFFICIAL QA & DEVELOPER EXTENSION</span>
    </div>
    <h1 class="hero-title">Nepal Test Filler</h1>
    <p class="hero-subtitle">
      Stop typing "asdf" or placeholder US data. Populate web forms instantly with realistic Nepali addresses, Bikram Sambat dates, citizenship numbers, and banking details.
    </p>

    <div class="grid-features">
      <div class="fcard">
        <div class="fcard-h">⚡ 1-Click Form Filling</div>
        <div class="fcard-p">Detects inputs across React, Vue, Next.js, and legacy forms with full shadow DOM support.</div>
      </div>
      <div class="fcard">
        <div class="fcard-h">📅 Bikram Sambat & BS Dates</div>
        <div class="fcard-p">Handles BS birth dates, Devanagari numerals, and dual AD/BS datepicker inputs.</div>
      </div>
      <div class="fcard">
        <div class="fcard-h">🏛️ 77 Districts & Wards</div>
        <div class="fcard-p">Hierarchically accurate province, district, municipality, and ward combinations.</div>
      </div>
    </div>
  </div>

  <div class="footer-row">
    <div><strong>Manifest V3</strong> • 100% Offline Local Engine • Zero Telemetry</div>
    <div style="color: #38bdf8; font-weight: 700;">Alt+Shift+F Shortcut</div>
  </div>
</body></html>`;

console.log('Generating Chrome Web Store marketing screenshots and promotional banners...');

// Generate 5 Store Screenshots (1280x800)
captureHtml(screenshot1Html, path.join(outDir, 'screenshot-1-popup-fill.png'), 1280, 800);
captureHtml(screenshot2Html, path.join(outDir, 'screenshot-2-loksewa-autofill.png'), 1280, 800);
captureHtml(screenshot3Html, path.join(outDir, 'screenshot-3-fintech-banking.png'), 1280, 800);
captureHtml(screenshot4Html, path.join(outDir, 'screenshot-4-domain-mapping.png'), 1280, 800);
captureHtml(screenshot5Html, path.join(outDir, 'screenshot-5-theme-toggle.png'), 1280, 800);

// Generate 2 Promotional Banners
captureHtml(promoSmallHtml, path.join(outDir, 'promo-small-440x280.png'), 440, 280);
captureHtml(promoMarqueeHtml, path.join(outDir, 'promo-marquee-920x680.png'), 920, 680);

console.log('✓ All 7 Chrome Web Store marketing assets generated successfully in store-assets/!');
