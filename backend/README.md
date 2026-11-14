# ClauseShield AI Backend 🛡️

Backend service for **ClauseShield: AI-Assisted Tenant Support (India)**.
Built with **FastAPI**, **Gemini 1.5 Flash**, and **Indian Tenancy Legal Rules**.

---

## Features

1. **AI Clause Auditing (`POST /api/audit-clause`)**:
   - Analyzes rental agreements, landlord WhatsApp messages, and deduction demands.
   - Computes a nuanced Risk Score (0-100) and Concern Level (`NEEDS REVIEW`, `HIGHER CONCERN`, `INFORMATION CHECK`).
   - Cites applicable Indian legal provisions (Section 74 of Indian Contract Act 1872, Model Tenancy Act 2021, State Rent Control Acts).
   - Generates customized WhatsApp dispute responses and print-ready formal letters.

2. **Lease Agreement PDF Parser (`POST /api/upload-lease`)**:
   - Parses multi-page PDF lease agreements with `pypdf`.
   - Automatically detects and flags suspicious clauses (painting deductions, lock-in forfeitures, excessive advance deposits).

3. **Hybrid Architecture (Fail-Safe)**:
   - When `GEMINI_API_KEY` is present, uses Google's latest **Gemini 1.5 Flash** for deep reasoning.
   - If the API key is not configured or network fails, automatically falls back to the **ClauseShield Indian Tenancy Rule Engine** with zero downtime and zero 500 errors.

---

## Quickstart (Local Development)

### 1. Set Up Python Virtual Environment
```bash
cd backend

# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Gemini API Key
Create a `.env` file (or set environment variable):
```bash
# Windows PowerShell
$env:GEMINI_API_KEY="your-gemini-api-key"

# macOS / Linux
export GEMINI_API_KEY="your-gemini-api-key"
```
*(Get a free key at [Google AI Studio](https://aistudio.google.com/))*.

### 4. Run the Server
```bash
uvicorn main:app --reload --port 8000
```
- API Base URL: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

---

## Deploying for Free (Hackathon Ready)

### Option A: Render.com (Recommended)
1. Push your repository to GitHub.
2. Sign in to [Render](https://render.com/) and click **New + > Web Service**.
3. Connect your GitHub repository.
4. Set the following settings:
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. In **Environment Variables**, add:
   - `GEMINI_API_KEY`: your Google AI Studio API key.
6. Click **Deploy**. Your API URL will be: `https://<your-service>.onrender.com`.

### Option B: Railway.app
1. Go to [Railway.app](https://railway.app/).
2. Select **Deploy from GitHub repo**, choose the `backend` folder.
3. Add `GEMINI_API_KEY` in variables and deploy.

---

## API Endpoints

### 1. `POST /api/audit-clause`
**Request Payload (JSON or Form-Data):**
```json
{
  "message": "Landlord says 1 month rent will be deducted for painting.",
  "state": "Maharashtra",
  "city": "Pune",
  "monthly_rent": 18000,
  "security_deposit": 50000,
  "amount_in_dispute": 18000,
  "landlord_name": "Mr. Sharma",
  "reply_days": 7
}
```

**Response:**
```json
{
  "title": "Fixed painting deduction deserves closer review.",
  "risk_score": 74,
  "concern_level": "NEEDS REVIEW",
  "reasoning": "Under Indian tenancy jurisprudence, routine wall wear...",
  "legal_references": ["Indian Contract Act, 1872 – Section 74"],
  "state_note": "In Maharashtra (Mumbai, Pune)...",
  "suggested_steps": ["Check your rental agreement...", "Request dated photos..."],
  "whatsapp_draft": "Hi Mr. Sharma, I am writing regarding...",
  "formal_letter": "Date: ...\nTo,\nMr. Sharma\n...",
  "engine_used": "Gemini 1.5 Flash (Live Legal AI)"
}
```

### 2. `POST /api/upload-lease`
Accepts a `.pdf` file in multipart/form-data. Returns extracted text and flagged suspicious clauses.
