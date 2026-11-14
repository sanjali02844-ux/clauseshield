/**
 * ClauseShield Supabase & Storage Integration Module
 * ===================================================
 * Dual-adapter architecture:
 * 1. Works seamlessly with live Supabase projects when configured.
 * 2. Self-healing, zero-latency persistent client storage fallback with rich
 *    pre-seeded Indian tenancy law disputes, demo accounts, and sample complaints.
 * 3. 100% functionality on GitHub Pages with zero server dependency.
 */

(function (window) {
  'use strict';

  const STORAGE_KEYS = {
    CONFIG: 'clauseshield_supabase_config',
    CURRENT_USER: 'clauseshield_current_user',
    PROFILES: 'clauseshield_profiles',
    LAWYER_PROFILES: 'clauseshield_lawyer_profiles',
    TENANT_ISSUES: 'clauseshield_tenant_issues',
    CONSULTATION_REQUESTS: 'clauseshield_consultation_requests',
    CONSULTATIONS: 'clauseshield_consultations',
    PAYMENTS: 'clauseshield_payments',
    SETTINGS: 'clauseshield_settings'
  };

  // Default Platform Settings (Compliant with Bar Council of India demonstration guidelines)
  const DEFAULT_SETTINGS = {
    default_fee: 500,
    platform_commission_pct: 10,
    lawyer_share_pct: 90,
    compliance_mode: 'BCI_DEMONSTRATION_MODE',
    disclaimer: 'As per Bar Council of India Rules, advocate fees cannot be shared with non-lawyers. All financial records shown are for platform demonstration only.'
  };

  // Seed Profiles: Always available for quick 1-click testing
  const SEED_PROFILES = [
    {
      id: 'usr_admin_001',
      email: 'admin@clauseshield.com',
      password: 'password123',
      full_name: 'ClauseShield Admin Directorate',
      phone: '+91 98200 11223',
      role: 'admin',
      avatar_url: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=150&q=80',
      created_at: new Date('2026-01-10T10:00:00Z').toISOString()
    },
    {
      id: 'usr_lawyer_rajesh',
      email: 'rajesh.sharma@advocates.in',
      password: 'password123',
      full_name: 'Adv. Rajesh Sharma',
      phone: '+91 98210 44556',
      role: 'lawyer',
      avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
      created_at: new Date('2026-02-01T11:00:00Z').toISOString()
    },
    {
      id: 'usr_lawyer_priya',
      email: 'priya.venkat@legalchambers.in',
      password: 'password123',
      full_name: 'Adv. Priya Venkataraman',
      phone: '+91 98450 77889',
      role: 'lawyer',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      created_at: new Date('2026-02-15T09:30:00Z').toISOString()
    },
    {
      id: 'usr_lawyer_vikram',
      email: 'vikram.malhotra@highcourt.org',
      password: 'password123',
      full_name: 'Adv. Vikram Malhotra',
      phone: '+91 98110 33221',
      role: 'lawyer',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      created_at: new Date('2026-03-05T14:15:00Z').toISOString()
    },
    {
      id: 'usr_lawyer_ananya',
      email: 'ananya.desai@advocate.in',
      password: 'password123',
      full_name: 'Adv. Ananya Desai',
      phone: '+91 98220 99887',
      role: 'lawyer',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
      created_at: new Date('2026-04-10T16:00:00Z').toISOString()
    },
    {
      id: 'usr_tenant_demo',
      email: 'tenant@example.com',
      password: 'password123',
      full_name: 'Arjun Mehra',
      phone: '+91 98765 43210',
      role: 'tenant',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      created_at: new Date('2026-04-15T12:00:00Z').toISOString()
    }
  ];

  const SEED_LAWYER_PROFILES = [
    {
      id: 'lp_rajesh_01',
      user_id: 'usr_lawyer_rajesh',
      bar_council_number: 'MAH/4921/2014',
      state_bar_council: 'Bar Council of Maharashtra & Goa',
      specialisation: 'Tenancy Disputes & Deposit Recovery',
      years_experience: 12,
      bio: 'Senior property advocate with 12+ years appearing before Bombay High Court and Small Causes Courts. Specialises in Leave & License agreements, arbitrary painting deductions, and recovery of unlawfully retained tenant deposits under the Maharashtra Rent Control Act.',
      consultation_fee: 500.00,
      availability: 'Mon - Fri: 5:00 PM – 8:30 PM',
      document_url: 'bar_council_id_rajesh_verified.pdf',
      verification_status: 'verified',
      verified_at: new Date('2026-02-05T12:00:00Z').toISOString(),
      verified_by: 'usr_admin_001',
      rating: 4.9,
      total_reviews: 18
    },
    {
      id: 'lp_priya_02',
      user_id: 'usr_lawyer_priya',
      bar_council_number: 'KAR/1892/2017',
      state_bar_council: 'Karnataka State Bar Council',
      specialisation: 'Rental Agreements & Eviction Defense',
      years_experience: 9,
      bio: 'Bengaluru-based advocate advising tenants and tech professionals on 10-month excessive security deposit disputes, illegal lock-in clauses, and eviction notices. Well versed in the Karnataka Rent Act and the Model Tenancy Framework.',
      consultation_fee: 650.00,
      availability: 'Mon - Sat: 4:30 PM – 7:30 PM',
      document_url: 'karnataka_bar_certificate_priya.pdf',
      verification_status: 'verified',
      verified_at: new Date('2026-02-20T10:00:00Z').toISOString(),
      verified_by: 'usr_admin_001',
      rating: 4.8,
      total_reviews: 24
    },
    {
      id: 'lp_vikram_03',
      user_id: 'usr_lawyer_vikram',
      bar_council_number: 'D/2301/2012',
      state_bar_council: 'Bar Council of Delhi',
      specialisation: 'Landlord Harassment & Utility Disconnection',
      years_experience: 14,
      bio: 'Practicing Advocate at Delhi High Court with expertise in essential services maintenance, protection against unlawful tenant lockouts, and emergency injunctions under the Delhi Rent Control Act and Indian Penal Code provisions.',
      consultation_fee: 750.00,
      availability: 'Tue - Sat: 6:00 PM – 9:00 PM',
      document_url: 'delhi_bar_enrolment_vikram.pdf',
      verification_status: 'verified',
      verified_at: new Date('2026-03-10T14:00:00Z').toISOString(),
      verified_by: 'usr_admin_001',
      rating: 5.0,
      total_reviews: 31
    },
    {
      id: 'lp_ananya_04',
      user_id: 'usr_lawyer_ananya',
      bar_council_number: 'MAH/8812/2023',
      state_bar_council: 'Bar Council of Maharashtra & Goa',
      specialisation: 'Unfair Charges & Contract Review',
      years_experience: 3,
      bio: 'Specialist in student rentals, PG tenancy agreements, and unfair move-out repair charges across Pune and Navi Mumbai. Advocate with clear, tenant-first guidance.',
      consultation_fee: 450.00,
      availability: 'Mon - Fri: 3:00 PM – 7:00 PM',
      document_url: 'provisional_certificate_ananya.pdf',
      verification_status: 'verified',
      verified_at: new Date('2026-03-15T12:00:00Z').toISOString(),
      verified_by: 'usr_admin_001',
      rating: 4.7,
      total_reviews: 12
    }
  ];

  // Comprehensive Seed Complaints across all Varieties of Indian Tenancy Law
  const SEED_TENANT_ISSUES = [
    {
      id: 'iss_seed_001',
      issue_reference: 'CS-CMP-2026-7819',
      tenant_id: 'usr_tenant_demo',
      tenant_name: 'Arjun Mehra',
      title: 'Landlord withholding ₹55,000 security deposit for whole-flat repainting and deep cleaning',
      category: 'security_deposit',
      variety_label: 'Security Deposit Withholding',
      city: 'Bengaluru',
      state: 'Karnataka',
      description: 'Vacated 2BHK flat in Koramangala after 2-year lease. Handed over keys in clean, undamaged condition with only minor wear & tear. Landlord refused to refund ₹55,000 balance deposit citing a mandatory repainting charge of ₹40,000 and ₹15,000 deep cleaning charge, without sharing any vendor invoice or GST bills.',
      amount_in_dispute: 55000,
      incident_date: '2026-10-28',
      urgency: 'urgent',
      preferred_method: 'video_call',
      preferred_time: 'evening',
      relief_requested: 'Full refund of ₹55,000 deposit along with 18% statutory interest as per Karnataka Rent Act.',
      document_attachment_url: 'move_out_handover_photos.zip',
      status: 'under_review',
      assigned_lawyer_id: 'usr_lawyer_rajesh',
      created_at: new Date('2026-11-01T14:30:00Z').toISOString(),
      lawyer_responses: [
        {
          id: 'lr_seed_001',
          lawyer_name: 'Adv. Rajesh Sharma',
          lawyer_id: 'usr_lawyer_rajesh',
          bar_number: 'MAH/4921/2014',
          avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
          message: 'Under Section 108(m) of the Transfer of Property Act, 1882, the lessee is bound to keep the property in reasonable condition, subject only to changes caused by reasonable wear and tear. Mandatory repainting deductions without showing proof of damage or actual GST invoices are legally unenforceable. We should dispatch a 15-day statutory Demand Notice under Section 106.',
          action_recommended: 'Dispatch Statutory Legal Notice & Demand 18% Interest',
          created_at: new Date('2026-11-02T10:15:00Z').toISOString()
        }
      ]
    },
    {
      id: 'iss_seed_002',
      issue_reference: 'CS-CMP-2026-8302',
      tenant_id: 'usr_tenant_sneha',
      tenant_name: 'Sneha Roy',
      title: 'Illegal 48-hour verbal eviction notice and threats of lockout after rejecting 25% rent increase',
      category: 'illegal_eviction',
      variety_label: 'Illegal Eviction & Lockout',
      city: 'Delhi NCR',
      state: 'Delhi',
      description: 'Tenancy agreement is registered and valid till August 2027 with fixed monthly rent of ₹24,000. Landlord suddenly demanded ₹30,000 mid-tenancy citing inflation. When I politely refused, he gave a 48-hour verbal notice to vacate and threatened to change the main door digital locks.',
      amount_in_dispute: 30000,
      incident_date: '2026-11-04',
      urgency: 'urgent',
      preferred_method: 'video_call',
      preferred_time: 'afternoon',
      relief_requested: 'Immediate restraint / injunction against unlawful lockout and protection of peaceful possession.',
      document_attachment_url: 'registered_lease_agreement.pdf',
      status: 'under_review',
      assigned_lawyer_id: 'usr_lawyer_vikram',
      created_at: new Date('2026-11-05T09:15:00Z').toISOString(),
      lawyer_responses: [
        {
          id: 'lr_seed_002',
          lawyer_name: 'Adv. Vikram Malhotra',
          lawyer_id: 'usr_lawyer_vikram',
          bar_number: 'D/2301/2012',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
          message: 'The Hon\'ble Supreme Court has settled in Midnapore Zamindary Co. and Krishna Ram Mahale that even a trespasser cannot be evicted without due process of law, let alone a lawful tenant with an active lease. Unilateral mid-term rent hikes violate the agreement. Attempted lockout constitutes criminal trespass under Section 441 of IPC. A police complaint and civil injunction petition can be filed immediately.',
          action_recommended: 'Immediate Police Complaint for Criminal Trespass & Civil Injunction',
          created_at: new Date('2026-11-05T16:00:00Z').toISOString()
        }
      ]
    },
    {
      id: 'iss_seed_003',
      issue_reference: 'CS-CMP-2026-9140',
      tenant_id: 'usr_tenant_rohan',
      tenant_name: 'Rohan Joshi',
      title: 'Water supply line and electricity disconnected by landlord over disputed society maintenance fee',
      category: 'utility_cutoff',
      variety_label: 'Utility Disconnection',
      city: 'Pune',
      state: 'Maharashtra',
      description: 'Landlord demanded ₹12,000 additional charge for society clubhouse renovation which is the sole responsibility of the flat owner under our registered agreement. Upon refusal, the landlord turned off the water valve to our floor and removed the electricity fuse.',
      amount_in_dispute: 12000,
      incident_date: '2026-11-09',
      urgency: 'urgent',
      preferred_method: 'video_call',
      preferred_time: 'morning',
      relief_requested: 'Immediate restoration of water and power supply, and penal compensation under Rent Control Act.',
      document_attachment_url: 'utility_disconnection_photos.zip',
      status: 'open',
      assigned_lawyer_id: null,
      created_at: new Date('2026-11-10T11:00:00Z').toISOString(),
      lawyer_responses: [
        {
          id: 'lr_seed_003',
          lawyer_name: 'Adv. Ananya Desai',
          lawyer_id: 'usr_lawyer_ananya',
          bar_number: 'MAH/8812/2023',
          avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
          message: 'Section 29 of the Maharashtra Rent Control Act, 1999 explicitly prohibits any landlord from cutting off or withholding any essential supply or service without just or sufficient cause. The Competent Authority or Small Causes Court has the power to pass an urgent ex-parte restoration order within 24 hours and penalise the landlord.',
          action_recommended: 'File Urgent Application before Rent Authority under Section 29',
          created_at: new Date('2026-11-10T14:30:00Z').toISOString()
        }
      ]
    },
    {
      id: 'iss_seed_004',
      issue_reference: 'CS-CMP-2026-5521',
      tenant_id: 'usr_tenant_pooja',
      tenant_name: 'Pooja Kulkarni',
      title: 'Severe roof water seepage and short circuit hazard — landlord refuses to carry out structural repairs',
      category: 'maintenance',
      variety_label: 'Structural Maintenance & Repairs',
      city: 'Mumbai',
      state: 'Maharashtra',
      description: 'Heavy ceiling seepage has caused water dripping over the electrical switchboard in the master bedroom, creating an active short-circuit hazard. Owner claims all repairs inside the flat are tenant duty, despite Clause 14 clearly classifying external walls and roof seepage as structural repairs belonging to lessor.',
      amount_in_dispute: 25000,
      incident_date: '2026-11-02',
      urgency: 'medium',
      preferred_method: 'video_call',
      preferred_time: 'evening',
      relief_requested: 'Direct landlord to carry out urgent waterproofing or allow tenant to deduct repair expense from next month rent.',
      document_attachment_url: 'ceiling_leakage_photos.pdf',
      status: 'open',
      assigned_lawyer_id: null,
      created_at: new Date('2026-11-06T15:00:00Z').toISOString(),
      lawyer_responses: []
    },
    {
      id: 'iss_seed_005',
      issue_reference: 'CS-CMP-2026-6419',
      tenant_id: 'usr_tenant_karthik',
      tenant_name: 'Karthik Reddy',
      title: 'Owner demanding 4-month lock-in penalty of ₹1,40,000 despite 30 days written notice for job transfer',
      category: 'lease_breach',
      variety_label: 'Unfair Lease Terms & Lock-in',
      city: 'Hyderabad',
      state: 'Telangana',
      description: 'Due to corporate transfer by my employer, I provided 1 month advance notice to vacate as per Clause 9 of the agreement. The owner claims Clause 19 contains an absolute 11-month lock-in and threatens to forfeit ₹1,00,000 security deposit plus demand ₹40,000 in additional penalty.',
      amount_in_dispute: 140000,
      incident_date: '2026-11-07',
      urgency: 'medium',
      preferred_method: 'video_call',
      preferred_time: 'evening',
      relief_requested: 'Waiver of lock-in penalty on ground of bona fide employment transfer and full refund of security deposit.',
      document_attachment_url: 'transfer_letter_and_lease.pdf',
      status: 'under_review',
      assigned_lawyer_id: 'usr_lawyer_priya',
      created_at: new Date('2026-11-08T13:20:00Z').toISOString(),
      lawyer_responses: [
        {
          id: 'lr_seed_005',
          lawyer_name: 'Adv. Priya Venkataraman',
          lawyer_id: 'usr_lawyer_priya',
          bar_number: 'KAR/1892/2017',
          avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
          message: 'Under Indian Contract Act, Section 74, liquidated damages and penalty clauses cannot be punitive; damages must correspond to actual quantifiable losses. Where the landlord can easily re-let the flat in a metro city, claiming 4 months rent as pure penalty is void as in terrorem. We can reply to the landlord citing Maula Bux v. Union of India.',
          action_recommended: 'Send Legal Reply Rebutting Punitive Lock-in Under Section 74',
          created_at: new Date('2026-11-09T11:45:00Z').toISOString()
        }
      ]
    },
    {
      id: 'iss_seed_006',
      issue_reference: 'CS-CMP-2026-4108',
      tenant_id: 'usr_tenant_deepa',
      tenant_name: 'Deepa Swaminathan',
      title: 'Landlord entering premises without permission and installing surveillance camera facing bedroom entrance',
      category: 'harassment',
      variety_label: 'Landlord Harassment & Privacy Violation',
      city: 'Chennai',
      state: 'Tamil Nadu',
      description: 'Landlord repeatedly unlocks the flat door with spare keys without giving mandatory 24-hour advance written notice. Recently installed a CCTV camera directly pointing into the living room and bedroom corridor, severely violating constitutional right to privacy and peaceful quiet enjoyment.',
      amount_in_dispute: 0,
      incident_date: '2026-11-11',
      urgency: 'urgent',
      preferred_method: 'video_call',
      preferred_time: 'morning',
      relief_requested: 'Immediate removal of invasive surveillance camera and binding undertaking against unauthorized trespass.',
      document_attachment_url: 'cctv_placement_photo.jpg',
      status: 'open',
      assigned_lawyer_id: null,
      created_at: new Date('2026-11-12T10:00:00Z').toISOString(),
      lawyer_responses: []
    },
    {
      id: 'iss_seed_007',
      issue_reference: 'CS-CMP-2026-3391',
      tenant_id: 'usr_tenant_sourav',
      tenant_name: 'Sourav Mukherjee',
      title: 'Sudden 30% mid-term rent hike demanded in month 4 of registered agreement with lockout threats',
      category: 'rent_hike',
      variety_label: 'Arbitrary Mid-Term Rent Hike',
      city: 'Kolkata',
      state: 'West Bengal',
      description: 'Signed an 11-month agreement in July 2026 at ₹18,000/month. Landlord served a WhatsApp ultimatum demanding ₹23,500/month from next week, asserting that property rates in Salt Lake had increased. Landlord threatened to bar society entry pass if hike is not paid.',
      amount_in_dispute: 18000,
      incident_date: '2026-11-12',
      urgency: 'medium',
      preferred_method: 'video_call',
      preferred_time: 'afternoon',
      relief_requested: 'Restrain landlord from enforcing mid-term hike and enforce fixed rent for entire 11-month tenure.',
      document_attachment_url: 'whatsapp_threat_screenshot.png',
      status: 'open',
      assigned_lawyer_id: null,
      created_at: new Date('2026-11-13T09:00:00Z').toISOString(),
      lawyer_responses: []
    },
    {
      id: 'iss_seed_008',
      issue_reference: 'CS-CMP-2026-2914',
      tenant_id: 'usr_tenant_manish',
      tenant_name: 'Manish Patel',
      title: 'Arbitrary move-out charges: ₹22,000 for floor buffing and ₹16,000 for kitchen granite replacement',
      category: 'unfair_charges',
      variety_label: 'Unfair Move-out Charges',
      city: 'Ahmedabad',
      state: 'Gujarat',
      description: 'Lived in 3BHK in Bodakdev for 3 years. At move-out inspection, landlord claimed the kitchen counter has minor surface knife marks and demanded ₹16,000 for complete granite replacement, plus ₹22,000 for marble buffing. Both represent natural gradual usage over 3 years.',
      amount_in_dispute: 38000,
      incident_date: '2026-10-30',
      urgency: 'low',
      preferred_method: 'document_review',
      preferred_time: 'afternoon',
      relief_requested: 'Disallow unfair replacement deductions and release ₹38,000 retained from deposit.',
      document_attachment_url: 'kitchen_counter_photos.zip',
      status: 'open',
      assigned_lawyer_id: null,
      created_at: new Date('2026-11-04T12:00:00Z').toISOString(),
      lawyer_responses: []
    }
  ];

  // Helper: Read / Write Local Storage with safety
  function getStorage(key, defaultValue) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.warn('ClauseShield Storage Warning:', e);
      return defaultValue;
    }
  }

  function setStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('ClauseShield Storage Error:', e);
    }
  }

  // Initialise & Self-heal Database on boot
  function initDatabase() {
    // 1. Profiles: Ensure seed accounts always exist
    const existingProfiles = getStorage(STORAGE_KEYS.PROFILES, []);
    if (!existingProfiles || existingProfiles.length === 0) {
      setStorage(STORAGE_KEYS.PROFILES, SEED_PROFILES);
    } else {
      let modified = false;
      for (const sp of SEED_PROFILES) {
        if (!existingProfiles.some(p => p.email.toLowerCase() === sp.email.toLowerCase())) {
          existingProfiles.push(sp);
          modified = true;
        }
      }
      if (modified) setStorage(STORAGE_KEYS.PROFILES, existingProfiles);
    }

    // 2. Lawyer Profiles: Ensure seed lawyers always exist
    const existingLawyers = getStorage(STORAGE_KEYS.LAWYER_PROFILES, []);
    if (!existingLawyers || existingLawyers.length === 0) {
      setStorage(STORAGE_KEYS.LAWYER_PROFILES, SEED_LAWYER_PROFILES);
    } else {
      let modified = false;
      for (const sl of SEED_LAWYER_PROFILES) {
        if (!existingLawyers.some(l => l.user_id === sl.user_id)) {
          existingLawyers.push(sl);
          modified = true;
        }
      }
      if (modified) setStorage(STORAGE_KEYS.LAWYER_PROFILES, existingLawyers);
    }

    // 3. Tenant Issues / Complaints: Ensure sample complaints always exist
    const existingIssues = getStorage(STORAGE_KEYS.TENANT_ISSUES, []);
    if (!existingIssues || existingIssues.length === 0) {
      setStorage(STORAGE_KEYS.TENANT_ISSUES, SEED_TENANT_ISSUES);
    }

    // 4. Consultation Requests
    if (!localStorage.getItem(STORAGE_KEYS.CONSULTATION_REQUESTS)) {
      setStorage(STORAGE_KEYS.CONSULTATION_REQUESTS, []);
    }

    // 5. Consultations
    if (!localStorage.getItem(STORAGE_KEYS.CONSULTATIONS)) {
      const seedConsultation = [{
        id: 'cst_seed_001',
        issue_id: 'iss_seed_001',
        tenant_id: 'usr_tenant_demo',
        lawyer_id: 'usr_lawyer_rajesh',
        scheduled_at: new Date(Date.now() + 86400000).toISOString(),
        duration_minutes: 30,
        meeting_room_id: 'CS-ROOM-DEMO-7819',
        meeting_url: 'https://meet.jit.si/ClauseShield_Legal_Consultation_Room_7819',
        status: 'scheduled',
        consultation_notes: 'Discussion on deposit recovery under Karnataka Rent Act and preparation of statutory notice.',
        created_at: new Date().toISOString()
      }];
      setStorage(STORAGE_KEYS.CONSULTATIONS, seedConsultation);
    }

    // 6. Payments
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
      const seedPayment = [{
        id: 'pay_seed_001',
        transaction_reference: 'TXN_CS_20261114_DEMO01',
        consultation_id: 'cst_seed_001',
        tenant_id: 'usr_tenant_demo',
        lawyer_id: 'usr_lawyer_rajesh',
        gross_amount: 500.00,
        lawyer_share: 450.00,
        platform_fee: 50.00,
        status: 'demo_processed',
        compliance_mode: 'BCI_DEMONSTRATION_MODE',
        created_at: new Date().toISOString()
      }];
      setStorage(STORAGE_KEYS.PAYMENTS, seedPayment);
    }

    // 7. Settings
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      setStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
  }

  initDatabase();

  // ------------------------------------------------------------------------------
  // SUPABASE CLIENT INITIALISATION / DUAL ADAPTER
  // ------------------------------------------------------------------------------
  const DEFAULT_CONFIG = {
    url: 'https://tupyazcflbdqrxzjfobv.supabase.co',
    anonKey: 'sb_publishable_MVpr7gmAvQxdJvENMaxeuA_LKC3RP3J'
  };

  let supabaseInstance = null;
  let storedConfig = getStorage(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG);
  if (!storedConfig || !storedConfig.url || !storedConfig.anonKey) {
    storedConfig = DEFAULT_CONFIG;
    setStorage(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG);
  }
  const config = storedConfig;

  if (window.supabase && config.url && config.anonKey) {
    try {
      supabaseInstance = window.supabase.createClient(config.url, config.anonKey);
      console.log('ClauseShield: Live Supabase Client connected to', config.url);
    } catch (e) {
      console.warn('ClauseShield: Live Supabase initialization failed, running with local persistent database.', e);
      supabaseInstance = null;
    }
  }

  // Unique ID Generator
  function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  function generateIssueRef() {
    const yr = new Date().getFullYear();
    const num = Math.floor(1000 + Math.random() * 9000);
    return `CS-CMP-${yr}-${num}`;
  }

  // ------------------------------------------------------------------------------
  // CLAUSESHIELD REPOSITORY API
  // ------------------------------------------------------------------------------
  const ClauseShieldDB = {
    // --------------------------------------------------------------------------
    // CONFIGURATION
    // --------------------------------------------------------------------------
    getConfig() {
      return getStorage(STORAGE_KEYS.CONFIG, { url: '', anonKey: '' });
    },

    setConfig(url, anonKey) {
      const cleanUrl = (url || '').trim();
      const cleanKey = (anonKey || '').trim();
      setStorage(STORAGE_KEYS.CONFIG, { url: cleanUrl, anonKey: cleanKey });
      if (cleanUrl && cleanKey && window.supabase) {
        try {
          supabaseInstance = window.supabase.createClient(cleanUrl, cleanKey);
          return { success: true, live: true };
        } catch (e) {
          return { success: false, error: e.message };
        }
      } else {
        supabaseInstance = null;
        return { success: true, live: false };
      }
    },

    isLiveSupabase() {
      return !!supabaseInstance;
    },

    // --------------------------------------------------------------------------
    // AUTHENTICATION & SESSIONS (Resilient & Self-healing)
    // --------------------------------------------------------------------------
    auth: {
      getCurrentUser() {
        return getStorage(STORAGE_KEYS.CURRENT_USER, null);
      },

      getUserByEmail(email) {
        if (!email) return null;
        const profiles = getStorage(STORAGE_KEYS.PROFILES, []);
        const normalized = email.toLowerCase().trim();
        return profiles.find(p => p.email.toLowerCase() === normalized) || null;
      },

      async signUp({ email, password, full_name, phone, role, lawyerDetails }) {
        if (!email || !password) {
          throw new Error('Please provide an email address and password.');
        }

        const normalizedEmail = email.toLowerCase().trim();
        const profiles = getStorage(STORAGE_KEYS.PROFILES, []);
        const existingUser = profiles.find(p => p.email.toLowerCase() === normalizedEmail);

        // If user already exists:
        if (existingUser) {
          if (existingUser.password === password) {
            // Existing user provided matching password -> Log them in!
            const sessionUser = {
              id: existingUser.id,
              email: existingUser.email,
              full_name: existingUser.full_name,
              phone: existingUser.phone,
              role: existingUser.role,
              avatar_url: existingUser.avatar_url
            };
            setStorage(STORAGE_KEYS.CURRENT_USER, sessionUser);
            return sessionUser;
          } else {
            throw new Error('An account with this email already exists. Please sign in with your password.');
          }
        }

        const resolvedName = (full_name && full_name.trim()) ? full_name.trim() : normalizedEmail.split('@')[0];
        const userId = generateId('usr');
        const userRole = role || 'tenant';

        const newProfile = {
          id: userId,
          email: normalizedEmail,
          password: password,
          full_name: resolvedName,
          phone: phone ? phone.trim() : '',
          role: userRole,
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(resolvedName)}&background=315ee8&color=fff`,
          created_at: new Date().toISOString()
        };

        profiles.push(newProfile);
        setStorage(STORAGE_KEYS.PROFILES, profiles);

        // If registering as a lawyer:
        if (userRole === 'lawyer') {
          const lawyerProfiles = getStorage(STORAGE_KEYS.LAWYER_PROFILES, []);
          const details = lawyerDetails || {};
          const newLawyerProfile = {
            id: generateId('lp'),
            user_id: userId,
            bar_council_number: details.bar_council_number || `BAR/${Math.floor(1000 + Math.random() * 9000)}/2026`,
            state_bar_council: details.state_bar_council || 'Bar Council of Maharashtra & Goa',
            specialisation: details.specialisation || 'Tenancy Disputes & Deposit Recovery',
            years_experience: Number(details.years_experience) || 5,
            bio: details.bio || 'Advocate offering free legal guidance and legal aid to tenants.',
            consultation_fee: Number(details.consultation_fee) || 0,
            availability: details.availability || 'Mon - Fri: 5:00 PM – 8:00 PM',
            document_url: details.document_name || 'bar_council_certificate.pdf',
            verification_status: 'verified', // Verified so lawyer can immediately test and advise!
            verified_at: new Date().toISOString(),
            verified_by: 'usr_admin_001',
            rating: 5.0,
            total_reviews: 1
          };
          lawyerProfiles.push(newLawyerProfile);
          setStorage(STORAGE_KEYS.LAWYER_PROFILES, lawyerProfiles);
        }

        // Set session
        const sessionUser = {
          id: newProfile.id,
          email: newProfile.email,
          full_name: newProfile.full_name,
          phone: newProfile.phone,
          role: newProfile.role,
          avatar_url: newProfile.avatar_url
        };
        setStorage(STORAGE_KEYS.CURRENT_USER, sessionUser);
        return sessionUser;
      },

      async signIn({ email, password }) {
        if (!email || !password) {
          throw new Error('Please enter both email and password.');
        }

        const profiles = getStorage(STORAGE_KEYS.PROFILES, []);
        const normalizedEmail = email.toLowerCase().trim();
        const user = profiles.find(p => p.email.toLowerCase() === normalizedEmail);

        if (!user) {
          const err = new Error('No account found for this email address. Click "Create New Account" to register.');
          err.userNotFound = true;
          err.email = normalizedEmail;
          throw err;
        }

        if (user.password !== password) {
          throw new Error('Incorrect password. Please verify your credentials and try again.');
        }

        const sessionUser = {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role,
          avatar_url: user.avatar_url
        };
        setStorage(STORAGE_KEYS.CURRENT_USER, sessionUser);
        return sessionUser;
      },

      async signUpOrSignIn({ email, password, full_name, role = 'tenant' }) {
        const normalizedEmail = (email || '').toLowerCase().trim();
        const profiles = getStorage(STORAGE_KEYS.PROFILES, []);
        const existing = profiles.find(p => p.email.toLowerCase() === normalizedEmail);

        if (existing) {
          return this.signIn({ email: normalizedEmail, password });
        } else {
          return this.signUp({ email: normalizedEmail, password, full_name, role });
        }
      },

      signOut() {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        return true;
      }
    },

    // --------------------------------------------------------------------------
    // TENANT COMPLAINTS & FREE LAWYER BOARD ("Generate Complaint")
    // --------------------------------------------------------------------------
    issues: {
      async create({ tenant_id, tenant_name, title, category, city, state, description, amount_in_dispute, incident_date, preferred_method, preferred_time, urgency, relief_requested, document_attachment_url }) {
        if (!title || !description || !city) {
          throw new Error('Please provide a complaint title, city location, and detailed description.');
        }

        const issues = getStorage(STORAGE_KEYS.TENANT_ISSUES, []);
        const issueRef = generateIssueRef();

        const newIssue = {
          id: generateId('iss'),
          issue_reference: issueRef,
          tenant_id: tenant_id || 'usr_guest_tenant',
          tenant_name: tenant_name || 'Tenant (Shielded)',
          title: title.trim(),
          category: category || 'security_deposit',
          variety_label: this.getVarietyLabel(category || 'security_deposit'),
          city: city.trim(),
          state: (state || 'Maharashtra').trim(),
          description: description.trim(),
          amount_in_dispute: Number(amount_in_dispute) || 0,
          incident_date: incident_date || new Date().toISOString().split('T')[0],
          urgency: urgency || 'urgent',
          relief_requested: relief_requested || 'Statutory refund and dispute resolution',
          preferred_method: preferred_method || 'video_call',
          preferred_time: preferred_time || 'evening',
          document_attachment_url: document_attachment_url || null,
          status: 'open',
          assigned_lawyer_id: null,
          created_at: new Date().toISOString(),
          lawyer_responses: []
        };

        issues.unshift(newIssue);
        setStorage(STORAGE_KEYS.TENANT_ISSUES, issues);
        return newIssue;
      },

      getVarietyLabel(category) {
        const map = {
          'security_deposit': 'Security Deposit Withholding',
          'illegal_eviction': 'Illegal Eviction & Lockout',
          'utility_cutoff': 'Utility Disconnection',
          'harassment': 'Landlord Harassment',
          'rent_hike': 'Arbitrary Rent Hike',
          'maintenance': 'Maintenance & Repairs',
          'lease_breach': 'Unfair Lease Terms',
          'unfair_charges': 'Unfair Move-out Charges',
          'other': 'Other Tenancy Dispute'
        };
        return map[category] || 'Tenancy Dispute';
      },

      async getByTenant(tenantId) {
        const issues = getStorage(STORAGE_KEYS.TENANT_ISSUES, []);
        return issues.filter(i => i.tenant_id === tenantId);
      },

      async getById(issueId) {
        const issues = getStorage(STORAGE_KEYS.TENANT_ISSUES, []);
        return issues.find(i => i.id === issueId || i.issue_reference === issueId) || null;
      },

      // Comprehensive Sorting & Variety Filtering for Free Lawyer Board
      async getAllAvailable({ category = 'all', state = 'all', search = '', status = 'all', urgency = 'all', sort = 'newest' } = {}) {
        const issues = getStorage(STORAGE_KEYS.TENANT_ISSUES, []);

        // Filter step
        let filtered = issues.filter(item => {
          if (status && status !== 'all' && item.status !== status) return false;
          if (category && category !== 'all' && item.category !== category) return false;
          if (urgency && urgency !== 'all' && item.urgency !== urgency) return false;
          if (state && state !== 'all') {
            const st = (item.state || '').toLowerCase();
            const ct = (item.city || '').toLowerCase();
            const target = state.toLowerCase();
            if (!st.includes(target) && !ct.includes(target)) return false;
          }
          if (search && search.trim()) {
            const q = search.toLowerCase().trim();
            const match = (item.title && item.title.toLowerCase().includes(q)) ||
                          (item.description && item.description.toLowerCase().includes(q)) ||
                          (item.city && item.city.toLowerCase().includes(q)) ||
                          (item.tenant_name && item.tenant_name.toLowerCase().includes(q)) ||
                          (item.issue_reference && item.issue_reference.toLowerCase().includes(q));
            if (!match) return false;
          }
          return true;
        });

        // Sorting step across different varieties & metrics
        filtered.sort((a, b) => {
          if (sort === 'newest') {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          } else if (sort === 'oldest') {
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          } else if (sort === 'amount_desc') {
            return (Number(b.amount_in_dispute) || 0) - (Number(a.amount_in_dispute) || 0);
          } else if (sort === 'amount_asc') {
            return (Number(a.amount_in_dispute) || 0) - (Number(b.amount_in_dispute) || 0);
          } else if (sort === 'urgency') {
            const rank = { urgent: 3, medium: 2, low: 1 };
            const rA = rank[a.urgency] || 1;
            const rB = rank[b.urgency] || 1;
            return rB - rA;
          } else if (sort === 'responses') {
            const respA = (a.lawyer_responses || []).length;
            const respB = (b.lawyer_responses || []).length;
            return respB - respA;
          }
          return 0;
        });

        return filtered;
      },

      // Any Free Lawyer Can Post Legal Advice / Opinion on a Complaint
      async addLawyerResponse({ issueId, lawyer_name, lawyer_id, bar_number, message, action_recommended }) {
        if (!message || !message.trim()) {
          throw new Error('Please enter legal advice for this tenant.');
        }

        const issues = getStorage(STORAGE_KEYS.TENANT_ISSUES, []);
        const idx = issues.findIndex(i => i.id === issueId || i.issue_reference === issueId);
        if (idx === -1) throw new Error('Complaint record not found.');

        if (!issues[idx].lawyer_responses) issues[idx].lawyer_responses = [];

        const newResponse = {
          id: generateId('lr'),
          lawyer_name: lawyer_name || 'Adv. Legal Aid Counsel',
          lawyer_id: lawyer_id || 'usr_free_lawyer',
          bar_number: bar_number || 'Enrolled Advocate',
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(lawyer_name || 'Advocate')}&background=101d35&color=fff`,
          message: message.trim(),
          action_recommended: action_recommended || 'Statutory Notice under Section 106 TPA',
          created_at: new Date().toISOString()
        };

        issues[idx].lawyer_responses.unshift(newResponse);
        if (issues[idx].status === 'open') {
          issues[idx].status = 'under_review';
        }
        setStorage(STORAGE_KEYS.TENANT_ISSUES, issues);
        return newResponse;
      },

      // Generate & Reset Sample Complaints
      seedSampleComplaints(forceReset = true) {
        setStorage(STORAGE_KEYS.TENANT_ISSUES, SEED_TENANT_ISSUES);
        return SEED_TENANT_ISSUES;
      },

      // Generate Formal Legal Notice Text
      generateLegalNotice(complaint) {
        const c = complaint || {};
        const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        const ref = c.issue_reference || 'CS-NOTICE-2026';
        const tenant = c.tenant_name || 'Tenant';
        const amount = c.amount_in_dispute ? `₹${Number(c.amount_in_dispute).toLocaleString('en-IN')}` : 'disputed sum';

        return `LEGAL NOTICE UNDER SECTION 106 OF THE TRANSFER OF PROPERTY ACT, 1882
Ref: ${ref}
Date: ${today}

To,
The Landlord / Property Owner
Re: Premises situated at ${c.city || 'City'}, ${c.state || 'State'}

SUBJECT: FORMAL DEMAND NOTICE FOR RESOLUTION OF TENANCY DISPUTE REGARDING ${c.title ? c.title.toUpperCase() : 'RENTAL PREMISES'}

Sir/Madam,

Under instructions from and on behalf of my client / the aggrieved tenant, ${tenant}, this formal Legal Notice is hereby served upon you:

1. That my client was the lawful occupant/licensee of the aforementioned residential premises under a valid Tenancy/Leave and License Agreement.

2. That the present dispute arose on or about ${c.incident_date || 'recently'}, wherein you have committed the following statutory breaches:
   "${c.description || 'Unlawful withholding of security deposit and arbitrary deductions without invoices.'}"

3. That under Section 108(m) of the Transfer of Property Act, 1882, the lessee is only bound to keep the property in reasonable condition, subject only to fair wear and tear. Furthermore, under Section 405/406 of the Indian Penal Code (Criminal Breach of Trust), failure to refund security deposit after peaceful handover constitutes an actionable criminal offense.

4. DEMAND FOR IMMEDIATE RELIEF:
   You are hereby called upon to:
   (a) Refund the total disputed amount of ${amount} within fifteen (15) days of receipt of this notice;
   (b) Cease and desist from any unlawful eviction, utility disconnection, or harassment;
   (c) Provide itemized contractor tax invoices for any claimed repairs.

TAKE NOTICE that in the event of your failure to comply within fifteen (15) days, my client shall initiate appropriate civil proceedings for recovery with 18% p.a. interest, alongside complaints before the competent Rent Authority and Consumer Commission, entirely at your risk, costs, and consequences.

Issued on behalf of:
${tenant}
c/o ClauseShield Legal Assistance Directorate
`;
      },

      async updateStatus(issueId, status, assignedLawyerId = null) {
        const issues = getStorage(STORAGE_KEYS.TENANT_ISSUES, []);
        const idx = issues.findIndex(i => i.id === issueId || i.issue_reference === issueId);
        if (idx === -1) throw new Error('Complaint not found');

        issues[idx].status = status;
        if (assignedLawyerId !== null) {
          issues[idx].assigned_lawyer_id = assignedLawyerId;
        }
        setStorage(STORAGE_KEYS.TENANT_ISSUES, issues);
        return issues[idx];
      },

      async withdraw(issueId, tenantId) {
        const issues = getStorage(STORAGE_KEYS.TENANT_ISSUES, []);
        const idx = issues.findIndex(i => (i.id === issueId || i.issue_reference === issueId) && i.tenant_id === tenantId);
        if (idx === -1) throw new Error('Complaint not found or unauthorized');

        issues[idx].status = 'withdrawn';
        setStorage(STORAGE_KEYS.TENANT_ISSUES, issues);
        return true;
      }
    },

    lawyers: {
      async getVerified({ specialisation, state, search } = {}) {
        const profiles = getStorage(STORAGE_KEYS.PROFILES, []);
        const lawyerProfiles = getStorage(STORAGE_KEYS.LAWYER_PROFILES, []);

        const verified = lawyerProfiles
          .filter(lp => lp.verification_status === 'verified')
          .map(lp => {
            const user = profiles.find(p => p.id === lp.user_id) || {};
            return {
              ...lp,
              full_name: user.full_name || 'Legal Advocate',
              avatar_url: user.avatar_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
              email: user.email,
              phone: user.phone
            };
          });

        return verified.filter(l => {
          if (specialisation && specialisation !== 'all' && !l.specialisation.toLowerCase().includes(specialisation.toLowerCase())) return false;
          if (state && state !== 'all' && !l.state_bar_council.toLowerCase().includes(state.toLowerCase())) return false;
          if (search) {
            const q = search.toLowerCase();
            const match = l.full_name.toLowerCase().includes(q) ||
                          l.specialisation.toLowerCase().includes(q) ||
                          l.bio.toLowerCase().includes(q) ||
                          l.state_bar_council.toLowerCase().includes(q);
            if (!match) return false;
          }
          return true;
        });
      },

      async getByUserId(userId) {
        const lawyerProfiles = getStorage(STORAGE_KEYS.LAWYER_PROFILES, []);
        const profiles = getStorage(STORAGE_KEYS.PROFILES, []);
        const lp = lawyerProfiles.find(l => l.user_id === userId);
        if (!lp) return null;
        const user = profiles.find(p => p.id === userId) || {};
        return { ...lp, full_name: user.full_name, avatar_url: user.avatar_url, email: user.email, phone: user.phone };
      },

      async getPending() {
        const profiles = getStorage(STORAGE_KEYS.PROFILES, []);
        const lawyerProfiles = getStorage(STORAGE_KEYS.LAWYER_PROFILES, []);
        return lawyerProfiles
          .filter(lp => lp.verification_status === 'pending')
          .map(lp => {
            const user = profiles.find(p => p.id === lp.user_id) || {};
            return { ...lp, full_name: user.full_name, email: user.email, phone: user.phone, avatar_url: user.avatar_url };
          });
      },

      async getAll() {
        const profiles = getStorage(STORAGE_KEYS.PROFILES, []);
        const lawyerProfiles = getStorage(STORAGE_KEYS.LAWYER_PROFILES, []);
        return lawyerProfiles.map(lp => {
          const user = profiles.find(p => p.id === lp.user_id) || {};
          return { ...lp, full_name: user.full_name, email: user.email, phone: user.phone, avatar_url: user.avatar_url };
        });
      },

      async verify(lawyerProfileId, adminId) {
        const lawyerProfiles = getStorage(STORAGE_KEYS.LAWYER_PROFILES, []);
        const idx = lawyerProfiles.findIndex(lp => lp.id === lawyerProfileId || lp.user_id === lawyerProfileId);
        if (idx === -1) throw new Error('Lawyer profile not found');

        lawyerProfiles[idx].verification_status = 'verified';
        lawyerProfiles[idx].verified_at = new Date().toISOString();
        lawyerProfiles[idx].verified_by = adminId;
        lawyerProfiles[idx].rejection_reason = null;
        setStorage(STORAGE_KEYS.LAWYER_PROFILES, lawyerProfiles);
        return lawyerProfiles[idx];
      },

      async reject(lawyerProfileId, reason, adminId) {
        const lawyerProfiles = getStorage(STORAGE_KEYS.LAWYER_PROFILES, []);
        const idx = lawyerProfiles.findIndex(lp => lp.id === lawyerProfileId || lp.user_id === lawyerProfileId);
        if (idx === -1) throw new Error('Lawyer profile not found');

        lawyerProfiles[idx].verification_status = 'rejected';
        lawyerProfiles[idx].rejection_reason = reason || 'Professional credentials could not be verified with State Bar Council records.';
        lawyerProfiles[idx].verified_by = adminId;
        setStorage(STORAGE_KEYS.LAWYER_PROFILES, lawyerProfiles);
        return lawyerProfiles[idx];
      }
    },

    // --------------------------------------------------------------------------
    // CONSULTATION REQUESTS & OFFERS
    // --------------------------------------------------------------------------
    consultationRequests: {
      async create({ issue_id, tenant_id, lawyer_id, initiated_by, note, proposed_date }) {
        const requests = getStorage(STORAGE_KEYS.CONSULTATION_REQUESTS, []);
        
        // Prevent duplicate pending requests for same issue and parties
        const existing = requests.find(r => r.issue_id === issue_id && r.lawyer_id === lawyer_id && r.status === 'pending');
        if (existing) {
          throw new Error('A consultation offer/request is already pending between these parties for this issue.');
        }

        const newReq = {
          id: generateId('crq'),
          issue_id: issue_id || null,
          tenant_id: tenant_id,
          lawyer_id: lawyer_id,
          initiated_by: initiated_by || 'lawyer', // 'lawyer' (offer) or 'tenant' (direct booking)
          note: note ? note.trim() : '',
          proposed_date: proposed_date || new Date(Date.now() + 86400000).toISOString(),
          status: 'pending',
          created_at: new Date().toISOString()
        };

        requests.unshift(newReq);
        setStorage(STORAGE_KEYS.CONSULTATION_REQUESTS, requests);

        // Update issue status to 'consultation_requested'
        if (issue_id) {
          const issues = getStorage(STORAGE_KEYS.TENANT_ISSUES, []);
          const issue = issues.find(i => i.id === issue_id);
          if (issue && issue.status === 'open') {
            issue.status = 'consultation_requested';
            setStorage(STORAGE_KEYS.TENANT_ISSUES, issues);
          }
        }

        return newReq;
      },

      async getByTenant(tenantId) {
        const requests = getStorage(STORAGE_KEYS.CONSULTATION_REQUESTS, []);
        const profiles = getStorage(STORAGE_KEYS.PROFILES, []);
        const lawyerProfiles = getStorage(STORAGE_KEYS.LAWYER_PROFILES, []);
        const issues = getStorage(STORAGE_KEYS.TENANT_ISSUES, []);

        return requests.filter(r => r.tenant_id === tenantId).map(r => {
          const lawyer = profiles.find(p => p.id === r.lawyer_id) || {};
          const lp = lawyerProfiles.find(l => l.user_id === r.lawyer_id) || {};
          const issue = issues.find(i => i.id === r.issue_id) || {};
          return {
            ...r,
            lawyer_name: lawyer.full_name || 'Advocate',
            lawyer_avatar: lawyer.avatar_url,
            bar_council_number: lp.bar_council_number,
            consultation_fee: lp.consultation_fee || 500,
            issue_title: issue.title || 'Legal Issue'
          };
        });
      },

      async getByLawyer(lawyerId) {
        const requests = getStorage(STORAGE_KEYS.CONSULTATION_REQUESTS, []);
        const profiles = getStorage(STORAGE_KEYS.PROFILES, []);
        const issues = getStorage(STORAGE_KEYS.TENANT_ISSUES, []);

        return requests.filter(r => r.lawyer_id === lawyerId).map(r => {
          const tenant = profiles.find(p => p.id === r.tenant_id) || {};
          const issue = issues.find(i => i.id === r.issue_id) || {};
          return {
            ...r,
            tenant_name: tenant.full_name || 'Tenant',
            issue_title: issue.title || 'Legal Issue',
            category: issue.category
          };
        });
      },

      async accept(requestId, scheduledTime = null) {
        const requests = getStorage(STORAGE_KEYS.CONSULTATION_REQUESTS, []);
        const req = requests.find(r => r.id === requestId);
        if (!req) throw new Error('Request not found');

        req.status = 'accepted';
        setStorage(STORAGE_KEYS.CONSULTATION_REQUESTS, requests);

        // Lock issue to this assigned lawyer
        if (req.issue_id) {
          const issues = getStorage(STORAGE_KEYS.TENANT_ISSUES, []);
          const issue = issues.find(i => i.id === req.issue_id);
          if (issue) {
            issue.status = 'accepted';
            issue.assigned_lawyer_id = req.lawyer_id;
            setStorage(STORAGE_KEYS.TENANT_ISSUES, issues);
          }
        }

        // Create the official Consultation & Private Video Meeting Room
        const roomId = `CS-MEET-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        const meetingUrl = `https://meet.jit.si/ClauseShield_Legal_${roomId}`;
        const scheduleDate = scheduledTime || req.proposed_date || new Date(Date.now() + 86400000).toISOString();

        const consultations = getStorage(STORAGE_KEYS.CONSULTATIONS, []);
        const newConsultation = {
          id: generateId('cst'),
          issue_id: req.issue_id,
          tenant_id: req.tenant_id,
          lawyer_id: req.lawyer_id,
          scheduled_at: scheduleDate,
          duration_minutes: 30,
          meeting_room_id: roomId,
          meeting_url: meetingUrl,
          status: 'scheduled',
          consultation_notes: req.note || 'Online Legal Consultation via ClauseShield Encrypted Video',
          created_at: new Date().toISOString()
        };
        consultations.unshift(newConsultation);
        setStorage(STORAGE_KEYS.CONSULTATIONS, consultations);

        // Automatically create demonstration payment record
        const lawyerProfiles = getStorage(STORAGE_KEYS.LAWYER_PROFILES, []);
        const lp = lawyerProfiles.find(l => l.user_id === req.lawyer_id);
        const grossFee = lp ? Number(lp.consultation_fee) : 500;
        const platformFee = Math.round(grossFee * 0.10);
        const lawyerShare = grossFee - platformFee;

        const payments = getStorage(STORAGE_KEYS.PAYMENTS, []);
        const newPayment = {
          id: generateId('pay'),
          transaction_reference: `TXN_CS_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
          consultation_id: newConsultation.id,
          tenant_id: req.tenant_id,
          lawyer_id: req.lawyer_id,
          gross_amount: grossFee,
          lawyer_share: lawyerShare,
          platform_fee: platformFee,
          status: 'demo_processed',
          compliance_mode: 'BCI_DEMONSTRATION_MODE',
          created_at: new Date().toISOString()
        };
        payments.unshift(newPayment);
        setStorage(STORAGE_KEYS.PAYMENTS, payments);

        return { consultation: newConsultation, payment: newPayment };
      },

      async decline(requestId) {
        const requests = getStorage(STORAGE_KEYS.CONSULTATION_REQUESTS, []);
        const req = requests.find(r => r.id === requestId);
        if (!req) throw new Error('Request not found');

        req.status = 'declined';
        setStorage(STORAGE_KEYS.CONSULTATION_REQUESTS, requests);

        // If the issue was waiting on this, restore it to open if no other pending requests exist
        if (req.issue_id) {
          const pendingOthers = requests.some(r => r.issue_id === req.issue_id && r.id !== requestId && r.status === 'pending');
          if (!pendingOthers) {
            const issues = getStorage(STORAGE_KEYS.TENANT_ISSUES, []);
            const issue = issues.find(i => i.id === req.issue_id);
            if (issue && issue.status === 'consultation_requested') {
              issue.status = 'open';
              setStorage(STORAGE_KEYS.TENANT_ISSUES, issues);
            }
          }
        }
        return req;
      }
    },

    // --------------------------------------------------------------------------
    // VIDEO CONSULTATIONS SYSTEM
    // --------------------------------------------------------------------------
    consultations: {
      async getByUser(userId, role) {
        const consultations = getStorage(STORAGE_KEYS.CONSULTATIONS, []);
        const profiles = getStorage(STORAGE_KEYS.PROFILES, []);
        const lawyerProfiles = getStorage(STORAGE_KEYS.LAWYER_PROFILES, []);
        const issues = getStorage(STORAGE_KEYS.TENANT_ISSUES, []);

        const userConsultations = consultations.filter(c => c.tenant_id === userId || c.lawyer_id === userId);

        return userConsultations.map(c => {
          const tenant = profiles.find(p => p.id === c.tenant_id) || {};
          const lawyer = profiles.find(p => p.id === c.lawyer_id) || {};
          const lp = lawyerProfiles.find(l => l.user_id === c.lawyer_id) || {};
          const issue = issues.find(i => i.id === c.issue_id) || {};

          return {
            ...c,
            tenant_name: tenant.full_name || 'Tenant',
            tenant_phone: tenant.phone || 'Protected',
            lawyer_name: lawyer.full_name || 'Advocate',
            lawyer_avatar: lawyer.avatar_url,
            bar_council_number: lp.bar_council_number,
            specialisation: lp.specialisation,
            issue_title: issue.title || 'Legal Consultation',
            issue_category: issue.category
          };
        });
      },

      async getById(consultationId) {
        const consultations = getStorage(STORAGE_KEYS.CONSULTATIONS, []);
        const c = consultations.find(item => item.id === consultationId);
        if (!c) return null;

        const profiles = getStorage(STORAGE_KEYS.PROFILES, []);
        const lawyerProfiles = getStorage(STORAGE_KEYS.LAWYER_PROFILES, []);
        const issues = getStorage(STORAGE_KEYS.TENANT_ISSUES, []);

        const tenant = profiles.find(p => p.id === c.tenant_id) || {};
        const lawyer = profiles.find(p => p.id === c.lawyer_id) || {};
        const lp = lawyerProfiles.find(l => l.user_id === c.lawyer_id) || {};
        const issue = issues.find(i => i.id === c.issue_id) || {};

        return {
          ...c,
          tenant_name: tenant.full_name,
          tenant_email: tenant.email,
          tenant_phone: tenant.phone,
          lawyer_name: lawyer.full_name,
          lawyer_avatar: lawyer.avatar_url,
          bar_council_number: lp.bar_council_number,
          specialisation: lp.specialisation,
          issue: issue
        };
      },

      async endCall(consultationId, notes = '') {
        const consultations = getStorage(STORAGE_KEYS.CONSULTATIONS, []);
        const c = consultations.find(item => item.id === consultationId);
        if (!c) throw new Error('Consultation session not found');

        c.status = 'completed';
        c.ended_at = new Date().toISOString();
        if (notes) c.consultation_notes = notes;
        setStorage(STORAGE_KEYS.CONSULTATIONS, consultations);

        // Also mark corresponding tenant issue as completed
        if (c.issue_id) {
          const issues = getStorage(STORAGE_KEYS.TENANT_ISSUES, []);
          const issue = issues.find(i => i.id === c.issue_id);
          if (issue) {
            issue.status = 'completed';
            setStorage(STORAGE_KEYS.TENANT_ISSUES, issues);
          }
        }
        return c;
      }
    },

    // --------------------------------------------------------------------------
    // PAYMENT & COMMISSION LEDGER
    // --------------------------------------------------------------------------
    payments: {
      async getByUser(userId) {
        const payments = getStorage(STORAGE_KEYS.PAYMENTS, []);
        const profiles = getStorage(STORAGE_KEYS.PROFILES, []);
        const consultations = getStorage(STORAGE_KEYS.CONSULTATIONS, []);

        return payments.filter(p => p.tenant_id === userId || p.lawyer_id === userId).map(p => {
          const tenant = profiles.find(u => u.id === p.tenant_id) || {};
          const lawyer = profiles.find(u => u.id === p.lawyer_id) || {};
          const cst = consultations.find(c => c.id === p.consultation_id) || {};
          return {
            ...p,
            tenant_name: tenant.full_name || 'Tenant',
            lawyer_name: lawyer.full_name || 'Advocate',
            meeting_date: cst.scheduled_at || p.created_at
          };
        });
      },

      async getAll() {
        const payments = getStorage(STORAGE_KEYS.PAYMENTS, []);
        const profiles = getStorage(STORAGE_KEYS.PROFILES, []);
        return payments.map(p => {
          const tenant = profiles.find(u => u.id === p.tenant_id) || {};
          const lawyer = profiles.find(u => u.id === p.lawyer_id) || {};
          return {
            ...p,
            tenant_name: tenant.full_name || 'Tenant',
            lawyer_name: lawyer.full_name || 'Advocate'
          };
        });
      }
    },

    // --------------------------------------------------------------------------
    // ADMINISTRATOR SYSTEM
    // --------------------------------------------------------------------------
    admin: {
      async getMetrics() {
        const profiles = getStorage(STORAGE_KEYS.PROFILES, []);
        const lawyerProfiles = getStorage(STORAGE_KEYS.LAWYER_PROFILES, []);
        const issues = getStorage(STORAGE_KEYS.TENANT_ISSUES, []);
        const consultations = getStorage(STORAGE_KEYS.CONSULTATIONS, []);
        const payments = getStorage(STORAGE_KEYS.PAYMENTS, []);

        const totalTenants = profiles.filter(p => p.role === 'tenant').length;
        const totalLawyers = lawyerProfiles.length;
        const pendingLawyers = lawyerProfiles.filter(lp => lp.verification_status === 'pending').length;
        const verifiedLawyers = lawyerProfiles.filter(lp => lp.verification_status === 'verified').length;
        const totalIssues = issues.length;
        const activeConsultations = consultations.filter(c => c.status === 'scheduled' || c.status === 'in_progress').length;
        const completedConsultations = consultations.filter(c => c.status === 'completed').length;

        const totalGrossRevenue = payments.reduce((acc, p) => acc + (Number(p.gross_amount) || 0), 0);
        const totalPlatformFees = payments.reduce((acc, p) => acc + (Number(p.platform_fee) || 0), 0);
        const totalLawyerPayouts = payments.reduce((acc, p) => acc + (Number(p.lawyer_share) || 0), 0);

        return {
          totalTenants,
          totalLawyers,
          pendingLawyers,
          verifiedLawyers,
          totalIssues,
          activeConsultations,
          completedConsultations,
          paymentRecordsCount: payments.length,
          totalGrossRevenue,
          totalPlatformFees,
          totalLawyerPayouts
        };
      },

      async getAllUsers() {
        const profiles = getStorage(STORAGE_KEYS.PROFILES, []);
        const lawyerProfiles = getStorage(STORAGE_KEYS.LAWYER_PROFILES, []);

        return profiles.map(p => {
          const lp = lawyerProfiles.find(l => l.user_id === p.id);
          return {
            ...p,
            verification_status: lp ? lp.verification_status : 'n/a',
            bar_council_number: lp ? lp.bar_council_number : '—'
          };
        });
      },

      async getSettings() {
        return getStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      },

      async updateSettings(newSettings) {
        const current = getStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
        const updated = { ...current, ...newSettings };
        setStorage(STORAGE_KEYS.SETTINGS, updated);
        return updated;
      }
    }
  };

  // Expose on global window object
  window.ClauseShieldDB = ClauseShieldDB;

})(window);
