import asyncio
import json
import subprocess
import time
import urllib.request
import websockets

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

async def test_clauseshield():
    # Launch Edge headless with remote debugging
    cmd = [
        EDGE_PATH,
        "--headless=new",
        "--remote-debugging-port=9222",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        "--user-data-dir=C:\\Users\\a\\.gemini\\antigravity\\scratch\\clauseshield\\.edge_test_profile",
        "about:blank"
    ]
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(2)

    console_logs = []
    page_errors = []

    try:
        # Get list of targets from CDP
        req = urllib.request.urlopen("http://127.0.0.1:9222/json")
        targets = json.loads(req.read().decode())
        page_targets = [t for t in targets if t.get("type") == "page"]
        if not page_targets:
            # Create a new page target
            req_new = urllib.request.urlopen("http://127.0.0.1:9222/json/new")
            page_target = json.loads(req_new.read().decode())
            ws_url = page_target["webSocketDebuggerUrl"]
        else:
            ws_url = page_targets[0]["webSocketDebuggerUrl"]

        async with websockets.connect(ws_url) as ws:
            msg_id = 0
            async def send(method, params=None):
                nonlocal msg_id
                msg_id += 1
                payload = {"id": msg_id, "method": method, "params": params or {}}
                await ws.send(json.dumps(payload))
                while True:
                    resp = json.loads(await ws.recv())
                    if resp.get("id") == msg_id:
                        return resp
                    # Collect events
                    if resp.get("method") == "Runtime.consoleAPICalled":
                        log_type = resp["params"]["type"]
                        args = [str(a.get("value", a.get("description", ""))) for a in resp["params"]["args"]]
                        console_logs.append((log_type, " ".join(args)))
                    elif resp.get("method") == "Runtime.exceptionThrown":
                        details = resp["params"]["exceptionDetails"]
                        page_errors.append(details.get("text", "") + " " + str(details.get("exception", {})))

            # Enable CDP domains
            await send("Page.enable")
            await send("Runtime.enable")
            await send("Log.enable")

            async def evaluate(js_code):
                res = await send("Runtime.evaluate", {
                    "expression": js_code,
                    "returnByValue": True,
                    "awaitPromise": True
                })
                if "result" in res and "result" in res["result"]:
                    val = res["result"]["result"]
                    if val.get("type") == "undefined":
                        return None
                    return val.get("value")
                return res

            print("[*] Navigating to http://127.0.0.1:8000/ ...")
            nav_resp = await send("Page.navigate", {"url": "http://127.0.0.1:8000/"})
            print(f"Nav response: {nav_resp}")
            await asyncio.sleep(3)
            curr_url = await evaluate("window.location.href")
            print(f"Current URL: {curr_url}")
            title = await evaluate("document.title")
            print(f"[*] Page Title: {title}")
            assert "ClauseShield" in title, f"Unexpected title: {title}"

            # Test 2: Hero Demo Audit Button
            print("[*] Testing Demo Lease Audit button...")
            demo_res = await evaluate("""
                (() => {
                    const btn = document.getElementById('tryDemo');
                    if (!btn) return 'BUTTON_MISSING';
                    btn.click();
                    return 'CLICKED';
                })()
            """)
            print(f"    Result: {demo_res}")
            await asyncio.sleep(2)

            # Check if results are visible
            results_visible = await evaluate("!document.getElementById('results').hidden")
            print(f"    Results section visible: {results_visible}")
            risk_score = await evaluate("document.getElementById('riskScore').textContent")
            print(f"    Risk Score: {risk_score}")
            whatsapp_val = await evaluate("document.getElementById('whatsappText') ? document.getElementById('whatsappText').value.substring(0, 50) : 'MISSING'")
            formal_val = await evaluate("document.getElementById('formalText') ? document.getElementById('formalText').value.substring(0, 50) : 'MISSING'")
            print(f"    WhatsApp text excerpt: {whatsapp_val}...")
            print(f"    Formal letter excerpt: {formal_val}...")

            # Test 3: Clause filter buttons
            print("[*] Testing Clause Filter Buttons...")
            filter_res = await evaluate("""
                (() => {
                    const highBtn = document.querySelector('.clause-filter-btn[data-filter=\"High\"]');
                    if (highBtn) highBtn.click();
                    const visibleCards = Array.from(document.querySelectorAll('.clause-card')).filter(c => c.style.display !== 'none');
                    return visibleCards.length;
                })()
            """)
            print(f"    High concern cards visible: {filter_res}")

            # Test 4: Tab switching in Response Generator
            print("[*] Testing WhatsApp vs Formal Letter tab switching...")
            tab_res = await evaluate("""
                (() => {
                    const formalTab = document.querySelector('.tabs .tab[data-tab=\"formal\"]');
                    if (!formalTab) return 'TAB_MISSING';
                    formalTab.click();
                    const formalHidden = document.getElementById('formalPane').hidden;
                    const whatsappHidden = document.getElementById('whatsappPane').hidden;
                    return { formalHidden, whatsappHidden };
                })()
            """)
            print(f"    Tab toggle: {tab_res}")

            # Test 5: Calculator
            print("[*] Testing Dispute Calculator...")
            calc_res = await evaluate("""
                (() => {
                    document.getElementById('calcDeposit').value = '50000';
                    document.getElementById('calculate').click();
                    const totalDed = document.getElementById('totalDeductions').textContent;
                    const balance = document.getElementById('balance').textContent;
                    return { totalDed, balance };
                })()
            """)
            print(f"    Calculator result: {calc_res}")

            # Test 6: Auth Modal & Demo Tenant Login
            print("[*] Testing Demo Tenant Login...")
            tenant_login = await evaluate("""
                (async () => {
                    const user = await ClauseShieldDB.auth.signIn({ email: 'tenant@example.com', password: 'password123' });
                    if (user) {
                        window.updateNavUserState();
                        return { success: true, name: user.full_name, role: user.role };
                    }
                    return { success: false };
                })()
            """)
            print(f"    Tenant login: {tenant_login}")

            # Test 7: Personal Dashboard & Evidence Vault
            print("[*] Testing Tenant Dashboard & Evidence Vault...")
            evidence_test = await evaluate("""
                (async () => {
                    const user = ClauseShieldDB.auth.getCurrentUser();
                    const issues = await ClauseShieldDB.tenantIssues.getByTenant(user.id);
                    const evidence = await ClauseShieldDB.evidence.getAll(user.id);
                    return { issuesCount: issues.length, evidenceCount: evidence.length };
                })()
            """)
            print(f"    Tenant data: {evidence_test}")

            # Test 8: Opening High-Res Evidence Viewer
            print("[*] Testing High-Res Evidence Viewer Modal...")
            viewer_test = await evaluate("""
                (() => {
                    window.openEvidenceViewer({
                        name: 'Bathroom_Dampness_Proof.jpg',
                        type: 'image/jpeg',
                        size: 1450000,
                        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
                        issue_ref: 'CS-2026-9041',
                        caption: 'Pre-existing wall seepage before handover'
                    });
                    const modal = document.getElementById('evidenceViewerModal');
                    const isOpen = modal && modal.classList.contains('open');
                    const img = document.getElementById('activeViewerImg');
                    const imgVisible = img && img.src.length > 0;
                    return { modalOpen: isOpen, imgVisible };
                })()
            """)
            print(f"    Evidence viewer result: {viewer_test}")

            # Close viewer
            await evaluate("closeModal('evidenceViewerModal');")

            # Test 9: Advocate Chambers Switch & Workspace
            print("[*] Testing Advocate Demo Login & Chambers Workspace...")
            adv_login = await evaluate("""
                (async () => {
                    const user = await ClauseShieldDB.auth.signIn({ email: 'rajesh.sharma@advocates.in', password: 'password123' });
                    if (user) {
                        window.updateNavUserState();
                        const advApp = document.getElementById('advocateAppShell');
                        const isVisible = advApp && advApp.style.display === 'flex';
                        const currentView = typeof ClauseShieldAdvocateUI === 'object' ? ClauseShieldAdvocateUI.currentView : null;
                        return { success: true, name: user.full_name, role: user.role, advVisible: isVisible, currentView };
                    }
                    return { success: false };
                })()
            """)
            print(f"    Advocate login & workspace: {adv_login}")

            # Test 10: Advocate Grievance Board
            print("[*] Testing Advocate Grievance Board & Inquiries...")
            grievance_test = await evaluate("""
                (() => {
                    ClauseShieldAdvocateUI.switchView('grievances');
                    const cards = document.querySelectorAll('#advGrievanceCardsStream .adv-grievance-card');
                    const countAvail = document.getElementById('advCountAvail') ? document.getElementById('advCountAvail').textContent : '0';
                    return { renderedCards: cards.length, countAvail };
                })()
            """)
            print(f"    Advocate grievances: {grievance_test}")

            # Test 11: Consultation Offer Modal in Advocate Chambers
            print("[*] Testing Consultation Offer Modal in Advocate Chambers...")
            offer_modal_test = await evaluate("""
                (() => {
                    const firstCard = document.querySelector('#advGrievanceCardsStream .adv-grievance-card');
                    if (!firstCard) return 'NO_CARDS';
                    const issueId = firstCard.id.replace('gCard_', '');
                    ClauseShieldAdvocateUI.openOfferModal(issueId);
                    const modal = document.getElementById('modalOfferConsultation');
                    const isOpen = modal && modal.style.display === 'flex';
                    return { isOpen, issueId };
                })()
            """)
            print(f"    Offer modal: {offer_modal_test}")

            # Test 12: Video Call Modal
            print("[*] Testing Video Call Modal Controls...")
            video_test = await evaluate("""
                (() => {
                    const modal = document.getElementById('videoCallModal');
                    if (typeof window.openVideoCallModal === 'function') {
                        window.openVideoCallModal({
                            participantName: 'Advocate Priya Sharma',
                            caseRef: 'CS-2026-9041'
                        });
                    } else {
                        modal.style.display = 'flex';
                    }
                    const isDisplayed = modal.style.display !== 'none';
                    const muteBtn = document.getElementById('btnMuteAudio');
                    if (muteBtn) muteBtn.click();
                    const audioMuted = muteBtn ? muteBtn.classList.contains('active') : false;
                    return { isDisplayed, audioMuted };
                })()
            """)
            print(f"    Video call modal test: {video_test}")

            # Close video modal
            await evaluate("document.getElementById('videoCallModal').style.display = 'none';")

            # Check for any page exceptions
            print(f"\n[*] Summary:")
            print(f"    Total Console Logs: {len(console_logs)}")
            print(f"    Total Uncaught Exceptions / Page Errors: {len(page_errors)}")
            if page_errors:
                print("    Page Errors:")
                for pe in page_errors:
                    print(f"      - {pe}")

            warn_errors = [c for c in console_logs if c[0] in ['error', 'warn']]
            if warn_errors:
                print("    Console Errors / Warnings:")
                for we in warn_errors:
                    print(f"      [{we[0]}] {we[1]}")

    finally:
        proc.terminate()
        proc.kill()

if __name__ == "__main__":
    asyncio.run(test_clauseshield())
