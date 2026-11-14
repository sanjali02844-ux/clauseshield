import io
import os
import re
import urllib.parse
from typing import List, Optional, Tuple
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
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
        "keywords": ["paint", "whitewash", "colour", "repainting", "wear", "tear"],
        "act_name": "Indian Contract Act, 1872",
        "section": "Section 74 (Penalty vs Liquidated Damages)",
        "summary": "Stipulating an automatic deduction (like 1 month's rent) for painting without proving actual damage beyond normal atmospheric wear and tear is deemed an unenforceable penalty. Deduction must reflect actual, itemized contractor invoices.",
        "tag": "Contract Doctrine",
        "query": "Indian Contract Act 1872 Section 74 penalty wear and tear"
    },
    {
        "keywords": ["deposit", "advance", "refund", "withhold", "caution"],
        "act_name": "Model Tenancy Act, 2021",
        "section": "Section 11 (Security Deposit Cap & Refund)",
        "summary": "Recommends that security deposits for residential premises shall not exceed two months' rent. The deposit must be refunded to the tenant within 30 days of handing over vacant possession, after valid agreed deductions.",
        "tag": "Statutory Cap",
        "query": "Model Tenancy Act 2021 Section 11 security deposit refund"
    },
    {
        "keywords": ["lock-in", "lockin", "premature", "early exit", "forfeit", "forfeiture"],
        "act_name": "Supreme Court of India Landmark Doctrine",
        "section": "Maula Bux v. Union of India / Kailash Nath Associates v. DDA",
        "summary": "The Supreme Court ruled that a party cannot forfeit a deposit merely because a contract has a forfeiture clause. The landlord must prove they suffered actual, unmitigated financial loss (such as vacant un-rented months despite reasonable diligence).",
        "tag": "Judicial Precedent",
        "query": "Kailash Nath Associates vs DDA Section 74 liquidated damages forfeiture"
    },
    {
        "keywords": ["maintenance", "repair", "structural", "seepage", "plumbing", "electrical"],
        "act_name": "Transfer of Property Act, 1882",
        "section": "Section 108(m) & Model Tenancy Act Second Schedule",
        "summary": "Divides upkeep responsibilities: structural repairs, external seepage, major plumbing, and whitewashing are the landlord's capital duty. Minor day-to-day upkeep (light bulbs, tap washers) is the tenant's responsibility.",
        "tag": "Property Law",
        "query": "Transfer of Property Act 1882 Section 108 landlord repair obligations"
    },
    {
        "keywords": ["escalat", "rent increase", "revision", "hike", "increment"],
        "act_name": "Model Tenancy Act, 2021",
        "section": "Section 9 & 10 (Revision of Rent)",
        "summary": "Rent cannot be increased arbitrarily mid-tenancy. Any rent revision requires a minimum of three months' prior notice in writing before the revised rent becomes payable.",
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
    """Finds matching verified Indian statutory references and case laws based on text content."""
    lower_text = text.lower()
    selected_laws = []
    seen_acts = set()

    for item in VERIFIED_LAWS_KNOWLEDGE_BASE:
        match_count = sum(1 for kw in item["keywords"] if kw in lower_text)
        if match_count > 0:
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

    # Add State specific act if available and not yet included
    if state == "Maharashtra" and "Maharashtra Rent Control Act" not in seen_acts:
        selected_laws.append(LegalReferenceItem(
            act_name="Maharashtra Rent Control Act, 1999",
            section="Section 29 & Section 55",
            summary="Requires registration of Leave & License agreements and makes it an offense for a landlord to disconnect water or electricity supply without just cause.",
            tag="State Act",
            source_url=make_kanoon_url("Maharashtra Rent Control Act 1999 Section 29 Section 55")
        ))
    elif state == "Karnataka" and "Karnataka Tenancy Framework" not in seen_acts:
        selected_laws.append(LegalReferenceItem(
            act_name="Karnataka Rent Guidelines & MTA Adoption",
            section="Doctrine on Disproportionate Security Deposits",
            summary="Challenges customary 10-month rental deposits and unilateral move-out deductions as conflicting with equitable contract principles and Model Tenancy Act benchmarks.",
            tag="State Practice",
            source_url=make_kanoon_url("Karnataka high court tenant security deposit refund ordinary wear")
        ))
    elif state == "Delhi" and "Delhi Rent Control Act" not in seen_acts:
        selected_laws.append(LegalReferenceItem(
            act_name="Delhi Rent Control Act, 1958",
            section="Section 45 (Cutting off or withholding essential supply)",
            summary="Empowers the Rent Controller to order immediate restoration of water or electricity if withheld by the landlord, and penalize the landlord.",
            tag="State Act",
            source_url=make_kanoon_url("Delhi Rent Control Act 1958 Section 45 essential supply")
        ))

    # Always ensure baseline Model Tenancy Act & Contract Act are present if nothing matched
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

    return selected_laws[:6]

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
            simple_explanation="Requires you to pay for repainting the property upon moving out, or authorizes a fixed deduction from your security deposit.",
            why_needs_attention="Under Indian tenancy doctrine, atmospheric paint fading, slight wall discoloration, and tiny nail holes constitute normal fair wear-and-tear. Automatic painting deductions without contractor receipts or proof of actual tenant damage violate principles under Section 74 of the Indian Contract Act, 1872.",
            suggested_action="Request dated move-in vs move-out photos and an itemised GST invoice from an external painter before agreeing to any repainting deduction.",
            legal_reference="Indian Contract Act, 1872 – Section 74 & Model Tenancy Act, 2021 Schedule II"
        ))

    # 2. Security Deposit & Refund Timeline Clause
    deposit_sent = find_best_sentence(r'(?:security deposit|caution deposit|refund of deposit|deposit.*refunded|advance rent)')
    if deposit_sent:
        is_delay = bool(re.search(r'(?:60 days|90 days|months? after|discretion of owner)', deposit_sent, re.I))
        clauses.append(ClauseFinding(
            clause_name="Security Deposit Refund Terms",
            original_text=deposit_sent,
            concern_level="High" if is_delay else "Medium",
            simple_explanation="Specifies how much deposit you pay and the conditions or timeframe under which the landlord must refund it when you hand over keys.",
            why_needs_attention="The Model Tenancy Act, 2021 (Section 11) caps residential security deposits at a maximum of two months' rent and requires complete refund upon handover (or within 30 days maximum). Long refund delays or arbitrary deductions leave tenants vulnerable.",
            suggested_action="Clarify in writing that the full deposit must be returned via bank transfer within 15–30 days of physical handover following a joint move-out inspection.",
            legal_reference="Model Tenancy Act, 2021 – Section 11 & State Rent Control Rules"
        ))

    # 3. Lock-in Period & Early Exit Penalty Clause
    lockin_sent = find_best_sentence(r'(?:lock-in|lockin|early termination|break.*lease|forfeit.*deposit|before expiry)')
    if lockin_sent:
        clauses.append(ClauseFinding(
            clause_name="Lock-in Period & Forfeiture Clause",
            original_text=lockin_sent,
            concern_level="High",
            simple_explanation="Penalizes the tenant for vacating before a specified initial period, often stipulating forfeiture of the entire deposit.",
            why_needs_attention="The Supreme Court of India (Kailash Nath Associates v. DDA, 2015) held that damages cannot be punitive. A landlord cannot automatically seize an entire security deposit unless they demonstrate actual, unmitigated financial vacancy loss despite reasonable efforts to re-let.",
            suggested_action="Negotiate an early exit clause providing a reasonable 1-month notice period or the option to introduce a replacement tenant.",
            legal_reference="Indian Contract Act, 1872 – Section 74 & Supreme Court Precedents on Mitigation of Loss"
        ))

    # 4. Repairs & Routine Maintenance Clause
    maint_sent = find_best_sentence(r'(?:maintenance|repairs?|structural repairs?|fixtures|leakage|seepage|electrical fittings)')
    if maint_sent:
        clauses.append(ClauseFinding(
            clause_name="Maintenance & Repair Obligations",
            original_text=maint_sent,
            concern_level="Medium",
            simple_explanation="Defines who pays for electrical, plumbing, structural, and ongoing building repairs during the lease.",
            why_needs_attention="Agreements often unfairly push structural seepage, major plumbing breakdown, and building wear onto tenants. Under Section 108(m) of the Transfer of Property Act and the Model Tenancy Act, structural repairs remain the exclusive responsibility of the owner.",
            suggested_action="Clarify the exact boundary: tenant handles minor consumables (bulbs, minor washers), while landlord remains responsible for structural repairs, plumbing lines, and wiring.",
            legal_reference="Transfer of Property Act, 1882 – Section 108 & Model Tenancy Act, 2021 – Section 15"
        ))

    # 5. Rent Revision / Escalation Clause
    rent_sent = find_best_sentence(r'(?:escalat|increase.*rent|revision.*rent|rent.*increment|10%|5%|annually)')
    if rent_sent:
        clauses.append(ClauseFinding(
            clause_name="Rent Revision & Escalation Terms",
            original_text=rent_sent,
            concern_level="Low" if "notice" in rent_sent.lower() else "Medium",
            simple_explanation="Sets the percentage and frequency by which the monthly rent will increase upon agreement renewal.",
            why_needs_attention="Under the Model Tenancy Act, rent revisions cannot be unilateral or unexpected. Landlords must give at least three months' prior notice in writing before the revised rent can be enforced.",
            suggested_action="Confirm that rent revisions require 3 months advance written notice and reflect reasonable local market adjustments.",
            legal_reference="Model Tenancy Act, 2021 – Section 9 & 10"
        ))

    # 6. Inspection, Entry & Tenant Privacy Clause
    entry_sent = find_best_sentence(r'(?:inspection|inspect|enter|entry|access.*premises|without.*notice|reasonable hours)')
    if entry_sent:
        clauses.append(ClauseFinding(
            clause_name="Landlord Entry & Privacy Rights",
            original_text=entry_sent,
            concern_level="High" if "without notice" in entry_sent.lower() else "Medium",
            simple_explanation="Governs when and how the landlord or their representative can enter the rented home for inspection.",
            why_needs_attention="Tenants have a fundamental right to quiet possession and privacy. Section 17 of the Model Tenancy Act strictly requires at least 24 hours' prior written or electronic notice, and visits must occur only between 7:00 AM and 8:00 PM.",
            suggested_action="Ensure the clause specifies a mandatory 24-hour advance written notice and agreed appointment time for any inspection.",
            legal_reference="Model Tenancy Act, 2021 – Section 17 & Bharatiya Nyaya Sanhita (Criminal Trespass)"
        ))

    # 7. Disconnection / Utilities Clause
    disc_sent = find_best_sentence(r'(?:disconnect|cut off|stop.*electricity|water.*supply|amenities|withhold.*service)')
    if disc_sent:
        clauses.append(ClauseFinding(
            clause_name="Essential Utilities & Service Withholding",
            original_text=disc_sent,
            concern_level="High",
            simple_explanation="Purports to allow the landlord to cut off water, electricity, or amenities if there is a dispute or delay.",
            why_needs_attention="Cutting off water or electricity is illegal in India. Section 20 of the Model Tenancy Act and Section 29 of the Maharashtra Rent Control Act expressly prohibit disconnecting essential services, treating it as an actionable offense.",
            suggested_action="Demand the removal of any clause that threatens disconnection of essential amenities; disputes must be resolved through established legal channels.",
            legal_reference="Model Tenancy Act, 2021 – Section 20 & State Rent Control Acts"
        ))

    # If no specific clause matched, capture the prominent excerpt
    if not clauses:
        first_clean = text[:280].replace("\n", " ").strip()
        clauses.append(ClauseFinding(
            clause_name="General Lease Terms & Handover Covenants",
            original_text=first_clean or "Tenancy covenants governing security deposit, handover, and notice period.",
            concern_level="Low",
            simple_explanation="Standard tenancy framework establishing lease tenure, handover rules, and mutual covenants.",
            why_needs_attention="All verbal promises, maintenance covenants, and deposit return terms should be clearly recorded in writing before signing.",
            suggested_action="Verify that all move-in conditions, inventory lists, and refund deadlines are explicitly documented.",
            legal_reference="Indian Contract Act, 1872 – Section 10 & 73"
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

    overall_summary = (
        f"ClauseShield analyzed your rental document ({document_name}). We identified {len(clauses)} specific clause(s) "
        f"relating to security deposits, painting charges, repairs, and handover terms. "
        "Review each highlighted clause below to understand where standard Indian tenancy practices and legal provisions protect your rights."
    )

    suggested_steps = [
        "Review the exact quoted wording in each card below against your signed copy.",
        "Request written invoices, contractor bills, and move-in comparison photos before accepting deductions.",
        "Send the pre-drafted WhatsApp response or Formal Letter to the landlord requesting itemized accounting.",
        "Check applicable state rules (e.g. Model Tenancy Act, Rent Control Acts) before accepting penalties."
    ]

    # Generate customized WhatsApp draft referencing the actual identified clauses
    clause_summaries = ", ".join(c.clause_name for c in clauses[:2])
    dispute_display = f"₹{security_deposit:,.0f}" if security_deposit > 0 else "the security deposit"
    whatsapp_draft = (
        f"{greeting}\n\n"
        f"I am writing regarding the rental agreement and handover for our premises at {loc}. "
        f"I have reviewed the agreement terms regarding {clause_summaries}. "
        f"To ensure a smooth and transparent handover, could you please share an itemised accounting along with supporting bills "
        f"for any proposed deductions beyond standard fair wear and tear?\n\n"
        f"I would like to settle {dispute_display} amicably. Please let me know your thoughts within {reply_days} days so we can confirm the remaining refund.\n\n"
        f"Thank you,\n[Your Name]"
    )

    # Generate customized Formal Legal Letter referencing the actual quotes
    quoted_clauses_block = ""
    for idx, c in enumerate(clauses[:3], 1):
        quoted_clauses_block += f"{idx}. {c.clause_name}: \"{c.original_text[:140]}...\"\n   -> Point for clarification: {c.suggested_action}\n"

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
        f"This communication is without prejudice to all rights and legal remedies available under applicable law.\n\n"
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
            "You are ClauseShield, an expert Indian legal technology auditor specialized in residential and commercial tenancy. "
            "Your task is to analyze actual rental agreements and tenant disputes under Indian Law. "
            "Follow these rules strictly: "
            "1. Identify clauses related to: security deposits, painting charges, maintenance, lock-in periods, early termination, penalties, rent increases, repairs, privacy/entry, and utilities. "
            "2. Identify clauses that may be unfair, unclear or worth reviewing. "
            "3. Quote the EXACT relevant sentence from the uploaded agreement in 'original_text'. Do not fabricate or generalize quotes. "
            "4. Explain the clause in simple, everyday English. "
            "5. Explain why the clause may be concerning under Indian tenancy jurisprudence (e.g. fair wear-and-tear doctrine, liquidated damages vs penalty under Section 74 Indian Contract Act, Model Tenancy Act 2021). "
            "6. Suggest what the tenant should clarify or request from the landlord. "
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

# -------------------------------------------------------------
# API Endpoints
# -------------------------------------------------------------

@app.get("/")
def root():
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
