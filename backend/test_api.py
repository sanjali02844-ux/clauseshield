"""
Comprehensive test script for ClauseShield AI Backend
Run with: python test_api.py
"""
import sys
from fastapi.testclient import TestClient
from main import app, analyze_agreement_content

client = TestClient(app)

def test_endpoints():
    print("1. Testing Health Endpoint...")
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("   ✓ Health check OK:", res.json())

    print("\n2. Testing Real Rental Agreement Analysis (Multi-Clause Extraction)...")
    sample_lease_text = (
        "RENTAL AGREEMENT executed on 1st November 2026. "
        "The Lessor is Mr. Rajesh Sharma and the Lessee is Ananya Verma. "
        "The monthly rent shall be Rs. 22,000 payable in advance. "
        "The Lessee has deposited a security deposit of Rs. 66,000 with the Lessor. "
        "Clause 8 (Painting): The tenant shall mandatorily pay one month's rent as painting charges on vacating the premises. "
        "Clause 11 (Lock-in): If the Lessee terminates this agreement before the 11-month lock-in period, the entire security deposit shall be forfeited without exception. "
        "Clause 14 (Repairs): The tenant shall be responsible for all ongoing maintenance, structural repairs and external plumbing charges. "
        "Clause 17 (Inspection): The landlord reserves the absolute right to inspect the premises at any time without notice. "
        "Clause 19 (Refund): The security deposit will be refunded within 90 days after complete handover of the premises."
    )

    response = analyze_agreement_content(
        document_name="Sample_Rental_Agreement.pdf",
        text=sample_lease_text,
        state="Maharashtra",
        city="Pune",
        monthly_rent=22000,
        security_deposit=66000,
        landlord_name="Mr. Rajesh Sharma",
        reply_days=7
    )

    print(f"   ✓ Document Analyzed: {response.document_name}")
    print(f"   ✓ Total Clauses Identified: {response.total_clauses_analyzed}")
    print(f"   ✓ Overall Risk Score: {response.risk_score}/100 ({response.concern_level})")
    print(f"   ✓ Verdict: {response.verdict_title}")

    assert response.total_clauses_analyzed >= 4, "Should have identified at least 4 clauses"
    for idx, c in enumerate(response.clauses, 1):
        print(f"     [{idx}] {c.clause_name} [{c.concern_level} Concern]")
        print(f"         Quoted: \"{c.original_text}\"")
        print(f"         Action: {c.suggested_action[:70]}...")

    print(f"\n3. Testing WhatsApp & Formal Letter Generation...")
    assert "Mr. Rajesh Sharma" in response.whatsapp_draft
    assert "Section 74 of the Indian Contract Act" in response.formal_letter
    print("   ✓ WhatsApp and Formal Letter successfully customized with actual lease clauses!")

    print(f"\n4. Testing Law Search Endpoint (/api/search-laws)...")
    res_laws = client.get("/api/search-laws?query=security%20deposit%20painting%20deduction&state=Maharashtra")
    assert res_laws.status_code == 200
    laws_data = res_laws.json()
    print(f"   ✓ Total Laws Found: {laws_data['total_laws_found']}")
    for l in laws_data['laws']:
        print(f"     - {l['act_name']} ({l['section']}) -> {l['tag']}")

    print("\n✓ ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_endpoints()
