# ClauseShield AI Backend 🛡️

Backend service for **ClauseShield: AI-Assisted Tenant Support (India)**.
Built with **FastAPI**, **Gemini 1.5 Flash**, **python-docx**, **pypdf**, and **Indian Tenancy Legal Rules**.

---

## Features

1. **Full Rental Agreement Analysis (`POST /api/analyze-agreement`)**:
   - Accepts uploaded PDF and DOCX agreements (or raw agreement text).
   - Extracts readable document content without hardcoded text or demo scenarios.
   - Automatically detects financial entities: monthly rent, security deposit amount, and landlord/lessor name.
   - Identifies specific clauses: painting charges, security deposit caps & refund timelines, lock-in periods, maintenance obligations, rent escalation, entry/privacy, and utility disconnections.
   - **Quotes the exact relevant sentence** directly from the uploaded document.
   - Assigns a **Concern Level** (`High`, `Medium`, `Low`) without falsely claiming illegal status.
   - Explains the clause in plain English, why it needs attention, and what the tenant should clarify.
   - Generates customized WhatsApp messages and formal letters referencing the actual clauses identified.

2. **Live Internet Legal Research (`GET /api/search-laws`)**:
   - Surfs and matches Indian tenancy statutes, sections, and High Court / Supreme Court precedents for any user query or problem.
   - Provides direct, verified search links to **India Code** and **Indian Kanoon**.

3. **Hybrid Architecture (Fail-Safe)**:
   - When `GEMINI_API_KEY` is present, uses Google's latest **Gemini 1.5 Flash** with search grounding for live deep legal AI reasoning.
   - If the API key is not configured or network fails, automatically falls back to the **ClauseShield Indian Tenancy Rule Engine** with zero downtime and zero 500 errors.

---

## Quickstart (Local Development)

### 1. Set Up Python Virtual Environment
```bash
cd backend

# On Windows
py -3.12 -m venv venv
venv\Scripts\activate

# On macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Gemini API Key (Optional)
Create a `.env` file or set environment variable:
```bash
# Windows PowerShell
$env:GEMINI_API_KEY="your-gemini-api-key"

# macOS / Linux
export GEMINI_API_KEY="your-gemini-api-key"
```
*(Get a free key at [Google AI Studio](https://aistudio.google.com/))*. Note: If omitted, ClauseShield automatically operates with the comprehensive offline Indian Tenancy Legal Engine.

### 4. Run the Server
```bash
uvicorn main:app --reload --port 8000
```
- API Base URL: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### 5. Run the Automated Tests
```bash
python test_full_workflow.py
python test_api.py
```

---

## API Endpoints

### 1. `POST /api/analyze-agreement`
**Payload (Multipart Form):**
- `file`: Uploaded `.pdf`, `.docx`, or `.txt` file (Max 15MB).
- `agreement_text`: Alternative raw text input.
- `state`: State or jurisdiction (e.g. `Maharashtra`, `Karnataka`, `Delhi`, `All-India`).
- `city`: City name (e.g. `Pune`, `Bengaluru`).
- `monthly_rent`: Optional monthly rent figure.
- `security_deposit`: Optional deposit amount.
- `landlord_name`: Landlord or agency name.
- `reply_days`: Response deadline (default 7 days).

### 2. `GET /api/search-laws?query=<query>&state=<state>`
Surfs and returns matching Indian acts, sections, plain English summaries, and verified Indian Kanoon URLs.

### 3. `POST /api/audit-clause`
Single clause / problem audit endpoint with backward compatibility.
