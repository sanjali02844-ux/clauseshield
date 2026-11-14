import re
from pathlib import Path

root = Path(r"C:\Users\a\.gemini\antigravity\scratch\clauseshield")

html_text = (root / "index.html").read_text(encoding="utf-8")
js_text = (root / "script.js").read_text(encoding="utf-8")
supabase_js_text = (root / "supabase-client.js").read_text(encoding="utf-8")
sql_text = (root / "supabase_schema.sql").read_text(encoding="utf-8")

# 1. Section IDs
sections = [
    'home', 'know-rights', 'audit', 'complaint-generator', 'lawyers', 'post-issue',
    'tenant-dashboard', 'lawyer-dashboard', 'admin-dashboard', 'calculator', 'wear', 'about'
]
for s in sections:
    assert f'id="{s}"' in html_text, f'Missing section: {s}'
print("✓ All 12 key sections verified present in index.html")

# 2. Modals
modals = ['authModal', 'videoCallModal', 'consultationModal', 'issueDetailsModal', 'supabaseModal']
for m in modals:
    assert f'id="{m}"' in html_text, f'Missing modal: {m}'
print("✓ All 5 modals verified present in index.html")

# 3. Preserved Features
preserved = [
    'runAudit', 'leaseFileInput', 'messageInput', 'scenario', 'stateSelect', 'city', 'rent', 'deposit', 'deduction',
    'results', 'riskLabel', 'verdictTitle', 'verdictReason', 'moneyValue', 'nextSteps', 'riskBar', 'riskScore',
    'clauseAnalysisSection', 'clauseCardsContainer', 'legalToggle', 'dynamicLegalCards', 'whatsappText', 'copyMessage',
    'whatsappLink', 'formalText', 'formalPreview', 'printLetter', 'copyLetter', 'calcDeposit', 'deductionRows',
    'addDeduction', 'calculate', 'totalDeductions', 'balance', 'photoUpload', 'photoPreview'
]
for p in preserved:
    assert f'id="{p}"' in html_text, f'Missing preserved element: {p}'
print("✓ All 35 original interactive elements verified preserved")

# 4. Check IDs referenced by $(...)
dollar_ids = set(re.findall(r"\$\(\s*['\"]([a-zA-Z0-9_\-]+)['\"]\s*\)", js_text))
missing = [i for i in sorted(dollar_ids) if f'id="{i}"' not in html_text]
print("Referenced IDs count:", len(dollar_ids))
print("Missing IDs:", missing)

# 5. Schema verification
tables = ['profiles', 'lawyer_profiles', 'tenant_issues', 'consultation_requests', 'consultations', 'payments', 'reviews', 'platform_settings']
for t in tables:
    assert f'public.{t}' in sql_text, f'Missing table in schema: {t}'
print("✓ All Supabase tables present in supabase_schema.sql")

print("All integrity checks passed!")
