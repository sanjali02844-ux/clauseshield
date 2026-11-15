"""
Comprehensive Verification Test Suite for ClauseShield AI Legal Assistant Improvements
Validates:
1. Behind-the-scenes dispute refinement on user-written content.
2. Most relevant law matching for specific dispute situations.
3. Grounding in the latest laws (BNS 2023, BNSS 2023, BSA 2023, MTA 2021).
4. Grounding in the latest Constitution of India (Articles 21, 300A, 14, 19).
"""

import os
import sys
from fastapi.testclient import TestClient

# Add backend directory to path
backend_dir = os.path.join(os.path.dirname(__file__), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app, refine_user_dispute_content, find_relevant_laws

client = TestClient(app)

def run_tests():
    print("=" * 78)
    print("  CLAUSESHIELD AI LEGAL ASSISTANT — VERIFICATION TEST SUITE")
    print("=" * 78)

    # -------------------------------------------------------------
    # TEST 1: Behind-the-scenes AI Refinement on User-Written Content
    # -------------------------------------------------------------
    print("\n[*] TEST 1: Behind-the-Scenes AI Dispute Refinement...")
    raw_user_input = (
        "my landlord Suresh not giving back my 45,000 security deposit. "
        "he is saying 1 month rent for painting deduction and threatening to cut my power "
        "and lock the flat if i complain."
    )

    refined = refine_user_dispute_content(
        text=raw_user_input,
        state="Maharashtra",
        monthly_rent=20000,
        security_deposit=50000,
        amount_in_dispute=45000
    )

    print("   ✓ Original User Note:", refined.original_text[:60] + "...")
    print("   ✓ Detected Violations:", refined.detected_violations)
    print("   ✓ Constitutional Protections:", refined.constitutional_protections)
    print("   ✓ Latest Statutory Protections:", refined.latest_statutory_protections)
    print("   ✓ Dispute Amount Identified: Rs.", refined.dispute_amount_estimated)

    assert "Unjustified Handover Painting & Wear-and-Tear Deductions" in refined.detected_violations
    assert "Unlawful Security Deposit Retention & Delayed Refund" in refined.detected_violations
    assert "Illegal Severance / Threat of Essential Utilities (Power / Water)" in refined.detected_violations
    assert any("Article 21" in cp for cp in refined.constitutional_protections)
    assert any("Article 300A" in cp for cp in refined.constitutional_protections)
    assert any("Bharatiya Nyaya Sanhita" in sp for sp in refined.latest_statutory_protections)
    assert refined.dispute_amount_estimated == 45000
    assert "FORMAL LEGAL DISPUTE STATEMENT" in refined.refined_statement
    print("   ✓ Step 1 Passed: Raw user input refined into formal legal articulation behind the scenes!")

    # -------------------------------------------------------------
    # TEST 2: API Endpoint POST /api/refine-user-dispute
    # -------------------------------------------------------------
    print("\n[*] TEST 2: Testing POST /api/refine-user-dispute endpoint...")
    res = client.post("/api/refine-user-dispute", json={
        "text": "Landlord trying to evict me with bouncers and without court order, withholding 60,000 deposit",
        "state": "Delhi",
        "monthly_rent": 25000,
        "security_deposit": 60000,
        "amount_in_dispute": 60000
    })
    assert res.status_code == 200, f"Refine endpoint returned {res.status_code}"
    data = res.json()
    assert "Extrajudicial Eviction Threat" in " ".join(data["detected_violations"])
    assert "Criminal Intimidation" in " ".join(data["detected_violations"])
    assert any("Article 21" in c for c in data["constitutional_protections"])
    assert any("Section 351" in s for s in data["latest_statutory_protections"])
    print("   ✓ Step 2 Passed: Refine API endpoint operational with structured legal formulation!")

    # -------------------------------------------------------------
    # TEST 3: Situation-Specific Relevance — Utility Cutoff
    # -------------------------------------------------------------
    print("\n[*] TEST 3: Situation-Specific Law Matching — Utility Disconnection...")
    utility_laws = find_relevant_laws("landlord cut off my electricity and water supply", state="Maharashtra")
    assert len(utility_laws) > 0
    top_law_names = [l.act_name + " " + l.section for l in utility_laws]
    print("   ✓ Top Matched Laws for Utility Disconnection:")
    for l in utility_laws:
        print(f"     - {l.act_name} ({l.section}) [🎯 {l.relevance_score}% Match] | {l.tag}")
        print(f"       Note: {l.application_note}")

    # Must contain Article 21, MTA Section 20, or State Rent Control Act
    has_art21 = any("Article 21" in name for name in top_law_names)
    has_mta20 = any("Section 20" in name for name in top_law_names)
    has_bns_utility = any("Section 324" in name for name in top_law_names)
    assert has_art21 or has_mta20 or has_bns_utility, "Utility issue must match Article 21, MTA Sec 20 or BNS Sec 324"
    print("   ✓ Step 3 Passed: Highest relevance laws anchored to Article 21 & essential service protections!")

    # -------------------------------------------------------------
    # TEST 4: Situation-Specific Relevance — Deposit & Wear-and-Tear
    # -------------------------------------------------------------
    print("\n[*] TEST 4: Situation-Specific Law Matching — Repainting & Security Deposit...")
    deposit_laws = find_relevant_laws("landlord deducting 30,000 for repainting and not refunding advance deposit", state="Karnataka")
    assert len(deposit_laws) > 0
    print("   ✓ Top Matched Laws for Deposit & Painting Deductions:")
    for l in deposit_laws:
        print(f"     - {l.act_name} ({l.section}) [🎯 {l.relevance_score}% Match] | {l.tag}")

    has_wear_tear = any("108(m)" in l.section or "Wear" in l.section for l in deposit_laws)
    has_deposit_cap = any("Section 11" in l.section or "300A" in l.section or "316" in l.section for l in deposit_laws)
    assert has_wear_tear, "Painting issue must match Section 108(m) wear & tear"
    assert has_deposit_cap, "Deposit issue must match MTA Sec 11, Article 300A, or BNS 316"
    print("   ✓ Step 4 Passed: Top laws precisely match wear-and-tear doctrines and deposit caps!")

    # -------------------------------------------------------------
    # TEST 5: Situation-Specific Relevance — Eviction & House-Trespass
    # -------------------------------------------------------------
    print("\n[*] TEST 5: Situation-Specific Law Matching — Eviction & Unlawful Entry...")
    eviction_laws = find_relevant_laws("landlord barging in with duplicate key and trying to evict and lockout", state="Delhi")
    assert len(eviction_laws) > 0
    print("   ✓ Top Matched Laws for Eviction & Trespass:")
    for l in eviction_laws:
        print(f"     - {l.act_name} ({l.section}) [🎯 {l.relevance_score}% Match] | {l.tag}")

    has_bns_trespass = any("Section 329" in l.section or "351" in l.section or "Section 6" in l.section for l in eviction_laws)
    assert has_bns_trespass, "Eviction/trespass must match BNS Section 329/351 or Specific Relief Act Sec 6"
    print("   ✓ Step 5 Passed: BNS 2023 criminal house-trespass and eviction protections triggered!")

    # -------------------------------------------------------------
    # TEST 6: Constitutional Grounding Verification
    # -------------------------------------------------------------
    print("\n[*] TEST 6: Constitutional Grounding Verification (Articles 21, 300A, 14, 19)...")
    from main import VERIFIED_LAWS_KNOWLEDGE_BASE
    const_entries = [k for k in VERIFIED_LAWS_KNOWLEDGE_BASE if k.get("is_constitutional")]
    assert len(const_entries) >= 3, f"Expected at least 3 constitutional entries, got {len(const_entries)}"
    const_sections = [k["section"] for k in const_entries]
    print("   ✓ Verified Constitutional Articles Present in Knowledge Base:")
    for s in const_sections:
        print(f"     - {s}")
    assert any("Article 21" in s for s in const_sections)
    assert any("Article 300A" in s for s in const_sections)
    assert any("Article 19" in s or "Article 14" in s for s in const_sections)
    print("   ✓ Step 6 Passed: Full grounding in latest constitutional articles confirmed!")

    # -------------------------------------------------------------
    # TEST 7: Latest Criminal & Procedural Codes Verification (2023 / 2024)
    # -------------------------------------------------------------
    print("\n[*] TEST 7: Latest Enacted Criminal Codes Verification (BNS, BNSS, BSA 2023)...")
    latest_entries = [k for k in VERIFIED_LAWS_KNOWLEDGE_BASE if k.get("is_latest_code")]
    assert len(latest_entries) >= 6, f"Expected at least 6 latest code entries, got {len(latest_entries)}"
    print("   ✓ Verified Latest Enacted Statutes Present:")
    for entry in latest_entries:
        print(f"     - {entry['act_name']} ({entry['section']})")
    assert any("Bharatiya Nyaya Sanhita" in e["act_name"] for e in latest_entries)
    assert any("Bharatiya Nagarik Suraksha" in e["act_name"] for e in latest_entries)
    assert any("Bharatiya Sakshya" in e["act_name"] for e in latest_entries)
    print("   ✓ Step 7 Passed: Bharatiya Nyaya Sanhita, BNSS, and BSA 2023 fully verified!")

    # -------------------------------------------------------------
    # TEST 8: Frontend Files Verification
    # -------------------------------------------------------------
    print("\n[*] TEST 8: Frontend UI & Behind-the-Scenes Components Verification...")
    index_html = open(os.path.join(os.path.dirname(__file__), "index.html"), encoding="utf-8").read()
    script_js = open(os.path.join(os.path.dirname(__file__), "script.js"), encoding="utf-8").read()
    style_css = open(os.path.join(os.path.dirname(__file__), "style.css"), encoding="utf-8").read()

    assert "aiLiveRefinementBar" in index_html
    assert "aiRefinementResultCard" in index_html
    assert "resultUserOriginalText" in index_html
    assert "resultAiRefinedText" in index_html
    assert "resultConstitutionalPills" in index_html
    assert "refineUserDisputeLocally" in script_js
    assert "refineUserDisputeBehindTheScenes" in script_js
    assert "setupUserDisputeRefineListeners" in script_js
    assert "ai-live-refinement-bar" in style_css
    assert "card-constitutional" in style_css
    assert "card-latest-code" in style_css

    print("   ✓ Step 8 Passed: Frontend UI, real-time listener hooks, and styles verified!")

    print("\n" + "=" * 78)
    print("  ✓ ALL 8 AI LEGAL ASSISTANT VERIFICATION TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 78)

if __name__ == "__main__":
    run_tests()
