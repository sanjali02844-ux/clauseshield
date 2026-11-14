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
    summary: "When your rental agreement expires, all lock-in periods and exit penalties end automatically. If you stay on and pay rent, you are only required to give standard written notice, and the landlord cannot charge you an early exit fee.",
    tag: "Statutory Protection",
    query: "Transfer of Property Act 1882 Section 111 Section 116 holding over expiry of lease"
  },
  {
    keywords: ["notice", "15 days", "month to month", "vacate notice", "relocating", "job transfer"],
    act_name: "Transfer of Property Act, 1882",
    section: "Section 106 (Notice to Terminate Month-to-Month Tenancy)",
    summary: "When an agreement has expired or is on a month-to-month basis, a 15-day written notice to vacate is legally sufficient, and no lock-in penalty can be imposed.",
    tag: "Notice Standards",
    query: "Transfer of Property Act 1882 Section 106 notice to quit month to month"
  },
  {
    keywords: ["lock-in", "lockin", "premature", "early exit", "forfeit", "forfeiture", "break lease", "penalty"],
    act_name: "Supreme Court Precedent & Contract Law",
    section: "Section 74 ICA & Kailash Nath Associates v. DDA (2015)",
    summary: "The Supreme Court of India ruled that a landlord cannot keep a tenant's deposit just because the agreement mentions a penalty. The landlord must prove they suffered real financial loss, and they must try to re-rent the property to minimize any vacancy.",
    tag: "Judicial Precedent",
    query: "Kailash Nath Associates vs DDA Section 74 liquidated damages forfeiture"
  },
  {
    keywords: ["paint", "whitewash", "color", "repainting", "wear", "tear"],
    act_name: "Indian Contract Act, 1872",
    section: "Section 74 (Fair Wear & Tear vs Deductions)",
    summary: "Normal paint fading and wall scuffs are fair wear and tear. Deducting money or demanding 1 month's rent for painting without proving tenant damage and showing actual GST bills is illegal.",
    tag: "Contract Doctrine",
    query: "Indian Contract Act 1872 Section 74 penalty wear and tear"
  },
  {
    keywords: ["deposit", "advance", "refund", "withhold", "caution"],
    act_name: "Model Tenancy Act, 2021",
    section: "Section 11 (Security Deposit Cap & Handover Refund)",
    summary: "Caps residential deposits at maximum 2 months' rent. The landlord must refund the deposit upon key handover (or within 30 days max) after fair, agreed adjustments.",
    tag: "Statutory Cap",
    query: "Model Tenancy Act 2021 Section 11 security deposit refund"
  },
  {
    keywords: ["maintenance", "repair", "structural", "seepage", "plumbing", "electrical"],
    act_name: "Transfer of Property Act, 1882",
    section: "Section 108(m) & Model Tenancy Act Schedule II",
    summary: "Structural repairs, wall seepage, and main plumbing belong to the landlord. Tenants are only responsible for day-to-day minor consumables like light bulbs and tap washers.",
    tag: "Property Law",
    query: "Transfer of Property Act 1882 Section 108 landlord repair obligations"
  },
  {
    keywords: ["escalat", "rent increase", "revision", "hike", "increment"],
    act_name: "Model Tenancy Act, 2021",
    section: "Section 9 & 10 (Revision of Rent & Notice)",
    summary: "Rent cannot be increased mid-tenancy or without advance notice. Landlords must give at least 3 months' written notice before any rent increase can take effect.",
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
let configuredBackendUrl = (window.location.origin && window.location.origin.startsWith('http') && !window.location.origin.includes('github.io'))
  ? window.location.origin
  : (localStorage.getItem('clauseshield_backend') || 'http://localhost:8000');

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

// Automatically probe and connect to FastAPI backend in the background
async function checkBackendStatus() {
  const origin = (window.location.origin && window.location.origin.startsWith('http')) ? window.location.origin : '';
  const candidates = [origin, configuredBackendUrl, 'http://127.0.0.1:8000', 'http://localhost:8000'].filter(Boolean);
  const seen = new Set();

  for (const url of candidates) {
    if (seen.has(url)) continue;
    seen.add(url);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(`${url}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        backendOnline = true;
        configuredBackendUrl = url;
        return true;
      }
    } catch (e) {
      // Continue to next candidate
    }
  }

  backendOnline = false;
  return false;
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
      simple_explanation: "Requires you to pay for repainting the entire flat or allows the landlord to deduct a fixed amount (like one month's rent) from your deposit when moving out.",
      why_needs_attention: "Normal paint fading, minor scuffs, and small nail holes are legally considered 'fair wear and tear' from everyday living. In India, owners are responsible for regular upkeep. Automatic deductions without proof of actual wall damage or GST contractor invoices are unjustified under Section 74 of the Indian Contract Act.",
      suggested_action: "Step 1: On your last day, take clear date-stamped photos and a video of all walls in bright light.\nStep 2: Inform the landlord that normal paint fading is fair wear-and-tear.\nStep 3: If they insist on a deduction, ask for an itemized GST bill and proof of damage caused by you.\nStep 4: Use our WhatsApp draft below to decline arbitrary painting deductions.",
      legal_reference: "Indian Contract Act, 1872 – Section 74 & Model Tenancy Act (Fair Wear & Tear)"
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
      simple_explanation: "Sets how much security deposit you pay and when the landlord must transfer your money back after you hand over keys.",
      why_needs_attention: "Landlords often delay returning deposits for months or make unreasonable last-minute deductions. The Model Tenancy Act (Section 11) caps residential deposits at 2 months' rent and requires the full deposit to be refunded at the time of key handover (or within 30 days maximum).",
      suggested_action: "Step 1: Request a joint inspection walk-through 2 days before move-out so any issues are discussed upfront.\nStep 2: Pay all final electricity and water bills and keep payment receipts ready.\nStep 3: Hand over keys only against a written or WhatsApp handover receipt.\nStep 4: Demand the balance deposit transferred to your bank account within 7 to 14 days.",
      legal_reference: "Model Tenancy Act, 2021 – Section 11 (Mandatory Deposit Refund)"
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
        simple_explanation: "Your original 11-month rental agreement has ended. Because it was never formally renewed, any lock-in period and early exit penalties expired with it. You are now free to vacate by giving standard notice without paying any penalty.",
        why_needs_attention: "Your landlord has NO legal right to charge a ₹10,000 penalty or deduct it from your deposit. Under Indian law (Transfer of Property Act, Sec 111 & 116), once a lease term ends, all penalty restrictions end. You only pay rent for the actual days you stay and give notice.",
        suggested_action: "Step 1: Do not agree to the ₹10,000 deduction on calls or texts.\nStep 2: Give 15 to 30 days written notice to vacate stating your official move-out date.\nStep 3: Send our pre-written response politely explaining that lock-in rules ended when the agreement expired.\nStep 4: Take move-out photos/videos and demand your full security deposit refund within 7–14 days of handing over keys.",
        legal_reference: "Transfer of Property Act, 1882 – Section 111(a) & Section 116 (Expired Agreement Protection)"
      });
    } else {
      clauses.push({
        clause_name: "Lock-in Period & Deposit Forfeiture Clause",
        original_text: lockinSent,
        concern_level: "High",
        simple_explanation: "The agreement requires you to stay for a minimum lock-in period and threatens to forfeit your deposit or charge a penalty if you move out early.",
        why_needs_attention: "A landlord cannot arbitrarily confiscate your entire deposit or charge heavy penalties. The Supreme Court of India ruled that a landlord can only claim compensation if they suffer genuine financial loss (such as a vacant flat after making real efforts to find a replacement).",
        suggested_action: "Step 1: Give 30 days written notice explaining your genuine need to move (job transfer, emergency).\nStep 2: Offer to help find a replacement tenant (post on flatmate groups) to prevent any rent loss for the owner.\nStep 3: If a replacement is found, the landlord suffers zero loss and must return your deposit in full.\nStep 4: If the landlord still insists on keeping your deposit, send our formal legal letter citing Supreme Court loss mitigation rules.",
        legal_reference: "Indian Contract Act, 1872 – Section 74 & Supreme Court Precedents (Penalties Cannot Be Punitive)"
      });
    }
  }

  // 4. Maintenance & Repairs
  const maintSent = findSentence('(?:maintenance|repairs?|structural repairs?|fixtures|leakage|seepage|electrical fittings)');
  if (maintSent) {
    clauses.push({
      clause_name: "Maintenance & Repair Obligations",
      original_text: maintSent,
      concern_level: "Medium",
      simple_explanation: "Defines who pays for electrical, plumbing, wall seepage, and structural building repairs during your stay.",
      why_needs_attention: "Agreements often try to force tenants to pay for heavy structural repairs, old pipe leaks, or seepage. Under Indian law, structural upkeep, external painting, and primary plumbing belong strictly to the property owner; tenants only handle minor routine items (like changing light bulbs).",
      suggested_action: "Step 1: Report any leakage, seepage, or electrical breakdown immediately in writing with photos/videos.\nStep 2: If the landlord delays repairs, remind them in writing that structural maintenance is the owner's responsibility under tenancy law.\nStep 3: If urgent repairs are ignored, you have the right to get it fixed and adjust the documented bill from the rent.",
      legal_reference: "Transfer of Property Act, 1882 – Section 108 & Model Tenancy Act, 2021 – Section 15"
    });
  }

  // 5. Rent Revision
  const rentSent = findSentence('(?:escalat|increase.*rent|revision.*rent|rent.*increment|10%|5%|annually)');
  if (rentSent) {
    clauses.push({
      clause_name: "Rent Revision & Escalation Terms",
      original_text: rentSent,
      concern_level: "Medium",
      simple_explanation: "Specifies how much and how often the landlord can increase your monthly rent upon lease renewal.",
      why_needs_attention: "Landlords cannot arbitrarily raise rent without warning or mid-agreement. Under the Model Tenancy Act, landlords must provide at least 3 months' written notice before any revised rent can take effect.",
      suggested_action: "Step 1: Confirm that rent can only increase upon renewal, never mid-tenancy.\nStep 2: Require 3 months advance written notice before accepting any proposed increase.\nStep 3: Compare market rates for similar flats in your society before agreeing to high increases.",
      legal_reference: "Model Tenancy Act, 2021 – Section 9 & 10 (Mandatory 3 Months Notice)"
    });
  }

  // 6. Landlord Entry / Inspection
  const entrySent = findSentence('(?:inspection|inspect|enter|entry|access.*premises|without.*notice|reasonable hours)');
  if (entrySent) {
    clauses.push({
      clause_name: "Landlord Entry & Privacy Rights",
      original_text: entrySent,
      concern_level: /without notice/i.test(entrySent) ? "High" : "Medium",
      simple_explanation: "Sets out the rules for when the landlord can enter your rented home for inspections or repairs.",
      why_needs_attention: "You are paying rent for peaceful possession and complete personal privacy. A landlord cannot drop in unannounced or demand entry whenever they like. Under Section 17 of the Model Tenancy Act, the landlord must give at least 24 hours prior written notice and visit only between 7:00 AM and 8:00 PM.",
      suggested_action: "Step 1: Insist on a mandatory 24-hour advance notice in writing before any visit.\nStep 2: Request that inspections be scheduled only at mutually agreed times when you or your family are home.\nStep 3: Keep entry records and decline unannounced drop-ins politely.",
      legal_reference: "Model Tenancy Act, 2021 – Section 17 (24-Hour Advance Written Notice Required)"
    });
  }

  // 7. Utility Disconnection
  const discSent = findSentence('(?:disconnect|cut off|stop.*electricity|water.*supply|amenities|withhold.*service)');
  if (discSent) {
    clauses.push({
      clause_name: "Essential Utilities & Disconnection Threat",
      original_text: discSent,
      concern_level: "High",
      simple_explanation: "Mentions cutting off electricity, water, or lift access if there is a dispute or rent delay.",
      why_needs_attention: "Cutting off water or electricity is strictly illegal under Indian law, even if rent is delayed. State Rent Control Acts empower rent authorities to order immediate reconnection and penalize landlords who cut essential utilities.",
      suggested_action: "Step 1: Immediately send a written message that withholding essential utilities is a punishable offense under state tenancy law.\nStep 2: Clear any undisputed utility bills and keep proof.\nStep 3: If utilities are cut, file an urgent complaint with the local Rent Authority or police station for immediate restoration.",
      legal_reference: "Model Tenancy Act, 2021 – Section 20 & State Rent Control Acts"
    });
  }

  // Fallback clause if nothing specifically matched
  if (clauses.length === 0) {
    clauses.push({
      clause_name: "General Lease Terms Review",
      original_text: text.slice(0, 240) || "General lease provisions regarding handover and security deposit refund.",
      concern_level: "Low",
      simple_explanation: "We reviewed your situation and agreement text to check for common tenant dispute risks regarding deposits, notice periods, and move-out deductions.",
      why_needs_attention: "Tenancy disputes in India usually arise from verbal promises or unclear handover rules. Under the Indian Contract Act, any deposit deduction must be based on proven financial loss, not arbitrary penalties.",
      suggested_action: "Step 1: Ensure all agreements and move-out notices are communicated in writing (WhatsApp/Email).\nStep 2: Take clear date-stamped photos of the apartment before vacating.\nStep 3: Do not agree to verbal deductions; ask for written invoices for any claimed expense.",
      legal_reference: "Indian Contract Act, 1872 & Model Tenancy Act, 2021"
    });
  }

  // Compute risk score
  const highCount = clauses.filter(c => c.concern_level === "High").length;
  const medCount = clauses.filter(c => c.concern_level === "Medium").length;
  const riskScore = Math.min(92, Math.max(25, 45 + (highCount * 18) + (medCount * 8)));

  const concernLevel = riskScore >= 75 ? "HIGHER CONCERN · REVIEW" : riskScore >= 60 ? "NEEDS REVIEW" : "INFORMATION CHECK";
  const verdictTitle = isExpired && clauses.some(c => c.clause_name.includes("Expired"))
    ? "No early exit penalty applies: your expired agreement cannot enforce lock-in fines."
    : `${clauses.length} clause(s) identified that warrant careful review.`;

  const overallSummary = isExpired && clauses.some(c => c.clause_name.includes("Expired"))
    ? "Good news: Under Indian law, because your 11-month agreement already expired and was never formally renewed, all lock-in periods and early exit penalties are completely void. You are legally free to move out by giving standard notice (15 to 30 days), and your landlord has NO legal basis to deduct the early exit penalty."
    : `ClauseShield analyzed your rental document (${docName}). We identified ${clauses.length} key area(s) concerning security deposits, wear-and-tear deductions, repairs, and notice rules under Indian tenancy law. Follow the clear step-by-step action plan below to protect your money.`;

  // Matched legal references (strictly relevant)
  const legalRefs = findRelevantLawsForText(text, state);

  // WhatsApp draft
  const depositDisplay = securityDeposit > 0 ? `₹${securityDeposit.toLocaleString('en-IN')}` : "my full security deposit";
  const penaltyDisplay = amountInDispute > 0 ? `₹${amountInDispute.toLocaleString('en-IN')}` : "the early exit penalty";
  let whatsappDraft = '';

  if (isExpired && clauses.some(c => c.clause_name.includes("Expired"))) {
    whatsappDraft = `${greeting}\n\nI am writing regarding my move-out and the security deposit refund for the flat at ${loc}.\n\nRegarding the ${penaltyDisplay}: Our 11-month rental agreement already expired and was not formally renewed. Under Indian law (Transfer of Property Act, Section 111 & 116), once an agreement expires, all lock-in periods and exit penalties end with it. Since there is no active contract, no early exit penalty applies.\n\nI am formally giving written notice to vacate on [Move-out Date]. I will hand over the flat clean and in good order.\n\nPlease confirm that my complete security deposit of ${depositDisplay} will be refunded in full upon key handover. Let me know a convenient time for our final walk-through.\n\nThank you,\n[Your Name]`;
  } else {
    const clauseNames = clauses.slice(0, 2).map(c => c.clause_name).join(' and ');
    const disputeDisplay = amountInDispute > 0 ? `₹${amountInDispute.toLocaleString('en-IN')}` : depositDisplay;
    whatsappDraft = `${greeting}\n\nI am writing regarding our rental agreement and move-out handover for the flat at ${loc}.\n\nRegarding our discussion on ${clauseNames}: I want to ensure a smooth, transparent handover. As per standard tenancy norms, regular paint fading and normal living wear are fair wear-and-tear. Could you please share an itemised accounting along with contractor receipts for any proposed deductions?\n\nI would like to settle ${disputeDisplay} amicably and receive the balance refund upon key handover. Please let me know your thoughts within ${replyDays} days.\n\nThank you,\n[Your Name]`;
  }

  // Formal letter draft
  let quotedBlock = '';
  clauses.slice(0, 3).forEach((c, idx) => {
    const firstLineAction = c.suggested_action.includes('\n') ? c.suggested_action.split('\n')[0] : c.suggested_action;
    quotedBlock += `${idx + 1}. ${c.clause_name}: "${c.original_text.slice(0, 140)}..."\n   -> Point for clarification: ${firstLineAction}\n`;
  });

  const formalLetter = (isExpired && clauses.some(c => c.clause_name.includes("Expired")))
    ? `Date: ${today}\n\nTo,\n${landlordRef}\n[Premises Address / Landlord Contact]\n\nSubject: Formal Notice of Move-Out and Full Refund of Security Deposit (No Early Exit Penalty Applicable)\n\n${formalGreeting}\n\nI am writing to formally communicate my schedule to vacate the residential premises situated at ${loc}, and to request the complete refund of my security deposit.\n\n1. Expiry of Agreement and Invalidity of Lock-in Penalty:\nOur 11-month rental agreement expired and was not formally renewed. Under Section 111(a) of the Transfer of Property Act, 1882, a lease determines automatically upon the expiry of its term. When an agreement expires, all special restrictions—including lock-in periods and early exit penalties—are legally extinguished. Occupancy thereafter operates on a month-to-month basis (Section 116), terminable by standard written notice (Section 106). Consequently, the proposed early termination penalty of ${penaltyDisplay} has no legal validity.\n\n2. Supreme Court Landmark Doctrine on Penalties:\nUnder Section 74 of the Indian Contract Act, 1872 and landmark rulings of the Supreme Court of India (Kailash Nath Associates v. DDA, 2015), forfeiture and penalties cannot be punitive. A landlord cannot deduct or forfeit a tenant's security deposit without demonstrating actual, unmitigated financial loss.\n\n3. Handover and Refund Timeline:\nI am providing this formal written notice to vacate the premises on [Move-out Date]. I will hand over the flat clean and in good condition, and invite you for a joint walk-through inspection.\n\nAccordingly, I request that you:\n1. Confirm withdrawal of the proposed early exit penalty of ${penaltyDisplay}.\n2. Acknowledge this written notice of handover.\n3. Transfer the full security deposit of ${depositDisplay} to my bank account upon key handover.\n\nPlease provide your written confirmation within ${replyDays} days so that this matter may be concluded amicably.\n\nYours sincerely,\n\n[Your Name]\n[Your Contact Number / Email Address]`
    : `Date: ${today}\n\nTo,\n${landlordRef}\n[Premises Address / Landlord Contact]\n\nSubject: Formal Request for Itemised Accounting and Refund of Security Deposit under Indian Tenancy Standards\n\n${formalGreeting}\n\nI am writing with respect to the tenancy agreement executed for the residential premises situated at ${loc}. Following an audit of our lease agreement and handover communications, I wish to address the following specific clauses:\n\n${quotedBlock}\nUnder recognized Indian legal doctrines, particularly Section 74 of the Indian Contract Act, 1872 and the Model Tenancy Act, 2021, deductions from a tenant's security deposit cannot operate as arbitrary forfeiture or penalty. Deductions must represent actual, proven, and documented loss. Ordinary aging, sun fading, and normal wear and tear remain the landlord's capital maintenance duty.\n\nAccordingly, I formally request that you provide:\n1. Itemised receipts or GST invoices for all actual contractor expenses incurred.\n2. Move-in versus move-out comparative photographic evidence demonstrating tenant-inflicted damage.\n3. Immediate electronic transfer of the undisputed portion of the security deposit.\n\nPlease provide your written accounting within ${replyDays} days of receipt of this communication so that this matter may be concluded amicably.\n\nYours sincerely,\n\n[Your Name]\n[Your Phone Number / Email Address]`;

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
      "Do NOT verbally agree to penalties or arbitrary deductions from your deposit.",
      "Give 15 to 30 days written notice to vacate via WhatsApp and email stating your move-out date.",
      "Send the tailored WhatsApp response or Formal Letter below explaining why the penalty is invalid.",
      "Take date-stamped 4K photos and video of all rooms and fixtures during your move-out inspection.",
      "Demand your complete security deposit refund via bank transfer within 7 to 14 days of key handover."
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

    // Format suggested action into clean step-by-step list
    const actionLines = String(c.suggested_action || '').split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const actionFormatted = actionLines.length > 1
      ? `<ul class="solution-steps-list">${actionLines.map(line => {
          const boldStep = line.replace(/^(Step\s*\d+:?|\d+\.\s*)/i, '<strong>$1</strong> ');
          return `<li>${boldStep}</li>`;
        }).join('')}</ul>`
      : `<p>${escapeHTML(c.suggested_action)}</p>`;

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
            <strong>💡 What this means:</strong>
            <p>${escapeHTML(c.simple_explanation)}</p>
          </div>
          <div class="clause-detail-item">
            <strong>⚠️ What this means for your money:</strong>
            <p>${escapeHTML(c.why_needs_attention)}</p>
          </div>
        </div>

        <div class="clause-action-box">
          <strong>✅ Your exact step-by-step solution:</strong>
          ${actionFormatted}
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
  const replyDays = Math.max(1, Number($('deadline') ? $('deadline').value : 7) || 7);

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

  // 1. Attempt Backend AI Analysis automatically
  if (!backendOnline) {
    await checkBackendStatus();
  }

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

  // Populate Drafts safely
  if ($('whatsappText')) $('whatsappText').value = auditResult.whatsapp_draft || '';
  if ($('formalText')) $('formalText').value = auditResult.formal_letter || '';
  if (typeof syncFormalLetter === 'function') syncFormalLetter();

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

if ($('copyMessage')) $('copyMessage').addEventListener('click', () => copyText($('whatsappText') ? $('whatsappText').value : ''));
if ($('copyLetter')) $('copyLetter').addEventListener('click', () => copyText($('formalText') ? $('formalText').value : ''));

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

// ==============================================================================
// TENANT COMPLAINT GENERATOR & FREE LAWYER BOARD CONTROLLER
// ==============================================================================

let activeVarietyFilter = 'all';
let currentNoticeDraftComplaint = null;


function debounce(func, wait = 250) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

async function initComplaintsPortal() {
  // Ensure sample complaints are loaded into database
  ClauseShieldDB.issues.seedSampleComplaints(false);

  // 1. Sub-navigation Tabs (File Complaint / Free Lawyer Board / Legal Notice Draft)
  const tabBtnFile = $('tabBtnFileComplaint');
  const tabBtnBoard = $('tabBtnLawyerBoard');
  const tabBtnNotice = $('tabBtnNoticeDraft');
  const paneFile = $('portalPaneFile');
  const paneBoard = $('portalPaneBoard');
  const paneNotice = $('portalPaneNotice');

  function switchPortalTab(tab) {
    if (tab === 'file') {
      if (tabBtnFile) tabBtnFile.classList.add('active');
      if (tabBtnBoard) tabBtnBoard.classList.remove('active');
      if (tabBtnNotice) tabBtnNotice.classList.remove('active');
      if (paneFile) paneFile.style.display = 'block';
      if (paneBoard) paneBoard.style.display = 'none';
      if (paneNotice) paneNotice.style.display = 'none';
    } else if (tab === 'board') {
      if (tabBtnBoard) tabBtnBoard.classList.add('active');
      if (tabBtnFile) tabBtnFile.classList.remove('active');
      if (tabBtnNotice) tabBtnNotice.classList.remove('active');
      if (paneFile) paneFile.style.display = 'none';
      if (paneBoard) paneBoard.style.display = 'block';
      if (paneNotice) paneNotice.style.display = 'none';
      renderComplaintsFeed();
    } else if (tab === 'notice') {
      if (tabBtnNotice) tabBtnNotice.classList.add('active');
      if (tabBtnFile) tabBtnFile.classList.remove('active');
      if (tabBtnBoard) tabBtnBoard.classList.remove('active');
      if (paneFile) paneFile.style.display = 'none';
      if (paneBoard) paneBoard.style.display = 'none';
      if (paneNotice) paneNotice.style.display = 'block';
      syncNoticeSheetPreview();
    }
  }

  if (tabBtnFile) tabBtnFile.addEventListener('click', () => switchPortalTab('file'));
  if (tabBtnBoard) tabBtnBoard.addEventListener('click', () => switchPortalTab('board'));
  if (tabBtnNotice) tabBtnNotice.addEventListener('click', () => switchPortalTab('notice'));

  // Listen for hash changes to #complaints-board
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#complaints-board') {
      switchPortalTab('board');
    } else if (window.location.hash === '#complaint-generator') {
      switchPortalTab('file');
    }
  });

  if (window.location.hash === '#complaints-board') {
    switchPortalTab('board');
  }

  // 2. Variety Filter Chips (Pills)
  const varietyChips = document.querySelectorAll('.variety-chip');
  varietyChips.forEach(chip => {
    chip.addEventListener('click', () => {
      varietyChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeVarietyFilter = chip.getAttribute('data-variety') || 'all';
      renderComplaintsFeed();
    });
  });

  // 3. Filter & Sort Bar Inputs
  const boardSortBy = $('boardSortBy');
  const boardUrgency = $('boardUrgencyFilter');
  const boardState = $('boardStateFilter');
  const boardStatus = $('boardStatusFilter');
  const boardSearch = $('boardSearchInput');

  if (boardSortBy) boardSortBy.addEventListener('change', renderComplaintsFeed);
  if (boardUrgency) boardUrgency.addEventListener('change', renderComplaintsFeed);
  if (boardState) boardState.addEventListener('change', renderComplaintsFeed);
  if (boardStatus) boardStatus.addEventListener('change', renderComplaintsFeed);
  if (boardSearch) boardSearch.addEventListener('input', debounce(renderComplaintsFeed, 250));

  // 4. "Generate Sample Complaints" Button
  const btnReset = $('btnResetSampleComplaints');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      ClauseShieldDB.issues.seedSampleComplaints(true);
      toast('✓ 8 Realistic Sample Tenancy Complaints Generated!');
      renderComplaintsFeed();
    });
  }

  // 4.1 1-Click Quick Dispute Presets
  const DISPUTE_PRESETS = {
    deposit: {
      category: 'security_deposit',
      urgency: 'urgent',
      amount: 55000,
      title: 'Landlord withholding ₹55,000 security deposit for unverified painting and deep cleaning',
      description: 'I peacefully handed over possession of the premises after completing the agreed 30-day notice period. The landlord inspected the apartment and raised no immediate structural damages. However, upon vacating, the landlord arbitrarily withheld ₹55,000 citing whole-flat repainting and deep cleaning charges without providing itemized contractor tax invoices. Under Section 108(m) of the Transfer of Property Act, normal wear and tear cannot be deducted.',
      relief: 'Full refund of ₹55,000 withheld security deposit immediately along with 18% p.a. statutory interest and waiver of unverified deductions.'
    },
    eviction: {
      category: 'illegal_eviction',
      urgency: 'urgent',
      amount: 0,
      title: 'Unlawful notice to vacate premises within 7 days without grounds and threat of lockout',
      description: 'The landlord served a verbal and WhatsApp notice demanding immediate vacation of the rented flat within 7 days, despite the valid 11-month registered lease having 6 months remaining. The landlord is threatening to change main door locks and forcibly remove personal belongings. Under the Model Tenancy Act and Transfer of Property Act, summary eviction without due process of law and a valid Rent Court order is illegal.',
      relief: 'Immediate withdrawal of unlawful eviction threats, respect for valid lease lock-in period, and guarantee of peaceful possession.'
    },
    utility: {
      category: 'utility_cutoff',
      urgency: 'urgent',
      amount: 0,
      title: 'Illegal disconnection of water supply and electricity to force premature lease termination',
      description: 'Following a disagreement regarding maintenance fees, the landlord instructed building maintenance to disconnect water supply and electricity to our flat. All utility dues and rents have been paid on time with receipts. Disconnection of essential services violates basic human rights and statutory tenancy laws under Section 14 of the Model Tenancy Act.',
      relief: 'Immediate restoration of water and electricity connections and cessation of extra-legal coercion.'
    },
    renthike: {
      category: 'rent_hike',
      urgency: 'medium',
      amount: 12000,
      title: 'Arbitrary 25% mid-term rent increase during active fixed-term rental agreement',
      description: 'The landlord issued a demand letter demanding an immediate 25% rent increase midway through the agreed 11-month tenure, threatening eviction if the revised rent is not paid starting next month. The signed agreement explicitly states fixed monthly rent with rent escalation permitted only upon renewal after 11 months.',
      relief: 'Adherence to the contractually agreed rental amount until the expiry of the 11-month term and cancellation of demand.'
    },
    repairs: {
      category: 'maintenance',
      urgency: 'medium',
      amount: 25000,
      title: 'Landlord refusal to repair severe bathroom seepage and structural ceiling water leak',
      description: 'Persistent water seepage from the ceiling has damaged bedroom walls and created electrical short-circuit hazards. Despite multiple written notices over the past 45 days, the landlord has refused to carry out necessary structural repairs, stating that maintenance inside the unit is solely tenant responsibility. Under tenancy law, landlord is obligated to maintain structural integrity and watertight habitability.',
      relief: 'Urgent structural leak repairs by licensed contractor within 7 days or permission to deduct repair costs from upcoming monthly rent.'
    }
  };

  function updateComplaintStatutoryNote(cat) {
    const noteEl = $('complaintStatutoryNote');
    if (!noteEl) return;
    const NOTES = {
      security_deposit: 'Under Section 108(m) of the Transfer of Property Act, 1882 & Model Tenancy Act, tenants are only responsible for damage beyond reasonable wear and tear. Deductions without contractor tax invoices violate tenancy law and constitute actionable criminal breach of trust (Sec 405 IPC).',
      illegal_eviction: 'Under Indian tenancy jurisprudence, a tenant cannot be forcibly evicted or locked out without due process of law. Landlords must obtain a formal eviction decree from the competent Rent Authority or civil court.',
      utility_cutoff: 'Under Section 20 of the Model Tenancy Act & State Rent Control Acts, cutting off essential services like water and electricity is a cognizable legal offense with penal provisions against the landlord.',
      harassment: 'Tenants enjoy an implied covenant of quiet enjoyment. Unannounced entry, verbal threats, and invasion of privacy entitle tenants to police protection and civil damages.',
      rent_hike: 'Rent revision can strictly take place according to the terms of the signed agreement or statutory 90-day written notice. Unilateral mid-tenure escalations are legally unenforceable.',
      maintenance: 'Under Section 15 of Model Tenancy Act, landlords are legally obligated to maintain structural integrity, plumbing, and essential habitability of residential premises.',
      lease_breach: 'Unfair contract terms, unreasonable lock-in penalties, and non-refundable deposits exceeding statutory limits (max 2 months in modern tenancy laws) can be challenged before Rent Authorities.',
      unfair_charges: 'Unilateral move-out deductions, administrative penalties, and unverified late fees are legally invalid without verified receipts and explicit contract authorization.'
    };
    noteEl.textContent = NOTES[cat] || NOTES.security_deposit;
  }

  if ($('compCategory')) {
    $('compCategory').addEventListener('change', () => updateComplaintStatutoryNote($('compCategory').value));
  }

  document.querySelectorAll('.dispute-preset-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-preset');
      const data = DISPUTE_PRESETS[presetKey];
      if (!data) return;

      if ($('compCategory')) {
        $('compCategory').value = data.category;
        updateComplaintStatutoryNote(data.category);
      }
      if ($('compUrgency')) $('compUrgency').value = data.urgency;
      if ($('compAmount') && data.amount) $('compAmount').value = data.amount;
      if ($('compTitle')) $('compTitle').value = data.title;
      if ($('compDescription')) $('compDescription').value = data.description;
      if ($('compRelief')) $('compRelief').value = data.relief;
      if ($('compDate') && !$('compDate').value) $('compDate').value = new Date().toISOString().split('T')[0];

      toast(`⚡ Loaded "${btn.textContent.trim()}" template! You can customize any details.`);
    });
  });

  // 5. Tenant Complaint Form Submission ("Put Their Complaint")
  const tenantComplaintForm = $('tenantComplaintForm');
  if (tenantComplaintForm) {
    tenantComplaintForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const full_name = $('compTenantName').value.trim();
      const isAnon = $('compAnonymousToggle') ? $('compAnonymousToggle').checked : false;
      const email = $('compTenantEmail').value.trim();
      const phone = $('compTenantPhone') ? $('compTenantPhone').value.trim() : '';
      const category = $('compCategory').value;
      const urgency = $('compUrgency').value;
      const state = $('compState').value;
      const city = $('compCity').value.trim();
      const amount = $('compAmount') ? Number($('compAmount').value) || 0 : 0;
      const date = $('compDate').value;
      const landlord = $('compLandlordName') ? $('compLandlordName').value.trim() : '';
      const title = $('compTitle').value.trim();
      const description = $('compDescription').value.trim();
      const relief = $('compRelief').value.trim();

      // Ensure user session exists (auto-create tenant account if guest)
      let currentUser = ClauseShieldDB.auth.getCurrentUser();
      if (!currentUser) {
        try {
          currentUser = await ClauseShieldDB.auth.signUpOrSignIn({
            email,
            password: 'password123',
            full_name,
            role: 'tenant'
          });
          updateNavUserState();
        } catch (authErr) {
          console.warn('Silent tenant guest account creation note:', authErr);
        }
      }

      try {
        const newComplaint = await ClauseShieldDB.issues.create({
          tenant_id: currentUser ? currentUser.id : 'usr_guest_tenant',
          tenant_name: isAnon ? 'Tenant (Anonymous)' : full_name,
          title,
          category,
          city,
          state,
          description: landlord ? `Landlord: ${landlord}. ${description}` : description,
          amount_in_dispute: amount,
          incident_date: date,
          urgency,
          relief_requested: relief
        });

        currentNoticeDraftComplaint = newComplaint;
        toast(`✓ Complaint ${newComplaint.issue_reference} published! Free advocates notified.`);
        
        // Reset form fields
        tenantComplaintForm.reset();

        // Switch to complaints board and highlight newly added complaint
        switchPortalTab('board');
        setTimeout(() => {
          const card = document.querySelector(`[data-card-ref="${newComplaint.issue_reference}"]`);
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.style.outline = '3px solid var(--blue)';
            setTimeout(() => card.style.outline = 'none', 3000);
          }
        }, 300);

      } catch (err) {
        toast(err.message || 'Failed to submit complaint.');
      }
    });
  }

  // 6. Preview Formal Legal Notice from Form button
  const btnDraftNoticeFromForm = $('btnDraftNoticeFromForm');
  if (btnDraftNoticeFromForm) {
    btnDraftNoticeFromForm.addEventListener('click', () => {
      const full_name = $('compTenantName').value.trim() || 'Tenant';
      const city = $('compCity').value.trim() || 'City';
      const state = $('compState').value || 'State';
      const amount = $('compAmount') ? Number($('compAmount').value) || 0 : 0;
      const title = $('compTitle').value.trim() || 'Rental Dispute';
      const description = $('compDescription').value.trim() || 'Unlawful withholding of security deposit.';
      const date = $('compDate').value || new Date().toISOString().split('T')[0];

      currentNoticeDraftComplaint = {
        issue_reference: 'CS-NOTICE-' + Math.floor(1000 + Math.random() * 9000),
        tenant_name: full_name,
        city,
        state,
        amount_in_dispute: amount,
        title,
        description,
        incident_date: date
      };

      switchPortalTab('notice');
    });
  }

  // 7. Formal Printable Legal Notice Print Engine
  function printFormalLegalNotice(rawNoticeText, meta = {}) {
    const printable = $('printable-letter');
    const text = (rawNoticeText || '').trim();
    if (!text) {
      toast('No legal notice draft content to print.');
      return;
    }

    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const ref = meta.issue_reference || ('CS-LN-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000));
    const tenant = meta.tenant_name || 'Aggrieved Tenant';
    const city = meta.city || 'Bengaluru';
    const state = meta.state || 'Karnataka';

    if (printable) {
      printable.innerHTML = `
        <div class="print-legal-notice-doc">
          <div class="print-doc-header">
            <div class="print-emblem">⚖️ STATUTORY LEGAL DEMAND NOTICE</div>
            <div class="print-dispatch-badge">SERVED VIA REGISTERED POST WITH ACKNOWLEDGEMENT DUE (RPAD) &amp; ELECTRONIC TRANSMISSION</div>
            <div class="print-meta-grid">
              <div><strong>Notice Reference:</strong> ${escapeHTML(ref)}</div>
              <div style="text-align:right;"><strong>Date of Service:</strong> ${escapeHTML(today)} · ${escapeHTML(city)}, ${escapeHTML(state)}</div>
            </div>
          </div>
          
          <div class="print-doc-body">
            <pre class="print-pre-content">${escapeHTML(text)}</pre>
          </div>

          <div class="print-doc-signatures">
            <div class="print-sig-col">
              <div class="print-sig-line"></div>
              <strong>Signature of Aggrieved Tenant / Complainant</strong><br>
              <span>Name: ${escapeHTML(tenant)}</span><br>
              <small>Verified Tenant Member · ClauseShield Platform</small>
            </div>
            <div class="print-sig-col" style="text-align:right;">
              <div class="print-sig-line" style="margin-left:auto;"></div>
              <strong>Advocate / Authorized Representative</strong><br>
              <span>Enrolment No: ________________________</span><br>
              <small>Bar Council of India · Panel Advocate</small>
            </div>
          </div>

          <div class="print-doc-footer">
            <p>This statutory legal demand notice is issued under Section 106 &amp; 108 of Transfer of Property Act, 1882 &amp; Model Tenancy Act provisions. Drafted and verified via ClauseShield Legal Platform.</p>
          </div>
        </div>
      `;
    }

    toast('🖨️ Opening print dialogue... Choose "Save as PDF" to export.');
    setTimeout(() => {
      window.print();
    }, 150);
  }

  // 7.1 Legal Notice Sheet Editor & Live Preview Synchronization
  const noticeEditorText = $('noticeEditorText');
  const noticeSheetPreview = $('noticeSheetPreview');
  const btnPrintNoticeSheet = $('btnPrintNoticeSheet');
  const btnCopyNoticeSheet = $('btnCopyNoticeSheet');
  const btnWhatsAppNoticeSheet = $('btnWhatsAppNoticeSheet');

  function syncNoticeSheetPreview() {
    if (!noticeEditorText) return;
    if (!noticeEditorText.value.trim()) {
      const cmp = currentNoticeDraftComplaint || {
        issue_reference: 'CS-NOTICE-2026-DEMO',
        tenant_name: 'Arjun Mehra',
        city: 'Baner, Pune',
        state: 'Maharashtra',
        amount_in_dispute: 45000,
        title: 'Withholding of Security Deposit without Invoice',
        description: 'Tenant peacefully handed over possession. Landlord refused deposit refund citing unverified painting costs.',
        incident_date: '2026-11-01'
      };
      noticeEditorText.value = ClauseShieldDB.issues.generateLegalNotice(cmp);
    }
    if (noticeSheetPreview) {
      noticeSheetPreview.textContent = noticeEditorText.value;
    }
    if (btnWhatsAppNoticeSheet) {
      btnWhatsAppNoticeSheet.href = 'https://wa.me/?text=' + encodeURIComponent(noticeEditorText.value);
    }
  }

  if (noticeEditorText) {
    noticeEditorText.addEventListener('input', () => {
      if (noticeSheetPreview) noticeSheetPreview.textContent = noticeEditorText.value;
      if (btnWhatsAppNoticeSheet) {
        btnWhatsAppNoticeSheet.href = 'https://wa.me/?text=' + encodeURIComponent(noticeEditorText.value);
      }
    });
  }

  if (btnPrintNoticeSheet) {
    btnPrintNoticeSheet.addEventListener('click', () => {
      syncNoticeSheetPreview();
      const text = noticeEditorText ? noticeEditorText.value : '';
      printFormalLegalNotice(text, currentNoticeDraftComplaint || {});
    });
  }

  if (btnCopyNoticeSheet) {
    btnCopyNoticeSheet.addEventListener('click', () => {
      copyText(noticeEditorText ? noticeEditorText.value : '');
    });
  }

  // 8. Modal Legal Notice Preview Actions
  const btnPrintModalNotice = $('btnPrintModalNotice');
  const btnCopyModalNotice = $('btnCopyModalNotice');
  if (btnPrintModalNotice) {
    btnPrintModalNotice.addEventListener('click', () => {
      const text = $('modalNoticePreview') ? $('modalNoticePreview').textContent : '';
      printFormalLegalNotice(text, currentNoticeDraftComplaint || {});
    });
  }
  if (btnCopyModalNotice) {
    btnCopyModalNotice.addEventListener('click', () => {
      const text = $('modalNoticePreview') ? $('modalNoticePreview').textContent : '';
      copyText(text);
    });
  }

  // Render initial complaints feed
  await renderComplaintsFeed();
}

// Render Complaints Feed with Sorting & Filtering across All Varieties
async function renderComplaintsFeed() {
  const container = $('complaintsFeedList');
  if (!container) return;

  const category = activeVarietyFilter;
  const sort = $('boardSortBy') ? $('boardSortBy').value : 'newest';
  const urgency = $('boardUrgencyFilter') ? $('boardUrgencyFilter').value : 'all';
  const state = $('boardStateFilter') ? $('boardStateFilter').value : 'all';
  const status = $('boardStatusFilter') ? $('boardStatusFilter').value : 'all';
  const search = $('boardSearchInput') ? $('boardSearchInput').value : '';

  const complaints = await ClauseShieldDB.issues.getAllAvailable({
    category,
    sort,
    urgency,
    state,
    status,
    search
  });

  // Calculate live stats
  const allComplaints = await ClauseShieldDB.issues.getAllAvailable({});
  const urgentCount = allComplaints.filter(c => c.urgency === 'urgent').length;
  const totalVal = allComplaints.reduce((acc, c) => acc + (Number(c.amount_in_dispute) || 0), 0);
  const totalOpinions = allComplaints.reduce((acc, c) => acc + (c.lawyer_responses ? c.lawyer_responses.length : 0), 0);

  if ($('metricTotalComplaints')) $('metricTotalComplaints').textContent = allComplaints.length;
  if ($('metricUrgentComplaints')) $('metricUrgentComplaints').textContent = urgentCount;
  if ($('metricTotalDisputeVal')) $('metricTotalDisputeVal').textContent = formatINR(totalVal);
  if ($('metricLawyerResponses')) $('metricLawyerResponses').textContent = totalOpinions;
  if ($('portalBadgeCount')) $('portalBadgeCount').textContent = `${allComplaints.length} Active`;

  // Update variety counts on filter pills
  const countsByCat = {};
  allComplaints.forEach(c => {
    countsByCat[c.category] = (countsByCat[c.category] || 0) + 1;
  });
  if ($('chipCountAll')) $('chipCountAll').textContent = allComplaints.length;
  if ($('chipCountDeposit')) $('chipCountDeposit').textContent = countsByCat['security_deposit'] || 0;
  if ($('chipCountEviction')) $('chipCountEviction').textContent = countsByCat['illegal_eviction'] || 0;
  if ($('chipCountUtility')) $('chipCountUtility').textContent = countsByCat['utility_cutoff'] || 0;
  if ($('chipCountHarass')) $('chipCountHarass').textContent = countsByCat['harassment'] || 0;
  if ($('chipCountRentHike')) $('chipCountRentHike').textContent = countsByCat['rent_hike'] || 0;
  if ($('chipCountMaint')) $('chipCountMaint').textContent = countsByCat['maintenance'] || 0;
  if ($('chipCountLease')) $('chipCountLease').textContent = countsByCat['lease_breach'] || 0;
  if ($('chipCountCharges')) $('chipCountCharges').textContent = countsByCat['unfair_charges'] || 0;

  if (complaints.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:50px 20px;background:#fff;border-radius:14px;border:1px dashed var(--line);">
        <p style="font-size:1.15rem;font-weight:700;color:var(--navy);margin-bottom:8px;">No complaints match this filter.</p>
        <p style="font-size:.9rem;color:var(--muted);margin-bottom:18px;">Try selecting "All Varieties" or clearing search terms.</p>
        <button type="button" class="btn primary" onclick="$('btnResetSampleComplaints').click()">✨ Generate Sample Complaints</button>
      </div>
    `;
    return;
  }

  const currentUser = ClauseShieldDB.auth.getCurrentUser();
  const isLawyer = currentUser && currentUser.role === 'lawyer';

  container.innerHTML = complaints.map(c => {
    const responses = c.lawyer_responses || [];
    const urgencyClass = c.urgency === 'urgent' ? 'urgent' : (c.urgency === 'medium' ? 'medium' : 'low');
    const urgencyLabel = c.urgency ? c.urgency.toUpperCase() : 'STANDARD';

    return `
      <div class="complaint-card" data-card-ref="${escapeHTML(c.issue_reference)}">
        <div class="complaint-card-header">
          <div class="complaint-badges-group">
            <span class="issue-ref">${escapeHTML(c.issue_reference)}</span>
            <span class="badge-variety">${escapeHTML(c.variety_label || ClauseShieldDB.issues.getVarietyLabel(c.category))}</span>
            <span class="badge-urgency ${urgencyClass}">${urgencyLabel}</span>
            <span class="status-pill status-${c.status}">${(c.status || 'open').replace('_', ' ')}</span>
          </div>
          ${c.amount_in_dispute > 0 ? `
            <div style="text-align:right;">
              <span style="font-size:.74rem;color:var(--muted);display:block;">Dispute Amount</span>
              <span class="dispute-val-large">${formatINR(c.amount_in_dispute)}</span>
            </div>
          ` : ''}
        </div>

        <h3 class="complaint-card-title">${escapeHTML(c.title)}</h3>

        <div class="complaint-meta-bar">
          <span class="complaint-meta-item">👤 <strong>${escapeHTML(c.tenant_name || 'Tenant')}</strong></span>
          <span class="complaint-meta-item">📍 ${escapeHTML(c.city)}, ${escapeHTML(c.state)}</span>
          <span class="complaint-meta-item">📅 Incident: ${escapeHTML(c.incident_date || 'Recent')}</span>
          <span class="complaint-meta-item">💬 <strong>${responses.length}</strong> Lawyer ${responses.length === 1 ? 'Advice' : 'Opinions'}</span>
        </div>

        <div class="complaint-description">
          ${escapeHTML(c.description)}
        </div>

        ${c.relief_requested ? `
          <div class="complaint-relief-box">
            <strong>🎯 Resolution / Relief Demanded:</strong> ${escapeHTML(c.relief_requested)}
          </div>
        ` : ''}

        <!-- Lawyer Advice Thread -->
        <div class="lawyer-responses-container" id="responses_${c.id}">
          <div class="lawyer-response-header">
            <span style="font-weight:700;font-size:.88rem;color:var(--navy);">
              ⚖️ Verified Advocate Legal Opinions (${responses.length})
            </span>
            <span style="font-size:.76rem;color:var(--muted);">Pro Bono &amp; Statutory Guidance</span>
          </div>

          ${responses.length === 0 ? `
            <div style="font-size:.85rem;color:var(--muted);padding:8px 0;">
              No advocate responses yet. Verified lawyers can provide free statutory advice below.
            </div>
          ` : responses.map(r => `
            <div class="lawyer-response-item">
              <div class="lawyer-profile-tag">
                <img src="${r.avatar_url || 'https://ui-avatars.com/api/?name=Advocate&background=101d35&color=fff'}" class="lawyer-avatar-small" alt="Advocate">
                <div class="lawyer-info-text">
                  <strong>${escapeHTML(r.lawyer_name)} <span class="verified-icon">✓ Bar Council</span></strong>
                  <small>${escapeHTML(r.bar_number)} · ${new Date(r.created_at).toLocaleDateString('en-IN')}</small>
                </div>
              </div>
              <div class="lawyer-advice-text">
                ${escapeHTML(r.message)}
              </div>
              ${r.action_recommended ? `
                <span class="lawyer-rec-tag">Recommended: ${escapeHTML(r.action_recommended)}</span>
              ` : ''}
            </div>
          `).join('')}

          <!-- Expandable Inline Advocate Advice Form -->
          <div class="lawyer-reply-form" id="replyForm_${c.id}" style="display:none;">
            <h4 style="font-size:.92rem;margin:0 0 10px;color:var(--navy);">Provide Free Legal Advice as Advocate:</h4>
            <div class="form-grid" style="margin-bottom:10px;">
              <div>
                <label style="font-size:.75rem;">Your Full Name / Advocate Title *</label>
                <input type="text" id="advName_${c.id}" value="${currentUser && currentUser.role === 'lawyer' ? escapeHTML(currentUser.full_name) : 'Adv. Rohit Deshmukh'}" style="margin-bottom:8px;padding:8px 10px;font-size:.84rem;">
              </div>
              <div>
                <label style="font-size:.75rem;">Bar Council Enrolment No. *</label>
                <input type="text" id="advBar_${c.id}" value="MAH/5821/2016" style="margin-bottom:8px;padding:8px 10px;font-size:.84rem;">
              </div>
            </div>
            <label style="font-size:.75rem;">Legal Assessment &amp; Statutory Guidance *</label>
            <textarea id="advMsg_${c.id}" rows="3" placeholder="Cite applicable provisions (e.g. Section 108 TPA, Rent Act Section 29, IPC 405) and outline immediate steps..." style="margin-bottom:10px;padding:10px;font-size:.86rem;"></textarea>
            
            <label style="font-size:.75rem;">Recommended Legal Action</label>
            <input type="text" id="advAction_${c.id}" value="Dispatch Statutory Notice under Section 106 TPA" style="margin-bottom:12px;padding:8px 10px;font-size:.84rem;">

            <div style="display:flex;gap:8px;">
              <button type="button" class="btn primary btn-submit-advice" data-issue-id="${c.id}" style="padding:8px 14px;font-size:.84rem;">Post Free Legal Advice</button>
              <button type="button" class="btn secondary btn-cancel-advice" data-issue-id="${c.id}" style="padding:8px 14px;font-size:.84rem;">Cancel</button>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="complaint-actions-row">
          <button type="button" class="btn primary btn-toggle-reply" data-issue-id="${c.id}" style="padding:8px 16px;font-size:.85rem;">
            ⚖️ Provide Free Legal Advice
          </button>
          <button type="button" class="btn secondary btn-open-notice-modal" data-issue-id="${c.id}" style="padding:8px 16px;font-size:.85rem;">
            📜 View Legal Notice Draft
          </button>
          <a class="btn secondary" href="https://wa.me/?text=${encodeURIComponent('ClauseShield Legal Notice: ' + c.title + ' - Reference ' + c.issue_reference)}" target="_blank" rel="noopener" style="padding:8px 16px;font-size:.85rem;">
            💬 WhatsApp Notice
          </a>
        </div>
      </div>
    `;
  }).join('');

  // Attach event listeners to card actions
  attachComplaintCardListeners(complaints);
}

// Card Interactive Event Handlers
function attachComplaintCardListeners(complaints) {
  // 1. Toggle Reply Form
  document.querySelectorAll('.btn-toggle-reply').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-issue-id');
      const form = $(`replyForm_${id}`);
      if (form) {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
        if (form.style.display === 'block') {
          form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    });
  });

  // 2. Cancel Reply Form
  document.querySelectorAll('.btn-cancel-advice').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-issue-id');
      const form = $(`replyForm_${id}`);
      if (form) form.style.display = 'none';
    });
  });

  // 3. Submit Free Legal Advice
  document.querySelectorAll('.btn-submit-advice').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-issue-id');
      const advName = $(`advName_${id}`) ? $(`advName_${id}`).value.trim() : 'Advocate';
      const advBar = $(`advBar_${id}`) ? $(`advBar_${id}`).value.trim() : 'Bar Council Enrolled';
      const advMsg = $(`advMsg_${id}`) ? $(`advMsg_${id}`).value.trim() : '';
      const advAction = $(`advAction_${id}`) ? $(`advAction_${id}`).value.trim() : '';

      if (!advMsg) {
        toast('Please enter your legal advice message.');
        return;
      }

      try {
        await ClauseShieldDB.issues.addLawyerResponse({
          issueId: id,
          lawyer_name: advName,
          bar_number: advBar,
          message: advMsg,
          action_recommended: advAction
        });
        toast('✓ Free legal advice posted successfully!');
        renderComplaintsFeed();
      } catch (err) {
        toast(err.message || 'Failed to post legal advice.');
      }
    });
  });

  // 4. Open Modal Legal Notice Draft Preview
  document.querySelectorAll('.btn-open-notice-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-issue-id');
      const cmp = complaints.find(c => c.id === id);
      if (!cmp) return;

      currentNoticeDraftComplaint = cmp;
      const noticeText = ClauseShieldDB.issues.generateLegalNotice(cmp);
      if ($('modalNoticePreview')) $('modalNoticePreview').textContent = noticeText;
      if ($('legalNoticeModalTitle')) $('legalNoticeModalTitle').textContent = `Legal Notice · ${cmp.issue_reference}`;
      openModal('legalNoticeModal');
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  initAuthModal();
  initComplaintsPortal();
  checkBackendStatus();
  calculate();
  syncFormalLetter();
  // Render baseline laws in disclosure
  renderDynamicLaws();
});


// ==============================================================================
// CLAUSESHIELD LEGAL ASSISTANCE PLATFORM INTEGRATION MODULE
// ==============================================================================

let activeVideoConsultation = null;
let currentBookingContext = { lawyer: null, issue: null, initiatedBy: 'tenant' };

// ------------------------------------------------------------------------------
// Navigation & User Session Management
// ------------------------------------------------------------------------------

function updateNavUserState() {
  const user = window.ClauseShieldDB ? ClauseShieldDB.auth.getCurrentUser() : null;
  const isAdvocate = user && (user.role === 'advocate' || user.role === 'lawyer');

  const tenantCont = $('tenantAppContainer');
  const advShell = $('advocateAppShell');

  if (isAdvocate) {
    // Hide all tenant consumer elements
    if (tenantCont) tenantCont.style.display = 'none';
    if (advShell) advShell.style.display = 'flex';
    hideAllDashboards();

    if (window.ClauseShieldAdvocateUI) {
      ClauseShieldAdvocateUI.init();
      const currentAdvView = (window.location.hash || '').startsWith('#advocate/') ? 
        window.location.hash.replace('#advocate/', '') : 'overview';
      ClauseShieldAdvocateUI.renderWorkspace(user, currentAdvView);
    }
    return;
  }

  // Tenant / Guest mode: Hide advocate shell, show tenant consumer container
  if (advShell) advShell.style.display = 'none';
  if (tenantCont) tenantCont.style.display = 'block';

  const authNavBtn = $('authNavBtn');
  const guestAuthGroup = $('guestAuthGroup');
  const userMenuWrapper = $('userMenuWrapper');
  const navUserName = $('navUserName');
  const navUserRole = $('navUserRole');
  const navUserAvatar = $('navUserAvatar');
  const dropdownUserName = $('dropdownUserName');
  const dropdownUserEmail = $('dropdownUserEmail');
  const dropdownUserAvatar = $('dropdownUserAvatar');
  const dropdownUserStatus = $('dropdownUserStatus');
  const navDashboardLink = $('navDashboardLink');

  if (user) {
    if (guestAuthGroup) guestAuthGroup.style.display = 'none';
    if (authNavBtn) authNavBtn.style.display = 'none';
    if (userMenuWrapper) userMenuWrapper.style.display = 'inline-flex';
    if (navUserName) navUserName.textContent = user.full_name || 'My Account';
    if (navUserAvatar && user.avatar_url) navUserAvatar.src = user.avatar_url;
    if (dropdownUserAvatar && user.avatar_url) dropdownUserAvatar.src = user.avatar_url;
    if (dropdownUserName) dropdownUserName.textContent = user.full_name || 'My Account';
    if (dropdownUserEmail) dropdownUserEmail.textContent = user.email || '';
    if (dropdownUserStatus) {
      if (user.role === 'admin') dropdownUserStatus.textContent = 'Administrator';
      else dropdownUserStatus.textContent = 'Active Tenant Member';
    }

    if (navUserRole) {
      navUserRole.textContent = user.role.toUpperCase();
      navUserRole.className = `user-role-badge badge-${user.role}`;
    }

    if (navDashboardLink) {
      if (user.role === 'tenant') navDashboardLink.href = '#tenant-dashboard';
      else if (user.role === 'admin') navDashboardLink.href = '#admin-dashboard';
    }

    if (user.role === 'tenant') loadTenantDashboard();
    else if (user.role === 'admin') loadAdminDashboard();
  } else {
    if (guestAuthGroup) guestAuthGroup.style.display = 'inline-flex';
    if (authNavBtn) authNavBtn.style.display = 'none';
    if (userMenuWrapper) userMenuWrapper.style.display = 'none';
    hideAllDashboards();
  }
}

function hideAllDashboards() {
  const td = $('tenant-dashboard');
  const ld = $('lawyer-dashboard');
  const ad = $('admin-dashboard');
  if (td) td.style.display = 'none';
  if (ld) ld.style.display = 'none';
  if (ad) ad.style.display = 'none';
}

function handleHashNavigation() {
  const hash = window.location.hash || '#home';
  const user = window.ClauseShieldDB ? ClauseShieldDB.auth.getCurrentUser() : null;
  const isAdvocate = user && (user.role === 'advocate' || user.role === 'lawyer');

  if (isAdvocate) {
    const tenantCont = $('tenantAppContainer');
    const advShell = $('advocateAppShell');
    if (tenantCont) tenantCont.style.display = 'none';
    if (advShell) advShell.style.display = 'flex';
    hideAllDashboards();

    if (!hash.startsWith('#advocate')) {
      window.location.hash = '#advocate/overview';
      return;
    }

    const viewName = hash.replace('#advocate/', '') || 'overview';
    if (window.ClauseShieldAdvocateUI) {
      ClauseShieldAdvocateUI.renderWorkspace(user, viewName);
    }
    return;
  }

  // Unauthorized attempt to access advocate routes by URL manipulation
  if (hash.startsWith('#advocate')) {
    if (user && user.role === 'tenant') {
      toast('The Advocate Workspace is restricted to licensed legal practitioners.');
      window.location.hash = '#tenant-dashboard';
    } else {
      toast('Please sign in as an Advocate to access this legal workspace.');
      window.location.hash = '#home';
      openModal('authModal');
    }
    return;
  }

  // Non-advocate view handling
  const tenantCont = $('tenantAppContainer');
  const advShell = $('advocateAppShell');
  if (advShell) advShell.style.display = 'none';
  if (tenantCont) tenantCont.style.display = 'block';

  hideAllDashboards();

  if (hash === '#tenant-dashboard') {
    if (user && user.role === 'tenant') {
      const td = $('tenant-dashboard');
      if (td) td.style.display = 'block';
      loadTenantDashboard();
    } else {
      toast('Please log in as a Tenant to access this dashboard.');
      openModal('authModal');
    }
  } else if (hash === '#admin-dashboard') {
    if (user && user.role === 'admin') {
      const ad = $('admin-dashboard');
      if (ad) ad.style.display = 'block';
      loadAdminDashboard();
    } else {
      toast('Administrative access requires administrator credentials.');
      openModal('authModal');
    }
  }
}

window.addEventListener('hashchange', handleHashNavigation);

// User Menu Dropdown Toggle
const userPill = $('userPill');
const userDropdown = $('userDropdown');

if (userPill && userDropdown) {
  userPill.addEventListener('click', (e) => {
    e.stopPropagation();
    const isShowing = userDropdown.classList.toggle('show');
    userPill.setAttribute('aria-expanded', isShowing ? 'true' : 'false');
  });

  document.addEventListener('click', (e) => {
    if (!userDropdown.contains(e.target) && !userPill.contains(e.target)) {
      userDropdown.classList.remove('show');
      userPill.setAttribute('aria-expanded', 'false');
    }
  });

  userDropdown.querySelectorAll('a, button').forEach(item => {
    item.addEventListener('click', () => {
      userDropdown.classList.remove('show');
      userPill.setAttribute('aria-expanded', 'false');
    });
  });
}

// Log Out Handler
const logoutBtn = $('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    ClauseShieldDB.auth.signOut();
    toast('Logged out successfully.');
    updateNavUserState();
    window.location.hash = '#home';
  });
}

// ------------------------------------------------------------------------------
// Generic Modal Management
// ------------------------------------------------------------------------------

function openModal(modalId) {
  const el = $(modalId);
  if (el) el.classList.add('open');
}

function closeModal(modalId) {
  const el = $(modalId);
  if (el) {
    el.classList.remove('open');
    // If closing video call modal, ensure iframe is cleaned up
    if (modalId === 'videoCallModal') {
      const container = $('videoContainer');
      if (container) container.innerHTML = '';
      activeVideoConsultation = null;
    }
  }
}

document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-close');
    closeModal(target);
  });
});

document.querySelectorAll('.cs-modal-backdrop').forEach(backdrop => {
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      closeModal(backdrop.id);
    }
  });
});

// ------------------------------------------------------------------------------
// Streamlined & Resilient Authentication Management (Executive Polish)
// ------------------------------------------------------------------------------

let activeSignUpRole = 'tenant';
let authModalInitialized = false;

function initAuthModal() {
  if (authModalInitialized) return;
  authModalInitialized = true;

  const authNavBtn = $('authNavBtn');
  const navSignInBtn = $('navSignInBtn');

  if (authNavBtn) {
    authNavBtn.addEventListener('click', () => {
      openModal('authModal');
      switchAuthTab('register');
    });
  }

  if (navSignInBtn) {
    navSignInBtn.addEventListener('click', () => {
      openModal('authModal');
      switchAuthTab('login');
    });
  }

  const heroGetStartedBtn = $('heroGetStartedBtn');
  if (heroGetStartedBtn) {
    heroGetStartedBtn.addEventListener('click', () => {
      openModal('authModal');
      switchAuthTab('register');
    });
  }

  // Segmented Mode Tabs: Sign In vs Create Account vs Forgot Password
  const tabSignInBtn = $('tabSignInBtn');
  const tabSignUpBtn = $('tabSignUpBtn');
  const authSignInPane = $('authSignInPane');
  const authSignUpPane = $('authSignUpPane');
  const authForgotPane = $('authForgotPane');
  const authModalTitle = $('authModalTitle');
  const authModalSubtitle = $('authModalSubtitle');

  function switchAuthTab(mode) {
    const errBox1 = $('signInErrorBox');
    const errBox2 = $('tenantRegErrorBox');
    const errBox3 = $('lawyerRegErrorBox');
    const errBox4 = $('forgotAlertBox');
    if (errBox1) errBox1.style.display = 'none';
    if (errBox2) errBox2.style.display = 'none';
    if (errBox3) errBox3.style.display = 'none';
    if (errBox4) errBox4.style.display = 'none';

    if (mode === 'login') {
      if (tabSignInBtn) {
        tabSignInBtn.classList.add('active');
        tabSignInBtn.setAttribute('aria-selected', 'true');
      }
      if (tabSignUpBtn) {
        tabSignUpBtn.classList.remove('active');
        tabSignUpBtn.setAttribute('aria-selected', 'false');
      }
      if (authSignInPane) authSignInPane.style.display = 'block';
      if (authSignUpPane) authSignUpPane.style.display = 'none';
      if (authForgotPane) authForgotPane.style.display = 'none';
      if (authModalTitle) authModalTitle.textContent = 'Sign In to ClauseShield';
      if (authModalSubtitle) authModalSubtitle.textContent = 'Access tenant legal assistance, lease audits, and verified advocate advice.';
    } else if (mode === 'register') {
      if (tabSignUpBtn) {
        tabSignUpBtn.classList.add('active');
        tabSignUpBtn.setAttribute('aria-selected', 'true');
      }
      if (tabSignInBtn) {
        tabSignInBtn.classList.remove('active');
        tabSignInBtn.setAttribute('aria-selected', 'false');
      }
      if (authSignInPane) authSignInPane.style.display = 'none';
      if (authSignUpPane) authSignUpPane.style.display = 'block';
      if (authForgotPane) authForgotPane.style.display = 'none';
      if (authModalTitle) authModalTitle.textContent = 'Create Free ClauseShield Account';
      if (authModalSubtitle) authModalSubtitle.textContent = 'Select your role to file disputes, audit agreements, or advise tenants.';
    } else if (mode === 'forgot') {
      if (tabSignUpBtn) {
        tabSignUpBtn.classList.remove('active');
        tabSignUpBtn.setAttribute('aria-selected', 'false');
      }
      if (tabSignInBtn) {
        tabSignInBtn.classList.remove('active');
        tabSignInBtn.setAttribute('aria-selected', 'false');
      }
      if (authSignInPane) authSignInPane.style.display = 'none';
      if (authSignUpPane) authSignUpPane.style.display = 'none';
      if (authForgotPane) authForgotPane.style.display = 'block';
      if (authModalTitle) authModalTitle.textContent = 'Reset Account Password';
      if (authModalSubtitle) authModalSubtitle.textContent = 'Enter your email to verify and choose a new secure password.';
    }
  }

  function handleAuthHash() {
    const hash = window.location.hash;
    if (hash === '#login' || hash === '#signin') {
      openModal('authModal');
      switchAuthTab('login');
    } else if (hash === '#signup' || hash === '#get-started') {
      openModal('authModal');
      switchAuthTab('register');
    }
  }
  window.addEventListener('hashchange', handleAuthHash);
  setTimeout(handleAuthHash, 100);

  if (tabSignInBtn) tabSignInBtn.addEventListener('click', () => switchAuthTab('login'));
  if (tabSignUpBtn) tabSignUpBtn.addEventListener('click', () => switchAuthTab('register'));

  const switchRegisterLink = $('switchRegisterLink');
  if (switchRegisterLink) {
    switchRegisterLink.addEventListener('click', (e) => {
      e.preventDefault();
      switchAuthTab('register');
    });
  }

  const switchSignInLink = $('switchSignInLink');
  if (switchSignInLink) {
    switchSignInLink.addEventListener('click', (e) => {
      e.preventDefault();
      switchAuthTab('login');
    });
  }

  // Password Visibility Toggles
  document.querySelectorAll('.pwd-toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      const input = $(targetId);
      if (!input) return;
      const eyeOpen = btn.querySelector('.eye-open');
      const eyeClosed = btn.querySelector('.eye-closed');
      if (input.type === 'password') {
        input.type = 'text';
        if (eyeOpen) eyeOpen.style.display = 'none';
        if (eyeClosed) eyeClosed.style.display = 'inline-block';
      } else {
        input.type = 'password';
        if (eyeOpen) eyeOpen.style.display = 'inline-block';
        if (eyeClosed) eyeClosed.style.display = 'none';
      }
    });
  });

  // Password Strength Meter for Tenant Sign Up
  const tenantPwdInput = $('tenantRegPassword');
  const tenantPwdStrengthBox = $('tenantPwdStrengthBox');
  const tenantPwdBar = $('tenantPwdBar');
  const tenantPwdText = $('tenantPwdText');
  const tenantPwdHint = $('tenantPwdHint');

  if (tenantPwdInput && tenantPwdStrengthBox) {
    tenantPwdInput.addEventListener('input', () => {
      const val = tenantPwdInput.value;
      if (!val) {
        tenantPwdStrengthBox.style.display = 'none';
        return;
      }
      tenantPwdStrengthBox.style.display = 'block';
      let score = 0;
      if (val.length >= 6) score++;
      if (val.length >= 10) score++;
      if (/[A-Z]/.test(val) || /[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      tenantPwdBar.className = 'pwd-strength-bar';
      if (score <= 1) {
        tenantPwdBar.classList.add('weak');
        tenantPwdText.textContent = 'Weak';
        tenantPwdHint.textContent = 'Minimum 6 characters needed';
      } else if (score === 2) {
        tenantPwdBar.classList.add('medium');
        tenantPwdText.textContent = 'Moderate';
        tenantPwdHint.textContent = 'Add uppercase or numbers';
      } else if (score === 3) {
        tenantPwdBar.classList.add('strong');
        tenantPwdText.textContent = 'Strong';
        tenantPwdHint.textContent = 'Solid password security';
      } else {
        tenantPwdBar.classList.add('very-strong');
        tenantPwdText.textContent = 'Very Strong';
        tenantPwdHint.textContent = 'Optimal protection';
      }
    });
  }

  // Google Single Sign-On Simulation
  const googleSignInBtn = $('googleSignInBtn');
  if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const user = await ClauseShieldDB.auth.signInWithGoogle();
        toast(`✓ Signed in with Google as ${user.full_name}`);
        closeModal('authModal');
        updateNavUserState();
        if (typeof renderComplaintsFeed === 'function') renderComplaintsFeed();
        if (user.role === 'advocate' || user.role === 'lawyer') {
          window.location.hash = '#advocate/overview';
        } else if (user.role === 'tenant') {
          window.location.hash = '#tenant-dashboard';
        } else if (user.role === 'admin') {
          window.location.hash = '#admin-dashboard';
        }
      } catch (err) {
        toast(err.message || 'Google Sign In failed');
      }
    });
  }

  // Forgot Password Link & Form
  const forgotPasswordBtn = $('forgotPasswordBtn');
  if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', (e) => {
      e.preventDefault();
      switchAuthTab('forgot');
      const curEmail = $('loginEmail') ? $('loginEmail').value.trim() : '';
      if (curEmail && $('forgotEmail')) $('forgotEmail').value = curEmail;
    });
  }

  const backToSignInLink = $('backToSignInLink');
  if (backToSignInLink) {
    backToSignInLink.addEventListener('click', (e) => {
      e.preventDefault();
      switchAuthTab('login');
    });
  }

  const forgotPasswordForm = $('forgotPasswordForm');
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = $('forgotEmail').value.trim();
      const newPassword = $('resetNewPassword').value;
      const confirmPassword = $('resetConfirmPassword').value;
      const alertBox = $('forgotAlertBox');
      if (alertBox) alertBox.style.display = 'none';

      if (newPassword !== confirmPassword) {
        if (alertBox) {
          alertBox.className = 'auth-alert-box error';
          alertBox.style.display = 'block';
          alertBox.textContent = 'Passwords do not match. Please ensure both fields are identical.';
        }
        return;
      }

      try {
        await ClauseShieldDB.auth.resetPassword({ email, newPassword });
        toast('✓ Password updated successfully! Signing you in...');
        const user = await ClauseShieldDB.auth.signIn({ email, password: newPassword });
        closeModal('authModal');
        updateNavUserState();
        if (typeof renderComplaintsFeed === 'function') renderComplaintsFeed();
        if (user.role === 'advocate' || user.role === 'lawyer') {
          window.location.hash = '#advocate/overview';
        } else if (user.role === 'tenant') {
          window.location.hash = '#tenant-dashboard';
        } else if (user.role === 'admin') {
          window.location.hash = '#admin-dashboard';
        }
      } catch (err) {
        if (alertBox) {
          alertBox.className = 'auth-alert-box error';
          alertBox.style.display = 'block';
          alertBox.textContent = err.message || 'Could not reset password.';
        } else {
          toast(err.message || 'Could not reset password.');
        }
      }
    });
  }

  // Quick 1-Click Demo Login Buttons
  document.querySelectorAll('.demo-login-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = btn.getAttribute('data-email');
      const pass = btn.getAttribute('data-pass');
      try {
        const user = await ClauseShieldDB.auth.signIn({ email, password: pass });
        toast(`✓ Logged in as ${user.full_name} (${user.role.toUpperCase()})`);
        closeModal('authModal');
        updateNavUserState();
        if (typeof renderComplaintsFeed === 'function') renderComplaintsFeed();
        if (user.role === 'advocate' || user.role === 'lawyer') {
          window.location.hash = '#advocate/overview';
        } else if (user.role === 'tenant') {
          window.location.hash = '#tenant-dashboard';
        } else if (user.role === 'admin') {
          window.location.hash = '#admin-dashboard';
        }
      } catch (err) {
        toast(err.message || 'Demo login failed');
      }
    });
  });

  // Role Card Switcher in Create Account
  const roleCardTenant = $('roleCardTenant');
  const roleCardLawyer = $('roleCardLawyer');
  const tenantRegisterForm = $('tenantRegisterForm');
  const lawyerRegisterForm = $('lawyerRegisterForm');

  if (roleCardTenant && roleCardLawyer) {
    roleCardTenant.addEventListener('click', () => {
      activeSignUpRole = 'tenant';
      roleCardTenant.classList.add('active');
      roleCardLawyer.classList.remove('active');
      if (tenantRegisterForm) tenantRegisterForm.style.display = 'block';
      if (lawyerRegisterForm) lawyerRegisterForm.style.display = 'none';
    });

    roleCardLawyer.addEventListener('click', () => {
      activeSignUpRole = 'lawyer';
      roleCardLawyer.classList.add('active');
      roleCardTenant.classList.remove('active');
      if (tenantRegisterForm) tenantRegisterForm.style.display = 'none';
      if (lawyerRegisterForm) lawyerRegisterForm.style.display = 'block';
    });
  }

  // Sign In Form Submission (With Smart Auto-Account Creation)
  const signInForm = $('signInForm');
  if (signInForm) {
    signInForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = $('loginEmail').value.trim();
      const password = $('loginPassword').value;
      const errBox = $('signInErrorBox');
      if (errBox) errBox.style.display = 'none';

      try {
        const user = await ClauseShieldDB.auth.signIn({ email, password });
        toast(`✓ Welcome back, ${user.full_name}!`);
        closeModal('authModal');
        updateNavUserState();
        if (typeof renderComplaintsFeed === 'function') renderComplaintsFeed();
        if (user.role === 'advocate' || user.role === 'lawyer') {
          window.location.hash = '#advocate/overview';
        } else if (user.role === 'tenant') {
          window.location.hash = '#tenant-dashboard';
        } else if (user.role === 'admin') {
          window.location.hash = '#admin-dashboard';
        }

        if (user.role === 'advocate' || user.role === 'lawyer') {
          window.location.hash = '#advocate/overview';
        } else if (user.role === 'tenant') {
          window.location.hash = '#tenant-dashboard';
        } else if (user.role === 'admin') {
          window.location.hash = '#admin-dashboard';
        }
      } catch (err) {
        // If account not found: auto-create user or provide friendly 1-click option
        if (err.userNotFound) {
          if (errBox) {
            errBox.style.display = 'block';
            errBox.innerHTML = `
              <strong>No account found for "${escapeHTML(email)}".</strong><br>
              <div style="margin-top:8px;">
                <button type="button" class="btn primary" id="btnAutoCreateTenant" style="padding:6px 12px;font-size:.82rem;">Create as Tenant</button>
                <button type="button" class="btn secondary" id="btnAutoCreateLawyer" style="padding:6px 12px;font-size:.82rem;margin-left:6px;">Create as Advocate</button>
              </div>
            `;
            $('btnAutoCreateTenant').onclick = async () => {
              const u = await ClauseShieldDB.auth.signUp({ email, password, full_name: email.split('@')[0], role: 'tenant' });
              toast(`✓ Account created! Welcome, ${u.full_name}`);
              closeModal('authModal');
              updateNavUserState();
              if (typeof renderComplaintsFeed === 'function') renderComplaintsFeed();
            };
            $('btnAutoCreateLawyer').onclick = async () => {
              const u = await ClauseShieldDB.auth.signUp({ email, password, full_name: 'Adv. ' + email.split('@')[0], role: 'lawyer' });
              toast(`✓ Advocate account created! Welcome, ${u.full_name}`);
              closeModal('authModal');
              updateNavUserState();
              if (typeof renderComplaintsFeed === 'function') renderComplaintsFeed();
            };
          } else {
            toast(err.message);
          }
        } else {
          if (errBox) {
            errBox.style.display = 'block';
            errBox.textContent = err.message || 'Login failed. Please check credentials.';
          } else {
            toast(err.message || 'Login failed.');
          }
        }
      }
    });
  }

  // Tenant Register Form Submission
  if (tenantRegisterForm) {
    tenantRegisterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const full_name = $('tenantFullName').value.trim();
      const email = $('tenantRegEmail').value.trim();
      const password = $('tenantRegPassword').value;
      const phone = $('tenantRegPhone') ? $('tenantRegPhone').value.trim() : '';
      const errBox = $('tenantRegErrorBox');
      if (errBox) errBox.style.display = 'none';

      try {
        const user = await ClauseShieldDB.auth.signUp({
          email,
          password,
          full_name,
          phone,
          role: 'tenant'
        });
        toast(`✓ Account created! Welcome, ${user.full_name}`);
        closeModal('authModal');
        updateNavUserState();
        if (typeof renderComplaintsFeed === 'function') renderComplaintsFeed();
        if (user.role === 'advocate' || user.role === 'lawyer') {
          window.location.hash = '#advocate/overview';
        } else if (user.role === 'tenant') {
          window.location.hash = '#tenant-dashboard';
        } else if (user.role === 'admin') {
          window.location.hash = '#admin-dashboard';
        }
        window.location.hash = '#complaint-generator';
      } catch (err) {
        if (errBox) {
          errBox.style.display = 'block';
          errBox.textContent = err.message || 'Registration failed.';
        } else {
          toast(err.message || 'Registration failed.');
        }
      }
    });
  }

  // Lawyer Register Form Submission
  if (lawyerRegisterForm) {
    lawyerRegisterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const full_name = $('lawyerFullName').value.trim();
      const email = $('lawyerRegEmail').value.trim();
      const phone = $('lawyerPhone') ? $('lawyerPhone').value.trim() : '';
      const password = $('lawyerRegPassword').value;
      const bar_council_number = $('lawyerBarNumber') ? $('lawyerBarNumber').value.trim() : 'PENDING';
      const state_bar_council = $('lawyerStateBar') ? $('lawyerStateBar').value : 'Bar Council of Maharashtra & Goa';
      const state_of_practice = $('lawyerStatePractice') ? $('lawyerStatePractice').value.trim() : 'Maharashtra';
      const city_of_practice = $('lawyerCityPractice') ? $('lawyerCityPractice').value.trim() : 'Mumbai';
      const years_experience = $('lawyerExperience') ? Number($('lawyerExperience').value) : 1;
      const profile_photo = $('lawyerPhotoUrl') ? $('lawyerPhotoUrl').value.trim() : '';
      const bio = $('lawyerBio') ? $('lawyerBio').value.trim() : '';

      const practice_areas = [];
      document.querySelectorAll('input[name="advPracticeArea"]:checked').forEach(cb => practice_areas.push(cb.value));

      const errBox = $('lawyerRegErrorBox');
      if (errBox) errBox.style.display = 'none';

      try {
        const user = await ClauseShieldDB.auth.signUp({
          email,
          password,
          full_name,
          phone,
          role: 'advocate',
          advocateDetails: {
            bar_council_number,
            state_bar_council,
            state_of_practice,
            city_of_practice,
            years_experience,
            practice_areas: practice_areas.length ? practice_areas : ['Rental and tenancy disputes'],
            profile_photo,
            bio
          }
        });
        toast(`✓ Advocate registered! Credentials submitted for Bar Council verification.`);
        closeModal('authModal');
        updateNavUserState();
        window.location.hash = '#advocate/overview';
      } catch (err) {
        if (errBox) {
          errBox.style.display = 'block';
          errBox.textContent = err.message || 'Advocate registration failed.';
        } else {
          toast(err.message || 'Advocate registration failed.');
        }
      }
    });
  }
}

// "Post Your Legal Issue" Submission Form
// ------------------------------------------------------------------------------

const tenantPostIssueForm = $('tenantPostIssueForm');
if (tenantPostIssueForm) {
  tenantPostIssueForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = ClauseShieldDB.auth.getCurrentUser();

    if (!user) {
      toast('Please log in or create a Tenant Account to post your issue.');
      openModal('authModal');
      return;
    }

    if (user.role !== 'tenant') {
      toast('Only tenant accounts can submit legal issues. Please switch to a tenant account.');
      return;
    }

    const title = $('issueTitle').value.trim();
    const category = $('issueCategory').value;
    const state = $('issueState').value;
    const city = $('issueCity').value.trim();
    const amount_in_dispute = Number($('issueAmount').value) || 0;
    const incident_date = $('issueDate').value;
    const preferred_method = $('issueMethod').value;
    const description = $('issueDescription').value.trim();
    const preferred_time = $('issueTime').value;

    try {
      const newIssue = await ClauseShieldDB.issues.create({
        tenant_id: user.id,
        title,
        category,
        city,
        state,
        description,
        amount_in_dispute,
        incident_date,
        preferred_method,
        preferred_time,
        document_attachment_url: 'supporting_evidence_bundle.pdf'
      });

      toast(`✓ Legal issue posted! Case Ref: ${newIssue.issue_reference}`);
      tenantPostIssueForm.reset();
      loadTenantDashboard();
      window.location.hash = '#tenant-dashboard';
    } catch (err) {
      toast(err.message || 'Error posting issue.');
    }
  });
}

// ------------------------------------------------------------------------------
// "Find a Lawyer" Directory Module
// ------------------------------------------------------------------------------

async function loadLawyerDirectory() {
  const container = $('lawyersGrid');
  if (!container) return;

  const search = $('lawyerDirectorySearch') ? $('lawyerDirectorySearch').value : '';
  const specialty = $('lawyerDirectorySpecialty') ? $('lawyerDirectorySpecialty').value : 'all';
  const state = $('lawyerDirectoryState') ? $('lawyerDirectoryState').value : 'all';

  const lawyers = await ClauseShieldDB.lawyers.getVerified({
    specialisation: specialty,
    state: state,
    search: search
  });

  if (lawyers.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:40px 20px;background:#f8faff;border-radius:14px;border:1px dashed var(--line);">
        <p style="font-size:1.1rem;color:var(--navy);font-weight:700;margin-bottom:8px;">No verified advocates found matching your filter criteria.</p>
        <p class="fine">Try clearing your search keyword or selecting "All Specialties".</p>
      </div>
    `;
    return;
  }

  container.innerHTML = lawyers.map(l => `
    <article class="lawyer-card">
      <div class="lawyer-head">
        <img src="${escapeHTML(l.avatar_url)}" alt="${escapeHTML(l.full_name)}" class="lawyer-avatar">
        <div class="lawyer-head-info">
          <h3 class="lawyer-name">${escapeHTML(l.full_name)} <span class="verified-icon" title="Bar Council Verified">✓</span></h3>
          <span class="lawyer-bar">${escapeHTML(l.bar_council_number)} · ${escapeHTML(l.state_bar_council)}</span>
          <div class="lawyer-specialty">${escapeHTML(l.specialisation)}</div>
          <span class="badge-verified">✓ Bar Council Verified</span>
        </div>
      </div>
      <div class="lawyer-bio">${escapeHTML(l.bio)}</div>
      <div class="lawyer-meta-row">
        <div>
          <span class="fine">Experience</span>
          <strong style="display:block;color:var(--navy);">${l.years_experience} Years</strong>
        </div>
        <div>
          <span class="fine">Availability</span>
          <strong style="display:block;font-size:.78rem;color:var(--muted);">${escapeHTML(l.availability)}</strong>
        </div>
        <div style="text-align:right;">
          <span class="fine">Consultation Fee</span>
          <div class="lawyer-fee">${formatINR(l.consultation_fee)}</div>
        </div>
      </div>
      <div class="lawyer-actions">
        <button type="button" class="btn primary book-lawyer-btn" data-lawyer-id="${l.user_id}">Book Video Consultation</button>
      </div>
    </article>
  `).join('');

  container.querySelectorAll('.book-lawyer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lawyerId = btn.getAttribute('data-lawyer-id');
      const lawyer = lawyers.find(item => item.user_id === lawyerId);
      if (lawyer) openConsultationBooking(lawyer);
    });
  });
}

if ($('lawyerDirectorySearch')) $('lawyerDirectorySearch').addEventListener('input', loadLawyerDirectory);
if ($('lawyerDirectorySpecialty')) $('lawyerDirectorySpecialty').addEventListener('change', loadLawyerDirectory);
if ($('lawyerDirectoryState')) $('lawyerDirectoryState').addEventListener('change', loadLawyerDirectory);

// ------------------------------------------------------------------------------
// Tenant Dashboard Module
// ------------------------------------------------------------------------------

async function loadTenantDashboard() {
  const user = ClauseShieldDB.auth.getCurrentUser();
  if (!user || user.role !== 'tenant') return;

  const [issues, consultations, requests, payments] = await Promise.all([
    ClauseShieldDB.issues.getByTenant(user.id),
    ClauseShieldDB.consultations.getByUser(user.id, 'tenant'),
    ClauseShieldDB.consultationRequests.getByTenant(user.id),
    ClauseShieldDB.payments.getByUser(user.id)
  ]);

  if ($('tenantMetricIssues')) $('tenantMetricIssues').textContent = issues.length;
  if ($('tenantMetricRequests')) $('tenantMetricRequests').textContent = requests.filter(r => r.status === 'pending').length;
  if ($('tenantMetricMeetings')) $('tenantMetricMeetings').textContent = consultations.filter(c => c.status === 'scheduled').length;

  // Render Tenant Issues Cards
  const issuesContainer = $('tenantIssuesList');
  if (issuesContainer) {
    if (issues.length === 0) {
      issuesContainer.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:40px;background:#fff;border-radius:14px;border:1px dashed var(--line);">
          <p style="font-size:1.05rem;color:var(--navy);font-weight:700;">You haven't posted any legal issues yet.</p>
          <a href="#post-issue" class="btn primary" style="margin-top:12px;">+ Post Your Legal Issue</a>
        </div>
      `;
    } else {
      issuesContainer.innerHTML = issues.map(iss => `
        <div class="issue-card">
          <div class="issue-card-header">
            <span class="issue-ref">${escapeHTML(iss.issue_reference)}</span>
            <span class="status-pill status-${iss.status}">${iss.status.replace('_', ' ')}</span>
          </div>
          <h3 class="issue-title">${escapeHTML(iss.title)}</h3>
          <div class="issue-location">📍 ${escapeHTML(iss.city)}, ${escapeHTML(iss.state)}</div>
          <div class="issue-desc">${escapeHTML(iss.description)}</div>
          <div class="issue-meta-box">
            <span>Dispute Amount: <strong class="issue-dispute-amt">${formatINR(iss.amount_in_dispute)}</strong></span>
            <span>Date: ${iss.incident_date || 'Recent'}</span>
          </div>
          <div style="display:flex;gap:8px;margin-top:auto;">
            <button type="button" class="btn secondary view-issue-btn" data-issue-id="${iss.id}" style="flex:1;padding:8px 12px;font-size:.84rem;">View Details</button>
            ${(iss.status === 'open' || iss.status === 'consultation_requested') ? `
              <button type="button" class="btn secondary withdraw-issue-btn" data-issue-id="${iss.id}" style="color:var(--red);padding:8px 12px;font-size:.84rem;">Withdraw</button>
            ` : ''}
          </div>
        </div>
      `).join('');

      issuesContainer.querySelectorAll('.view-issue-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const issId = btn.getAttribute('data-issue-id');
          const issue = await ClauseShieldDB.issues.getById(issId);
          if (issue) openIssueDetailsModal(issue);
        });
      });

      issuesContainer.querySelectorAll('.withdraw-issue-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (confirm('Are you sure you want to withdraw this legal issue?')) {
            const issId = btn.getAttribute('data-issue-id');
            await ClauseShieldDB.issues.withdraw(issId, user.id);
            toast('Issue withdrawn.');
            loadTenantDashboard();
          }
        });
      });
    }
  }

  // Render Consultations Table
  const consultTable = $('tenantConsultationsTable');
  if (consultTable) {
    if (consultations.length === 0) {
      consultTable.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;">No video consultations scheduled yet.</td></tr>`;
    } else {
      consultTable.innerHTML = consultations.map(c => `
        <tr>
          <td>
            <strong>${escapeHTML(c.lawyer_name)}</strong>
            <div class="fine">${escapeHTML(c.bar_council_number || '')}</div>
          </td>
          <td>${escapeHTML(c.issue_title || 'Tenancy Matter')}</td>
          <td>${new Date(c.scheduled_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
          <td><span class="status-pill status-${c.status}">${c.status}</span></td>
          <td>
            ${c.status === 'scheduled' || c.status === 'in_progress' ? `
              <button type="button" class="btn primary join-video-btn" data-cst-id="${c.id}" style="padding:6px 14px;font-size:.82rem;">Join Video Call</button>
            ` : `<span class="fine">Session Completed</span>`}
          </td>
        </tr>
      `).join('');

      consultTable.querySelectorAll('.join-video-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const cId = btn.getAttribute('data-cst-id');
          const cst = await ClauseShieldDB.consultations.getById(cId);
          if (cst) launchVideoCall(cst);
        });
      });
    }
  }

  // Render Consultation Offers Table
  const offersTable = $('tenantOffersTable');
  if (offersTable) {
    const pendingOffers = requests.filter(r => r.status === 'pending');
    if (pendingOffers.length === 0) {
      offersTable.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;">No consultation offers pending at this time.</td></tr>`;
    } else {
      offersTable.innerHTML = pendingOffers.map(req => `
        <tr>
          <td>
            <strong>${escapeHTML(req.lawyer_name)}</strong>
            <div class="fine">${escapeHTML(req.bar_council_number || '')}</div>
          </td>
          <td>${escapeHTML(req.issue_title)}</td>
          <td>${new Date(req.proposed_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
          <td style="max-width:240px;font-size:.82rem;">${escapeHTML(req.note || 'Ready to provide legal counsel.')}</td>
          <td><strong>${formatINR(req.consultation_fee)}</strong></td>
          <td>
            <div style="display:flex;gap:6px;">
              <button type="button" class="btn primary accept-offer-btn" data-req-id="${req.id}" style="padding:6px 12px;font-size:.8rem;">Accept</button>
              <button type="button" class="btn secondary decline-offer-btn" data-req-id="${req.id}" style="padding:6px 12px;font-size:.8rem;">Decline</button>
            </div>
          </td>
        </tr>
      `).join('');

      offersTable.querySelectorAll('.accept-offer-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const reqId = btn.getAttribute('data-req-id');
          await ClauseShieldDB.consultationRequests.accept(reqId);
          toast('✓ Consultation accepted! Video room created.');
          loadTenantDashboard();
        });
      });

      offersTable.querySelectorAll('.decline-offer-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const reqId = btn.getAttribute('data-req-id');
          await ClauseShieldDB.consultationRequests.decline(reqId);
          toast('Offer declined.');
          loadTenantDashboard();
        });
      });
    }
  }

  // Render Demonstration Payment Receipts
  const paymentsTable = $('tenantPaymentsTable');
  if (paymentsTable) {
    if (payments.length === 0) {
      paymentsTable.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;">No demonstration payment records found.</td></tr>`;
    } else {
      paymentsTable.innerHTML = payments.map(p => `
        <tr>
          <td><code>${escapeHTML(p.transaction_reference)}</code></td>
          <td>${escapeHTML(p.lawyer_name)}</td>
          <td><strong>${formatINR(p.gross_amount)}</strong></td>
          <td><span class="status-pill status-accepted">Demo Processed</span></td>
          <td><span class="fine">BCI Demonstration</span></td>
          <td>${new Date(p.created_at).toLocaleDateString()}</td>
        </tr>
      `).join('');
    }
  }
}

// ------------------------------------------------------------------------------
// Lawyer Dashboard & Public Case Board Module
// ------------------------------------------------------------------------------

async function loadLawyerDashboard() {
  const user = ClauseShieldDB.auth.getCurrentUser();
  if (!user || user.role !== 'lawyer') return;

  const lawyerProfile = await ClauseShieldDB.lawyers.getByUserId(user.id);
  const isVerified = lawyerProfile && lawyerProfile.verification_status === 'verified';

  // Verification status banner and badge
  const banner = $('lawyerVerificationBanner');
  const badge = $('lawyerStatusBadge');
  const bannerText = $('lawyerVerificationText');

  if (isVerified) {
    if (banner) banner.style.display = 'none';
    if (badge) {
      badge.textContent = '✓ Bar Council Verified';
      badge.className = 'badge-verified';
    }
  } else {
    if (banner) {
      banner.style.display = 'flex';
      bannerText.innerHTML = `
        <strong>Application Under Review · Pending Bar Council Verification:</strong>
        Your advocate profile is pending verification by our administrative directorate. Once your Bar Council enrolment credentials are verified, you will be able to accept cases and offer consultations.
      `;
    }
    if (badge) {
      badge.textContent = 'Verification Pending';
      badge.className = 'badge-pending';
    }
  }

  // Fetch Lawyer Cases & Consultations
  const search = $('lawyerCaseSearch') ? $('lawyerCaseSearch').value : '';
  const category = $('lawyerCaseCategoryFilter') ? $('lawyerCaseCategoryFilter').value : 'all';
  const state = $('lawyerCaseStateFilter') ? $('lawyerCaseStateFilter').value : 'all';
  const status = $('lawyerCaseStatusFilter') ? $('lawyerCaseStatusFilter').value : 'all';

  const [availableCases, consultations, payments] = await Promise.all([
    ClauseShieldDB.issues.getAllAvailable({ category, state, search, status }),
    ClauseShieldDB.consultations.getByUser(user.id, 'lawyer'),
    ClauseShieldDB.payments.getByUser(user.id)
  ]);

  if ($('lawyerMetricAvailableCases')) $('lawyerMetricAvailableCases').textContent = availableCases.length;
  if ($('lawyerMetricConsultations')) $('lawyerMetricConsultations').textContent = consultations.length;

  const totalLawyerNet = payments.reduce((acc, p) => acc + (Number(p.lawyer_share) || 0), 0);
  const totalLawyerGross = payments.reduce((acc, p) => acc + (Number(p.gross_amount) || 0), 0);
  const totalPlatformCut = payments.reduce((acc, p) => acc + (Number(p.platform_fee) || 0), 0);

  if ($('lawyerMetricEarnings')) $('lawyerMetricEarnings').textContent = formatINR(totalLawyerNet);
  if ($('lawyerLedgerGross')) $('lawyerLedgerGross').textContent = formatINR(totalLawyerGross);
  if ($('lawyerLedgerPlatform')) $('lawyerLedgerPlatform').textContent = formatINR(totalPlatformCut);
  if ($('lawyerLedgerNet')) $('lawyerLedgerNet').textContent = formatINR(totalLawyerNet);

  // Render Available Cases Grid
  const casesContainer = $('lawyerAvailableCasesGrid');
  if (casesContainer) {
    if (availableCases.length === 0) {
      casesContainer.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:40px;background:#fff;border-radius:14px;border:1px dashed var(--line);">
          <p style="font-size:1.05rem;color:var(--navy);font-weight:700;">No tenant issues match your current filters.</p>
        </div>
      `;
    } else {
      casesContainer.innerHTML = availableCases.map(iss => {
        const isAssignedToOther = iss.assigned_lawyer_id && iss.assigned_lawyer_id !== user.id;
        const canOffer = isVerified && !isAssignedToOther && iss.status !== 'completed' && iss.status !== 'withdrawn';

        return `
          <div class="issue-card">
            <div class="issue-card-header">
              <span class="issue-ref">${escapeHTML(iss.issue_reference)}</span>
              <span class="status-pill status-${iss.status}">${iss.status.replace('_', ' ')}</span>
            </div>
            <h3 class="issue-title">${escapeHTML(iss.title)}</h3>
            <div class="issue-location">📍 ${escapeHTML(iss.city)}, ${escapeHTML(iss.state)}</div>
            <div class="issue-desc">${escapeHTML(iss.description)}</div>
            <div class="issue-meta-box">
              <span>Dispute: <strong class="issue-dispute-amt">${formatINR(iss.amount_in_dispute)}</strong></span>
              <span>Pref: ${iss.preferred_method === 'video_call' ? '📹 Video Call' : '📞 Call'}</span>
            </div>
            <div style="display:flex;gap:8px;margin-top:auto;">
              <button type="button" class="btn secondary lawyer-view-btn" data-issue-id="${iss.id}" style="flex:1;padding:8px 12px;font-size:.84rem;">View Details</button>
              ${canOffer ? `
                <button type="button" class="btn primary lawyer-offer-btn" data-issue-id="${iss.id}" style="flex:1;padding:8px 12px;font-size:.84rem;">Offer Consultation</button>
              ` : isAssignedToOther ? `
                <button type="button" class="btn secondary" disabled title="Assigned to another advocate" style="flex:1;opacity:.6;padding:8px 12px;font-size:.84rem;">Assigned</button>
              ` : !isVerified ? `
                <button type="button" class="btn secondary" disabled title="Advocate verification required" style="flex:1;opacity:.6;padding:8px 12px;font-size:.84rem;">Pending Verification</button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');

      casesContainer.querySelectorAll('.lawyer-view-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const issId = btn.getAttribute('data-issue-id');
          const issue = await ClauseShieldDB.issues.getById(issId);
          if (issue) openIssueDetailsModal(issue);
        });
      });

      casesContainer.querySelectorAll('.lawyer-offer-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const issId = btn.getAttribute('data-issue-id');
          const issue = await ClauseShieldDB.issues.getById(issId);
          if (issue && lawyerProfile) {
            openConsultationBooking(lawyerProfile, issue, 'lawyer');
          }
        });
      });
    }
  }

  // Render Lawyer Consultations Table
  const consultTable = $('lawyerConsultationsTable');
  if (consultTable) {
    if (consultations.length === 0) {
      consultTable.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;">No client consultations assigned yet.</td></tr>`;
    } else {
      consultTable.innerHTML = consultations.map(c => `
        <tr>
          <td><strong>${escapeHTML(c.tenant_name)}</strong></td>
          <td>${escapeHTML(c.issue_title || 'Tenancy Matter')}</td>
          <td>${new Date(c.scheduled_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
          <td><span class="status-pill status-${c.status}">${c.status}</span></td>
          <td>
            ${c.status === 'scheduled' || c.status === 'in_progress' ? `
              <button type="button" class="btn primary join-video-btn" data-cst-id="${c.id}" style="padding:6px 14px;font-size:.82rem;">Join Video Call</button>
            ` : `<span class="fine">Session Completed</span>`}
          </td>
        </tr>
      `).join('');

      consultTable.querySelectorAll('.join-video-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const cId = btn.getAttribute('data-cst-id');
          const cst = await ClauseShieldDB.consultations.getById(cId);
          if (cst) launchVideoCall(cst);
        });
      });
    }
  }

  // Render Lawyer Ledger Table
  const ledgerTable = $('lawyerLedgerTable');
  if (ledgerTable) {
    if (payments.length === 0) {
      ledgerTable.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;">No demonstration transactions recorded.</td></tr>`;
    } else {
      ledgerTable.innerHTML = payments.map(p => `
        <tr>
          <td><code>${escapeHTML(p.transaction_reference)}</code></td>
          <td>${escapeHTML(p.tenant_name)}</td>
          <td>${formatINR(p.gross_amount)}</td>
          <td style="color:var(--green);font-weight:700;">${formatINR(p.lawyer_share)}</td>
          <td class="fine">${formatINR(p.platform_fee)}</td>
          <td><span class="status-pill status-accepted">Demo Processed</span></td>
          <td>${new Date(p.created_at).toLocaleDateString()}</td>
        </tr>
      `).join('');
    }
  }
}

if ($('lawyerCaseSearch')) $('lawyerCaseSearch').addEventListener('input', loadLawyerDashboard);
if ($('lawyerCaseCategoryFilter')) $('lawyerCaseCategoryFilter').addEventListener('change', loadLawyerDashboard);
if ($('lawyerCaseStateFilter')) $('lawyerCaseStateFilter').addEventListener('change', loadLawyerDashboard);
if ($('lawyerCaseStatusFilter')) $('lawyerCaseStatusFilter').addEventListener('change', loadLawyerDashboard);

// ------------------------------------------------------------------------------
// Admin Dashboard Directorate Module
// ------------------------------------------------------------------------------

async function loadAdminDashboard() {
  const user = ClauseShieldDB.auth.getCurrentUser();
  if (!user || user.role !== 'admin') return;

  const [metrics, pendingLawyers, allUsers, allIssues, consultations, payments, settings] = await Promise.all([
    ClauseShieldDB.admin.getMetrics(),
    ClauseShieldDB.lawyers.getPending(),
    ClauseShieldDB.admin.getAllUsers(),
    ClauseShieldDB.issues.getAllAvailable({}),
    ClauseShieldDB.consultations.getByUser('admin', 'admin'),
    ClauseShieldDB.payments.getAll(),
    ClauseShieldDB.admin.getSettings()
  ]);

  if ($('adminMetricTenants')) $('adminMetricTenants').textContent = metrics.totalTenants;
  if ($('adminMetricLawyers')) $('adminMetricLawyers').textContent = metrics.totalLawyers;
  if ($('adminMetricPending')) $('adminMetricPending').textContent = metrics.pendingLawyers;
  if ($('adminMetricVerified')) $('adminMetricVerified').textContent = metrics.verifiedLawyers;
  if ($('adminMetricIssues')) $('adminMetricIssues').textContent = metrics.totalIssues;
  if ($('adminMetricActiveConsultations')) $('adminMetricActiveConsultations').textContent = metrics.activeConsultations;

  // Render Lawyer Verifications Table
  const verificationsTable = $('adminLawyerVerificationsTable');
  if (verificationsTable) {
    if (pendingLawyers.length === 0) {
      verificationsTable.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--green);font-weight:700;">✓ No pending advocate applications. All advocates reviewed!</td></tr>`;
    } else {
      verificationsTable.innerHTML = pendingLawyers.map(lp => `
        <tr>
          <td>
            <strong>${escapeHTML(lp.full_name)}</strong>
            <div class="fine">${escapeHTML(lp.email)}</div>
          </td>
          <td><code>${escapeHTML(lp.bar_council_number)}</code></td>
          <td>${escapeHTML(lp.state_bar_council)}</td>
          <td>${escapeHTML(lp.specialisation)}</td>
          <td>${lp.years_experience} Years</td>
          <td>${formatINR(lp.consultation_fee)}</td>
          <td>
            <a href="javascript:void(0)" class="fine" onclick="toast('Inspection preview: ${escapeHTML(lp.document_url)}')">📄 View Document</a>
          </td>
          <td>
            <div style="display:flex;gap:6px;">
              <button type="button" class="btn primary approve-lawyer-btn" data-lawyer-id="${lp.id}" style="padding:6px 12px;font-size:.8rem;background:var(--green);">✓ Verify</button>
              <button type="button" class="btn secondary reject-lawyer-btn" data-lawyer-id="${lp.id}" style="padding:6px 12px;font-size:.8rem;color:var(--red);">✕ Reject</button>
            </div>
          </td>
        </tr>
      `).join('');

      verificationsTable.querySelectorAll('.approve-lawyer-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const lpId = btn.getAttribute('data-lawyer-id');
          await ClauseShieldDB.lawyers.verify(lpId, user.id);
          toast('✓ Advocate verified! Profile is now active on public directory.');
          loadAdminDashboard();
          loadLawyerDirectory();
        });
      });

      verificationsTable.querySelectorAll('.reject-lawyer-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const lpId = btn.getAttribute('data-lawyer-id');
          const reason = prompt('Please enter the reason for rejection:', 'Bar Council credentials could not be verified.');
          if (reason) {
            await ClauseShieldDB.lawyers.reject(lpId, reason, user.id);
            toast('Advocate application rejected.');
            loadAdminDashboard();
          }
        });
      });
    }
  }

  // Render All Users Table
  const usersTable = $('adminUsersTable');
  if (usersTable) {
    usersTable.innerHTML = allUsers.map(u => `
      <tr>
        <td><strong>${escapeHTML(u.full_name)}</strong></td>
        <td>${escapeHTML(u.email)}</td>
        <td>${escapeHTML(u.phone || '—')}</td>
        <td><span class="user-role-badge badge-${u.role}">${u.role}</span></td>
        <td>${u.role === 'lawyer' ? `<span class="badge-${u.verification_status}">${u.verification_status}</span>` : 'Active'}</td>
        <td>${new Date(u.created_at).toLocaleDateString()}</td>
      </tr>
    `).join('');
  }

  // Render All Issues Table
  const issuesTable = $('adminIssuesTable');
  if (issuesTable) {
    issuesTable.innerHTML = allIssues.map(iss => `
      <tr>
        <td><code>${escapeHTML(iss.issue_reference)}</code></td>
        <td>${escapeHTML(iss.title)}</td>
        <td><span class="status-pill status-${iss.status}">${iss.category.replace('_', ' ')}</span></td>
        <td>${escapeHTML(iss.city)}, ${escapeHTML(iss.state)}</td>
        <td>${formatINR(iss.amount_in_dispute)}</td>
        <td><span class="status-pill status-${iss.status}">${iss.status}</span></td>
        <td>${new Date(iss.created_at).toLocaleDateString()}</td>
      </tr>
    `).join('');
  }

  // Render Consultations Table
  const adminConsultTable = $('adminConsultationsTable');
  if (adminConsultTable) {
    const consultationsAll = await ClauseShieldDB.consultations.getByUser('admin', 'admin');
    adminConsultTable.innerHTML = consultationsAll.map(c => `
      <tr>
        <td><code>${c.id}</code></td>
        <td>${escapeHTML(c.tenant_name)}</td>
        <td>${escapeHTML(c.lawyer_name)}</td>
        <td>${new Date(c.scheduled_at).toLocaleString()}</td>
        <td><span class="status-pill status-${c.status}">${c.status}</span></td>
        <td><small>${escapeHTML(c.meeting_room_id)}</small></td>
      </tr>
    `).join('');
  }

  // Render Payments Ledger Table
  const adminPaymentsTable = $('adminPaymentsTable');
  if (adminPaymentsTable) {
    adminPaymentsTable.innerHTML = payments.map(p => `
      <tr>
        <td><code>${escapeHTML(p.transaction_reference)}</code></td>
        <td>${escapeHTML(p.tenant_name)}</td>
        <td>${escapeHTML(p.lawyer_name)}</td>
        <td><strong>${formatINR(p.gross_amount)}</strong></td>
        <td>${formatINR(p.lawyer_share)}</td>
        <td style="color:var(--blue);font-weight:700;">${formatINR(p.platform_fee)}</td>
        <td><span class="status-pill status-accepted">Demo Processed</span></td>
        <td>${new Date(p.created_at).toLocaleDateString()}</td>
      </tr>
    `).join('');
  }

  // Populate Admin Settings Form
  if ($('cfgDefaultFee')) $('cfgDefaultFee').value = settings.default_fee || 500;
  if ($('cfgPlatformPct')) $('cfgPlatformPct').value = settings.platform_commission_pct || 10;
  if ($('cfgLawyerPct')) $('cfgLawyerPct').value = settings.lawyer_share_pct || 90;
}

// Admin Settings Form Submit
const adminSettingsForm = $('adminSettingsForm');
if (adminSettingsForm) {
  adminSettingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const default_fee = Number($('cfgDefaultFee').value) || 500;
    const platform_commission_pct = Number($('cfgPlatformPct').value) || 10;
    const lawyer_share_pct = Number($('cfgLawyerPct').value) || 90;
    const compliance_mode = $('cfgComplianceMode').value;

    await ClauseShieldDB.admin.updateSettings({
      default_fee,
      platform_commission_pct,
      lawyer_share_pct,
      compliance_mode
    });
    toast('✓ Platform fee parameters updated successfully.');
  });
}

// ------------------------------------------------------------------------------
// Video Consultation System (Jitsi WebRTC Integration)
// ------------------------------------------------------------------------------

function launchVideoCall(consultation) {
  const user = ClauseShieldDB.auth.getCurrentUser();
  if (!user) {
    toast('Please log in to join video consultation.');
    openModal('authModal');
    return;
  }

  // Strict authorization check: Only assigned tenant or lawyer can access meeting
  if (user.id !== consultation.tenant_id && user.id !== consultation.lawyer_id && user.role !== 'admin') {
    toast('Access denied: You are not an authorized participant for this legal consultation.');
    return;
  }

  activeVideoConsultation = consultation;

  if ($('videoCaseRef')) $('videoCaseRef').textContent = consultation.meeting_room_id;
  if ($('videoCaseTitle')) $('videoCaseTitle').textContent = consultation.issue_title || 'Legal Consultation';
  if ($('videoCaseLocation')) $('videoCaseLocation').textContent = consultation.issue_category || 'Tenancy Matter';
  if ($('videoCaseAmount')) $('videoCaseAmount').textContent = 'Confidential';

  // Build secure Jitsi Meet iframe
  const container = $('videoContainer');
  if (container) {
    const roomName = encodeURIComponent(consultation.meeting_room_id.replace(/[^a-zA-Z0-9]/g, '_'));
    const displayName = encodeURIComponent(user.full_name);
    
    container.innerHTML = `
      <iframe 
        src="https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&userInfo.displayName=%22${displayName}%22"
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        title="ClauseShield Confidential Legal Video Consultation">
      </iframe>
    `;
  }

  openModal('videoCallModal');
}

// End Consultation Button
const endVideoCallBtn = $('endVideoCallBtn');
if (endVideoCallBtn) {
  endVideoCallBtn.addEventListener('click', async () => {
    if (!activeVideoConsultation) return;

    if (confirm('Conclude this legal consultation session?')) {
      const notes = prompt('Enter consultation closing remarks or advice summary (Optional):', 'Consultation successfully completed.');
      await ClauseShieldDB.consultations.endCall(activeVideoConsultation.id, notes);
      toast('✓ Consultation ended and marked completed.');
      closeModal('videoCallModal');
      updateNavUserState();
    }
  });
}

// ------------------------------------------------------------------------------
// Consultation Booking & Offer Modal Flow
// ------------------------------------------------------------------------------

function openConsultationBooking(lawyer, issue = null, initiatedBy = 'tenant') {
  currentBookingContext = { lawyer, issue, initiatedBy };

  const fee = Number(lawyer.consultation_fee) || 500;
  const platformFee = Math.round(fee * 0.10);
  const lawyerShare = fee - platformFee;

  if ($('consultLawyerName')) $('consultLawyerName').textContent = lawyer.full_name || 'Advocate';
  if ($('consultLawyerMeta')) $('consultLawyerMeta').textContent = `${lawyer.bar_council_number || ''} · ${lawyer.specialisation || 'Tenancy Law'}`;
  if ($('consultFeeDisplay')) $('consultFeeDisplay').textContent = formatINR(fee);

  if ($('breakdownConsultFee')) $('breakdownConsultFee').textContent = formatINR(fee);
  if ($('breakdownLawyerShare')) $('breakdownLawyerShare').textContent = formatINR(lawyerShare);
  if ($('breakdownPlatformFee')) $('breakdownPlatformFee').textContent = formatINR(platformFee);
  if ($('breakdownTotalPayable')) $('breakdownTotalPayable').textContent = formatINR(fee);

  // Default to tomorrow 6:00 PM
  const tomorrow = new Date(Date.now() + 86400000);
  tomorrow.setHours(18, 0, 0, 0);
  const dateInput = $('consultPreferredDate');
  if (dateInput) {
    dateInput.value = tomorrow.toISOString().slice(0, 16);
  }

  openModal('consultationModal');
}

const consultationBookingForm = $('consultationBookingForm');
if (consultationBookingForm) {
  consultationBookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = ClauseShieldDB.auth.getCurrentUser();

    if (!user) {
      toast('Please log in to schedule a consultation.');
      openModal('authModal');
      return;
    }

    const { lawyer, issue, initiatedBy } = currentBookingContext;
    const proposedDate = $('consultPreferredDate').value;
    const note = $('consultUserNote').value.trim();

    try {
      if (initiatedBy === 'lawyer' && issue) {
        // Lawyer offering consultation on a tenant's issue
        await ClauseShieldDB.consultationRequests.create({
          issue_id: issue.id,
          tenant_id: issue.tenant_id,
          lawyer_id: user.id,
          initiated_by: 'lawyer',
          note: note || 'I have reviewed your tenancy dispute and am available for an online legal consultation.',
          proposed_date: proposedDate ? new Date(proposedDate).toISOString() : null
        });
        toast('✓ Consultation offer sent to the tenant!');
      } else {
        // Tenant booking directly with a verified lawyer
        const req = await ClauseShieldDB.consultationRequests.create({
          issue_id: issue ? issue.id : null,
          tenant_id: user.id,
          lawyer_id: lawyer.user_id || lawyer.id,
          initiated_by: 'tenant',
          note: note,
          proposed_date: proposedDate ? new Date(proposedDate).toISOString() : null
        });

        // Automatically accept and generate private video room
        await ClauseShieldDB.consultationRequests.accept(req.id, req.proposed_date);
        toast('✓ Consultation scheduled & private video meeting created!');
      }

      closeModal('consultationModal');
      updateNavUserState();
      if (user.role === 'tenant') window.location.hash = '#tenant-dashboard';
      else if (user.role === 'lawyer') window.location.hash = '#lawyer-dashboard';
    } catch (err) {
      toast(err.message || 'Error processing consultation request.');
    }
  });
}

// ------------------------------------------------------------------------------
// Issue Details Modal
// ------------------------------------------------------------------------------

function openIssueDetailsModal(issue) {
  const user = ClauseShieldDB.auth.getCurrentUser();

  if ($('detailRef')) $('detailRef').textContent = issue.issue_reference;
  if ($('detailStatus')) {
    const el = $('detailStatus');
    el.textContent = issue.status.replace('_', ' ');
    el.className = `status-pill status-${issue.status}`;
  }
  if ($('detailHeading')) $('detailHeading').textContent = issue.title;
  if ($('detailLocation')) $('detailLocation').textContent = `📍 ${issue.city}, ${issue.state}`;
  if ($('detailAmount')) $('detailAmount').textContent = formatINR(issue.amount_in_dispute);
  if ($('detailDate')) $('detailDate').textContent = issue.incident_date || 'Not specified';
  if ($('detailNarrative')) $('detailNarrative').textContent = issue.description;

  const actionsContainer = $('issueDetailActions');
  if (actionsContainer) {
    if (user && user.role === 'lawyer' && (issue.status === 'open' || issue.status === 'consultation_requested')) {
      actionsContainer.innerHTML = `
        <button type="button" class="btn primary" id="detailOfferBtn" style="flex:1;">Offer Online Consultation</button>
      `;
      const offerBtn = $('detailOfferBtn');
      if (offerBtn) {
        offerBtn.addEventListener('click', async () => {
          closeModal('issueDetailsModal');
          const lawyerProfile = await ClauseShieldDB.lawyers.getByUserId(user.id);
          if (lawyerProfile) openConsultationBooking(lawyerProfile, issue, 'lawyer');
        });
      }
    } else {
      actionsContainer.innerHTML = '';
    }
  }

  openModal('issueDetailsModal');
}

// ------------------------------------------------------------------------------
// Supabase & Backend Configuration Modal
// ------------------------------------------------------------------------------

const footerSupabaseBtn = $('footerSupabaseBtn');
const navOpenSupabaseConfig = $('navOpenSupabaseConfig');

if (footerSupabaseBtn) {
  footerSupabaseBtn.addEventListener('click', () => {
    const cfg = ClauseShieldDB.getConfig();
    if ($('sbUrlInput')) $('sbUrlInput').value = cfg.url || '';
    if ($('sbAnonKeyInput')) $('sbAnonKeyInput').value = cfg.anonKey || '';
    openModal('supabaseModal');
  });
}

if (navOpenSupabaseConfig) {
  navOpenSupabaseConfig.addEventListener('click', () => {
    const cfg = ClauseShieldDB.getConfig();
    if ($('sbUrlInput')) $('sbUrlInput').value = cfg.url || '';
    if ($('sbAnonKeyInput')) $('sbAnonKeyInput').value = cfg.anonKey || '';
    openModal('supabaseModal');
  });
}

const supabaseConfigForm = $('supabaseConfigForm');
if (supabaseConfigForm) {
  supabaseConfigForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = $('sbUrlInput').value.trim();
    const key = $('sbAnonKeyInput').value.trim();

    const res = ClauseShieldDB.setConfig(url, key);
    if (res.live) {
      toast('✓ Connected to live Supabase project!');
    } else {
      toast('Saved. Running with zero-config local persistent database.');
    }
    closeModal('supabaseModal');
  });
}

// Dashboard Tabs Switching (Within Tenant, Lawyer, Admin dashboards)
document.querySelectorAll('.dash-tabs').forEach(tabGroup => {
  tabGroup.querySelectorAll('.dash-tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      tabGroup.querySelectorAll('.dash-tab').forEach(b => b.classList.remove('active'));
      tabBtn.classList.add('active');

      const targetPaneId = tabBtn.getAttribute('data-tab');
      const container = tabGroup.closest('.dashboard-container');
      if (container) {
        container.querySelectorAll('.dash-pane').forEach(pane => {
          pane.hidden = pane.id !== targetPaneId;
        });
      }
    });
  });
});

// ------------------------------------------------------------------------------
// Platform Initialization on DOM Ready
// ------------------------------------------------------------------------------

window.addEventListener('DOMContentLoaded', () => {
  initAuthModal();
  initComplaintsPortal();
  updateNavUserState();
  loadLawyerDirectory();
  handleHashNavigation();
});
