"""
Quick test script for ClauseShield AI Backend
Run with: python test_api.py
"""
import sys

try:
    from main import app, fallback_rule_analysis
    print("✓ Successfully imported FastAPI app and rule engine.")
except ImportError as e:
    print(f"✗ Import error: {e}")
    sys.exit(1)

# Test the fallback rule analyzer
test_response = fallback_rule_analysis(
    message="Landlord is deducting 1 month rent for painting and full deposit for moving out early.",
    state="Maharashtra",
    city="Pune",
    monthly_rent=20000,
    security_deposit=50000,
    amount_in_dispute=20000,
    landlord_name="Mr. Sharma",
    reply_days=7
)

print("\n--- Test Audit Result ---")
print(f"Verdict: {test_response.title}")
print(f"Risk Score: {test_response.risk_score}/100 ({test_response.concern_level})")
print(f"Engine: {test_response.engine_used}")
print(f"State Note: {test_response.state_note[:80]}...")
print(f"WhatsApp Draft Preview: {test_response.whatsapp_draft[:100]}...")
print("\n✓ Rule analyzer verified successfully!")
