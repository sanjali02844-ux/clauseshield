const $ = id => document.getElementById(id);

const cases = {
  painting: {
    message: "My landlord says one month's rent will be deducted from my security deposit for painting when I move out.",
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

let currentCase = null;

function toast(message) {
  const el = $('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2600);
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

function generateDrafts() {
  const msg = $('messageInput').value.trim();
  if (!msg) return;

  const city = $('city').value.trim() || '[City / State]';
  const deadline = Math.max(1, Number($('deadline').value) || 7);
  const name = $('landlordName').value.trim();
  const greeting = name ? 'Hi ' + name + ',' : 'Hello,';
  const formalGreeting = name ? 'Dear ' + name + ',' : 'Dear Landlord,';
  const landlordRecipient = name || "[Landlord's Name]";
  const today = getFormattedDate();

  const whatsappDraft = `${greeting}\n\nI am writing about the proposed deduction from my security deposit relating to: "${msg}". Could you please share the relevant agreement clause, an itemised calculation and supporting bills or evidence of any damage beyond ordinary wear and tear? I would appreciate resolving this amicably. Please respond within ${deadline} days and confirm the expected refund, if any.\n\nProperty location: ${city}\nThank you.`;

  const formalDraft = `Date: ${today}

To,
${landlordRecipient}
[Landlord's Address / Property Details]

Subject: Request for explanation and settlement of security-deposit deductions

${formalGreeting}

I am writing regarding the security deposit paid for the rented premises located at ${city}. The issue raised is: "${msg}".

Please provide the specific agreement clause relied upon, an itemised statement of proposed deductions, and verifiable copies of supporting bills, contractor invoices, or inspection records. As per standard tenancy norms, routine wear and tear is not chargeable to the tenant. I request that any undisputed balance of the deposit be refunded without delay so that this matter may be settled amicably.

Please provide your written response along with the necessary documentation within ${deadline} days of receiving this letter.

This communication is a formal request for clarification and accounting, and is issued without prejudice to any rights or legal remedies available under applicable law.

Sincerely,
[Your Name]
[Your Phone Number / Email Address]`;

  $('whatsappText').value = whatsappDraft;
  $('formalText').value = formalDraft;
  syncFormalLetter();
}

function loadCase(key) {
  const c = cases[key];
  if (!c) return;
  currentCase = key;
  $('scenario').value = key;
  $('messageInput').value = c.message;
  $('rent').value = c.rent;
  $('deposit').value = c.deposit;
  $('deduction').value = c.deduction;

  // Pre-populate calculator deposit for convenience
  if ($('calcDeposit')) {
    $('calcDeposit').value = c.deposit;
    calculate();
  }

  $('audit').scrollIntoView({ behavior: 'smooth' });
  toast('Demo scenario loaded');
}

// Navigation & Demo buttons
document.querySelectorAll('[data-case]').forEach(b => {
  b.addEventListener('click', () => loadCase(b.dataset.case));
});

$('scenario').addEventListener('change', e => {
  if (e.target.value) loadCase(e.target.value);
});

$('tryDemo').addEventListener('click', () => loadCase('painting'));

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

// Audit execution
$('runAudit').addEventListener('click', () => {
  const msg = $('messageInput').value.trim();
  if (!msg) {
    toast('Choose a scenario or paste a message first.');
    return;
  }
  const c = cases[currentCase] || null;
  const amount = Number($('deduction').value) || 0;
  const title = c ? c.title : 'Your wording may need a closer review.';
  const reason = c ? c.reason : 'Identify the exact clause, check your tenancy agreement and local rules, and request an itemised explanation with supporting evidence.';
  const score = c ? c.risk : 50;
  const steps = c ? c.steps : [
    "Save the complete agreement and the message you received.",
    "Ask for the specific clause and an itemised calculation.",
    "Collect payment receipts, inspection photos and handover records.",
    "Verify the applicable state rules or consult a qualified lawyer."
  ];

  $('riskLabel').textContent = score >= 75 ? 'HIGHER CONCERN · REVIEW' : score >= 60 ? 'NEEDS REVIEW' : 'INFORMATION CHECK';
  $('verdictTitle').textContent = title;
  $('verdictReason').textContent = reason;
  $('moneyValue').textContent = formatINR(amount);

  $('riskScore').textContent = score;
  $('riskBar').style.width = score + '%';
  $('riskBar').style.background = score >= 75 ? '#c65b50' : score >= 60 ? '#c18b36' : '#279b73';

  $('nextSteps').innerHTML = steps.map(s => '<li>' + escapeHTML(s) + '</li>').join('');

  generateDrafts();

  $('results').hidden = false;
  $('results').scrollIntoView({ behavior: 'smooth' });
});

// Update drafts dynamically when landlord details change
function updateOnDetailsChange() {
  if (!$('results').hidden && $('messageInput').value.trim()) {
    generateDrafts();
  }
}
$('landlordName').addEventListener('input', updateOnDetailsChange);
$('deadline').addEventListener('input', updateOnDetailsChange);

// Sync formal letter edits live to preview and printable element
$('formalText').addEventListener('input', syncFormalLetter);

// Legal References toggle
$('legalToggle').addEventListener('click', () => {
  const d = $('legalDetails');
  d.hidden = !d.hidden;
  $('legalToggle').setAttribute('aria-expanded', String(!d.hidden));
  $('legalToggle').textContent = (d.hidden ? '＋' : '−') + ' Want to see the legal references?';
});

// Tabs switching
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

// Clipboard copy
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

$('copyMessage').addEventListener('click', () => copyText($('whatsappText').value));
$('copyLetter').addEventListener('click', () => copyText($('formalText').value));

// WhatsApp link
$('whatsappLink').addEventListener('click', e => {
  const text = $('whatsappText').value;
  if (!text) {
    e.preventDefault();
    toast('Generate a message first.');
    return;
  }
  e.currentTarget.href = 'https://wa.me/?text=' + encodeURIComponent(text);
});

// Print / Save as PDF
$('printLetter').addEventListener('click', () => {
  syncFormalLetter();
  const text = $('formalText').value.trim();
  if (!text) {
    toast('Please run an audit or write a letter first.');
    return;
  }
  window.print();
});

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

$('addDeduction').addEventListener('click', () => {
  const row = document.createElement('div');
  row.className = 'deduction-row';
  row.innerHTML = '<input aria-label="Deduction description" placeholder="Deduction name"><input aria-label="Deduction amount" type="number" min="0" value="0"><button class="remove-deduction" type="button" aria-label="Remove deduction" title="Remove deduction">×</button>';
  $('deductionRows').appendChild(row);
  calculate();
});

$('deductionRows').addEventListener('click', e => {
  if (e.target.classList.contains('remove-deduction') || e.target.closest('.remove-deduction')) {
    const row = e.target.closest('.deduction-row');
    if (row) {
      row.remove();
      calculate();
    }
  }
});

$('calculate').addEventListener('click', calculate);
$('deductionRows').addEventListener('input', calculate);
$('calcDeposit').addEventListener('input', calculate);

// Evidence Photo Upload preview with card presentation
$('photoUpload').addEventListener('change', e => {
  const holder = $('photoPreview');
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

// Run initial calculation and formal letter sync
calculate();
syncFormalLetter();
