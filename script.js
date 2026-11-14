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
  "Maharashtra": "In Maharashtra (Mumbai, Pune), Leave & License agreements are governed under the Maharashtra Rent Control Act, 1999. Under Section 55, agreements must be registered. Routine painting and fair wear-and-tear cannot be charged without verified documentation of tenant damage. Section 29 makes cutting off essential utilities a punishable offense.",
  "Karnataka": "In Karnataka (Bengaluru), customary demands for 6–10 months deposit contradict the Model Tenancy Act (which caps residential deposits at 2 months). Mandatory painting deductions on vacating are a frequent point of dispute and require itemised contractor proof.",
  "Delhi": "In Delhi NCR (Delhi, Gurgaon, Noida), withholding a deposit without providing contractor invoices or receipts for damage repair constitutes unlawful retention under Indian contract law.",
  "Tamil Nadu": "Tamil Nadu has enacted the Rights and Responsibilities of Landlords and Tenants Act, 2017, which regulates security deposits (capped at 3 months) and requires written, registered tenancy contracts.",
  "Telangana": "In Telangana (Hyderabad), arbitrary deductions without joint handover inspection or receipts can be contested before the local Rent Authority or Civil Court.",
  "West Bengal": "In West Bengal, premises tenancy laws mandate itemized disclosure of repair charges and protect tenants against unjustified forfeiture of deposits.",
  "All-India": "Under Section 74 of the Indian Contract Act, 1872, stipulating forfeiture or penalty without proof of actual damage or loss is not legally enforceable. Furthermore, the Model Tenancy Act, 2021 recommends a maximum 2-month security deposit for residential premises."
};

// High-Precision Verified Statutory Knowledge Base for Indian Tenancy Disputes
const VERIFIED_LAWS = [
  {
    keywords: ["expired", "expire", "lapse", "not renewed", "unrenewed", "holding over"],
    act_name: "Transfer of Property Act, 1882",
    section: "Section 111(a) & Section 116 (Determination of Lease & Holding Over)",
    summary: "When a lease period expires by efflux of time, its covenants (including lock-in restrictions and penalties) lapse automatically. Continuing occupancy with rent payment becomes a month-to-month tenancy without lock-in liability.",
    tag: "Statutory Protection",
    query: "Transfer of Property Act 1882 Section 111 Section 116 holding over expiry of lease"
  },
  {
    keywords: ["notice", "15 days", "month to month", "vacate notice", "relocating", "job transfer"],
    act_name: "Transfer of Property Act, 1882",
    section: "Section 106 (Notice to Terminate Month-to-Month Tenancy)",
    summary: "Following lease expiry or for monthly residential tenancies, a 15-day written notice expiring with the tenancy month is legally sufficient to vacate without incurring any lock-in forfeiture.",
    tag: "Notice Standards",
    query: "Transfer of Property Act 1882 Section 106 notice to quit month to month"
  },
  {
    keywords: ["lock-in", "lockin", "premature", "early exit", "forfeit", "forfeiture", "break lease", "penalty"],
    act_name: "Supreme Court Precedent & Contract Law",
    section: "Section 74 ICA & Kailash Nath Associates v. DDA (2015)",
    summary: "Liquidated damages cannot be punitive. A landlord cannot automatically seize deposits or levy early exit penalties unless they demonstrate actual, unmitigated financial vacancy loss despite reasonable efforts to re-let.",
    tag: "Judicial Precedent",
    query: "Kailash Nath Associates vs DDA Section 74 liquidated damages forfeiture"
  },
  {
    keywords: ["paint", "whitewash", "color", "repainting", "wear", "tear"],
    act_name: "Indian Contract Act, 1872",
    section: "Section 74 (Fair Wear & Tear vs Deductions)",
    summary: "Deductions for painting or routine renovation without proving tenant damage beyond fair wear and tear are regarded as an unenforceable penalty. Landlords cannot deduct fixed arbitrary sums without itemized contractor bills.",
    tag: "Contract Doctrine",
    query: "Indian Contract Act 1872 Section 74 penalty wear and tear"
  },
  {
    keywords: ["deposit", "advance", "refund", "withhold", "caution"],
    act_name: "Model Tenancy Act, 2021",
    section: "Section 11 (Security Deposit Cap & Handover Refund)",
    summary: "Recommends capping security deposits for residential properties at a maximum of two months' rent. The deposit must be refunded upon handing over vacant possession or within 30 days maximum.",
    tag: "Statutory Cap",
    query: "Model Tenancy Act 2021 Section 11 security deposit refund"
  },
  {
    keywords: ["maintenance", "repair", "structural", "seepage", "plumbing", "electrical"],
    act_name: "Transfer of Property Act, 1882",
    section: "Section 108(m) & Model Tenancy Act Schedule II",
    summary: "Major structural repairs, external seepage, major plumbing, and whitewashing are the landlord's capital duty. Minor day-to-day upkeep (light bulbs, minor washers) is the tenant's responsibility.",
    tag: "Property Law",
    query: "Transfer of Property Act 1882 Section 108 landlord repair obligations"
  },
  {
    keywords: ["escalat", "rent increase", "revision", "hike", "increment"],
    act_name: "Model Tenancy Act, 2021",
    section: "Section 9 & 10 (Revision of Rent & Notice)",
    summary: "Rent cannot be escalated arbitrarily mid-tenancy. Any rent revision requires at least three months' prior written notice before revised rent becomes payable.",
    tag: "Rent Regulation",
    query: "Model Tenancy Act 2021 Section 9 10 revision of rent notice"
  },
  {
    keywords: ["inspect", "entry", "enter", "privacy", "trespass", "access"],
    act_name: "Model Tenancy Act, 2021",
    section: "Section 17 (Right of Entry & Tenant Privacy)",
    summary: "A landlord or agent cannot enter rented premises without at least 24 hours' prior written or electronic notice, and visits must occur only between 7:00 AM and 8:00 PM for reasonable inspection.",
    tag: "Tenant Rights",
    query: "Model Tenancy Act 2021 Section 17 landlord entry 24 hour notice"
  },
  {
    keywords: ["disconnect", "cut off", "electricity", "water", "essential", "utility"],
    act_name: "State Rent Control Acts & Model Tenancy Act",
    section: "Section 20 (Withholding of Essential Services)",
    summary: "Withholding essential supplies (electricity, water, elevator) is expressly prohibited under Section 20 of MTA and is a punishable offense under State Rent Control Acts.",
    tag: "Essential Services",
    query: "Model Tenancy Act Section 20 withholding essential supply electricity water"
  },
  {
    keywords: ["evict", "eviction", "throw out", "lock out", "possession", "vacate"],
    act_name: "Specific Relief Act, 1963",
    section: "Section 6 (Suit by person dispossessed of immovable property)",
    summary: "A tenant who is forcibly dispossessed of property without due process of law can file a summary suit to recover possession immediately, even against the owner.",
    tag: "Eviction Protection",
    query: "Specific Relief Act 1963 Section 6 illegal dispossession tenant"
  },
  {
    keywords: ["platform", "co-living", "managed", "unfair", "broker", "pg", "student housing"],
    act_name: "Consumer Protection Act, 2019",
    section: "Section 2(47) (Unfair Contract Terms & Deficiency in Service)",
    summary: "Protects renters against unfair terms and service deficiencies when renting through commercial managed housing platforms, co-living operators, or rental aggregators.",
    tag: "Consumer Redressal",
    query: "Consumer Protection Act 2019 unfair contract terms tenant co-living"
  }
];

let currentCase = null;
let backendOnline = false;
let configuredBackendUrl = localStorage.getItem('clauseshield_backend') || 'http://localhost:8000';

// Upload state
let uploadedFile = null;
let uploadedFileText = '';
let currentAnalysisClauses = [];

function toast(message) {
  const el = $('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3200);
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

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function makeKanoonUrl(query) {
  return `https://indiankanoon.org/search/?formInput=${encodeURIComponent(query)}`;
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

// -------------------------------------------------------------
// Document Text Extraction (Client-Side for PDF, DOCX, TXT)
// -------------------------------------------------------------

async function extractTextFromPDF(file) {
  if (!window.pdfjsLib) {
    throw new Error('PDF library is loading. Please try again.');
  }
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  const numPages = Math.min(pdf.numPages, 20);

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += `\n[Page ${i}] ` + pageText;
  }
  return { text: fullText.trim(), pages: numPages };
}

async function extractTextFromDOCX(file) {
  if (!window.mammoth) {
    throw new Error('Word document reader is loading. Please try again.');
  }
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return { text: (result.value || '').trim(), pages: Math.max(1, Math.ceil(result.value.length / 2500)) };
}

async function extractTextFromTXT(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = evt => resolve({ text: (evt.target.result || '').trim(), pages: 1 });
    reader.onerror = err => reject(err);
    reader.readAsText(file);
  });
}

async function handleFileUpload(file) {
  if (!file) return;

  const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  if (!validExtensions.includes(ext)) {
    toast('Unsupported file. Please upload a PDF (.pdf), Word (.docx) or Text (.txt) file.');
    return;
  }

  // File size validation (15MB max)
  const maxSize = 15 * 1024 * 1024;
  if (file.size > maxSize) {
    toast(`File is too large (${formatBytes(file.size)}). Maximum supported size is 15MB.`);
    return;
  }

  uploadedFile = file;

  const dropzonePrompt = $('dropzonePrompt');
  const fileUploadStatus = $('fileUploadStatus');
  const fileNameDisplay = $('fileNameDisplay');
  const filePageDisplay = $('filePageDisplay');
  const previewBox = $('extractedPreviewBox');
  const previewText = $('extractedPreviewText');
  const charCount = $('extractedCharCount');

  if (dropzonePrompt) dropzonePrompt.hidden = true;
  if (fileUploadStatus) fileUploadStatus.hidden = false;
  if (fileNameDisplay) fileNameDisplay.textContent = file.name;
  if (filePageDisplay) filePageDisplay.textContent = `Extracting (${formatBytes(file.size)})...`;

  try {
    let result = null;
    if (ext === '.pdf') {
      result = await extractTextFromPDF(file);
    } else if (ext === '.docx' || ext === '.doc') {
      result = await extractTextFromDOCX(file);
    } else {
      result = await extractTextFromTXT(file);
    }

    uploadedFileText = result.text;

    if (filePageDisplay) {
      filePageDisplay.textContent = `${formatBytes(file.size)} · ${result.pages} page(s) · Extracted`;
    }

    if (previewBox && previewText && charCount) {
      charCount.textContent = uploadedFileText.length.toLocaleString('en-IN');
      previewText.textContent = uploadedFileText.slice(0, 3000) + (uploadedFileText.length > 3000 ? '\n\n... [remaining document text parsed in backend] ...' : '');
      previewBox.hidden = false;
    }

    if (uploadedFileText.length < 50) {
      toast('Notice: This document appears to be a scanned image with minimal selectable text. Paste the clause text directly if needed.');
    } else {
      toast(`✓ Extracted agreement text from ${file.name}`);
    }

    // Auto-detect financial details if present
    autoDetectEntities(uploadedFileText);

  } catch (err) {
    console.error('Extraction error:', err);
    if (filePageDisplay) filePageDisplay.textContent = 'Extraction notice (Backend will parse file directly)';
    toast('Client preview unavailable. Backend AI will process the file on review.');
  }
}

function autoDetectEntities(text) {
  // Rent detection
  const rentMatch = text.match(/(?:monthly\s+)?rent[^\d\n\r]{1,50}?(?:₹|rs\.?|inr)?\s*([0-9]{1,2}(?:,[0-9]{2,3})+|[0-9]{4,6})/i);
  if (rentMatch && $('rent') && !$('rent').value) {
    const val = rentMatch[1].replace(/,/g, '');
    $('rent').value = val;
  }

  // Security deposit detection
  const depMatch = text.match(/(?:security\s+deposit|caution\s+deposit|advance\s+deposit|deposit)[^\d\n\r]{1,50}?(?:₹|rs\.?|inr)?\s*([0-9]{1,2}(?:,[0-9]{2,3})+|[0-9]{4,7})/i);
  if (depMatch && $('deposit') && !$('deposit').value) {
    const val = depMatch[1].replace(/,/g, '');
    $('deposit').value = val;
    if ($('calcDeposit')) $('calcDeposit').value = val;
  }

  // Landlord name detection
  const landlordMatch = text.match(/(?:Lessor|Landlord|Licensor|Owner)(?:\s*(?:is|called|named|referred to as))?[:\s]+((?:(?:Mr\.|Mrs\.|Ms\.|Shri|Dr\.)\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/);
  if (landlordMatch && $('landlordName') && !$('landlordName').value) {
    $('landlordName').value = landlordMatch[1].trim();
  }
}

// -------------------------------------------------------------
// In-Browser Multi-Clause Legal Analyzer (Offline Fallback Engine)
// -------------------------------------------------------------

function analyzeAgreementLocally(text, state, city, monthlyRent, securityDeposit, landlordName, replyDays, docName = "Rental Agreement", amountInDispute = 0) {
  const sentences = (text || '').split(/(?<=[.!?\n])\s+/);
  const loc = (city ? `${city}, ${state}` : state).trim();
  const greeting = landlordName ? `Hi ${landlordName},` : 'Hello,';
  const formalGreeting = landlordName ? `Dear ${landlordName},` : 'Dear Landlord,';
  const landlordRef = landlordName || "[Landlord's Name]";
  const today = getFormattedDate();

  function findSentence(pattern) {
    const regex = new RegExp(pattern, 'i');
    for (const s of sentences) {
      const clean = s.trim();
      if (clean.length > 25 && clean.length < 400 && regex.test(clean)) {
        return clean.replace(/\n+/g, ' ');
      }
    }
    const match = text.match(regex);
    if (match) {
      const start = Math.max(0, match.index - 40);
      const end = Math.min(text.length, match.index + 140);
      return text.slice(start, end).replace(/\n+/g, ' ').trim();
    }
    return null;
  }

  const clauses = [];
  const isExpired = /expired|lapse|not renewed|unrenewed|efflux/i.test(text);

  // 1. Painting Clause
  const paintSent = findSentence('(?:paint|whitewash|repainting|colouring|distemper|charges? for painting)');
  if (paintSent) {
    const isFixedMonth = /one month|1 month|full month|mandatory/i.test(paintSent);
    clauses.push({
      clause_name: "Painting & Handover Deductions",
      original_text: paintSent,
      concern_level: isFixedMonth ? "High" : "Medium",
      simple_explanation: "Mandates that you pay for repainting the property upon moving out, or authorizes a fixed deduction from your security deposit.",
      why_needs_attention: "Under Indian tenancy doctrine, atmospheric wall discoloration and minor nail holes constitute normal fair wear-and-tear. Fixed painting deductions without contractor receipts or proof of actual tenant damage violate principles under Section 74 of the Indian Contract Act, 1872.",
      suggested_action: "Request dated move-in vs move-out photos and an itemised GST invoice from an external contractor before agreeing to any repainting deduction.",
      legal_reference: "Indian Contract Act, 1872 – Section 74 & Model Tenancy Act, 2021 Schedule II"
    });
  }

  // 2. Deposit Refund Timeline
  const depSent = findSentence('(?:security deposit|caution deposit|refund of deposit|deposit.*refunded|advance rent)');
  if (depSent) {
    const isDelay = /60 days|90 days|months? after|discretion of owner/i.test(depSent);
    clauses.push({
      clause_name: "Security Deposit Refund Terms",
      original_text: depSent,
      concern_level: isDelay ? "High" : "Medium",
      simple_explanation: "Specifies conditions or timeframe under which the landlord must refund your security deposit when you vacate.",
      why_needs_attention: "The Model Tenancy Act, 2021 (Section 11) caps residential security deposits at a maximum of two months' rent and requires complete refund upon physical handover or within 30 days maximum.",
      suggested_action: "Clarify in writing that the full deposit must be returned via electronic transfer within 15–30 days of physical handover following a joint move-out inspection.",
      legal_reference: "Model Tenancy Act, 2021 – Section 11 & State Rent Control Rules"
    });
  }

  // 3. Lock-in Period & Early Exit Penalty Clause
  const lockinSent = findSentence('(?:lock-in|lockin|early termination|break.*lease|forfeit.*deposit|before expiry|exit penalty)');
  if (lockinSent) {
    if (isExpired) {
      clauses.push({
        clause_name: "Expired Agreement & Early Exit Penalty Demand",
        original_text: lockinSent,
        concern_level: "High",
        simple_explanation: "The landlord is demanding an early exit or lock-in penalty on an agreement that has already expired by efflux of time and was never renewed.",
        why_needs_attention: "Under Section 111(a) of the Transfer of Property Act, 1882, a lease determines automatically upon expiry of its term. When an agreement expires without formal renewal, prior lock-in clauses and penalties are extinguished. Under Section 116, continuing occupancy converts the tenancy into a month-to-month arrangement terminable by 15 days notice (Section 106). A landlord cannot legally enforce a lock-in penalty on an expired agreement.",
        suggested_action: "Inform the landlord in writing that the 11-month agreement has expired, extinguishing any lock-in covenants. Provide 15 to 30 days notice to vacate and request full deposit return without penalty.",
        legal_reference: "Transfer of Property Act, 1882 – Section 111(a) & Section 116 (Determination of Lease & Holding Over)"
      });
    } else {
      clauses.push({
        clause_name: "Lock-in Period & Forfeiture Clause",
        original_text: lockinSent,
        concern_level: "High",
        simple_explanation: "Penalizes the tenant for vacating before a specified initial tenure, stipulating forfeiture of the entire deposit.",
        why_needs_attention: "The Supreme Court of India (Kailash Nath Associates v. DDA, 2015) ruled that damages cannot be punitive. A landlord cannot automatically seize a full deposit unless they demonstrate actual unmitigated financial loss despite reasonable efforts to re-let.",
        suggested_action: "Negotiate an early exit clause providing a reasonable 1-month notice period or the option to introduce a replacement tenant.",
        legal_reference: "Indian Contract Act, 1872 – Section 74 & Landmark Supreme Court Rulings on Mitigation"
      });
    }
  }

  // 4. Maintenance & Repairs
  const maintSent = findSentence('(?:maintenance|repairs?|structural repairs?|fixtures|leakage|seepage|electrical fittings)');
  if (maintSent) {
    clauses.push({
      clause_name: "Maintenance & Structural Repair Obligations",
      original_text: maintSent,
      concern_level: "Medium",
      simple_explanation: "Defines who pays for electrical, plumbing, structural, and ongoing building repairs during tenancy.",
      why_needs_attention: "Lease agreements often unfairly push external building seepage, major plumbing breakdown, and structural damage onto tenants. Under Section 108(m) of the Transfer of Property Act, structural repairs remain the exclusive responsibility of the owner.",
      suggested_action: "Clarify the boundary: tenant handles minor day-to-day consumables (bulbs, washers), while landlord remains responsible for structural repairs, plumbing lines, and wiring.",
      legal_reference: "Transfer of Property Act, 1882 – Section 108 & Model Tenancy Act, 2021 – Section 15"
    });
  }

  // 5. Rent Revision
  const rentSent = findSentence('(?:escalat|increase.*rent|revision.*rent|rent.*increment|10%|5%|annually)');
  if (rentSent) {
    clauses.push({
      clause_name: "Rent Revision & Annual Escalation",
      original_text: rentSent,
      concern_level: "Medium",
      simple_explanation: "Sets the percentage and frequency by which the monthly rent will increase upon agreement renewal.",
      why_needs_attention: "Under the Model Tenancy Act, rent revisions cannot be unilateral or unexpected. Landlords must give at least three months' prior notice in writing before revised rent takes effect.",
      suggested_action: "Confirm that rent revisions require 3 months advance written notice and reflect reasonable local market benchmarks.",
      legal_reference: "Model Tenancy Act, 2021 – Section 9 & 10"
    });
  }

  // 6. Landlord Entry / Inspection
  const entrySent = findSentence('(?:inspection|inspect|enter|entry|access.*premises|without.*notice|reasonable hours)');
  if (entrySent) {
    clauses.push({
      clause_name: "Landlord Entry & Tenant Privacy Rights",
      original_text: entrySent,
      concern_level: /without notice/i.test(entrySent) ? "High" : "Medium",
      simple_explanation: "Governs when and how the landlord or their representative can enter the rented premises for inspection.",
      why_needs_attention: "Tenants have a legal right to quiet enjoyment. Section 17 of the Model Tenancy Act strictly requires at least 24 hours' prior written or electronic notice, and visits must occur only between 7:00 AM and 8:00 PM.",
      suggested_action: "Ensure the clause specifies a mandatory 24-hour advance written notice and agreed appointment time for any inspection.",
      legal_reference: "Model Tenancy Act, 2021 – Section 17 & Bharatiya Nyaya Sanhita (Criminal Trespass)"
    });
  }

  // 7. Utility Disconnection
  const discSent = findSentence('(?:disconnect|cut off|stop.*electricity|water.*supply|amenities|withhold.*service)');
  if (discSent) {
    clauses.push({
      clause_name: "Essential Utilities & Service Withholding",
      original_text: discSent,
      concern_level: "High",
      simple_explanation: "Purports to allow the landlord to cut off water, electricity, or amenities if there is a dispute or delay.",
      why_needs_attention: "Cutting off water or electricity is illegal in India. Section 20 of the Model Tenancy Act and Section 29 of the Maharashtra Rent Control Act expressly prohibit disconnecting essential services, treating it as an actionable offense.",
      suggested_action: "Demand the removal of any clause that threatens disconnection of essential amenities; disputes must be resolved through established legal channels.",
      legal_reference: "Model Tenancy Act, 2021 – Section 20 & State Rent Control Acts"
    });
  }

  // Fallback clause if nothing specifically matched
  if (clauses.length === 0) {
    clauses.push({
      clause_name: "General Tenancy Covenants",
      original_text: text.slice(0, 240) || "General lease provisions regarding handover and security deposit refund.",
      concern_level: "Low",
      simple_explanation: "General tenancy terms establishing lease tenure, handover rules, and mutual covenants.",
      why_needs_attention: "All verbal promises, maintenance covenants, and deposit return terms should be clearly recorded in writing before signing.",
      suggested_action: "Verify that all move-in conditions, inventory lists, and refund deadlines are explicitly documented.",
      legal_reference: "Indian Contract Act, 1872 – Section 10 & 73"
    });
  }

  // Compute risk score
  const highCount = clauses.filter(c => c.concern_level === "High").length;
  const medCount = clauses.filter(c => c.concern_level === "Medium").length;
  const riskScore = Math.min(92, Math.max(25, 45 + (highCount * 18) + (medCount * 8)));

  const concernLevel = riskScore >= 75 ? "HIGHER CONCERN · REVIEW" : riskScore >= 60 ? "NEEDS REVIEW" : "INFORMATION CHECK";
  const verdictTitle = isExpired && clauses.some(c => c.clause_name.includes("Expired"))
    ? "Exit penalty demanded on an expired agreement warrants formal dispute objection."
    : `${clauses.length} clause(s) identified that warrant careful review.`;

  const overallSummary = isExpired && clauses.some(c => c.clause_name.includes("Expired"))
    ? `Under Indian property law, once an 11-month tenancy agreement expires by efflux of time, its lock-in covenants and early termination penalties are extinguished. Continued tenancy with rent payment converts to a periodic month-to-month arrangement determinable by 15 days notice (Transfer of Property Act, 1882 Section 111 & 116). The landlord cannot enforce an early exit penalty on an expired lease.`
    : `ClauseShield audited your document (${docName}). We identified ${clauses.length} specific clause(s) relating to security deposits, painting charges, repairs, and handover terms. Review the breakdown below to understand your statutory protections.`;

  // Matched legal references (strictly relevant)
  const legalRefs = findRelevantLawsForText(text, state);

  // WhatsApp draft
  const disputeDisplay = amountInDispute > 0 ? `₹${amountInDispute.toLocaleString('en-IN')}` : (securityDeposit > 0 ? `₹${securityDeposit.toLocaleString('en-IN')}` : "the security deposit");
  let whatsappDraft = '';

  if (isExpired && clauses.some(c => c.clause_name.includes("Expired"))) {
    whatsappDraft = `${greeting}\n\nI am writing regarding the handover and security deposit refund for our rented flat at ${loc}.\n\nRegarding the early exit penalty demanded: our 11-month agreement has already expired by efflux of time and was not formally renewed. Under Section 111(a) and Section 116 of the Transfer of Property Act, 1882, any prior lock-in period lapsed upon lease expiry, and continuing occupancy operates on a month-to-month basis terminable by 15 days notice (Section 106).\n\nI am providing written notice to vacate. Please confirm the complete refund of ${disputeDisplay} within ${replyDays} days so we can conclude the handover smoothly.\n\nThank you,\n[Your Name]`;
  } else {
    const clauseNames = clauses.slice(0, 2).map(c => c.clause_name).join(' and ');
    whatsappDraft = `${greeting}\n\nI am writing regarding the rental agreement and handover for our premises at ${loc}. I have reviewed the agreement terms regarding ${clauseNames}. To ensure a smooth and transparent handover, could you please share an itemised accounting along with supporting bills for any proposed deductions beyond standard fair wear and tear?\n\nI would like to settle ${disputeDisplay} amicably. Please let me know your thoughts within ${replyDays} days so we can confirm the remaining refund.\n\nThank you,\n[Your Name]`;
  }

  // Formal letter draft
  let quotedBlock = '';
  clauses.slice(0, 3).forEach((c, idx) => {
    quotedBlock += `${idx + 1}. ${c.clause_name}: "${c.original_text.slice(0, 140)}..."\n   -> Point for clarification: ${c.suggested_action}\n`;
  });

  const formalLetter = `Date: ${today}\n\nTo,\n${landlordRef}\n[Premises Address / Landlord Contact]\n\nSubject: Formal Notice Regarding Handover, Extinguishment of Expired Lease Covenants & Security Deposit Refund\n\n${formalGreeting}\n\nI am writing with respect to the tenancy agreement executed for the residential premises situated at ${loc}. Following an audit of our lease agreement and handover communications, I wish to place the following statutory position on record:\n\n${quotedBlock}\nUnder Section 111(a) of the Transfer of Property Act, 1882, an 11-month lease agreement determines automatically upon the expiry of its term. When an agreement has expired by efflux of time and is not formally renewed, prior lock-in covenants and early termination penalties are extinguished. Occupancy thereafter operates as a periodic tenancy by holding over under Section 116, terminable by 15 days notice under Section 106.\n\nFurthermore, under Section 74 of the Indian Contract Act, 1872 and landmark rulings of the Supreme Court of India (Kailash Nath Associates v. DDA, 2015), liquidated damages cannot be punitive and require demonstration of actual, unmitigated financial loss.\n\nAccordingly, I formally request that you:\n1. Withdraw the proposed early termination penalty of ${disputeDisplay}.\n2. Acknowledge this written notice of handover.\n3. Release the complete security deposit within ${replyDays} days of key handover.\n\nPlease provide your written confirmation within ${replyDays} days so that this matter may be concluded amicably.\n\nThis communication is without prejudice to all rights and legal remedies available under applicable law.\n\nYours sincerely,\n\n[Your Name]\n[Your Phone Number / Email Address]`;

  return {
    document_name: docName,
    total_clauses_analyzed: clauses.length,
    risk_score: riskScore,
    concern_level: concernLevel,
    verdict_title: verdictTitle,
    overall_summary: overallSummary,
    clauses: clauses,
    legal_references: legalRefs,
    state_note: STATE_CONTEXTS[state] || STATE_CONTEXTS["All-India"],
    suggested_steps: [
      "Review the quoted clause wording in the card below.",
      "Send the tailored WhatsApp response or Formal Letter citing Section 111(a) and Section 116.",
      "Provide written 15-day notice to vacate without consenting to penalty deductions.",
      "Keep all bank transfer receipts, lease copies, and handover communications organised."
    ],
    whatsapp_draft: whatsappDraft,
    formal_letter: formalLetter,
    engine_used: "ClauseShield Smart Legal Rule Engine (Offline Verified)"
  };
}

function findRelevantLawsForText(text, state) {
  const lower = (text || '').toLowerCase();
  const scored = [];
  const seen = new Set();

  for (const law of VERIFIED_LAWS) {
    const hits = law.keywords.filter(k => lower.includes(k)).length;
    if (hits > 0) {
      scored.push({ score: hits, law });
    }
  }

  // Sort by highest keyword relevance
  scored.sort((a, b) => b.score - a.score);

  const matched = [];
  for (const item of scored) {
    const law = item.law;
    if (!seen.has(law.act_name + law.section)) {
      seen.add(law.act_name + law.section);
      matched.push({
        act_name: law.act_name,
        section: law.section,
        summary: law.summary,
        tag: law.tag,
        source_url: makeKanoonUrl(law.query)
      });
    }
  }

  // Add State act ONLY if the topic is directly relevant to that state act
  const isUtilityIssue = /electric|water|utility|disconnect|cut off/i.test(lower);
  const isRegistrationIssue = /register|registration|stamp|unregistered/i.test(lower);
  const isDepositIssue = /10 month|ten month|large deposit/i.test(lower);

  if (state === "Maharashtra" && isUtilityIssue && !seen.has("Maharashtra Rent Control Act")) {
    matched.push({
      act_name: "Maharashtra Rent Control Act, 1999",
      section: "Section 29 (Cutting off or withholding essential supply)",
      summary: "Makes it an offense punishable with fine or imprisonment for a landlord to cut off water or electricity supply without just cause.",
      tag: "State Act",
      source_url: makeKanoonUrl("Maharashtra Rent Control Act 1999 Section 29 essential supply")
    });
  } else if (state === "Maharashtra" && isRegistrationIssue && !seen.has("Maharashtra Rent Control Act")) {
    matched.push({
      act_name: "Maharashtra Rent Control Act, 1999",
      section: "Section 55 (Tenancy Agreement Registration)",
      summary: "Requires Leave & License agreements to be registered in writing; the responsibility of registration lies primarily on the landlord.",
      tag: "State Act",
      source_url: makeKanoonUrl("Maharashtra Rent Control Act 1999 Section 55 registration")
    });
  } else if (state === "Delhi" && isUtilityIssue && !seen.has("Delhi Rent Control Act")) {
    matched.push({
      act_name: "Delhi Rent Control Act, 1958",
      section: "Section 45 (Cutting off or withholding essential supply)",
      summary: "Empowers the Rent Controller to order immediate restoration of water or electricity if withheld by the landlord, and penalize the landlord.",
      tag: "State Act",
      source_url: makeKanoonUrl("Delhi Rent Control Act 1958 Section 45 essential supply")
    });
  } else if (state === "Karnataka" && isDepositIssue && !seen.has("Karnataka Tenancy Framework")) {
    matched.push({
      act_name: "Karnataka Rent Guidelines & MTA Adoption",
      section: "Doctrine on Disproportionate Security Deposits",
      summary: "Challenges customary 10-month rental deposits and unilateral move-out deductions as conflicting with equitable contract principles.",
      tag: "State Practice",
      source_url: makeKanoonUrl("Karnataka high court tenant security deposit refund ordinary wear")
    });
  }

  // If completely empty, provide standard baseline
  if (matched.length === 0) {
    matched.push({
      act_name: "Indian Contract Act, 1872",
      section: "Section 73 & Section 74",
      summary: "Deductions from a security deposit cannot be arbitrary or punitive. The landlord is only entitled to compensation for actual, proven damages resulting from a breach.",
      tag: "Contract Law",
      source_url: makeKanoonUrl("Indian Contract Act 1872 Section 74 liquidated damages")
    });
    matched.push({
      act_name: "Model Tenancy Act, 2021",
      section: "General Provisions & Schedule II",
      summary: "Provides modern national guidelines governing residential deposits, mutual repair covenants, and dispute settlement between tenants and landlords.",
      tag: "Model Framework",
      source_url: makeKanoonUrl("Model Tenancy Act 2021 Government of India")
    });
  }

  // Return the top 2-3 most precise laws so it is focused and never messy
  return matched.slice(0, 3);
}

// -------------------------------------------------------------
// UI Rendering Functions
// -------------------------------------------------------------

function renderClauseCards(clauses) {
  currentAnalysisClauses = clauses || [];
  const container = $('clauseCardsContainer');
  const filterBar = $('clauseFilterBar');
  if (!container) return;

  const allCount = currentAnalysisClauses.length;
  const highCount = currentAnalysisClauses.filter(c => c.concern_level === 'High').length;
  const medCount = currentAnalysisClauses.filter(c => c.concern_level === 'Medium').length;
  const lowCount = currentAnalysisClauses.filter(c => c.concern_level === 'Low').length;

  // If only 1 clause exists, hide the filter bar to keep the UI clean
  if (filterBar) {
    if (allCount <= 1) {
      filterBar.style.display = 'none';
    } else {
      filterBar.style.display = 'flex';
      // Toggle individual filter buttons
      const btnAll = document.querySelector('.clause-filter-btn[data-filter="all"]');
      const btnHigh = document.querySelector('.clause-filter-btn[data-filter="High"]');
      const btnMed = document.querySelector('.clause-filter-btn[data-filter="Medium"]');
      const btnLow = document.querySelector('.clause-filter-btn[data-filter="Low"]');

      if ($('countAll')) $('countAll').textContent = allCount;
      if ($('countHigh')) $('countHigh').textContent = highCount;
      if ($('countMedium')) $('countMedium').textContent = medCount;
      if ($('countLow')) $('countLow').textContent = lowCount;

      if (btnHigh) btnHigh.style.display = highCount > 0 ? 'inline-block' : 'none';
      if (btnMed) btnMed.style.display = medCount > 0 ? 'inline-block' : 'none';
      if (btnLow) btnLow.style.display = lowCount > 0 ? 'inline-block' : 'none';
    }
  }

  filterAndRenderClauses('all');
}

function filterAndRenderClauses(filter) {
  const container = $('clauseCardsContainer');
  if (!container) return;

  const filtered = filter === 'all'
    ? currentAnalysisClauses
    : currentAnalysisClauses.filter(c => c.concern_level === filter);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="panel" style="text-align:center;padding:30px;color:var(--muted);">
        <p>No clauses found matching the "${filter}" filter.</p>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map((c, i) => {
    const concernClass = c.concern_level.toLowerCase();
    const badgeClass = concernClass;
    const badgeText = `${c.concern_level} Concern`;
    const legalTagHTML = c.legal_reference
      ? `<span class="clause-legal-tag">⚖️ ${escapeHTML(c.legal_reference)}</span>`
      : '';

    // Clean up quote text: strip leading and trailing quotes to prevent double-quotes
    const cleanQuote = String(c.original_text || '')
      .replace(/^[\s"'“”]+|[\s"'“”]+$/g, '')
      .trim();

    return `
      <article class="clause-card concern-${concernClass}">
        <div class="clause-card-header">
          <h3 class="clause-card-title">${escapeHTML(c.clause_name)}</h3>
          <span class="concern-badge ${badgeClass}">${badgeText}</span>
        </div>

        <div class="clause-quote-box">
          <span class="clause-quote-label">Original wording from agreement:</span>
          "${escapeHTML(cleanQuote)}"
        </div>

        <div class="clause-details-grid">
          <div class="clause-detail-item">
            <strong>💡 What this clause means:</strong>
            <p>${escapeHTML(c.simple_explanation)}</p>
          </div>
          <div class="clause-detail-item">
            <strong>⚠️ Why it needs attention:</strong>
            <p>${escapeHTML(c.why_needs_attention)}</p>
          </div>
        </div>

        <div class="clause-action-box">
          <strong>📋 Suggested action for the tenant:</strong>
          <p>${escapeHTML(c.suggested_action)}</p>
        </div>

        ${legalTagHTML ? `<div style="margin-top:10px;">${legalTagHTML}</div>` : ''}
      </article>
    `;
  }).join('');
}

// Filter buttons handler
document.querySelectorAll('.clause-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.clause-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterAndRenderClauses(btn.dataset.filter);
  });
});

function renderDynamicLaws(laws) {
  const container = $('dynamicLegalCards');
  if (!container) return;

  if (!laws || laws.length === 0) {
    laws = VERIFIED_LAWS.slice(0, 2).map(l => ({
      act_name: l.act_name,
      section: l.section,
      summary: l.summary,
      tag: l.tag,
      source_url: makeKanoonUrl(l.query)
    }));
  }

  // Update badge count
  if ($('legalCountBadge')) {
    $('legalCountBadge').textContent = `${laws.length} Provision${laws.length === 1 ? '' : 's'}`;
  }

  container.innerHTML = laws.map(l => `
    <div class="legal-card">
      <span class="legal-tag">${escapeHTML(l.tag || 'Statutory Provision')}</span>
      <h3>${escapeHTML(l.act_name)} – ${escapeHTML(l.section)}</h3>
      <p>${escapeHTML(l.summary)}</p>
      ${l.source_url ? `<a href="${l.source_url}" target="_blank" rel="noopener noreferrer" class="legal-card-link">🌐 View on Indian Kanoon & Bare Act ↗</a>` : ''}
    </div>
  `).join('');
}

// -------------------------------------------------------------
// Mode Switcher (File Upload vs Text)
// -------------------------------------------------------------

function switchInputMode(mode) {
  const fileModeBtn = document.querySelector('.mode-tab[data-mode="file"]');
  const textModeBtn = document.querySelector('.mode-tab[data-mode="text"]');
  const fileContainer = $('fileUploadContainer');
  const textContainer = $('textInputContainer');

  if (mode === 'file') {
    if (fileModeBtn) fileModeBtn.classList.add('active');
    if (textModeBtn) textModeBtn.classList.remove('active');
    if (fileContainer) fileContainer.hidden = false;
    if (textContainer) textContainer.hidden = true;
  } else {
    if (fileModeBtn) fileModeBtn.classList.remove('active');
    if (textModeBtn) textModeBtn.classList.add('active');
    if (fileContainer) fileContainer.hidden = true;
    if (textContainer) textContainer.hidden = false;
  }
}

document.querySelectorAll('.mode-tab').forEach(tab => {
  tab.addEventListener('click', () => switchInputMode(tab.dataset.mode));
});

// Dropzone file input listeners
const leaseFileInput = $('leaseFileInput');
const leaseDropzone = $('fileUploadContainer');

if (leaseFileInput) {
  leaseFileInput.addEventListener('change', e => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  });
}

if (leaseDropzone) {
  ['dragenter', 'dragover'].forEach(name => {
    leaseDropzone.addEventListener(name, e => {
      e.preventDefault();
      leaseDropzone.classList.add('dragover');
    });
  });
  ['dragleave', 'drop'].forEach(name => {
    leaseDropzone.addEventListener(name, e => {
      e.preventDefault();
      leaseDropzone.classList.remove('dragover');
    });
  });
  leaseDropzone.addEventListener('drop', e => {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  });
}

const removeFileBtn = $('removeFileBtn');
if (removeFileBtn) {
  removeFileBtn.addEventListener('click', e => {
    e.stopPropagation();
    uploadedFile = null;
    uploadedFileText = '';
    if (leaseFileInput) leaseFileInput.value = '';
    $('dropzonePrompt').hidden = false;
    $('fileUploadStatus').hidden = true;
    if ($('extractedPreviewBox')) $('extractedPreviewBox').hidden = true;
    toast('Agreement file removed');
  });
}

const togglePreviewBtn = $('togglePreviewTextBtn');
if (togglePreviewBtn) {
  togglePreviewBtn.addEventListener('click', () => {
    const textEl = $('extractedPreviewText');
    if (!textEl) return;
    textEl.hidden = !textEl.hidden;
    togglePreviewBtn.textContent = textEl.hidden ? 'Show Preview' : 'Hide Preview';
  });
}

// -------------------------------------------------------------
// Primary Audit Execution (Hybrid: Backend API + In-Browser Fallback)
// -------------------------------------------------------------

$('runAudit').addEventListener('click', async () => {
  const activeModeTab = document.querySelector('.mode-tab.active');
  const isFileMode = activeModeTab && activeModeTab.dataset.mode === 'file';

  const state = $('stateSelect') ? $('stateSelect').value : 'All-India';
  const city = $('city') ? $('city').value.trim() : '';
  const rent = Number($('rent').value) || 0;
  const deposit = Number($('deposit').value) || 0;
  const deduction = Number($('deduction').value) || 0;
  const landlordName = $('landlordName') ? $('landlordName').value.trim() : '';
  const replyDays = Math.max(1, Number($('deadline').value) || 7);

  let textToAudit = '';
  let docName = 'Rental Agreement';

  if (isFileMode && uploadedFile) {
    docName = uploadedFile.name;
    textToAudit = uploadedFileText || '';
  } else if (!isFileMode && $('messageInput').value.trim()) {
    textToAudit = $('messageInput').value.trim();
    docName = 'Rental Query';
  } else if (uploadedFileText) {
    textToAudit = uploadedFileText;
    docName = uploadedFile ? uploadedFile.name : 'Uploaded Document';
  } else {
    toast('Please upload your rental agreement (.pdf or .docx) or type your rental problem first.');
    return;
  }

  const runBtn = $('runAudit');
  const loadingIndicator = $('loadingIndicator');
  const loadingTitle = $('loadingTitle');
  const loadingSubtitle = $('loadingSubtitle');

  runBtn.disabled = true;
  if (loadingIndicator) loadingIndicator.hidden = false;
  if (loadingTitle) loadingTitle.textContent = 'Analyzing Rental Agreement...';
  if (loadingSubtitle) loadingSubtitle.textContent = 'Extracting document clauses and evaluating Indian legal protections...';

  let auditResult = null;

  // 1. Attempt Backend AI Analysis if backend is online
  if (backendOnline) {
    try {
      const formData = new FormData();
      if (uploadedFile) {
        formData.append('file', uploadedFile);
      }
      formData.append('agreement_text', textToAudit);
      formData.append('state', state);
      formData.append('city', city);
      formData.append('monthly_rent', rent);
      formData.append('security_deposit', deposit);
      formData.append('amount_in_dispute', deduction);
      formData.append('landlord_name', landlordName);
      formData.append('reply_days', replyDays);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(`${configuredBackendUrl}/api/analyze-agreement`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        auditResult = await res.json();
      }
    } catch (e) {
      console.warn('Backend call failed or timed out. Falling back to in-browser legal rule engine.', e);
    }
  }

  // 2. Fallback to In-Browser Engine if backend was offline or failed
  if (!auditResult) {
    auditResult = analyzeAgreementLocally(textToAudit, state, city, rent, deposit, landlordName, replyDays, docName, deduction);
  }

  // 3. Render Results into Interface
  $('riskLabel').textContent = auditResult.concern_level || 'NEEDS REVIEW';
  $('verdictTitle').textContent = auditResult.verdict_title;
  $('verdictReason').textContent = auditResult.overall_summary;
  $('moneyValue').textContent = formatINR(deduction > 0 ? deduction : auditResult.extracted_deposit || deposit);

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

  // Render Individual Clause Cards
  renderClauseCards(auditResult.clauses || []);

  // Render Dynamic Legal Provisions (Precise & Focused)
  renderDynamicLaws(auditResult.legal_references || []);

  // Populate Drafts
  $('whatsappText').value = auditResult.whatsapp_draft;
  $('formalText').value = auditResult.formal_letter;
  syncFormalLetter();

  // Reset loading indicator
  runBtn.disabled = false;
  if (loadingIndicator) loadingIndicator.hidden = true;

  // Display results section and smoothly scroll
  $('results').hidden = false;
  $('results').scrollIntoView({ behavior: 'smooth' });

  toast('✓ Analysis complete');
});

// Demo scenarios loader
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

  switchInputMode('text');
  $('audit').scrollIntoView({ behavior: 'smooth' });
  toast('Demo scenario loaded');
}

document.querySelectorAll('[data-case]').forEach(b => {
  b.addEventListener('click', () => loadCase(b.dataset.case));
});

$('scenario').addEventListener('change', e => {
  if (e.target.value) loadCase(e.target.value);
});

$('tryDemo').addEventListener('click', () => loadCase('painting'));

// Mobile menu toggle
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

// Legal References disclosure toggle
if ($('legalToggle')) {
  $('legalToggle').addEventListener('click', () => {
    const d = $('legalDetails');
    if (!d) return;
    d.hidden = !d.hidden;
    $('legalToggle').setAttribute('aria-expanded', String(!d.hidden));
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

// WhatsApp Direct Share
if ($('whatsappLink')) {
  $('whatsappLink').addEventListener('click', e => {
    e.preventDefault();
    const text = $('whatsappText').value.trim();
    if (!text) {
      toast('Generate a message first.');
      return;
    }
    const url = 'https://wa.me/?text=' + encodeURIComponent(text);
    window.open(url, '_blank', 'noopener,noreferrer');
  });
}

// Sync formal letter live
if ($('formalText')) $('formalText').addEventListener('input', syncFormalLetter);

// Print / PDF Export
if ($('printLetter')) {
  $('printLetter').addEventListener('click', () => {
    syncFormalLetter();
    window.print();
  });
}

// -------------------------------------------------------------
// Calculator Functionality (Preserved & Enhanced)
// -------------------------------------------------------------

function calculate() {
  const deposit = Number($('calcDeposit').value) || 0;
  const rows = document.querySelectorAll('#deductionRows .deduction-row');
  let total = 0;
  rows.forEach(r => {
    const inputs = r.querySelectorAll('input');
    const val = Number(inputs[1].value) || 0;
    total += val;
  });
  const balance = deposit - total;
  $('totalDeductions').textContent = formatINR(total);
  const balEl = $('balance');
  balEl.textContent = formatINR(balance);
  balEl.className = 'calc-number ' + (balance >= 0 ? 'green' : 'red');
}

if ($('calculate')) $('calculate').addEventListener('click', calculate);

if ($('addDeduction')) {
  $('addDeduction').addEventListener('click', () => {
    const container = $('deductionRows');
    const row = document.createElement('div');
    row.className = 'deduction-row';
    row.innerHTML = `
      <input aria-label="Deduction description" placeholder="Deduction item">
      <input aria-label="Deduction amount" type="number" min="0" placeholder="0">
      <button class="remove-deduction" type="button" aria-label="Remove deduction" title="Remove deduction">×</button>
    `;
    container.appendChild(row);
  });
}

if ($('deductionRows')) {
  $('deductionRows').addEventListener('click', e => {
    if (e.target.classList.contains('remove-deduction')) {
      const rows = document.querySelectorAll('#deductionRows .deduction-row');
      if (rows.length > 1) {
        e.target.closest('.deduction-row').remove();
        calculate();
      } else {
        toast('At least one deduction row is required.');
      }
    }
  });
}

// -------------------------------------------------------------
// Wear & Tear Evidence Photos (Preserved)
// -------------------------------------------------------------

const photoUpload = $('photoUpload');
const photoPreview = $('photoPreview');

if (photoUpload && photoPreview) {
  photoUpload.addEventListener('change', e => {
    const files = e.target.files;
    photoPreview.innerHTML = '';
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = evt => {
        const card = document.createElement('div');
        card.className = 'photo-card';
        card.innerHTML = `
          <img src="${evt.target.result}" alt="${escapeHTML(file.name)}">
          <div class="photo-card-name" title="${escapeHTML(file.name)}">${escapeHTML(file.name)}</div>
        `;
        photoPreview.appendChild(card);
      };
      reader.readAsDataURL(file);
    });
    toast(`Added ${files.length} photo(s) for local preview`);
  });
}

// Initialise on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  checkBackendStatus();
  calculate();
  syncFormalLetter();
  // Render baseline laws in disclosure
  renderDynamicLaws();
});
