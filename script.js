const $ = id => document.getElementById(id);

// Pre-defined demo scenarios
const cases = {
  painting: {
    message: "My landlord says one month's rent will be deducted from my security deposit for painting when I move out.",
    state: "Maharashtra",
    city: "Pune, Maharashtra",
    rent: 18000,
    deposit: 50000,
    deduction: 25000,
    title: "A fixed painting charge deserves a closer review.",
    reason: "Ask whether the charge reflects documented damage beyond ordinary use, and request an itemised explanation and supporting bills. The agreement and applicable state rules matter.",
    risk: 72,
    steps: [
      "Check the exact painting and maintenance wording in your agreement.",
      "Request dated move-in and move-out photos, an itemised bill and proof of actual damage.",
      "Keep the deposit receipt and all written conversations.",
      "Check the tenancy rules applicable in your state."
    ]
  },
  lockin: {
    message: "My landlord says the entire security deposit will be kept because I am moving out before the lock-in period ends.",
    state: "Karnataka",
    city: "Bengaluru, Karnataka",
    rent: 20000,
    deposit: 45000,
    deduction: 45000,
    title: "The lock-in and forfeiture wording needs careful review.",
    reason: "A full-deposit forfeiture is not automatically justified just because a clause says so. Review the lock-in terms, notice, actual loss and applicable contract and state law before accepting the deduction.",
    risk: 82,
    steps: [
      "Read the lock-in, notice and early-termination clauses together.",
      "Ask the landlord to explain the amount claimed and how it was calculated.",
      "Keep proof of notice, rent payments and handover condition.",
      "Seek legal advice before accepting a large forfeiture."
    ]
  },
  deposit: {
    message: "The landlord is asking for ten months of rent as an advance security deposit.",
    state: "Karnataka",
    city: "Bengaluru, Karnataka",
    rent: 25000,
    deposit: 250000,
    deduction: 0,
    title: "Check the deposit amount against the rules that apply locally.",
    reason: "Security-deposit limits and tenancy requirements can depend on the state and the law in force. The Model Tenancy Act is a model framework and does not automatically apply everywhere.",
    risk: 65,
    steps: [
      "Identify the state and city where the property is located.",
      "Check whether the state has adopted tenancy legislation and what it says about deposits.",
      "Ask for the deposit amount and refund terms in writing.",
      "Do not rely on a general online statement without checking local law."
    ]
  }
};

// Indian State Tenancy Insights
const STATE_CONTEXTS = {
  "Maharashtra": "In Maharashtra (Mumbai, Pune), Leave & License agreements are governed under the Maharashtra Rent Control Act, 1999. Under Section 55, agreements must be registered. Routine painting and fair wear-and-tear cannot be charged without verified documentation of tenant damage.",
  "Karnataka": "In Karnataka (Bengaluru), customary demands for 6–10 months deposit contradict the Model Tenancy Act (which caps residential deposits at 2 months). Mandatory painting deductions on vacating are a frequent point of dispute and require itemised contractor proof.",
  "Delhi": "In Delhi NCR (Delhi, Gurgaon, Noida), withholding a deposit without providing contractor invoices or receipts for damage repair constitutes unlawful retention under Indian contract law.",
  "Tamil Nadu": "Tamil Nadu has enacted the Rights and Responsibilities of Landlords and Tenants Act, which regulates security deposits and requires written, registered tenancy contracts.",
  "Telangana": "In Telangana (Hyderabad), arbitrary deductions without joint handover inspection or receipts can be contested before the local Rent Authority or Civil Court.",
  "West Bengal": "In West Bengal, premises tenancy laws mandate itemized disclosure of repair charges and protect tenants against unjustified forfeiture of deposits.",
  "All-India": "Under Section 74 of the Indian Contract Act, 1872, stipulating forfeiture or penalty without proof of actual damage or loss is not legally enforceable. Furthermore, the Model Tenancy Act, 2021 recommends a maximum 2-month security deposit for residential premises."
};

let currentCase = null;
let backendOnline = false;
let configuredBackendUrl = localStorage.getItem('clauseshield_backend') || 'http://localhost:8000';

function toast(message) {
  const el = $('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2800);
}

function formatINR(value) {
  return '₹' + Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function getFormattedDate() {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date().toLocaleDateString('en-IN', options);
}

function escapeHTML(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function syncFormalLetter() {
  const text = $('formalText') ? $('formalText').value : '';
  const preview = $('formalPreview');
  const printable = $('printable-letter');
  if (preview) preview.textContent = text;
  if (printable) printable.textContent = text;
}

// Check Backend Health
async function checkBackendStatus() {
  const pulse = $('backendPulse');
  const statusText = $('backendStatusText');
  const inputEl = $('backendUrlInput');
  if (inputEl) inputEl.value = configuredBackendUrl;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${configuredBackendUrl}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      backendOnline = true;
      if (pulse) pulse.classList.remove('offline');
      if (statusText) {
        statusText.textContent = data.gemini_api_configured
          ? 'Engine: Live Gemini 1.5 AI Connected'
          : 'Engine: FastAPI Backend Connected (Rule Mode)';
      }
      return;
    }
  } catch (e) {
    // Backend is offline, fallback is active
  }

  backendOnline = false;
  if (pulse) pulse.classList.add('offline');
  if (statusText) {
    statusText.textContent = 'Engine: Smart In-Browser Rule Analyzer (Ready)';
  }
}

// Local Fallback Rule Engine for Indian Tenancies
function analyzeLocally(message, state, city, monthlyRent, securityDeposit, amountInDispute, landlordName, replyDays) {
  const lowerMsg = (message || '').toLowerCase();
  const loc = (city ? `${city}, ${state}` : state).trim();
  const greeting = landlordName ? `Hi ${landlordName},` : 'Hello,';
  const formalGreeting = landlordName ? `Dear ${landlordName},` : 'Dear Landlord,';
  const landlordRef = landlordName || "[Landlord's Name]";
  const today = getFormattedDate();

  const isPainting = /paint|whitewash|color|repainting/.test(lowerMsg);
  const isLockin = /lock-in|lockin|early|premature|forfeit|break lease/.test(lowerMsg);
  const isDeposit = /advance|10 month|ten month|deposit|caution/.test(lowerMsg);
  const isCleaning = /clean|deep clean|sanitize|housekeeping/.test(lowerMsg);

  let title, riskScore, concernLevel, reason, steps;

  if (isPainting) {
    title = "A fixed painting charge deserves a closer review.";
    riskScore = 74;
    concernLevel = "NEEDS REVIEW";
    reason = "Under Indian tenancy rules, minor wall discoloration and nail marks constitute fair wear and tear. Demanding a full month's rent for repainting without contractor bills or documented damage violates Section 74 of the Indian Contract Act, 1872.";
    steps = [
      "Check your rental agreement for the exact painting and maintenance wording.",
      "Request dated move-in and move-out photos alongside an itemised contractor bill.",
      "Verify whether the property suffered damage beyond standard wear and tear.",
      "Cite applicable state rules or the Model Tenancy Act before agreeing to deductions."
    ];
  } else if (isLockin) {
    title = "Full-deposit forfeiture for early exit requires careful review.";
    riskScore = 84;
    concernLevel = "HIGHER CONCERN · REVIEW";
    reason = "A landlord cannot automatically forfeit the entire deposit as a punitive measure. Under Indian contract law, liquidated damages must reflect actual, demonstrated loss (such as unmitigated vacancy period) rather than an arbitrary penalty.";
    steps = [
      "Review the lock-in, notice, and termination clauses in your lease agreement.",
      "Ask the landlord to provide proof of actual financial loss incurred.",
      "Confirm written records of notice delivery and handover clearances.",
      "Seek legal guidance if an excessive forfeiture is demanded."
    ];
  } else if (isDeposit) {
    title = "Check the advance deposit against statutory guidelines.";
    riskScore = 68;
    concernLevel = "NEEDS REVIEW";
    reason = "The Model Tenancy Act, 2021 recommends capping residential security deposits at a maximum of two months' rent. Demanding 6 to 10 months advance rent is customary in some areas but increasingly contested.";
    steps = [
      "Negotiate for a 2-to-3 month deposit citing modern rental framework standards.",
      "Ensure the deposit refund timeline is recorded in writing.",
      "Confirm that interest or bank guarantee alternatives are discussed."
    ];
  } else if (isCleaning) {
    title = "Cleaning charges must reflect verifiable deep cleaning.";
    riskScore = 62;
    concernLevel = "NEEDS REVIEW";
    reason = "Unless the premises were left in an exceptionally unhygienic state, normal broom-clean handover is standard. Deep cleaning deductions require photographic proof and GST invoices.";
    steps = [
      "Compare move-in photos with the final handover condition.",
      "Request original GST invoices from the cleaning vendor.",
      "Propose arranging independent professional cleaning if the quote is inflated."
    ];
  } else {
    title = "Your rental situation warrants an itemised explanation.";
    riskScore = 55;
    concernLevel = "INFORMATION CHECK";
    reason = "Any deduction from a tenant's security deposit must be accompanied by supporting invoices, receipts, and reference to signed lease terms.";
    steps = [
      "Request an itemised breakdown of all proposed deductions.",
      "Gather payment receipts, lease documents, and handover records.",
      "Request supporting bills before consenting to any deduction."
    ];
  }

  const stateNote = STATE_CONTEXTS[state] || STATE_CONTEXTS["All-India"];

  const whatsappDraft = `${greeting}\n\nI am writing regarding the security deposit for our rented premises at ${loc}. Regarding the proposed deduction for: "${message}", could you please share the relevant agreement clause along with an itemised bill and receipts for any actual repairs beyond standard fair wear and tear?\n\nI would like to settle this smoothly. Please share your response within ${replyDays} days so we can confirm the remaining refund.\n\nThank you,\n[Your Name]`;

  const formalDraft = `Date: ${today}

To,
${landlordRef}
[Landlord's Address / Property Details]

Subject: Formal Request for Itemised Accounting and Refund of Security Deposit

${formalGreeting}

I am writing regarding the security deposit paid for the rented premises located at ${loc}. The deduction communicated is: "${message}".

Under recognized tenancy standards and principles under Section 74 of the Indian Contract Act, 1872, deductions from a tenant's security deposit must correspond to actual, documented loss and cannot penalize ordinary wear and tear resulting from reasonable domestic occupancy. Routine repainting and minor ageing of the property are the responsibility of the owner as part of general property maintenance.

Accordingly, I formally request that you provide:
1. The specific clause in our executed rental agreement authorizing this deduction.
2. An itemised statement detailing the exact work required.
3. Original contractor invoices, estimates, or GST bills verifying actual expenses incurred.
4. Move-in versus move-out comparative photographic evidence.

I request that you refund any undisputed balance of the deposit immediately, and provide your written response to this request within ${replyDays} days of receiving this letter so that this matter may be settled amicably.

This communication is a formal request for clarification and accounting, and is issued without prejudice to any rights or legal remedies available under applicable law.

Sincerely,
[Your Name]
[Your Phone Number / Email Address]`;

  return {
    title,
    risk_score: riskScore,
    concern_level: concernLevel,
    reasoning: reason,
    state_note: stateNote,
    suggested_steps: steps,
    whatsapp_draft: whatsappDraft,
    formal_letter: formalDraft,
    engine_used: "ClauseShield Smart Legal Rule Engine"
  };
}

// Generate drafts helper
function generateDrafts() {
  const msg = $('messageInput').value.trim();
  if (!msg) return;

  const state = $('stateSelect') ? $('stateSelect').value : 'All-India';
  const city = $('city') ? $('city').value.trim() : '';
  const rent = Number($('rent').value) || 0;
  const deposit = Number($('deposit').value) || 0;
  const deduction = Number($('deduction').value) || 0;
  const landlordName = $('landlordName') ? $('landlordName').value.trim() : '';
  const replyDays = Math.max(1, Number($('deadline').value) || 7);

  const result = analyzeLocally(msg, state, city, rent, deposit, deduction, landlordName, replyDays);
  $('whatsappText').value = result.whatsapp_draft;
  $('formalText').value = result.formal_letter;
  syncFormalLetter();
}

// Load Demo Cases
function loadCase(key) {
  const c = cases[key];
  if (!c) return;
  currentCase = key;
  $('scenario').value = key;
  $('messageInput').value = c.message;
  if ($('stateSelect') && c.state) $('stateSelect').value = c.state;
  if ($('city') && c.city) $('city').value = c.city;
  $('rent').value = c.rent;
  $('deposit').value = c.deposit;
  $('deduction').value = c.deduction;

  if ($('calcDeposit')) {
    $('calcDeposit').value = c.deposit;
    calculate();
  }

  // Switch to text mode if on file mode
  switchInputMode('text');

  $('audit').scrollIntoView({ behavior: 'smooth' });
  toast('Demo scenario loaded');
}

// Input Mode Toggle (Text vs PDF Upload)
function switchInputMode(mode) {
  const textModeBtn = document.querySelector('.mode-tab[data-mode="text"]');
  const fileModeBtn = document.querySelector('.mode-tab[data-mode="file"]');
  const textContainer = $('textInputContainer');
  const fileContainer = $('fileUploadContainer');

  if (mode === 'file') {
    if (textModeBtn) textModeBtn.classList.remove('active');
    if (fileModeBtn) fileModeBtn.classList.add('active');
    if (textContainer) textContainer.hidden = true;
    if (fileContainer) fileContainer.hidden = false;
  } else {
    if (fileModeBtn) fileModeBtn.classList.remove('active');
    if (textModeBtn) textModeBtn.classList.add('active');
    if (textContainer) textContainer.hidden = false;
    if (fileContainer) fileContainer.hidden = true;
  }
}

document.querySelectorAll('.mode-tab').forEach(tab => {
  tab.addEventListener('click', () => switchInputMode(tab.dataset.mode));
});

// PDF.js Client-Side Lease Text Extraction
async function extractTextFromPDF(file) {
  const dropzonePrompt = $('dropzonePrompt');
  const fileUploadStatus = $('fileUploadStatus');
  const fileNameDisplay = $('fileNameDisplay');
  const filePageDisplay = $('filePageDisplay');

  if (!window.pdfjsLib) {
    toast('PDF library loading... Please try again in a moment.');
    return;
  }

  if (dropzonePrompt) dropzonePrompt.hidden = true;
  if (fileUploadStatus) fileUploadStatus.hidden = false;
  if (fileNameDisplay) fileNameDisplay.textContent = file.name;
  if (filePageDisplay) filePageDisplay.textContent = 'Reading PDF...';

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    const numPages = Math.min(pdf.numPages, 10);

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += `\n[Page ${i}] ` + pageText;
    }

    if (filePageDisplay) {
      filePageDisplay.textContent = `Extracted ${numPages} page(s)`;
    }

    // Populate message input with extracted text
    const cleanText = fullText.trim();
    if (cleanText) {
      // Find prominent clauses if present
      const match = cleanText.match(/(?:paint|deposit|lock-in|wear and tear|deduct|maintenance)[^\.\n]{20,200}\./i);
      if (match) {
        $('messageInput').value = match[0].trim();
      } else {
        $('messageInput').value = cleanText.slice(0, 500) + '...';
      }
      toast(`Extracted ${numPages} pages from ${file.name}`);
    } else {
      toast('Could not extract text. The PDF might be scanned.');
    }
  } catch (err) {
    console.error('PDF parsing error:', err);
    if (filePageDisplay) filePageDisplay.textContent = 'Extraction failed';
    toast('Error reading PDF. You can paste the clause text directly.');
  }
}

// Lease File Input & Drag and Drop Handlers
const leaseFileInput = $('leaseFileInput');
const leaseDropzone = $('fileUploadContainer');

if (leaseFileInput) {
  leaseFileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        extractTextFromPDF(file);
      } else {
        const reader = new FileReader();
        reader.onload = evt => {
          $('messageInput').value = (evt.target.result || '').slice(0, 600);
          const fn = $('fileNameDisplay');
          const fp = $('filePageDisplay');
          if (fn) fn.textContent = file.name;
          if (fp) fp.textContent = 'Text file loaded';
          $('dropzonePrompt').hidden = true;
          $('fileUploadStatus').hidden = false;
          toast('Text file loaded');
        };
        reader.readAsText(file);
      }
    }
  });
}

if (leaseDropzone) {
  ['dragenter', 'dragover'].forEach(eventName => {
    leaseDropzone.addEventListener(eventName, e => {
      e.preventDefault();
      leaseDropzone.classList.add('dragover');
    });
  });
  ['dragleave', 'drop'].forEach(eventName => {
    leaseDropzone.addEventListener(eventName, e => {
      e.preventDefault();
      leaseDropzone.classList.remove('dragover');
    });
  });
  leaseDropzone.addEventListener('drop', e => {
    const file = e.dataTransfer.files[0];
    if (file) {
      extractTextFromPDF(file);
    }
  });
}

const removeFileBtn = $('removeFileBtn');
if (removeFileBtn) {
  removeFileBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (leaseFileInput) leaseFileInput.value = '';
    $('dropzonePrompt').hidden = false;
    $('fileUploadStatus').hidden = true;
    toast('File removed');
  });
}

// Backend API Settings Modal / Toggle
const apiSettingsToggle = $('apiSettingsToggle');
const apiSettingsPanel = $('apiSettingsPanel');
const testApiBtn = $('testApiBtn');

if (apiSettingsToggle && apiSettingsPanel) {
  apiSettingsToggle.addEventListener('click', () => {
    apiSettingsPanel.hidden = !apiSettingsPanel.hidden;
    apiSettingsToggle.setAttribute('aria-expanded', String(!apiSettingsPanel.hidden));
  });
}

if (testApiBtn) {
  testApiBtn.addEventListener('click', async () => {
    const url = $('backendUrlInput').value.trim().replace(/\/+$/, '');
    if (!url) {
      toast('Please enter a valid backend URL.');
      return;
    }
    configuredBackendUrl = url;
    localStorage.setItem('clauseshield_backend', url);
    toast('Testing connection...');
    await checkBackendStatus();
    if (backendOnline) {
      toast('✓ Connected to Backend successfully!');
      if (apiSettingsPanel) apiSettingsPanel.hidden = true;
    } else {
      toast('Could not connect to backend. Falling back to local rule engine.');
    }
  });
}

// Navigation & Demo buttons
document.querySelectorAll('[data-case]').forEach(b => {
  b.addEventListener('click', () => loadCase(b.dataset.case));
});

$('scenario').addEventListener('change', e => {
  if (e.target.value) loadCase(e.target.value);
});

$('tryDemo').addEventListener('click', () => loadCase('painting'));

// Mobile menu navigation toggle
const menuToggle = $('menuToggle');
const mainNav = $('mainNav');
if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
  document.querySelectorAll('#mainNav a').forEach(a => {
    a.addEventListener('click', () => {
      mainNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Audit Execution (Hybrid: Backend Gemini API + In-Browser Rule Fallback)
$('runAudit').addEventListener('click', async () => {
  const msg = $('messageInput').value.trim();
  if (!msg) {
    toast('Choose a scenario, upload a lease, or paste a clause first.');
    return;
  }

  const state = $('stateSelect') ? $('stateSelect').value : 'All-India';
  const city = $('city') ? $('city').value.trim() : '';
  const rent = Number($('rent').value) || 0;
  const deposit = Number($('deposit').value) || 0;
  const deduction = Number($('deduction').value) || 0;
  const landlordName = $('landlordName') ? $('landlordName').value.trim() : '';
  const replyDays = Math.max(1, Number($('deadline').value) || 7);

  const runBtn = $('runAudit');
  const originalText = runBtn.textContent;
  runBtn.textContent = 'Analyzing clause...';
  runBtn.disabled = true;

  let auditResult = null;

  // Attempt Backend AI call if online or configured
  if (backendOnline) {
    try {
      const formData = new FormData();
      formData.append('message', msg);
      formData.append('state', state);
      formData.append('city', city);
      formData.append('monthly_rent', rent);
      formData.append('security_deposit', deposit);
      formData.append('amount_in_dispute', deduction);
      formData.append('landlord_name', landlordName);
      formData.append('reply_days', replyDays);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${configuredBackendUrl}/api/audit-clause`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        auditResult = await res.json();
      }
    } catch (e) {
      console.warn('Backend call timed out or failed, using local rule analyzer.');
    }
  }

  // Graceful fallback to built-in rule analyzer if backend failed or offline
  if (!auditResult) {
    auditResult = analyzeLocally(msg, state, city, rent, deposit, deduction, landlordName, replyDays);
  }

  // Render results into UI
  $('riskLabel').textContent = auditResult.concern_level || (auditResult.risk_score >= 75 ? 'HIGHER CONCERN · REVIEW' : auditResult.risk_score >= 60 ? 'NEEDS REVIEW' : 'INFORMATION CHECK');
  $('verdictTitle').textContent = auditResult.title;
  $('verdictReason').textContent = auditResult.reasoning;
  $('moneyValue').textContent = formatINR(deduction);

  const score = Math.max(0, Math.min(100, auditResult.risk_score || 50));
  $('riskScore').textContent = score;
  $('riskBar').style.width = score + '%';
  $('riskBar').style.background = score >= 75 ? '#c65b50' : score >= 60 ? '#c18b36' : '#279b73';

  // Next steps list
  const steps = auditResult.suggested_steps || [];
  $('nextSteps').innerHTML = steps.map(s => '<li>' + escapeHTML(s) + '</li>').join('');

  // Engine Pill & State Pill
  const enginePill = $('enginePill');
  const statePill = $('statePill');
  if (enginePill) enginePill.textContent = '⚡ ' + (auditResult.engine_used || 'ClauseShield Legal Engine');
  if (statePill) statePill.textContent = 'Jurisdiction: ' + state;

  // State Context Alert
  const stateAlertCard = $('stateAlertCard');
  const stateAlertText = $('stateAlertText');
  if (stateAlertCard && stateAlertText) {
    const note = auditResult.state_note || STATE_CONTEXTS[state] || STATE_CONTEXTS['All-India'];
    stateAlertText.textContent = note;
    stateAlertCard.hidden = false;
  }

  // Drafts
  $('whatsappText').value = auditResult.whatsapp_draft;
  $('formalText').value = auditResult.formal_letter;
  syncFormalLetter();

  runBtn.textContent = originalText;
  runBtn.disabled = false;

  $('results').hidden = false;
  $('results').scrollIntoView({ behavior: 'smooth' });
});

// Update drafts dynamically when landlord details change
function updateOnDetailsChange() {
  if (!$('results').hidden && $('messageInput').value.trim()) {
    generateDrafts();
  }
}
if ($('landlordName')) $('landlordName').addEventListener('input', updateOnDetailsChange);
if ($('deadline')) $('deadline').addEventListener('input', updateOnDetailsChange);
if ($('stateSelect')) $('stateSelect').addEventListener('change', updateOnDetailsChange);

// Sync formal letter live to preview and printable element
if ($('formalText')) $('formalText').addEventListener('input', syncFormalLetter);

// Legal References toggle
if ($('legalToggle')) {
  $('legalToggle').addEventListener('click', () => {
    const d = $('legalDetails');
    if (!d) return;
    d.hidden = !d.hidden;
    $('legalToggle').setAttribute('aria-expanded', String(!d.hidden));
    $('legalToggle').textContent = (d.hidden ? '＋' : '−') + ' Want to see the legal references?';
  });
}

// Tabs switching (WhatsApp vs Formal Letter)
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === tab));
    $('whatsappPane').hidden = tab.dataset.tab !== 'whatsapp';
    $('formalPane').hidden = tab.dataset.tab !== 'formal';
    if (tab.dataset.tab === 'formal') {
      syncFormalLetter();
    }
  });
});

// Clipboard copy helper
async function copyText(value) {
  if (!value) {
    toast('Nothing to copy yet. Generate a message first.');
    return;
  }
  try {
    await navigator.clipboard.writeText(value);
    toast('Copied to clipboard');
  } catch (e) {
    toast('Copy is unavailable here. Select the text and copy it manually.');
  }
}

if ($('copyMessage')) $('copyMessage').addEventListener('click', () => copyText($('whatsappText').value));
if ($('copyLetter')) $('copyLetter').addEventListener('click', () => copyText($('formalText').value));

// WhatsApp send link
if ($('whatsappLink')) {
  $('whatsappLink').addEventListener('click', e => {
    const text = $('whatsappText').value;
    if (!text) {
      e.preventDefault();
      toast('Generate a message first.');
      return;
    }
    e.currentTarget.href = 'https://wa.me/?text=' + encodeURIComponent(text);
  });
}

// Print / Save as PDF
if ($('printLetter')) {
  $('printLetter').addEventListener('click', () => {
    syncFormalLetter();
    const text = $('formalText').value.trim();
    if (!text) {
      toast('Please run an audit or write a letter first.');
      return;
    }
    window.print();
  });
}

// Dispute Calculator
function calculate() {
  const deposit = Math.max(0, Number($('calcDeposit').value) || 0);
  let total = 0;
  document.querySelectorAll('.deduction-row input[type=number]').forEach(i => {
    total += Math.max(0, Number(i.value) || 0);
  });
  $('totalDeductions').textContent = formatINR(total);
  $('balance').textContent = formatINR(Math.max(0, deposit - total));
  if (total > deposit) {
    toast('Entered deductions exceed the deposit amount.');
  }
}

if ($('addDeduction')) {
  $('addDeduction').addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'deduction-row';
    row.innerHTML = '<input aria-label="Deduction description" placeholder="Deduction name"><input aria-label="Deduction amount" type="number" min="0" value="0"><button class="remove-deduction" type="button" aria-label="Remove deduction" title="Remove deduction">×</button>';
    $('deductionRows').appendChild(row);
    calculate();
  });
}

if ($('deductionRows')) {
  $('deductionRows').addEventListener('click', e => {
    if (e.target.classList.contains('remove-deduction') || e.target.closest('.remove-deduction')) {
      const row = e.target.closest('.deduction-row');
      if (row) {
        row.remove();
        calculate();
      }
    }
  });
  $('deductionRows').addEventListener('input', calculate);
}

if ($('calculate')) $('calculate').addEventListener('click', calculate);
if ($('calcDeposit')) $('calcDeposit').addEventListener('input', calculate);

// Evidence Photo Upload preview with card presentation
if ($('photoUpload')) {
  $('photoUpload').addEventListener('change', e => {
    const holder = $('photoPreview');
    if (!holder) return;
    holder.innerHTML = '';
    const files = [...e.target.files];
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const card = document.createElement('div');
      card.className = 'photo-card';
      const img = document.createElement('img');
      img.alt = file.name || 'Inspection photo';
      img.src = URL.createObjectURL(file);
      const label = document.createElement('div');
      label.className = 'photo-card-name';
      label.textContent = file.name;
      card.appendChild(img);
      card.appendChild(label);
      holder.appendChild(card);
    });
  });
}

// Initializations
calculate();
syncFormalLetter();
checkBackendStatus();
