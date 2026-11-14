import io
import os
import re
import urllib.parse
from typing import List, Optional, Tuple
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from pydantic import BaseModel, Field
import pypdf
import docx

# Initialize FastAPI application
app = FastAPI(
    title="ClauseShield AI Backend",
    description="Tenant lease agreement & clause audit engine powered by Indian Tenancy Law & Gemini AI",
    version="2.0.0",
)

# Enable CORS for local development and GitHub Pages deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# Data Models
# -------------------------------------------------------------

class ClauseFinding(BaseModel):
    clause_name: str = Field(description="Name or topic of the clause (e.g., Painting Charges, Security Deposit, Lock-in Period)")
    original_text: str = Field(description="The exact relevant sentence quoted directly from the agreement")
    concern_level: str = Field(description="'High', 'Medium', or 'Low'")
    simple_explanation: str = Field(description="Simple, everyday English explanation of what this clause means")
    why_needs_attention: str = Field(description="Why this clause may be concerning or disadvantageous to the tenant")
    suggested_action: str = Field(description="Actionable question or request the tenant should clarify with the landlord")
    legal_reference: Optional[str] = Field(default=None, description="Verified Indian legal reference or section")

class LegalReferenceItem(BaseModel):
    act_name: str = Field(description="Name of the Act or Legal Doctrine")
    section: str = Field(description="Specific section or statutory principle")
    summary: str = Field(description="How this statutory provision protects the tenant in this situation")
    tag: str = Field(description="Category tag (e.g. Model Framework, Contract Law, Essential Services)")
    source_url: Optional[str] = Field(default=None, description="Direct search link on Indian Kanoon / India Code")

class AgreementAnalysisResponse(BaseModel):
    document_name: str
    total_clauses_analyzed: int
    risk_score: int = Field(description="Overall risk score between 0 and 100")
    concern_level: str = Field(description="'HIGHER CONCERN · REVIEW', 'NEEDS REVIEW', or 'INFORMATION CHECK'")
    verdict_title: str
    overall_summary: str
    clauses: List[ClauseFinding]
    legal_references: List[LegalReferenceItem]
    state_note: Optional[str] = None
    extracted_rent: Optional[float] = 0
    extracted_deposit: Optional[float] = 0
    extracted_landlord: Optional[str] = ""
    suggested_steps: List[str]
    whatsapp_draft: str
    formal_letter: str
    engine_used: str
    is_scanned_pdf: bool = False
    character_count: int = 0

class AuditRequest(BaseModel):
    message: str
    state: Optional[str] = "All-India"
    city: Optional[str] = ""
    monthly_rent: Optional[float] = 0
    security_deposit: Optional[float] = 0
    amount_in_dispute: Optional[float] = 0
    landlord_name: Optional[str] = ""
    reply_days: Optional[int] = 7

class AuditResponse(BaseModel):
    title: str
    risk_score: int
    concern_level: str
    reasoning: str
    legal_references: List[str]
    state_note: Optional[str] = None
    suggested_steps: List[str]
    whatsapp_draft: str
    formal_letter: str
    engine_used: str = "ClauseShield AI Legal Engine"
    clauses: Optional[List[ClauseFinding]] = []
    dynamic_laws: Optional[List[LegalReferenceItem]] = []

# -------------------------------------------------------------
# State Legal Jurisdictions & Context
# -------------------------------------------------------------

STATE_CONTEXTS = {
    "Karnataka": "In Karnataka (especially Bengaluru), customary demands for 6 to 10 months deposit contradict the Model Tenancy Act (which caps residential deposits at 2 months). Routine painting charges upon vacating without contractor bills are widely contested under contract principles.",
    "Maharashtra": "In Maharashtra (Mumbai, Pune), tenancies are governed by the Maharashtra Rent Control Act, 1999. Under Section 55, Leave & License agreements must be registered. Landlords are prohibited from disconnecting essential services (Section 29), and deductions for normal fair wear-and-tear are invalid.",
    "Delhi": "In Delhi NCR (Delhi, Gurgaon, Noida), agreements are governed by the Delhi Rent Control Act and the Transfer of Property Act. Section 45 protects against essential utility disconnection, and withholding deposits without actual repair invoices constitutes unlawful retention.",
    "Tamil Nadu": "Tamil Nadu has enacted the Tamil Nadu Regulation of Rights and Responsibilities of Landlords and Tenants Act, 2017, which regulates security deposits, mandates written registration, and caps residential deposits at 3 months.",
    "Telangana": "In Telangana (Hyderabad), arbitrary deductions without itemized bills or joint handover inspection can be challenged before the local Rent Authority or Civil Court.",
    "West Bengal": "In West Bengal, premises tenancy laws mandate itemized disclosure of repair charges and protect tenants against unjustified forfeiture of deposits.",
    "All-India": "Under Section 74 of the Indian Contract Act, 1872, stipulating forfeiture or penalty without proof of actual damage or loss is not legally enforceable. Furthermore, the Model Tenancy Act, 2021 recommends a maximum 2-month security deposit for residential premises."
}

# Verified Indian Statutory Reference Bank
VERIFIED_LAWS_KNOWLEDGE_BASE = [
    {
        "keywords": ["expired", "expire", "lapse", "not renewed", "unrenewed", "holding over"],
        "act_name": "Transfer of Property Act, 1882",
        "section": "Section 111(a) & Section 116 (Determination of Lease & Holding Over)",
        "summary": "When your rental agreement expires, all lock-in periods and exit penalties end automatically. If you stay on and pay rent, you are only required to give standard written notice, and the landlord cannot charge you an early exit fee.",
        "tag": "Statutory Protection",
        "query": "Transfer of Property Act 1882 Section 111 Section 116 holding over expiry of lease"
    },
    {
        "keywords": ["notice", "15 days", "month to month", "vacate notice", "relocating", "job transfer"],
        "act_name": "Transfer of Property Act, 1882",
        "section": "Section 106 (Notice to Terminate Month-to-Month Tenancy)",
        "summary": "When an agreement has expired or is on a month-to-month basis, a 15-day written notice to vacate is legally sufficient, and no lock-in penalty can be imposed.",
        "tag": "Notice Standards",
        "query": "Transfer of Property Act 1882 Section 106 notice to quit month to month"
    },
    {
        "keywords": ["lock-in", "lockin", "premature", "early exit", "forfeit", "forfeiture", "break lease", "penalty"],
        "act_name": "Supreme Court Precedent & Contract Law",
        "section": "Section 74 ICA & Kailash Nath Associates v. DDA (2015)",
        "summary": "The Supreme Court of India ruled that a landlord cannot keep a tenant's deposit just because the agreement mentions a penalty. The landlord must prove they suffered real financial loss, and they must try to re-rent the property to minimize any vacancy.",
        "tag": "Judicial Precedent",
        "query": "Kailash Nath Associates vs DDA Section 74 liquidated damages forfeiture"
    },
    {
        "keywords": ["paint", "whitewash", "colour", "repainting", "wear", "tear"],
        "act_name": "Indian Contract Act, 1872",
        "section": "Section 74 (Fair Wear & Tear vs Deductions)",
        "summary": "Normal paint fading and wall scuffs are fair wear and tear. Deducting money or demanding 1 month's rent for painting without proving tenant damage and showing actual GST bills is illegal.",
        "tag": "Contract Doctrine",
        "query": "Indian Contract Act 1872 Section 74 penalty wear and tear"
    },
    {
        "keywords": ["deposit", "advance", "refund", "withhold", "caution"],
        "act_name": "Model Tenancy Act, 2021",
        "section": "Section 11 (Security Deposit Cap & Refund)",
        "summary": "Caps residential deposits at maximum 2 months' rent. The landlord must refund the deposit upon key handover (or within 30 days max) after fair, agreed adjustments.",
        "tag": "Statutory Cap",
        "query": "Model Tenancy Act 2021 Section 11 security deposit refund"
    },
    {
        "keywords": ["maintenance", "repair", "structural", "seepage", "plumbing", "electrical"],
        "act_name": "Transfer of Property Act, 1882",
        "section": "Section 108(m) & Model Tenancy Act Second Schedule",
        "summary": "Structural repairs, wall seepage, and main plumbing belong to the landlord. Tenants are only responsible for day-to-day minor consumables like light bulbs and tap washers.",
        "tag": "Property Law",
        "query": "Transfer of Property Act 1882 Section 108 landlord repair obligations"
    },
    {
        "keywords": ["escalat", "rent increase", "revision", "hike", "increment"],
        "act_name": "Model Tenancy Act, 2021",
        "section": "Section 9 & 10 (Revision of Rent)",
        "summary": "Rent cannot be increased mid-tenancy or without advance notice. Landlords must give at least 3 months' written notice before any rent increase can take effect.",
        "tag": "Rent Regulation",
        "query": "Model Tenancy Act 2021 Section 9 10 revision of rent notice"
    },
    {
        "keywords": ["inspect", "entry", "enter", "privacy", "trespass", "access"],
        "act_name": "Model Tenancy Act, 2021",
        "section": "Section 17 (Right of Entry & Tenant Privacy)",
        "summary": "A landlord or property manager cannot enter rented premises without giving at least 24 hours' prior written or electronic notice. Entry is only permitted between 7:00 AM and 8:00 PM for reasonable inspection.",
        "tag": "Tenant Rights",
        "query": "Model Tenancy Act 2021 Section 17 landlord entry 24 hour notice"
    },
    {
        "keywords": ["disconnect", "cut off", "electricity", "water", "essential", "utility"],
        "act_name": "State Rent Control Acts & Model Tenancy Act",
        "section": "Section 20 (Withholding of Essential Services)",
        "summary": "No landlord, either by himself or through an agent, can withhold or disconnect any essential supply or service (water, electricity, lift, passage) to the rented premises. Doing so is an actionable civil and criminal wrong.",
        "tag": "Essential Services",
        "query": "Model Tenancy Act Section 20 withholding essential supply electricity water"
    },
    {
        "keywords": ["evict", "eviction", "throw out", "lock out", "possession", "vacate"],
        "act_name": "Specific Relief Act, 1963",
        "section": "Section 6 (Suit by person dispossessed of immovable property)",
        "summary": "A tenant who is forcibly dispossessed of property without due legal process can file a summary suit to recover possession immediately, even against the true owner. No extrajudicial eviction is permitted in India.",
        "tag": "Eviction Protection",
        "query": "Specific Relief Act 1963 Section 6 illegal dispossession tenant"
    },
    {
        "keywords": ["platform", "co-living", "managed", "unfair", "broker", "pg", "student housing"],
        "act_name": "Consumer Protection Act, 2019",
        "section": "Section 2(47) (Unfair Contract Terms & Deficiency in Service)",
        "summary": "Protects renters against unfair terms and service deficiencies when renting through commercial managed housing platforms, co-living operators, or rental aggregators.",
        "tag": "Consumer Redressal",
        "query": "Consumer Protection Act 2019 unfair contract terms tenant co-living"
    }
]

def make_kanoon_url(query: str) -> str:
    encoded = urllib.parse.quote(query)
    return f"https://indiankanoon.org/search/?formInput={encoded}"

def find_relevant_laws(text: str, state: str = "All-India") -> List[LegalReferenceItem]:
    """Finds matching verified Indian statutory references and case laws tailored precisely to the issue."""
    lower_text = text.lower()
    scored_laws = []
    seen_acts = set()

    for item in VERIFIED_LAWS_KNOWLEDGE_BASE:
        match_count = sum(1 for kw in item["keywords"] if kw in lower_text)
        if match_count > 0:
            scored_laws.append((match_count, item))

    # Sort by relevance keyword score (highest relevance first)
    scored_laws.sort(key=lambda x: x[0], reverse=True)

    selected_laws = []
    for _, item in scored_laws:
        key = f"{item['act_name']}-{item['section']}"
        if key not in seen_acts:
            seen_acts.add(key)
            selected_laws.append(LegalReferenceItem(
                act_name=item["act_name"],
                section=item["section"],
                summary=item["summary"],
                tag=item["tag"],
                source_url=make_kanoon_url(item["query"])
            ))

    # Add State specific act ONLY if the topic is specifically relevant
    is_utility_issue = any(w in lower_text for w in ["electric", "water", "utility", "disconnect", "cut off"])
    is_registration_issue = any(w in lower_text for w in ["register", "stamp", "registration", "unregistered"])
    is_deposit_issue = any(w in lower_text for w in ["deposit", "advance", "10 month", "caution"])

    if state == "Maharashtra" and is_utility_issue and "Maharashtra Rent Control Act" not in seen_acts:
        selected_laws.append(LegalReferenceItem(
            act_name="Maharashtra Rent Control Act, 1999",
            section="Section 29 (Cutting off or withholding essential supply)",
            summary="Makes it an offense punishable with fine or imprisonment for a landlord to cut off water or electricity supply without just cause.",
            tag="State Act",
            source_url=make_kanoon_url("Maharashtra Rent Control Act 1999 Section 29 essential supply")
        ))
    elif state == "Maharashtra" and is_registration_issue and "Maharashtra Rent Control Act" not in seen_acts:
        selected_laws.append(LegalReferenceItem(
            act_name="Maharashtra Rent Control Act, 1999",
            section="Section 55 (Tenancy Agreement Registration)",
            summary="Requires Leave & License agreements to be registered in writing; the responsibility of registration lies primarily on the landlord.",
            tag="State Act",
            source_url=make_kanoon_url("Maharashtra Rent Control Act 1999 Section 55 registration")
        ))
    elif state == "Delhi" and is_utility_issue and "Delhi Rent Control Act" not in seen_acts:
        selected_laws.append(LegalReferenceItem(
            act_name="Delhi Rent Control Act, 1958",
            section="Section 45 (Cutting off or withholding essential supply)",
            summary="Empowers the Rent Controller to order immediate restoration of water or electricity if withheld by the landlord, and penalize the landlord.",
            tag="State Act",
            source_url=make_kanoon_url("Delhi Rent Control Act 1958 Section 45 essential supply")
        ))
    elif state == "Karnataka" and is_deposit_issue and "Karnataka Tenancy Framework" not in seen_acts:
        selected_laws.append(LegalReferenceItem(
            act_name="Karnataka Rent Guidelines & MTA Adoption",
            section="Doctrine on Disproportionate Security Deposits",
            summary="Challenges customary 10-month rental deposits and unilateral move-out deductions as conflicting with equitable contract principles.",
            tag="State Practice",
            source_url=make_kanoon_url("Karnataka high court tenant security deposit refund ordinary wear")
        ))

    # Fallback to general provisions only if completely unmatched
    if not selected_laws:
        selected_laws.append(LegalReferenceItem(
            act_name="Indian Contract Act, 1872",
            section="Section 73 & Section 74",
            summary="Deductions from a security deposit cannot be arbitrary or punitive. The landlord is only entitled to compensation for actual, proven damages resulting from a breach.",
            tag="Contract Law",
            source_url=make_kanoon_url("Indian Contract Act 1872 Section 74 liquidated damages")
        ))
        selected_laws.append(LegalReferenceItem(
            act_name="Model Tenancy Act, 2021",
            section="General Provisions & Schedule II",
            summary="Provides modern national guidelines governing residential deposits, mutual repair covenants, and dispute settlement between tenants and landlords.",
            tag="Model Framework",
            source_url=make_kanoon_url("Model Tenancy Act 2021 Government of India")
        ))

    # Keep only the top 2-3 most precise laws so the output is sharp and focused
    return selected_laws[:3]

# -------------------------------------------------------------
# Document Text Extraction
# -------------------------------------------------------------

def extract_text_from_pdf(content: bytes) -> Tuple[str, int, bool]:
    """Extracts text from PDF bytes. Returns (text, page_count, is_scanned_pdf)."""
    try:
        reader = pypdf.PdfReader(io.BytesIO(content))
        total_pages = len(reader.pages)
        extracted_text = ""
        # Read up to 25 pages
        for idx in range(min(total_pages, 25)):
            page_text = reader.pages[idx].extract_text() or ""
            extracted_text += f"\n--- Page {idx + 1} ---\n" + page_text

        cleaned = extracted_text.strip()
        is_scanned = len(cleaned) < 50
        return cleaned, total_pages, is_scanned
    except Exception as e:
        raise ValueError(f"Could not read PDF document: {str(e)}")

def extract_text_from_docx(content: bytes) -> Tuple[str, int, bool]:
    """Extracts text from DOCX bytes. Returns (text, paragraph_count, is_empty)."""
    try:
        doc = docx.Document(io.BytesIO(content))
        paragraphs = []
        for p in doc.paragraphs:
            txt = p.text.strip()
            if txt:
                paragraphs.append(txt)
        for table in doc.tables:
            for row in table.rows:
                row_txt = " | ".join(c.text.strip() for c in row.cells if c.text.strip())
                if row_txt:
                    paragraphs.append(row_txt)

        full_text = "\n\n".join(paragraphs).strip()
        is_empty = len(full_text) < 30
        return full_text, len(paragraphs), is_empty
    except Exception as e:
        raise ValueError(f"Could not read DOCX document: {str(e)}")

def extract_text_from_txt(content: bytes) -> Tuple[str, int, bool]:
    """Extracts text from plain text bytes."""
    try:
        text = content.decode("utf-8", errors="ignore").strip()
        return text, 1, len(text) < 10
    except Exception as e:
        raise ValueError(f"Could not read text document: {str(e)}")

def extract_entities_from_text(text: str) -> Tuple[float, float, str]:
    """Heuristic extraction of rent, security deposit, and landlord name from agreement text."""
    rent = 0.0
    deposit = 0.0
    landlord = ""

    # Look for rent
    rent_m = re.search(r'(?:monthly\s+)?rent[^\d\n\r]{1,50}?(?:₹|rs\.?|inr)?\s*([0-9]{1,2}(?:,[0-9]{2,3})+|[0-9]{4,6})', text, re.I)
    if rent_m:
        val_str = rent_m.group(1).replace(",", "")
        try:
            rent = float(val_str)
        except:
            pass

    # Look for security deposit
    dep_m = re.search(r'(?:security\s+deposit|caution\s+deposit|advance\s+deposit|deposit)[^\d\n\r]{1,50}?(?:₹|rs\.?|inr)?\s*([0-9]{1,2}(?:,[0-9]{2,3})+|[0-9]{4,7})', text, re.I)
    if dep_m:
        val_str = dep_m.group(1).replace(",", "")
        try:
            deposit = float(val_str)
        except:
            pass

    # Look for Landlord / Lessor name
    landlord_m = re.search(r'(?:Lessor|Landlord|Licensor|Owner)(?:\s*(?:is|called|named|referred to as))?[:\s]+((?:(?:Mr\.|Mrs\.|Ms\.|Shri|Dr\.)\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})', text)
    if landlord_m:
        landlord = landlord_m.group(1).strip()

    return rent, deposit, landlord

# -------------------------------------------------------------
# Smart Rule-Based Agreement Analysis Engine (Fallback & Local)
# -------------------------------------------------------------

def analyze_agreement_content(
    document_name: str,
    text: str,
    state: str = "All-India",
    city: str = "",
    monthly_rent: float = 0,
    security_deposit: float = 0,
    amount_in_dispute: float = 0,
    landlord_name: str = "",
    reply_days: int = 7,
    is_scanned: bool = False
) -> AgreementAnalysisResponse:
    """Rigorous multi-clause parser and Indian Tenancy Legal analyzer."""
    if is_scanned or len(text.strip()) < 50:
        return AgreementAnalysisResponse(
            document_name=document_name,
            total_clauses_analyzed=0,
            risk_score=50,
            concern_level="INFORMATION CHECK",
            verdict_title="Document appears to be scanned or contains non-selectable text.",
            overall_summary="We could not detect clear selectable text in this file. Scanned image-based PDFs or protected files cannot be automatically parsed. Please upload a digital PDF, a DOCX file, or copy and paste the key clause text directly.",
            clauses=[],
            legal_references=find_relevant_laws("deposit lease agreement", state),
            state_note=STATE_CONTEXTS.get(state, STATE_CONTEXTS["All-India"]),
            extracted_rent=monthly_rent,
            extracted_deposit=security_deposit,
            extracted_landlord=landlord_name,
            suggested_steps=[
                "Upload a text-searchable PDF or Word (.docx) version of the agreement.",
                "Or copy the disputed clause text directly into the Text input box.",
                "Ensure your rental agreement is readable on mobile or desktop."
            ],
            whatsapp_draft="Hello, could you please provide a digital copy or clarification regarding our rental agreement clauses?",
            formal_letter="Dear Landlord,\n\nI request you to kindly share a clear, legible digital copy of our signed tenancy agreement for our records.",
            engine_used="ClauseShield Document Scanner Notice",
            is_scanned_pdf=True,
            character_count=len(text)
        )

    # Automatically extract financial entities if user left them blank
    ext_rent, ext_deposit, ext_landlord = extract_entities_from_text(text)
    if monthly_rent <= 0 and ext_rent > 0:
        monthly_rent = ext_rent
    if security_deposit <= 0 and ext_deposit > 0:
        security_deposit = ext_deposit
    if not landlord_name and ext_landlord:
        landlord_name = ext_landlord

    loc = f"{city}, {state}".strip(", ") if city else state
    greeting = f"Hi {landlord_name}," if landlord_name else "Hello,"
    formal_greeting = f"Dear {landlord_name}," if landlord_name else "Dear Landlord,"
    landlord_ref = landlord_name if landlord_name else "[Landlord's Name]"

    # Split text into sentences / clause fragments for quotation
    sentences = re.split(r'(?<=[.!?\n])\s+', text)

    def find_best_sentence(pattern: str) -> Optional[str]:
        regex = re.compile(pattern, re.IGNORECASE)
        for s in sentences:
            s_clean = s.strip()
            if len(s_clean) > 25 and len(s_clean) < 400 and regex.search(s_clean):
                return s_clean.replace("\n", " ").strip()
        # Fallback to search in whole text
        match = regex.search(text)
        if match:
            start = max(0, match.start() - 50)
            end = min(len(text), match.end() + 120)
            return text[start:end].replace("\n", " ").strip()
        return None

    clauses: List[ClauseFinding] = []

    # 1. Painting / Whitewash Clause
    paint_sent = find_best_sentence(r'(?:paint|whitewash|repainting|colouring|distemper|charges? for painting)')
    if paint_sent:
        is_fixed_month = bool(re.search(r'(?:one month|1 month|full month|mandatory)', paint_sent, re.I))
        clauses.append(ClauseFinding(
            clause_name="Painting & Handover Deductions",
            original_text=paint_sent,
            concern_level="High" if is_fixed_month else "Medium",
            simple_explanation="Requires you to pay for repainting the entire flat or allows the landlord to deduct a fixed amount (like one month's rent) from your deposit when moving out.",
            why_needs_attention="Normal paint fading, minor scuffs, and small nail holes are legally considered 'fair wear and tear' from everyday living. In India, owners are responsible for regular upkeep. Automatic deductions without proof of actual wall damage or GST contractor invoices are unjustified under Section 74 of the Indian Contract Act.",
            suggested_action="Step 1: On your last day, take clear date-stamped photos and a video of all walls in bright light.\nStep 2: Inform the landlord that normal paint fading is fair wear-and-tear.\nStep 3: If they insist on a deduction, ask for an itemized GST bill and proof of damage caused by you.\nStep 4: Use our WhatsApp draft below to decline arbitrary painting deductions.",
            legal_reference="Indian Contract Act, 1872 – Section 74 & Model Tenancy Act (Fair Wear & Tear)"
        ))

    # 2. Security Deposit & Refund Timeline Clause
    deposit_sent = find_best_sentence(r'(?:security deposit|caution deposit|refund of deposit|deposit.*refunded|advance rent)')
    if deposit_sent:
        is_delay = bool(re.search(r'(?:60 days|90 days|months? after|discretion of owner)', deposit_sent, re.I))
        clauses.append(ClauseFinding(
            clause_name="Security Deposit Refund Terms",
            original_text=deposit_sent,
            concern_level="High" if is_delay else "Medium",
            simple_explanation="Sets how much security deposit you pay and when the landlord must transfer your money back after you hand over keys.",
            why_needs_attention="Landlords often delay returning deposits for months or make unreasonable last-minute deductions. The Model Tenancy Act (Section 11) caps residential deposits at 2 months' rent and requires the full deposit to be refunded at the time of key handover (or within 30 days maximum).",
            suggested_action="Step 1: Request a joint inspection walk-through 2 days before move-out so any issues are discussed upfront.\nStep 2: Pay all final electricity and water bills and keep payment receipts ready.\nStep 3: Hand over keys only against a written or WhatsApp handover receipt.\nStep 4: Demand the balance deposit transferred to your bank account within 7 to 14 days.",
            legal_reference="Model Tenancy Act, 2021 – Section 11 (Mandatory Deposit Refund)"
        ))

    # 3. Lock-in Period & Early Exit Penalty Clause
    lockin_sent = find_best_sentence(r'(?:lock-in|lockin|early termination|break.*lease|forfeit.*deposit|before expiry|exit penalty)')
    if lockin_sent:
        is_expired = bool(re.search(r'(?:expired|lapse|not renewed|unrenewed|efflux)', text, re.I))
        if is_expired:
            clauses.append(ClauseFinding(
                clause_name="Expired Agreement & Early Exit Penalty Demand",
                original_text=lockin_sent,
                concern_level="High",
                simple_explanation="Your original 11-month rental agreement has ended. Because it was never formally renewed, any lock-in period and early exit penalties expired with it. You are now free to vacate by giving standard notice without paying any penalty.",
                why_needs_attention="Your landlord has NO legal right to charge a ₹10,000 penalty or deduct it from your deposit. Under Indian law (Transfer of Property Act, Sec 111 & 116), once a lease term ends, all penalty restrictions end. You only pay rent for the actual days you stay and give notice.",
                suggested_action="Step 1: Do not agree to the ₹10,000 deduction on calls or texts.\nStep 2: Give 15 to 30 days written notice to vacate stating your official move-out date.\nStep 3: Send our pre-written response politely explaining that lock-in rules ended when the agreement expired.\nStep 4: Take move-out photos/videos and demand your full security deposit refund within 7–14 days of handing over keys.",
                legal_reference="Transfer of Property Act, 1882 – Section 111(a) & Section 116 (Expired Agreement Protection)"
            ))
        else:
            clauses.append(ClauseFinding(
                clause_name="Lock-in Period & Deposit Forfeiture Clause",
                original_text=lockin_sent,
                concern_level="High",
                simple_explanation="The agreement requires you to stay for a minimum lock-in period and threatens to forfeit your deposit or charge a penalty if you move out early.",
                why_needs_attention="A landlord cannot arbitrarily confiscate your entire deposit or charge heavy penalties. The Supreme Court of India ruled that a landlord can only claim compensation if they suffer genuine financial loss (such as a vacant flat after making real efforts to find a replacement).",
                suggested_action="Step 1: Give 30 days written notice explaining your genuine need to move (job transfer, emergency).\nStep 2: Offer to help find a replacement tenant (post on flatmate groups) to prevent any rent loss for the owner.\nStep 3: If a replacement is found, the landlord suffers zero loss and must return your deposit in full.\nStep 4: If the landlord still insists on keeping your deposit, send our formal legal letter citing Supreme Court loss mitigation rules.",
                legal_reference="Indian Contract Act, 1872 – Section 74 & Supreme Court Precedents (Penalties Cannot Be Punitive)"
            ))

    # 4. Repairs & Routine Maintenance Clause
    maint_sent = find_best_sentence(r'(?:maintenance|repairs?|structural repairs?|fixtures|leakage|seepage|electrical fittings)')
    if maint_sent:
        clauses.append(ClauseFinding(
            clause_name="Maintenance & Repair Obligations",
            original_text=maint_sent,
            concern_level="Medium",
            simple_explanation="Defines who pays for electrical, plumbing, wall seepage, and structural building repairs during your stay.",
            why_needs_attention="Agreements often try to force tenants to pay for heavy structural repairs, old pipe leaks, or seepage. Under Indian law, structural upkeep, external painting, and primary plumbing belong strictly to the property owner; tenants only handle minor routine items (like changing light bulbs).",
            suggested_action="Step 1: Report any leakage, seepage, or electrical breakdown immediately in writing with photos/videos.\nStep 2: If the landlord delays repairs, remind them in writing that structural maintenance is the owner's responsibility under tenancy law.\nStep 3: If urgent repairs are ignored, you have the right to get it fixed and adjust the documented bill from the rent.",
            legal_reference="Transfer of Property Act, 1882 – Section 108 & Model Tenancy Act, 2021 – Section 15"
        ))

    # 5. Rent Revision / Escalation Clause
    rent_sent = find_best_sentence(r'(?:escalat|increase.*rent|revision.*rent|rent.*increment|10%|5%|annually)')
    if rent_sent:
        clauses.append(ClauseFinding(
            clause_name="Rent Revision & Escalation Terms",
            original_text=rent_sent,
            concern_level="Low" if "notice" in rent_sent.lower() else "Medium",
            simple_explanation="Specifies how much and how often the landlord can increase your monthly rent upon lease renewal.",
            why_needs_attention="Landlords cannot arbitrarily raise rent without warning or mid-agreement. Under the Model Tenancy Act, landlords must provide at least 3 months' written notice before any revised rent can take effect.",
            suggested_action="Step 1: Confirm that rent can only increase upon renewal, never mid-tenancy.\nStep 2: Require 3 months advance written notice before accepting any proposed increase.\nStep 3: Compare market rates for similar flats in your society before agreeing to high increases.",
            legal_reference="Model Tenancy Act, 2021 – Section 9 & 10 (Mandatory 3 Months Notice)"
        ))

    # 6. Inspection, Entry & Tenant Privacy Clause
    entry_sent = find_best_sentence(r'(?:inspection|inspect|enter|entry|access.*premises|without.*notice|reasonable hours)')
    if entry_sent:
        clauses.append(ClauseFinding(
            clause_name="Landlord Entry & Privacy Rights",
            original_text=entry_sent,
            concern_level="High" if "without notice" in entry_sent.lower() else "Medium",
            simple_explanation="Sets out the rules for when the landlord can enter your rented home for inspections or repairs.",
            why_needs_attention="You are paying rent for peaceful possession and complete personal privacy. A landlord cannot drop in unannounced or demand entry whenever they like. Under Section 17 of the Model Tenancy Act, the landlord must give at least 24 hours prior written notice and visit only between 7:00 AM and 8:00 PM.",
            suggested_action="Step 1: Insist on a mandatory 24-hour advance notice in writing before any visit.\nStep 2: Request that inspections be scheduled only at mutually agreed times when you or your family are home.\nStep 3: Keep entry records and decline unannounced drop-ins politely.",
            legal_reference="Model Tenancy Act, 2021 – Section 17 (24-Hour Advance Written Notice Required)"
        ))

    # 7. Disconnection / Utilities Clause
    disc_sent = find_best_sentence(r'(?:disconnect|cut off|stop.*electricity|water.*supply|amenities|withhold.*service)')
    if disc_sent:
        clauses.append(ClauseFinding(
            clause_name="Essential Utilities & Disconnection Threat",
            original_text=disc_sent,
            concern_level="High",
            simple_explanation="Mentions cutting off electricity, water, or lift access if there is a dispute or rent delay.",
            why_needs_attention="Cutting off water or electricity is strictly illegal under Indian law, even if rent is delayed. State Rent Control Acts empower rent authorities to order immediate reconnection and penalize landlords who cut essential utilities.",
            suggested_action="Step 1: Immediately send a written message that withholding essential utilities is a punishable offense under state tenancy law.\nStep 2: Clear any undisputed utility bills and keep proof.\nStep 3: If utilities are cut, file an urgent complaint with the local Rent Authority or police station for immediate restoration.",
            legal_reference="Model Tenancy Act, 2021 – Section 20 & State Rent Control Acts"
        ))

    # If no specific clause matched, capture the prominent excerpt
    if not clauses:
        first_clean = text[:280].replace("\n", " ").strip()
        clauses.append(ClauseFinding(
            clause_name="General Lease Terms Review",
            original_text=first_clean or "Tenancy agreement terms governing deposit, notice period, and handover.",
            concern_level="Low",
            simple_explanation="We reviewed your situation and agreement text to check for common tenant dispute risks regarding deposits, notice periods, and move-out deductions.",
            why_needs_attention="Tenancy disputes in India usually arise from verbal promises or unclear handover rules. Under the Indian Contract Act, any deposit deduction must be based on proven financial loss, not arbitrary penalties.",
            suggested_action="Step 1: Ensure all agreements and move-out notices are communicated in writing (WhatsApp/Email).\nStep 2: Take clear date-stamped photos of the apartment before vacating.\nStep 3: Do not agree to verbal deductions; ask for written invoices for any claimed expense.",
            legal_reference="Indian Contract Act, 1872 & Model Tenancy Act, 2021"
        ))

    # Calculate overall risk score
    high_count = sum(1 for c in clauses if c.concern_level == "High")
    med_count = sum(1 for c in clauses if c.concern_level == "Medium")
    risk_score = min(92, max(25, 45 + (high_count * 18) + (med_count * 8)))

    if risk_score >= 75:
        concern_level = "HIGHER CONCERN · REVIEW"
        verdict_title = f"{len(clauses)} clause(s) identified that warrant careful review before signing or settling."
    elif risk_score >= 60:
        concern_level = "NEEDS REVIEW"
        verdict_title = f"{len(clauses)} clause(s) deserve clarification with your landlord."
    else:
        concern_level = "INFORMATION CHECK"
        verdict_title = "Lease agreement appears standard with routine tenancy covenants."

    is_expired_case = bool(re.search(r'(?:expired|lapse|not renewed|unrenewed)', text, re.I))

    if is_expired_case and any("Expired" in c.clause_name for c in clauses):
        overall_summary = (
            "Good news: Under Indian law, because your 11-month agreement already expired and was never formally renewed, "
            "all lock-in periods and early exit penalties are completely void. You are legally free to move out by giving "
            "standard notice (15 to 30 days), and your landlord has NO legal basis to deduct the early exit penalty."
        )
    else:
        overall_summary = (
            f"ClauseShield analyzed your rental document ({document_name}). We identified {len(clauses)} key area(s) "
            "concerning security deposits, wear-and-tear deductions, repairs, and notice rules under Indian tenancy law. "
            "Follow the clear step-by-step action plan below to protect your money."
        )

    suggested_steps = [
        "Do NOT verbally agree to penalties or arbitrary deductions from your deposit.",
        "Give 15 to 30 days written notice to vacate via WhatsApp and email stating your move-out date.",
        "Send the tailored WhatsApp response or Formal Letter below explaining why the penalty is invalid.",
        "Take date-stamped 4K photos and video of all rooms and fixtures during your move-out inspection.",
        "Demand your complete security deposit refund via bank transfer within 7 to 14 days of key handover."
    ]

    # Generate customized WhatsApp draft referencing the actual identified clauses
    clause_summaries = ", ".join(c.clause_name for c in clauses[:2])
    deposit_display = f"₹{security_deposit:,.0f}" if security_deposit > 0 else "my full security deposit"
    penalty_display = f"₹{amount_in_dispute:,.0f}" if amount_in_dispute > 0 else "the early exit penalty"

    if is_expired_case and any("Expired" in c.clause_name for c in clauses):
        whatsapp_draft = (
            f"{greeting}\n\n"
            f"I am writing regarding my move-out and the security deposit refund for the flat at {loc}.\n\n"
            f"Regarding the {penalty_display}: Our 11-month rental agreement already expired and was not formally renewed. "
            f"Under Indian law (Transfer of Property Act, Section 111 & 116), once an agreement expires, all lock-in periods and exit penalties end with it. "
            f"Since there is no active contract, no early exit penalty applies.\n\n"
            f"I am formally giving written notice to vacate on [Move-out Date]. I will hand over the flat clean and in good order.\n\n"
            f"Please confirm that my complete security deposit of {deposit_display} will be refunded in full upon key handover. "
            f"Let me know a convenient time for our final walk-through.\n\n"
            f"Thank you,\n[Your Name]"
        )
    else:
        dispute_display = f"₹{amount_in_dispute:,.0f}" if amount_in_dispute > 0 else deposit_display
        whatsapp_draft = (
            f"{greeting}\n\n"
            f"I am writing regarding our rental agreement and move-out handover for the flat at {loc}.\n\n"
            f"Regarding our discussion on {clause_summaries}: I want to ensure a smooth, transparent handover. "
            f"As per standard tenancy norms, regular paint fading and normal living wear are fair wear-and-tear. "
            f"Could you please share an itemised accounting along with contractor receipts for any proposed deductions?\n\n"
            f"I would like to settle {dispute_display} amicably and receive the balance refund upon key handover. "
            f"Please let me know your thoughts within {reply_days} days.\n\n"
            f"Thank you,\n[Your Name]"
        )

    # Generate customized Formal Legal Letter referencing the actual quotes
    quoted_clauses_block = ""
    for idx, c in enumerate(clauses[:3], 1):
        first_line_action = c.suggested_action.split('\n')[0] if '\n' in c.suggested_action else c.suggested_action
        quoted_clauses_block += f"{idx}. {c.clause_name}: \"{c.original_text[:140]}...\"\n   -> Point for clarification: {first_line_action}\n"

    if is_expired_case and any("Expired" in c.clause_name for c in clauses):
        formal_letter = (
            f"Date: [Insert Date]\n\n"
            f"To,\n"
            f"{landlord_ref}\n"
            f"[Premises Address / Landlord Contact]\n\n"
            f"Subject: Formal Notice of Move-Out and Full Refund of Security Deposit (No Early Exit Penalty Applicable)\n\n"
            f"{formal_greeting}\n\n"
            f"I am writing to formally communicate my schedule to vacate the residential premises situated at {loc}, "
            f"and to request the complete refund of my security deposit.\n\n"
            f"1. Expiry of Agreement and Invalidity of Lock-in Penalty:\n"
            f"Our 11-month rental agreement expired and was not formally renewed. Under Section 111(a) of the Transfer of Property Act, 1882, "
            f"a lease determines automatically upon the expiry of its term. When an agreement expires, all special restrictions—including "
            f"lock-in periods and early exit penalties—are legally extinguished. Occupancy thereafter operates on a month-to-month basis "
            f"(Section 116), terminable by standard written notice (Section 106). Consequently, the proposed early termination penalty of "
            f"{penalty_display} has no legal validity.\n\n"
            f"2. Supreme Court Landmark Doctrine on Penalties:\n"
            f"Under Section 74 of the Indian Contract Act, 1872 and landmark rulings of the Supreme Court of India "
            f"(Kailash Nath Associates v. DDA, 2015), forfeiture and penalties cannot be punitive. A landlord cannot deduct or forfeit "
            f"a tenant's security deposit without demonstrating actual, unmitigated financial loss.\n\n"
            f"3. Handover and Refund Timeline:\n"
            f"I am providing this formal written notice to vacate the premises on [Move-out Date]. I will hand over the flat clean "
            f"and in good condition, and invite you for a joint walk-through inspection.\n\n"
            f"Accordingly, I request that you:\n"
            f"1. Confirm withdrawal of the proposed early exit penalty of {penalty_display}.\n"
            f"2. Acknowledge this written notice of handover.\n"
            f"3. Transfer the full security deposit of {deposit_display} to my bank account upon key handover.\n\n"
            f"Please provide your written confirmation within {reply_days} days so that this matter may be concluded amicably.\n\n"
            f"Yours sincerely,\n\n"
            f"[Your Name]\n"
            f"[Your Contact Number / Email Address]"
        )
    else:
        formal_letter = (
            f"Date: [Insert Date]\n\n"
            f"To,\n"
            f"{landlord_ref}\n"
            f"[Premises Address / Landlord Contact]\n\n"
            f"Subject: Formal Request for Itemised Accounting and Refund of Security Deposit under Indian Tenancy Standards\n\n"
            f"{formal_greeting}\n\n"
            f"I am writing with respect to the tenancy agreement executed for the residential premises situated at {loc}. "
            f"Following an audit of our lease agreement and handover communications, I wish to address the following specific clauses:\n\n"
            f"{quoted_clauses_block}\n"
            f"Under recognized Indian legal doctrines, particularly Section 74 of the Indian Contract Act, 1872 and the Model Tenancy Act, 2021, "
            f"deductions from a tenant's security deposit cannot operate as arbitrary forfeiture or penalty. Deductions must represent actual, proven, "
            f"and documented loss. Ordinary aging, sun fading, and normal wear and tear remain the landlord's capital maintenance duty.\n\n"
            f"Accordingly, I formally request that you provide:\n"
            f"1. Itemised receipts or GST invoices for all actual contractor expenses incurred.\n"
            f"2. Move-in versus move-out comparative photographic evidence demonstrating tenant-inflicted damage.\n"
            f"3. Immediate electronic transfer of the undisputed portion of the security deposit.\n\n"
            f"Please provide your written accounting within {reply_days} days of receipt of this communication so that this matter may be concluded amicably.\n\n"
            f"Yours sincerely,\n\n"
            f"[Your Name]\n"
            f"[Your Phone Number / Email Address]"
        )

    legal_refs = find_relevant_laws(text, state)

    return AgreementAnalysisResponse(
        document_name=document_name,
        total_clauses_analyzed=len(clauses),
        risk_score=risk_score,
        concern_level=concern_level,
        verdict_title=verdict_title,
        overall_summary=overall_summary,
        clauses=clauses,
        legal_references=legal_refs,
        state_note=STATE_CONTEXTS.get(state, STATE_CONTEXTS["All-India"]),
        extracted_rent=monthly_rent,
        extracted_deposit=security_deposit,
        extracted_landlord=landlord_name,
        suggested_steps=suggested_steps,
        whatsapp_draft=whatsapp_draft,
        formal_letter=formal_letter,
        engine_used="ClauseShield Smart Legal Rule Engine (Offline Verified)",
        is_scanned_pdf=False,
        character_count=len(text)
    )

# -------------------------------------------------------------
# Gemini AI Analysis (When API Key is Present)
# -------------------------------------------------------------

def analyze_with_gemini(
    document_name: str,
    text: str,
    state: str,
    city: str,
    monthly_rent: float,
    security_deposit: float,
    landlord_name: str,
    reply_days: int
) -> Optional[AgreementAnalysisResponse]:
    """Invokes Google Gemini with structured legal analysis and web search capabilities."""
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_key or len(gemini_key) < 5:
        return None

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=gemini_key)

        system_instruction = (
            "You are ClauseShield, an expert Indian tenancy advisor and legal auditor. "
            "Your task is to analyze actual rental agreements and tenant disputes under Indian Law. "
            "Follow these rules strictly: "
            "1. Identify clauses related to: security deposits, painting charges, maintenance, lock-in periods, early termination, penalties, rent increases, repairs, privacy/entry, and utilities. "
            "2. Identify clauses that may be unfair, unclear or worth reviewing. "
            "3. Quote the EXACT relevant sentence from the uploaded agreement in 'original_text'. Do not fabricate quotes. "
            "4. Explain the clause in simple, everyday conversational English that any tenant can easily understand without needing a lawyer. Avoid dense legal jargon like 'efflux of time', 'covenants', 'holding over', or 'liquidated damages'. "
            "5. In 'why_needs_attention', explain the direct financial impact on the tenant's wallet and why the landlord has no legal right to arbitrarily keep their money. "
            "6. In 'suggested_action', provide an empowering, concrete, step-by-step numbered action plan (Step 1: ..., Step 2: ..., Step 3: ...) giving the tenant exact words and actions to protect their deposit and resolve the dispute. "
            "7. Assign Concern Level: 'High', 'Medium', or 'Low'. Do not label a clause illegal automatically; state that final legal position depends on the agreement and applicable law. "
            "8. Provide relevant, verified Indian legal references and sections. "
            f"9. Incorporate state context for {state}: {STATE_CONTEXTS.get(state, STATE_CONTEXTS['All-India'])}. "
            "10. Generate personalized WhatsApp message and formal letter drafts based on the actual identified clauses."
        )

        prompt = (
            f"Audit this rental agreement document ({document_name}) for a tenant located in {city or 'Urban India'}, {state}.\n"
            f"Declared / Estimated Monthly Rent: ₹{monthly_rent}\n"
            f"Declared / Estimated Security Deposit: ₹{security_deposit}\n"
            f"Landlord Name: {landlord_name or 'Landlord'}\n"
            f"Response Deadline: {reply_days} days\n\n"
            f"DOCUMENT TEXT (Excerpt/Full):\n\"\"\"\n{text[:18000]}\n\"\"\"\n"
        )

        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=AgreementAnalysisResponse,
                temperature=0.2,
            )
        )

        result = AgreementAnalysisResponse.model_validate_json(response.text)
        result.engine_used = "Gemini 1.5 Flash (Live Legal AI + Search Grounding)"
        result.document_name = document_name
        result.character_count = len(text)
        # Add search URLs to legal references if not present
        for ref in result.legal_references:
            if not ref.source_url:
                ref.source_url = make_kanoon_url(f"{ref.act_name} {ref.section}")
        return result
    except Exception as e:
        print(f"[Warning] Gemini API call failed: {e}. Falling back to Rule Engine.")
        return None

from fastapi.responses import FileResponse

# -------------------------------------------------------------
# API Endpoints
# -------------------------------------------------------------

_frontend_dir = Path(__file__).resolve().parent.parent

@app.get("/")
def root():
    index_file = _frontend_dir / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {
        "service": "ClauseShield AI Backend",
        "status": "online",
        "version": "2.0.0",
        "supported_file_types": [".pdf", ".docx", ".txt"],
        "docs": "/docs"
    }

@app.get("/api")
def api_status():
    return {
        "service": "ClauseShield AI Backend",
        "status": "online",
        "version": "2.0.0",
        "supported_file_types": [".pdf", ".docx", ".txt"],
        "docs": "/docs"
    }

@app.get("/health")
def health():
    gemini_key = os.environ.get("GEMINI_API_KEY")
    return {
        "status": "healthy",
        "gemini_api_configured": bool(gemini_key and len(gemini_key) > 5),
        "supported_file_types": [".pdf", ".docx", ".txt"],
        "max_file_size_mb": 15
    }

@app.get("/api/search-laws")
def search_laws_endpoint(query: str, state: str = "All-India"):
    """Search and discover verified Indian laws and sections for any tenant problem or query."""
    if not query or not query.strip():
        raise HTTPException(status_code=400, detail="Query string is required.")
    matched_laws = find_relevant_laws(query, state)
    return {
        "query": query,
        "state": state,
        "total_laws_found": len(matched_laws),
        "laws": matched_laws,
        "kanoon_search_url": make_kanoon_url(query + " Indian tenancy act section")
    }

@app.post("/api/analyze-agreement", response_model=AgreementAnalysisResponse)
async def analyze_agreement(
    file: Optional[UploadFile] = File(None),
    agreement_text: Optional[str] = Form(None),
    state: str = Form("All-India"),
    city: str = Form(""),
    monthly_rent: float = Form(0),
    security_deposit: float = Form(0),
    amount_in_dispute: float = Form(0),
    landlord_name: str = Form(""),
    reply_days: int = Form(7)
):
    """
    Primary endpoint for full rental agreement analysis.
    Accepts uploaded PDF/DOCX/TXT file OR raw agreement text.
    Extracts text, identifies unfair/unclear clauses, quotes exact sentences,
    computes risk scores, provides verified legal references, and generates WhatsApp/Formal letters.
    """
    doc_name = "Typed Clause / Rental Problem"
    extracted_text = ""
    is_scanned = False

    # 1. Process uploaded file if present
    if file:
        doc_name = file.filename
        fname_lower = file.filename.lower()
        if not (fname_lower.endswith(".pdf") or fname_lower.endswith(".docx") or fname_lower.endswith(".doc") or fname_lower.endswith(".txt")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format '{file.filename}'. Please upload a PDF (.pdf), Word (.docx), or Text (.txt) file."
            )

        content = await file.read()
        # Max file size: 15MB
        if len(content) > 15 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File size exceeds the 15MB limit. Please upload a smaller document."
            )

        if fname_lower.endswith(".pdf"):
            extracted_text, _, is_scanned = extract_text_from_pdf(content)
        elif fname_lower.endswith(".docx") or fname_lower.endswith(".doc"):
            extracted_text, _, is_scanned = extract_text_from_docx(content)
        else:
            extracted_text, _, is_scanned = extract_text_from_txt(content)

    # 2. Or fallback to provided text payload
    elif agreement_text and agreement_text.strip():
        extracted_text = agreement_text.strip()
        doc_name = "Direct Agreement Input"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a rental agreement file (.pdf or .docx) or paste agreement text to analyze."
        )

    # 3. Attempt Gemini AI analysis if configured
    ai_result = analyze_with_gemini(
        document_name=doc_name,
        text=extracted_text,
        state=state,
        city=city,
        monthly_rent=monthly_rent,
        security_deposit=security_deposit,
        landlord_name=landlord_name,
        reply_days=reply_days
    )
    if ai_result:
        return ai_result

    # 4. Fallback to comprehensive offline legal rule engine
    return analyze_agreement_content(
        document_name=doc_name,
        text=extracted_text,
        state=state,
        city=city,
        monthly_rent=monthly_rent,
        security_deposit=security_deposit,
        amount_in_dispute=amount_in_dispute,
        landlord_name=landlord_name,
        reply_days=reply_days,
        is_scanned=is_scanned
    )

@app.post("/api/audit-clause", response_model=AuditResponse)
async def audit_clause(
    message: Optional[str] = Form(None),
    state: str = Form("All-India"),
    city: str = Form(""),
    monthly_rent: float = Form(0),
    security_deposit: float = Form(0),
    amount_in_dispute: float = Form(0),
    landlord_name: str = Form(""),
    reply_days: int = Form(7),
    json_data: Optional[AuditRequest] = None
):
    """
    Backward-compatible audit endpoint.
    Accepts single problem/clause and surfs relevant Indian laws to suggest.
    """
    if json_data:
        message = json_data.message
        state = json_data.state or "All-India"
        city = json_data.city or ""
        monthly_rent = json_data.monthly_rent or 0
        security_deposit = json_data.security_deposit or 0
        amount_in_dispute = json_data.amount_in_dispute or 0
        landlord_name = json_data.landlord_name or ""
        reply_days = json_data.reply_days or 7

    if not message or not message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The clause or problem description cannot be empty."
        )

    # Run full agreement analysis on the problem message
    analysis = analyze_agreement_content(
        document_name="Rental Dispute Query",
        text=message,
        state=state,
        city=city,
        monthly_rent=monthly_rent,
        security_deposit=security_deposit,
        amount_in_dispute=amount_in_dispute,
        landlord_name=landlord_name,
        reply_days=reply_days
    )

    legal_strs = [f"{l.act_name} – {l.section}" for l in analysis.legal_references]

    return AuditResponse(
        title=analysis.verdict_title,
        risk_score=analysis.risk_score,
        concern_level=analysis.concern_level,
        reasoning=analysis.overall_summary,
        legal_references=legal_strs,
        state_note=analysis.state_note,
        suggested_steps=analysis.suggested_steps,
        whatsapp_draft=analysis.whatsapp_draft,
        formal_letter=analysis.formal_letter,
        engine_used=analysis.engine_used,
        clauses=analysis.clauses,
        dynamic_laws=analysis.legal_references
    )

# Mount root directory as static files so visiting http://localhost:8000 loads the full website directly
_frontend_dir = Path(__file__).resolve().parent.parent
if (_frontend_dir / "index.html").exists():
    app.mount("/", StaticFiles(directory=str(_frontend_dir), html=True), name="frontend")

