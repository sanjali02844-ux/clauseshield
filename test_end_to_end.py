import asyncio
import json
import subprocess
import time
import urllib.request
import websockets

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

async def test_full_platform():
    cmd = [
        EDGE_PATH,
        "--headless=new",
        "--remote-debugging-port=9222",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        r"--user-data-dir=C:\Users\a\.gemini\antigravity\scratch\clauseshield\.edge_test_profile_2",
        "about:blank"
    ]
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(2)

    console_logs = []
    page_errors = []

    try:
        req = urllib.request.urlopen("http://127.0.0.1:9222/json")
        targets = json.loads(req.read().decode())
        page_targets = [t for t in targets if t.get("type") == "page"]
        ws_url = page_targets[0]["webSocketDebuggerUrl"] if page_targets else json.loads(urllib.request.urlopen("http://127.0.0.1:9222/json/new").read().decode())["webSocketDebuggerUrl"]

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
                    if resp.get("method") == "Runtime.consoleAPICalled":
                        log_type = resp["params"]["type"]
                        args = [str(a.get("value", a.get("description", ""))) for a in resp["params"]["args"]]
                        console_logs.append((log_type, " ".join(args)))
                    elif resp.get("method") == "Runtime.exceptionThrown":
                        details = resp["params"]["exceptionDetails"]
                        page_errors.append(details.get("text", "") + " " + str(details.get("exception", {})))

            await send("Page.enable")
            await send("Runtime.enable")
            await send("Log.enable")
            await send("Network.enable")
            await send("Network.setCacheDisabled", {"cacheDisabled": True})

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
            await send("Page.navigate", {"url": "http://127.0.0.1:8000/"})
            for _ in range(30):
                await asyncio.sleep(0.2)
                state = await evaluate("document.readyState")
                if state == "complete":
                    break
            await asyncio.sleep(1)

            # -------------------------------------------------------------
            # 1. Test Filing a New Tenant Dispute via Complaint Form
            # -------------------------------------------------------------
            print("\n[Step 1] Testing Filing a New Tenant Dispute...")
            file_res = await evaluate("""
                (async () => {
                    try {
                        // Log in as tenant
                        const user = await ClauseShieldDB.auth.signIn({ email: 'tenant@example.com', password: 'password123' });
                        window.updateNavUserState();

                        // Fill complaint form
                        document.getElementById('compTenantName').value = 'Arjun Mehra';
                        document.getElementById('compTenantEmail').value = 'arjun.mehra@example.com';
                        document.getElementById('compTenantPhone').value = '9876543210';
                        document.getElementById('compCategory').value = 'security_deposit';
                        document.getElementById('compUrgency').value = 'urgent';
                        document.getElementById('compState').value = 'Karnataka';
                        document.getElementById('compCity').value = 'Bengaluru';
                        document.getElementById('compAmount').value = '45000';
                        document.getElementById('compDate').value = '2026-11-15';
                        document.getElementById('compLandlordName').value = 'Brigade Properties Ltd';
                        document.getElementById('compTitle').value = 'Unreasonable ₹45,000 deduction for wall repainting';
                        document.getElementById('compDescription').value = 'Landlord deducted ₹45,000 citing repainting charges after 2 years of tenancy without providing paint invoices or contractor bills.';
                        document.getElementById('compRelief').value = 'Immediate refund of ₹45,000 security deposit with 18% interest';

                        // Dispatch submit event
                        const form = document.getElementById('tenantComplaintForm');
                        const ev = new Event('submit', { cancelable: true, bubbles: true });
                        form.dispatchEvent(ev);

                        // Wait slightly for async DB insert
                        await new Promise(r => setTimeout(r, 600));

                        // Verify issue created in database
                        const issues = await ClauseShieldDB.issues.getAll();
                        const latest = issues.find(i => i.title && i.title.includes('₹45,000'));
                        return {
                            success: !!latest,
                            issueId: latest ? latest.id : null,
                            issueRef: latest ? latest.issue_reference : null,
                            title: latest ? latest.title : null
                        };
                    } catch (e) {
                        return { error: e.toString(), stack: e.stack };
                    }
                })()
            """)
            print(f"    Complaint filed: {file_res}")
            assert file_res.get("success"), "Failed to file tenant complaint!"

            # -------------------------------------------------------------
            # 2. Test Tenant Evidence Vault Populated
            # -------------------------------------------------------------
            print("\n[Step 2] Testing Tenant Evidence Vault...")
            evd_res = await evaluate("""
                (async () => {
                    const user = ClauseShieldDB.auth.getCurrentUser();
                    // Add an inspection photo
                    await ClauseShieldDB.evidence.add(user.id, {
                        name: 'Living_Room_Handover_Inspection.jpg',
                        type: 'image/jpeg',
                        size: 2150000,
                        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
                        caption: 'Living room spotless walls at final key handover',
                        issue_ref: 'CS-NEW-001'
                    });
                    const allEvidence = await ClauseShieldDB.evidence.getAll(user.id);
                    return { count: allEvidence.length, latestName: allEvidence[0].name };
                })()
            """)
            print(f"    Evidence vault: {evd_res}")
            assert evd_res.get("count", 0) > 0, "Evidence vault empty!"

            # -------------------------------------------------------------
            # 3. Test Advocate Grievance Board Live Sync & Offer Creation
            # -------------------------------------------------------------
            print("\n[Step 3] Testing Advocate Grievance Board & Video Offer...")
            adv_offer_res = await evaluate(f"""
                (async () => {{
                    try {{
                        // Sign in as Advocate
                        const adv = await ClauseShieldDB.auth.signIn({{ email: 'rajesh.sharma@advocates.in', password: 'password123' }});
                        window.updateNavUserState();
                        ClauseShieldAdvocateUI.switchView('grievances');

                        // Check that the grievance is available on the board
                        const issueId = '{file_res["issueId"]}';
                        const issue = ClauseShieldAdvocateDB.grievances.getById(issueId, adv.id);

                        // Accept grievance and offer minimal fee consultation
                        const acceptRes = ClauseShieldAdvocateDB.grievances.accept(issueId, adv.id, {{
                            consultation_fee: 149,
                            proposed_date: new Date(Date.now() + 86400000).toISOString(),
                            duration_minutes: 30,
                            advice_message: 'Reviewed your ₹45,000 painting dispute. Under Sec 108(m) TPA 1882, wear and tear cannot be deducted.',
                            create_case: true
                        }});

                        return {{
                            foundOnBoard: !!issue,
                            offerCreated: !!acceptRes,
                            caseCreated: !!acceptRes.case,
                            fee: 149
                        }};
                    }} catch (e) {{
                        return {{ error: e.toString(), stack: e.stack }};
                    }}
                }})()
            """)
            print(f"    Advocate offer: {adv_offer_res}")
            assert adv_offer_res.get("offerCreated"), "Failed to create consultation offer!"

            # -------------------------------------------------------------
            # 4. Test Tenant Sees Scheduled Video Consultation
            # -------------------------------------------------------------
            print("\n[Step 4] Testing Tenant Sees Scheduled Video Consultation...")
            accept_res = await evaluate(f"""
                (async () => {{
                    // Switch back to Tenant
                    const tenant = await ClauseShieldDB.auth.signIn({{ email: 'tenant@example.com', password: 'password123' }});
                    window.updateNavUserState();

                    const consultations = await ClauseShieldDB.consultations.getByUser(tenant.id, 'tenant');
                    const myConsultation = consultations.find(c => c.issue_id === '{file_res["issueId"]}');

                    return {{
                        success: !!myConsultation,
                        consultationId: myConsultation ? myConsultation.id : null,
                        fee: myConsultation ? myConsultation.consultation_fee : 0,
                        lawyer: myConsultation ? myConsultation.lawyer_name : null,
                        meetingUrl: myConsultation ? myConsultation.meeting_url : null
                    }};
                }})()
            """)
            print(f"    Tenant consultation: {accept_res}")
            assert accept_res.get("success"), "Tenant consultation not found!"

            # -------------------------------------------------------------
            # 5. Test Printable Legal Notice Generator Tab
            # -------------------------------------------------------------
            print("\n[Step 5] Testing Printable Legal Notice Draft Generator...")
            notice_res = await evaluate("""
                (() => {
                    const noticeTab = document.getElementById('tabBtnNoticeDraft');
                    if (noticeTab) noticeTab.click();

                    const editor = document.getElementById('noticeEditorText');
                    const sheet = document.getElementById('noticeSheetPreview');
                    const sheetText = sheet ? sheet.textContent : '';
                    return {
                        hasText: sheetText.length > 50,
                        hasDemandNotice: sheetText.includes('LEGAL DEMAND NOTICE') || sheetText.includes('DEMAND NOTICE'),
                        hasAct: sheetText.includes('Transfer of Property Act') || sheetText.includes('Indian Contract Act') || sheetText.includes('Tenancy')
                    };
                })()
            """)
            print(f"    Notice draft sync: {notice_res}")
            assert notice_res.get("hasText") and notice_res.get("hasAct"), "Notice draft not rendering properly!"

            # -------------------------------------------------------------
            # 6. Test Admin Dashboard
            # -------------------------------------------------------------
            print("\n[Step 6] Testing Admin Dashboard & User Accounts...")
            admin_res = await evaluate("""
                (async () => {
                    const admin = await ClauseShieldDB.auth.signIn({ email: 'admin@clauseshield.com', password: 'password123' });
                    window.updateNavUserState();
                    const adminSec = document.getElementById('admin-dashboard');
                    const isVisible = adminSec && !adminSec.hidden;
                    const users = await ClauseShieldDB.admin.getAllUsers();
                    return {
                        adminRole: admin.role,
                        usersCount: users.length
                    };
                })()
            """)
            print(f"    Admin view: {admin_res}")
            assert admin_res.get("usersCount", 0) > 0, "Admin view failed!"

            print("\n" + "="*60)
            print("✓ ALL END-TO-END WORKFLOW TESTS COMPLETED SUCCESSFULLY!")
            print("="*60)
            print(f"Total Console Logs: {len(console_logs)}")
            print(f"Total Page Errors: {len(page_errors)}")
            if page_errors:
                for pe in page_errors:
                    print("  -", pe)

    finally:
        proc.terminate()
        proc.kill()

if __name__ == "__main__":
    asyncio.run(test_full_platform())
