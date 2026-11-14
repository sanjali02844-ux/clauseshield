import os
import re
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pypdf
import io

# Initialize FastAPI application
app = FastAPI(
    title="ClauseShield AI Backend",
    description="Tenant lease clause audit engine powered by Indian Tenancy Law & Gemini AI",
    version="1.0.0",
)

# Enable CORS for local development and GitHub Pages deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Output Schema
class AuditResponse(BaseModel):
    title: str = Field(description="A concise headline verdict on the clause")
    risk_score: int = Field(description="Score between 0 and 100 on how unfair/risky the clause or deduction is")
    concern_level: str = Field(description="HIGHER CONCERN · REVIEW, NEEDS REVIEW, or INFORMATION CHECK")
    reasoning: str = Field(description="Explanation grounded in Indian tenancy law and practical rental practices")
    legal_references: List[str] = Field(description="Applicable acts/sections")
    state_note: Optional[str] = Field(default=None, description="State-specific legal note (e.g. Maharashtra, Karnataka)")
    suggested_steps: List[str] = Field(description="Actionable next steps for the tenant")
    whatsapp_draft: str = Field(description="Polite but firm message for WhatsApp")
    formal_letter: str = Field(description="Complete formal legal letter/notice ready to print")
    engine_used: str = Field(default="Gemini 1.5 Flash", description="Indicates whether AI or rule engine generated the response")

class AuditRequest(BaseModel):
    message: str
    state: Optional[str] = "All-India"
    city: Optional[str] = ""
    monthly_rent: Optional[float] = 0
    security_deposit: Optional[float] = 0
    amount_in_dispute: Optional[float] = 0
    landlord_name: Optional[str] = ""
    reply_days: Optional[int] = 7

# State-specific legal contexts for Indian tenancies
STATE_CONTEXTS = {
    "Karnataka": "In Karnataka (especially Bengaluru), customary 10-month deposits contradict the Model Tenancy Act (which caps residential deposits at 2 months). Routine painting charges at move-out are a major source of litigation; courts regularly treat ordinary repainting as landlord maintenance unless exceptional tenant-inflicted damage is proven.",
    "Maharashtra": "In Maharashtra (Mumbai, Pune), tenancies are governed by the Maharashtra Rent Control Act, 1999. Under Section 55, Leave & License agreements must be registered. Unregistered penalties cannot be arbitrarily claimed, and security deposits must be returned upon vacating after legitimate actual wear-and-tear verification.",
    "Delhi": "In Delhi NCR (Delhi, Gurgaon, Noida), agreements are governed by the Delhi Rent Control Act and the Transfer of Property Act. Withholding security deposit without providing contractor invoices or receipts for damage repair constitutes unlawful retention under contract principles.",
    "Tamil Nadu": "Tamil Nadu has enacted the Tamil Nadu Regulation of Rights and Responsibilities of Landlords and Tenants Act, 2017, which regulates security deposits and requires written tenancy registration.",
    "Telangana": "In Telangana (Hyderabad), arbitrary deductions without itemized bills or joint inspection can be challenged before the Rent Controller or Civil Court.",
    "All-India": "Under Section 74 of the Indian Contract Act, 1872, stipulating forfeiture or penalty without proof of actual damage or loss is not legally enforceable. Furthermore, the Model Tenancy Act, 2021 recommends a maximum 2-month security deposit for residential premises."
}

def fallback_rule_analysis(
    message: str,
    state: str = "All-India",
    city: str = "",
    monthly_rent: float = 0,
    security_deposit: float = 0,
    amount_in_dispute: float = 0,
    landlord_name: str = "",
    reply_days: int = 7
) -> AuditResponse:
    """Heuristic rule engine used when Gemini API key is not configured or in fallback mode."""
    lower_msg = message.lower()
    loc = f"{city}, {state}".strip(", ") if city else state
    greeting = f"Hi {landlord_name}," if landlord_name else "Hello,"
    formal_greeting = f"Dear {landlord_name}," if landlord_name else "Dear Landlord,"
    landlord_ref = landlord_name if landlord_name else "[Landlord's Name]"

    # Detect clause categories
    is_painting = any(w in lower_msg for w in ["paint", "whitewash", "color", "colour", "repainting"])
    is_lockin = any(w in lower_msg for w in ["lock-in", "lockin", "early", "premature", "forfeit", "forfeiture", "break lease"])
    is_deposit = any(w in lower_msg for w in ["advance", "10 month", "ten month", "deposit", "caution deposit"])
    is_cleaning = any(w in lower_msg for w in ["clean", "deep clean", "housekeeping", "sanitize"])
    is_damage = any(w in lower_msg for w in ["damage", "broken", "scratch", "fixture", "tile"])

    if is_painting:
        title = "Fixed painting deduction deserves closer review."
        risk_score = 74
        concern_level = "NEEDS REVIEW"
        reasoning = (
            "Under Indian tenancy jurisprudence, routine wall wear, slight fading, and nail holes constitute normal wear and tear. "
            "A mandatory deduction of a full month's rent for repainting without presenting an itemized bill or proof of exceptional tenant damage "
            "is generally regarded as unreasonable retention under Section 74 of the Indian Contract Act, 1872."
        )
        legal_refs = [
            "Indian Contract Act, 1872 – Section 74 (Compensation for breach of contract where penalty is stipulated)",
            "Model Tenancy Act, 2021 (Guidelines on landlord maintenance and handover duties)",
            "General Tenancy Doctrine: Fair Wear & Tear is the landlord's capital maintenance expense."
        ]
        steps = [
            "Check your rental agreement for the exact painting and maintenance clause.",
            "Request dated move-in and move-out photos and an itemised invoice from the contractor.",
            "Ask whether the walls suffered damage beyond normal atmospheric wear and faded paint.",
            "Issue a polite written request via WhatsApp/Email before considering formal mediation."
        ]
    elif is_lockin:
        title = "Full-deposit forfeiture for early exit requires legal scrutiny."
        risk_score = 84
        concern_level = "HIGHER CONCERN · REVIEW"
        reasoning = (
            "While lock-in clauses are common, a landlord cannot automatically seize an entire deposit as a penalty unless they have suffered "
            "actual, demonstrated financial loss (such as unmitigated vacancy despite reasonable effort to re-let). Under Indian Contract Law, "
            "liquidated damages must represent genuine pre-estimated loss, not punitive forfeiture."
        )
        legal_refs = [
            "Indian Contract Act, 1872 – Section 74 (Disallowance of punitive damages)",
            "Supreme Court precedent on mitigation of damages (Maula Bux v. Union of India / Kailash Nath Associates)",
            "Model Tenancy Act, 2021 (Standard notice periods and handover rules)"
        ]
        steps = [
            "Examine whether a notice period was provided and if replacement tenants were offered.",
            "Request the landlord to provide proof of actual financial loss caused by the move-out.",
            "Ensure you have written records of handover and utility bill clearances.",
            "Seek legal counseling if a large security deposit is withheld without explanation."
        ]
    elif is_deposit:
        title = "Check the requested deposit against statutory guidelines."
        risk_score = 68
        concern_level = "NEEDS REVIEW"
        reasoning = (
            "The Model Tenancy Act (MTA), 2021 expressly recommends capping residential security deposits at a maximum of two months' rent. "
            "While customary practices in cities like Bengaluru previously saw demands of 6 to 10 months, newer lease frameworks discourage such heavy capital lockup."
        )
        legal_refs = [
            "Model Tenancy Act, 2021 – Section 11 (Security deposit capped at maximum 2 months for residential properties)",
            "State Rent Control legislation and prevailing local guidelines."
        ]
        steps = [
            "Negotiate for a 2 to 3 month deposit citing modern rental framework standards.",
            "Ensure the refund timeline (normally within 30 days of handover) is explicitly recorded in writing.",
            "Confirm that interest or bank guarantee alternatives are discussed."
        ]
    elif is_cleaning:
        title = "Cleaning fee should reflect verifiable deep cleaning."
        risk_score = 62
        concern_level = "NEEDS REVIEW"
        reasoning = (
            "Unless the premises were handed over in an exceptionally dirty or unhygienic condition, standard broom-clean handover is sufficient. "
            "Deductions for deep cleaning require before/after photographic proof and official receipts."
        )
        legal_refs = [
            "Indian Contract Act, 1872 – Right to fair accounting",
            "Tenancy Handover Protocols and condition checklists."
        ]
        steps = [
            "Compare move-in photos with the handover condition.",
            "Request GST invoice and scope of work from the cleaning service company.",
            "Propose cleaning the premises independently if the quote is inflated."
        ]
    else:
        title = "Rental clause warrants itemised explanation and documentation."
        risk_score = 55
        concern_level = "INFORMATION CHECK"
        reasoning = (
            "Any deduction from a tenant's security deposit must be accompanied by a clear breakdown, supporting receipts, "
            "and reference to specific clauses in the signed agreement. Arbitrary or unexplained deductions can be challenged."
        )
        legal_refs = [
            "Indian Contract Act, 1872 – Section 73 & 74",
            "Model Tenancy Act, 2021 – Deposit refund and dispute settlement provisions"
        ]
        steps = [
            "Request an itemised breakdown of all proposed deductions.",
            "Gather all rental receipts, inventory lists, and move-in/move-out photographs.",
            "Cite the signed agreement and ask for supporting bills before agreeing to any deduction."
        ]

    state_note = STATE_CONTEXTS.get(state, STATE_CONTEXTS["All-India"])

    whatsapp_draft = (
        f"{greeting}\n\n"
        f"I am writing regarding the security deposit for our rented flat at {loc}. "
        f"Regarding the proposed deduction for: \"{message}\", could you please share the relevant clause in our agreement, "
        f"along with an itemised bill and receipts for any actual repairs beyond standard fair wear and tear?\n\n"
        f"I would like to settle this smoothly. Please let me know your thoughts within {reply_days} days so we can confirm the remaining refund.\n\n"
        f"Thank you,\n[Your Name]"
    )

    formal_letter = (
        f"Date: [Insert Date]\n\n"
        f"To,\n"
        f"{landlord_ref}\n"
        f"[Landlord Address / Premises Address]\n\n"
        f"Subject: Formal Request for Itemised Accounting and Refund of Security Deposit\n\n"
        f"{formal_greeting}\n\n"
        f"I am writing with respect to the security deposit paid towards the rented premises located at {loc}. "
        f"This letter addresses the proposed deduction communicated regarding: \"{message}\".\n\n"
        f"Under recognized tenancy standards and principles under Section 74 of the Indian Contract Act, 1872, deductions from a tenant's "
        f"security deposit must correspond to actual, documented loss and cannot penalize ordinary wear and tear resulting from reasonable domestic occupancy. "
        f"Routine repainting and minor ageing of the property are the responsibility of the owner as part of general property maintenance.\n\n"
        f"Accordingly, I formally request that you provide:\n"
        f"1. The specific clause in our executed rental agreement authorizing this deduction.\n"
        f"2. An itemised statement detailing the exact work required.\n"
        f"3. Original contractor invoices, estimates, or GST bills verifying actual expenses incurred.\n"
        f"4. Move-in versus move-out comparative photographic evidence.\n\n"
        f"I request you to release any undisputed balance of the deposit immediately, and provide your written response to this request "
        f"within {reply_days} days of receipt of this letter so that this matter may be settled amicably without the need for formal dispute escalation.\n\n"
        f"This communication is without prejudice to all rights and remedies available to me under applicable tenancy and contract laws.\n\n"
        f"Yours sincerely,\n\n"
        f"[Your Name]\n"
        f"[Your Contact Number]\n"
        f"[Your Email Address]"
    )

    return AuditResponse(
        title=title,
        risk_score=risk_score,
        concern_level=concern_level,
        reasoning=reasoning,
        legal_references=legal_refs,
        state_note=state_note,
        suggested_steps=steps,
        whatsapp_draft=whatsapp_draft,
        formal_letter=formal_letter,
        engine_used="ClauseShield Smart Rule Engine (Local Framework)"
    )

@app.get("/")
def root():
    return {
        "service": "ClauseShield AI Backend",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health():
    gemini_key = os.environ.get("GEMINI_API_KEY")
    return {
        "status": "healthy",
        "gemini_api_configured": bool(gemini_key and len(gemini_key) > 5)
    }

@app.post("/api/audit-clause", response_model=AuditResponse)
async def audit_clause(
    message: str = Form(None),
    state: str = Form("All-India"),
    city: str = Form(""),
    monthly_rent: float = Form(0),
    security_deposit: float = Form(0),
    amount_in_dispute: float = Form(0),
    landlord_name: str = Form(""),
    reply_days: int = Form(7),
    # Also support JSON payload
    json_data: Optional[AuditRequest] = None
):
    # Support both Form data and JSON payload
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
            detail="The clause or landlord message cannot be empty."
        )

    gemini_key = os.environ.get("GEMINI_API_KEY")

    # If Gemini API key is available, attempt AI analysis
    if gemini_key:
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=gemini_key)
            system_instruction = (
                "You are ClauseShield, an Indian legal technology assistant for tenants. "
                "Analyze rental clauses and landlord deduction notices under Indian law: "
                "1. Model Tenancy Act, 2021 (maximum 2-month residential security deposit, mutual repair obligations). "
                "2. Indian Contract Act, 1872 (Section 74: disallowance of penalty clauses, liquidated damages require proof of actual loss). "
                "3. Ordinary Wear and Tear vs Tenant Damage (painting/routine maintenance is landlord's obligation unless exceptional damage occurred). "
                f"4. State context: {STATE_CONTEXTS.get(state, STATE_CONTEXTS['All-India'])}. "
                "Return rigorous, structured JSON following the specified schema."
            )

            prompt = (
                f"Analyze this tenant dispute in {city or 'Urban India'}, {state}:\n"
                f"Clause/Message: \"{message}\"\n"
                f"Monthly Rent: ₹{monthly_rent}\n"
                f"Security Deposit: ₹{security_deposit}\n"
                f"Disputed Amount: ₹{amount_in_dispute}\n"
                f"Landlord Name: {landlord_name or 'Landlord'}\n"
                f"Target Response Deadline: {reply_days} days\n"
            )

            response = client.models.generate_content(
                model="gemini-1.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    response_schema=AuditResponse,
                    temperature=0.2,
                )
            )

            result = AuditResponse.model_validate_json(response.text)
            result.engine_used = "Gemini 1.5 Flash (Live Legal AI)"
            return result
        except Exception as e:
            # If Gemini call fails (e.g. rate limit, bad key), gracefully fallback to rule engine
            print(f"[Warning] Gemini API call failed: {e}. Falling back to Rule Engine.")

    # Graceful fallback to built-in rule engine
    return fallback_rule_analysis(
        message=message,
        state=state,
        city=city,
        monthly_rent=monthly_rent,
        security_deposit=security_deposit,
        amount_in_dispute=amount_in_dispute,
        landlord_name=landlord_name,
        reply_days=reply_days
    )

@app.post("/api/upload-lease")
async def upload_lease(file: UploadFile = File(...)):
    """Extract text from an uploaded lease agreement PDF."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Currently, only PDF (.pdf) files are supported for automated lease extraction."
        )

    try:
        content = await file.read()
        pdf_reader = pypdf.PdfReader(io.BytesIO(content))
        total_pages = len(pdf_reader.pages)
        extracted_text = ""

        # Extract text from up to first 8 pages
        for page_idx in range(min(total_pages, 8)):
            page_text = pdf_reader.pages[page_idx].extract_text() or ""
            extracted_text += f"\n--- PAGE {page_idx + 1} ---\n" + page_text

        # Identify suspicious sections (painting, deposit, lock-in, deduction)
        suspicious_snippets = []
        pattern = re.compile(
            r'([^.\n]*?(?:paint|lock-in|deposit|forfeit|wear and tear|deduct|damage|maintenance)[^.\n]*?\.)',
            re.IGNORECASE
        )
        matches = pattern.findall(extracted_text)
        for m in matches[:5]:
            cleaned = m.strip()
            if len(cleaned) > 20 and cleaned not in suspicious_snippets:
                suspicious_snippets.append(cleaned)

        return {
            "filename": file.filename,
            "total_pages": total_pages,
            "extracted_character_count": len(extracted_text),
            "flagged_clauses": suspicious_snippets,
            "sample_extracted_text": extracted_text[:2500].strip()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read PDF lease: {str(e)}"
        )
