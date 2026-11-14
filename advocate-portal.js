/**
 * ClauseShield — Advocate Portal Workspace Controller & Data Repository
 * =======================================================================
 * Implements Stage 2 through Stage 6 for the dedicated Advocate SaaS workspace:
 * - Role-based advocate registration & credential verification state machine.
 * - Advocate data isolation (cases, clients, case notes, case documents, appointments).
 * - Case & Client Management with detailed drawers and search/filter.
 * - Legal Document Workspace with file restrictions.
 * - Rental Agreement Audit integration with case-linking.
 * - Legal Rebuttal Workspace with statutory drafting and case-linking.
 * - Legal References & Research with jurisdiction applicability.
 * - Appointments & Consultations scheduler.
 * - Professional Advocate Profile management.
 */

(function (window) {
  'use strict';

  // ----------------------------------------------------------------------------
  // ADVOCATE STORAGE KEYS
  // ----------------------------------------------------------------------------
  const ADV_STORAGE_KEYS = {
    ADVOCATE_PROFILES: 'clauseshield_advocate_profiles',
    CASES: 'clauseshield_advocate_cases',
    CLIENTS: 'clauseshield_advocate_clients',
    DOCUMENTS: 'clauseshield_advocate_documents',
    NOTES: 'clauseshield_advocate_notes',
    APPOINTMENTS: 'clauseshield_advocate_appointments',
    AUDITS: 'clauseshield_advocate_audits',
    REBUTTALS: 'clauseshield_advocate_rebuttals'
  };

  function getStorage(key, fallback = []) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.warn('ClauseShield Advocate Storage Read Error:', e);
      return fallback;
    }
  }

  function setStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('ClauseShield Advocate Storage Write Error:', e);
    }
  }

  function generateId(prefix = 'adv') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  function generateCaseRef() {
    const yr = new Date().getFullYear();
    const num = Math.floor(1000 + Math.random() * 9000);
    return `CS-CAS-${yr}-${num}`;
  }

  // ----------------------------------------------------------------------------
  // SEED ADVOCATE DATA (Ready for Instant 1-Click Testing)
  // ----------------------------------------------------------------------------
  const SEED_ADVOCATE_PROFILES = [
    {
      id: 'ap_rajesh_01',
      user_id: 'usr_lawyer_rajesh',
      bar_council_number: 'MAH/4921/2014',
      state_bar_council: 'Bar Council of Maharashtra & Goa',
      state_of_practice: 'Maharashtra',
      city_of_practice: 'Mumbai',
      years_experience: 12,
      practice_areas: [
        'Rental and tenancy disputes',
        'Property law',
        'Civil litigation',
        'Security deposit disputes'
      ],
      bio: 'Senior property advocate with 12+ years appearing before Bombay High Court and Small Causes Courts. Specialises in Leave & License agreements, arbitrary painting deductions, and recovery of unlawfully retained tenant deposits.',
      profile_photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
      verification_status: 'verified', // Verified Advocate Demo
      verified_at: '2026-02-05T12:00:00Z',
      verified_by: 'usr_admin_001',
      created_at: '2026-02-01T11:00:00Z',
      updated_at: '2026-02-05T12:00:00Z'
    },
    {
      id: 'ap_pending_02',
      user_id: 'usr_advocate_pending',
      bar_council_number: 'TN/3142/2021',
      state_bar_council: 'Bar Council of Tamil Nadu',
      state_of_practice: 'Tamil Nadu',
      city_of_practice: 'Chennai',
      years_experience: 4,
      practice_areas: [
        'Rental and tenancy disputes',
        'Consumer disputes',
        'Contract law'
      ],
      bio: 'Advocate practicing at Madras High Court advising residential tenants on statutory deposit rights under the Tamil Nadu Tenancy Act, 2017.',
      profile_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      verification_status: 'pending_verification', // Unverified Advocate Demo (Test #2 & #4)
      verified_at: null,
      verified_by: null,
      created_at: '2026-11-01T10:00:00Z',
      updated_at: '2026-11-01T10:00:00Z'
    }
  ];

  const SEED_CLIENTS = [
    {
      id: 'cli_rajesh_01',
      advocate_id: 'usr_lawyer_rajesh',
      full_name: 'Kavita Nair',
      email: 'kavita.nair@techcorp.in',
      phone: '+91 98200 44112',
      city: 'Mumbai',
      state: 'Maharashtra',
      private_notes: 'Tenant in Bandra West 2BHK flat. Landlord forfeited Rs 80,000 citing Clause 14 lock-in penalty despite 30 days statutory notice of job transfer. Issued Section 106 notice.',
      created_at: '2026-11-02T10:00:00Z',
      updated_at: '2026-11-02T10:00:00Z'
    },
    {
      id: 'cli_rajesh_02',
      advocate_id: 'usr_lawyer_rajesh',
      full_name: 'Rohan Verma',
      email: 'rohan.verma@consulting.com',
      phone: '+91 98190 22334',
      city: 'Pune',
      state: 'Maharashtra',
      private_notes: 'Arbitrary painting and deep cleaning deductions of Rs 45,000 in Viman Nagar. Landlord failed to produce tax invoices or paint receipts.',
      created_at: '2026-11-04T11:30:00Z',
      updated_at: '2026-11-04T11:30:00Z'
    },
    {
      id: 'cli_rajesh_03',
      advocate_id: 'usr_lawyer_rajesh',
      full_name: 'Pooja Sengupta',
      email: 'pooja.s@financeservices.in',
      phone: '+91 98450 11998',
      city: 'Bengaluru',
      state: 'Karnataka',
      private_notes: 'Landlord unlawfully cut off electricity after refusal to pay illegal mid-term rent hike. Ready to file for emergency injunction under Specific Relief Act.',
      created_at: '2026-11-06T14:15:00Z',
      updated_at: '2026-11-06T14:15:00Z'
    }
  ];

  const SEED_CASES = [
    {
      id: 'cas_rajesh_01',
      case_reference: 'CS-CAS-2026-1049',
      advocate_id: 'usr_lawyer_rajesh',
      client_id: 'cli_rajesh_01',
      client_name: 'Kavita Nair',
      client_phone: '+91 98200 44112',
      client_email: 'kavita.nair@techcorp.in',
      title: 'Illegal 3-Month Lock-in Deduction & Deposit Withholding',
      nature_of_dispute: 'deposit_dispute',
      property_location: 'Flat 402, Sea View Apts, Bandra West, Mumbai, MH',
      security_deposit_amount: 80000,
      rent_amount: 40000,
      description: 'The tenant vacated the premises on 31st October 2026 pursuant to an official job transfer to Hyderabad, providing 30 days prior written notice. The landlord has refused to return the Rs. 80,000 security deposit, claiming an arbitrary 3-month lock-in penalty. Notice served under Section 106 & Section 74 of the Indian Contract Act.',
      status: 'in_progress',
      created_at: '2026-11-02T10:15:00Z',
      updated_at: '2026-11-10T16:00:00Z'
    },
    {
      id: 'cas_rajesh_02',
      case_reference: 'CS-CAS-2026-1052',
      advocate_id: 'usr_lawyer_rajesh',
      client_id: 'cli_rajesh_02',
      client_name: 'Rohan Verma',
      client_phone: '+91 98190 22334',
      client_email: 'rohan.verma@consulting.com',
      title: 'Arbitrary Painting & Deep Cleaning Deductions (Rs. 45,000)',
      nature_of_dispute: 'rental_dispute',
      property_location: 'Row House 12, Clover Highlands, Viman Nagar, Pune, MH',
      security_deposit_amount: 60000,
      rent_amount: 25000,
      description: 'Upon handover of keys after 3-year peaceful tenancy, landlord retained Rs. 45,000 for full house repainting and deep cleaning. The property exhibits normal wear & tear protected under Section 108(m) of the Transfer of Property Act, 1882. No damage reports or contractor bills provided.',
      status: 'under_review',
      created_at: '2026-11-04T12:00:00Z',
      updated_at: '2026-11-12T09:30:00Z'
    },
    {
      id: 'cas_rajesh_03',
      case_reference: 'CS-CAS-2026-1058',
      advocate_id: 'usr_lawyer_rajesh',
      client_id: 'cli_rajesh_03',
      client_name: 'Pooja Sengupta',
      client_phone: '+91 98450 11998',
      client_email: 'pooja.s@financeservices.in',
      title: 'Unlawful Power & Water Disconnection Following Dispute',
      nature_of_dispute: 'civil_litigation',
      property_location: 'Flat 3B, Sunshine Residency, Indiranagar, Bengaluru, KA',
      security_deposit_amount: 120000,
      rent_amount: 32000,
      description: 'Landlord served an informal demand for a 25% mid-term rent hike. Upon the client asserting the agreed 11-month lease rate, the landlord illegally instructed the apartment facility manager to disconnect the electricity supply. Violation of essential amenities protections.',
      status: 'new',
      created_at: '2026-11-06T14:30:00Z',
      updated_at: '2026-11-06T14:30:00Z'
    }
  ];

  const SEED_NOTES = [
    {
      id: 'not_01',
      case_id: 'cas_rajesh_01',
      advocate_id: 'usr_lawyer_rajesh',
      note_content: 'Reviewed registered Leave & License agreement. Clause 14 lock-in penalty is clearly punitive and runs counter to Maula Bux v. Union of India (AIR 1970 SC 1955). Landlord cannot show actual vacancy loss as flat is already re-listed online.',
      created_at: '2026-11-03T11:00:00Z'
    },
    {
      id: 'not_02',
      case_id: 'cas_rajesh_01',
      advocate_id: 'usr_lawyer_rajesh',
      note_content: 'Dispatched formal legal demand notice via registered speed post (Consignment No: EM982736184IN) on 5th Nov giving 15 days statutory cure period.',
      created_at: '2026-11-05T15:30:00Z'
    },
    {
      id: 'not_03',
      case_id: 'cas_rajesh_02',
      advocate_id: 'usr_lawyer_rajesh',
      note_content: 'Requested client to provide move-in inspection photographs and handover video log to establish that wall discoloration is natural weathering.',
      created_at: '2026-11-04T16:00:00Z'
    }
  ];

  const SEED_DOCUMENTS = [
    {
      id: 'doc_01',
      case_id: 'cas_rajesh_01',
      advocate_id: 'usr_lawyer_rajesh',
      document_name: 'Registered_Leave_and_License_Bandra.pdf',
      document_type: 'rental_agreement',
      file_size_bytes: 1845020,
      mime_type: 'application/pdf',
      uploaded_at: '2026-11-02T10:20:00Z'
    },
    {
      id: 'doc_02',
      case_id: 'cas_rajesh_01',
      advocate_id: 'usr_lawyer_rajesh',
      document_name: 'Landlord_Deposit_Deduction_Notice.pdf',
      document_type: 'landlord_notice',
      file_size_bytes: 420100,
      mime_type: 'application/pdf',
      uploaded_at: '2026-11-02T10:22:00Z'
    },
    {
      id: 'doc_03',
      case_id: 'cas_rajesh_01',
      advocate_id: 'usr_lawyer_rajesh',
      document_name: 'Statutory_Demand_Notice_Sec106.pdf',
      document_type: 'legal_notice',
      file_size_bytes: 512300,
      mime_type: 'application/pdf',
      uploaded_at: '2026-11-05T15:00:00Z'
    },
    {
      id: 'doc_04',
      case_id: 'cas_rajesh_02',
      advocate_id: 'usr_lawyer_rajesh',
      document_name: 'Move_Out_Handover_Inspection_Report.pdf',
      document_type: 'supporting_evidence',
      file_size_bytes: 2950000,
      mime_type: 'application/pdf',
      uploaded_at: '2026-11-04T12:10:00Z'
    }
  ];

  const SEED_APPOINTMENTS = [
    {
      id: 'apt_rajesh_01',
      advocate_id: 'usr_lawyer_rajesh',
      client_id: 'cli_rajesh_01',
      case_id: 'cas_rajesh_01',
      client_name: 'Kavita Nair',
      case_title: 'Illegal 3-Month Lock-in Deduction & Deposit Withholding',
      scheduled_at: '2026-11-18T16:30:00Z',
      duration_minutes: 30,
      meeting_type: 'office_consultation',
      meeting_notes: 'Conference to review landlord rejoinder and finalize Small Causes Court summary recovery petition.',
      status: 'scheduled',
      created_at: '2026-11-10T11:00:00Z'
    },
    {
      id: 'apt_rajesh_02',
      advocate_id: 'usr_lawyer_rajesh',
      client_id: 'cli_rajesh_02',
      case_id: 'cas_rajesh_02',
      client_name: 'Rohan Verma',
      case_title: 'Arbitrary Painting & Deep Cleaning Deductions (Rs. 45,000)',
      scheduled_at: '2026-11-20T11:00:00Z',
      duration_minutes: 45,
      meeting_type: 'video_conference',
      meeting_notes: 'Online review of move-in video timestamp log before dispatching statutory rebuttal.',
      status: 'scheduled',
      created_at: '2026-11-11T14:00:00Z'
    }
  ];

  // Self-heal and initialize seed data
  function initAdvocateDatabase() {
    // 1. Advocate Profiles
    const existingAdvProfiles = getStorage(ADV_STORAGE_KEYS.ADVOCATE_PROFILES, []);
    if (!existingAdvProfiles || existingAdvProfiles.length === 0) {
      setStorage(ADV_STORAGE_KEYS.ADVOCATE_PROFILES, SEED_ADVOCATE_PROFILES);
    } else {
      let modified = false;
      for (const sap of SEED_ADVOCATE_PROFILES) {
        if (!existingAdvProfiles.some(p => p.user_id === sap.user_id)) {
          existingAdvProfiles.push(sap);
          modified = true;
        }
      }
      if (modified) setStorage(ADV_STORAGE_KEYS.ADVOCATE_PROFILES, existingAdvProfiles);
    }

    // Ensure pending advocate exists in general profiles for testing
    if (window.ClauseShieldDB) {
      const profiles = getStorage('clauseshield_profiles', []);
      if (!profiles.some(p => p.email === 'advocate.pending@legalchambers.in')) {
        profiles.push({
          id: 'usr_advocate_pending',
          email: 'advocate.pending@legalchambers.in',
          password: 'password123',
          full_name: 'Adv. Meenakshi Sundaram',
          phone: '+91 94440 88221',
          role: 'advocate',
          avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
          created_at: new Date('2026-11-01T10:00:00Z').toISOString()
        });
        setStorage('clauseshield_profiles', profiles);
      }
    }

    // 2. Clients
    const existingClients = getStorage(ADV_STORAGE_KEYS.CLIENTS, []);
    if (!existingClients || existingClients.length === 0) {
      setStorage(ADV_STORAGE_KEYS.CLIENTS, SEED_CLIENTS);
    }

    // 3. Cases
    const existingCases = getStorage(ADV_STORAGE_KEYS.CASES, []);
    if (!existingCases || existingCases.length === 0) {
      setStorage(ADV_STORAGE_KEYS.CASES, SEED_CASES);
    }

    // 4. Notes
    const existingNotes = getStorage(ADV_STORAGE_KEYS.NOTES, []);
    if (!existingNotes || existingNotes.length === 0) {
      setStorage(ADV_STORAGE_KEYS.NOTES, SEED_NOTES);
    }

    // 5. Documents
    const existingDocs = getStorage(ADV_STORAGE_KEYS.DOCUMENTS, []);
    if (!existingDocs || existingDocs.length === 0) {
      setStorage(ADV_STORAGE_KEYS.DOCUMENTS, SEED_DOCUMENTS);
    }

    // 6. Appointments
    const existingApts = getStorage(ADV_STORAGE_KEYS.APPOINTMENTS, []);
    if (!existingApts || existingApts.length === 0) {
      setStorage(ADV_STORAGE_KEYS.APPOINTMENTS, SEED_APPOINTMENTS);
    }
  }

  initAdvocateDatabase();

  // ----------------------------------------------------------------------------
  // ADVOCATE REPOSITORY MODULES
  // ----------------------------------------------------------------------------
  const AdvocateDB = {
    // --------------------------------------------------------------------------
    // ADVOCATE PROFILE & VERIFICATION MANAGEMENT
    // --------------------------------------------------------------------------
    profile: {
      get(userId) {
        if (!userId) return null;
        const advProfiles = getStorage(ADV_STORAGE_KEYS.ADVOCATE_PROFILES, []);
        const allProfiles = getStorage('clauseshield_profiles', []);
        
        const advProf = advProfiles.find(p => p.user_id === userId) || null;
        const baseProf = allProfiles.find(p => p.id === userId) || null;

        if (!baseProf && !advProf) return null;

        return {
          id: userId,
          full_name: (baseProf && baseProf.full_name) || 'Advocate',
          email: (baseProf && baseProf.email) || '',
          phone: (baseProf && baseProf.phone) || '',
          role: 'advocate',
          avatar_url: (advProf && advProf.profile_photo) || (baseProf && baseProf.avatar_url) || '',
          bar_council_number: (advProf && advProf.bar_council_number) || 'Pending Enrolment',
          state_bar_council: (advProf && advProf.state_bar_council) || 'Bar Council of Maharashtra & Goa',
          state_of_practice: (advProf && advProf.state_of_practice) || 'Maharashtra',
          city_of_practice: (advProf && advProf.city_of_practice) || 'Mumbai',
          years_experience: (advProf && advProf.years_experience) || 1,
          practice_areas: (advProf && advProf.practice_areas) || ['Rental and tenancy disputes'],
          bio: (advProf && advProf.bio) || '',
          verification_status: (advProf && advProf.verification_status) || 'pending_verification',
          verified_at: (advProf && advProf.verified_at) || null,
          verified_by: (advProf && advProf.verified_by) || null,
          rejection_reason: (advProf && advProf.rejection_reason) || null
        };
      },

      update(userId, updates) {
        if (!userId) throw new Error('User ID is required');

        // Prevent security violation: user cannot self-verify!
        const cleanUpdates = { ...updates };
        delete cleanUpdates.verification_status;
        delete cleanUpdates.verified_at;
        delete cleanUpdates.verified_by;
        delete cleanUpdates.role;

        // 1. Update basic profile
        const allProfiles = getStorage('clauseshield_profiles', []);
        const profIdx = allProfiles.findIndex(p => p.id === userId);
        if (profIdx !== -1) {
          if (cleanUpdates.full_name) allProfiles[profIdx].full_name = cleanUpdates.full_name.trim();
          if (cleanUpdates.phone) allProfiles[profIdx].phone = cleanUpdates.phone.trim();
          if (cleanUpdates.profile_photo) allProfiles[profIdx].avatar_url = cleanUpdates.profile_photo.trim();
          setStorage('clauseshield_profiles', allProfiles);

          // Update session if it's the current user
          const currentUser = getStorage('clauseshield_current_user', null);
          if (currentUser && currentUser.id === userId) {
            currentUser.full_name = allProfiles[profIdx].full_name;
            currentUser.phone = allProfiles[profIdx].phone;
            currentUser.avatar_url = allProfiles[profIdx].avatar_url;
            setStorage('clauseshield_current_user', currentUser);
          }
        }

        // 2. Update advocate profile
        const advProfiles = getStorage(ADV_STORAGE_KEYS.ADVOCATE_PROFILES, []);
        let advIdx = advProfiles.findIndex(p => p.user_id === userId);
        if (advIdx === -1) {
          const newAdvProf = {
            id: generateId('ap'),
            user_id: userId,
            bar_council_number: cleanUpdates.bar_council_number || '',
            state_bar_council: cleanUpdates.state_bar_council || '',
            state_of_practice: cleanUpdates.state_of_practice || '',
            city_of_practice: cleanUpdates.city_of_practice || '',
            years_experience: Number(cleanUpdates.years_experience) || 0,
            practice_areas: cleanUpdates.practice_areas || ['Rental and tenancy disputes'],
            bio: cleanUpdates.bio || '',
            profile_photo: cleanUpdates.profile_photo || '',
            verification_status: 'pending_verification',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          advProfiles.push(newAdvProf);
        } else {
          advProfiles[advIdx] = {
            ...advProfiles[advIdx],
            bar_council_number: cleanUpdates.bar_council_number !== undefined ? cleanUpdates.bar_council_number : advProfiles[advIdx].bar_council_number,
            state_bar_council: cleanUpdates.state_bar_council !== undefined ? cleanUpdates.state_bar_council : advProfiles[advIdx].state_bar_council,
            state_of_practice: cleanUpdates.state_of_practice !== undefined ? cleanUpdates.state_of_practice : advProfiles[advIdx].state_of_practice,
            city_of_practice: cleanUpdates.city_of_practice !== undefined ? cleanUpdates.city_of_practice : advProfiles[advIdx].city_of_practice,
            years_experience: cleanUpdates.years_experience !== undefined ? Number(cleanUpdates.years_experience) : advProfiles[advIdx].years_experience,
            practice_areas: cleanUpdates.practice_areas !== undefined ? cleanUpdates.practice_areas : advProfiles[advIdx].practice_areas,
            bio: cleanUpdates.bio !== undefined ? cleanUpdates.bio : advProfiles[advIdx].bio,
            profile_photo: cleanUpdates.profile_photo !== undefined ? cleanUpdates.profile_photo : advProfiles[advIdx].profile_photo,
            updated_at: new Date().toISOString()
          };
        }
        setStorage(ADV_STORAGE_KEYS.ADVOCATE_PROFILES, advProfiles);

        return this.get(userId);
      },

      setVerificationStatus(userId, status, reviewerId = 'usr_admin_001', rejectionReason = null) {
        const validStatuses = ['pending_verification', 'verified', 'rejected', 'additional_info_required'];
        if (!validStatuses.includes(status)) {
          throw new Error('Invalid verification status');
        }

        const advProfiles = getStorage(ADV_STORAGE_KEYS.ADVOCATE_PROFILES, []);
        const advIdx = advProfiles.findIndex(p => p.user_id === userId);
        if (advIdx !== -1) {
          advProfiles[advIdx].verification_status = status;
          advProfiles[advIdx].verified_at = (status === 'verified') ? new Date().toISOString() : null;
          advProfiles[advIdx].verified_by = (status === 'verified') ? reviewerId : null;
          advProfiles[advIdx].rejection_reason = rejectionReason;
          advProfiles[advIdx].updated_at = new Date().toISOString();
          setStorage(ADV_STORAGE_KEYS.ADVOCATE_PROFILES, advProfiles);
          return true;
        }
        return false;
      }
    },

    // --------------------------------------------------------------------------
    // CASE MANAGEMENT (Strict Advocate Isolation)
    // --------------------------------------------------------------------------
    cases: {
      getAll(advocateId, filters = {}) {
        if (!advocateId) return [];
        let cases = getStorage(ADV_STORAGE_KEYS.CASES, []);
        
        // Strict isolation: only return cases belonging to this advocate
        cases = cases.filter(c => c.advocate_id === advocateId);

        // Apply filters
        if (filters.status && filters.status !== 'all') {
          cases = cases.filter(c => c.status === filters.status);
        }

        if (filters.nature && filters.nature !== 'all') {
          cases = cases.filter(c => c.nature_of_dispute === filters.nature);
        }

        if (filters.search && filters.search.trim()) {
          const q = filters.search.toLowerCase().trim();
          cases = cases.filter(c => 
            (c.title && c.title.toLowerCase().includes(q)) ||
            (c.case_reference && c.case_reference.toLowerCase().includes(q)) ||
            (c.client_name && c.client_name.toLowerCase().includes(q)) ||
            (c.property_location && c.property_location.toLowerCase().includes(q))
          );
        }

        // Sort descending by created_at
        cases.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return cases;
      },

      getById(caseId, advocateId) {
        if (!caseId || !advocateId) return null;
        const cases = getStorage(ADV_STORAGE_KEYS.CASES, []);
        const target = cases.find(c => c.id === caseId && c.advocate_id === advocateId);
        if (!target) return null;

        // Enrich with client details
        const clients = getStorage(ADV_STORAGE_KEYS.CLIENTS, []);
        const client = clients.find(cl => cl.id === target.client_id) || {};

        // Enrich with notes and documents counts
        const allNotes = getStorage(ADV_STORAGE_KEYS.NOTES, []);
        const caseNotes = allNotes.filter(n => n.case_id === caseId && n.advocate_id === advocateId);

        const allDocs = getStorage(ADV_STORAGE_KEYS.DOCUMENTS, []);
        const caseDocs = allDocs.filter(d => d.case_id === caseId && d.advocate_id === advocateId);

        return {
          ...target,
          client,
          notes: caseNotes,
          documents: caseDocs
        };
      },

      create({ advocate_id, client_id, title, nature_of_dispute, property_location, security_deposit_amount, rent_amount, description, status }) {
        if (!advocate_id) throw new Error('Advocate ID is required.');
        if (!title || !title.trim()) throw new Error('Case title is required.');
        if (!property_location || !property_location.trim()) throw new Error('Property location is required.');
        if (!description || !description.trim()) throw new Error('Case description is required.');

        const clients = getStorage(ADV_STORAGE_KEYS.CLIENTS, []);
        const client = clients.find(cl => cl.id === client_id && cl.advocate_id === advocate_id) || null;

        const newCase = {
          id: generateId('cas'),
          case_reference: generateCaseRef(),
          advocate_id,
          client_id: client ? client.id : null,
          client_name: client ? client.full_name : 'Direct Client',
          client_phone: client ? client.phone : '',
          client_email: client ? client.email : '',
          title: title.trim(),
          nature_of_dispute: nature_of_dispute || 'rental_dispute',
          property_location: property_location.trim(),
          security_deposit_amount: Number(security_deposit_amount) || 0,
          rent_amount: Number(rent_amount) || 0,
          description: description.trim(),
          status: status || 'new',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const cases = getStorage(ADV_STORAGE_KEYS.CASES, []);
        cases.unshift(newCase);
        setStorage(ADV_STORAGE_KEYS.CASES, cases);

        return newCase;
      },

      update(caseId, advocateId, updates) {
        if (!caseId || !advocateId) throw new Error('Case ID and Advocate ID are required.');
        const cases = getStorage(ADV_STORAGE_KEYS.CASES, []);
        const idx = cases.findIndex(c => c.id === caseId && c.advocate_id === advocateId);
        if (idx === -1) throw new Error('Case not found or unauthorized.');

        cases[idx] = {
          ...cases[idx],
          ...updates,
          updated_at: new Date().toISOString()
        };

        setStorage(ADV_STORAGE_KEYS.CASES, cases);
        return cases[idx];
      },

      addNote(caseId, advocateId, noteContent) {
        if (!caseId || !advocateId) throw new Error('Case ID and Advocate ID required.');
        if (!noteContent || !noteContent.trim()) throw new Error('Note content cannot be empty.');

        const newNote = {
          id: generateId('not'),
          case_id: caseId,
          advocate_id: advocateId,
          note_content: noteContent.trim(),
          created_at: new Date().toISOString()
        };

        const notes = getStorage(ADV_STORAGE_KEYS.NOTES, []);
        notes.unshift(newNote);
        setStorage(ADV_STORAGE_KEYS.NOTES, notes);

        // Update case updated_at
        this.update(caseId, advocateId, {});

        return newNote;
      },

      getNotes(caseId, advocateId) {
        const notes = getStorage(ADV_STORAGE_KEYS.NOTES, []);
        return notes
          .filter(n => n.case_id === caseId && n.advocate_id === advocateId)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      },

      addDocument(caseId, advocateId, { document_name, document_type, file_size_bytes, mime_type, file_data }) {
        if (!caseId || !advocateId) throw new Error('Case ID and Advocate ID required.');
        if (!document_name) throw new Error('Document name is required.');

        // File size check: 15MB limit
        if (file_size_bytes && file_size_bytes > 15 * 1024 * 1024) {
          throw new Error('File exceeds the maximum allowable limit of 15MB.');
        }

        const newDoc = {
          id: generateId('doc'),
          case_id: caseId,
          advocate_id: advocateId,
          document_name: document_name.trim(),
          document_type: document_type || 'rental_agreement',
          file_size_bytes: file_size_bytes || 0,
          mime_type: mime_type || 'application/pdf',
          file_data: file_data || null,
          uploaded_at: new Date().toISOString()
        };

        const docs = getStorage(ADV_STORAGE_KEYS.DOCUMENTS, []);
        docs.unshift(newDoc);
        setStorage(ADV_STORAGE_KEYS.DOCUMENTS, docs);

        // Update case updated_at
        this.update(caseId, advocateId, {});

        return newDoc;
      },

      getDocuments(caseId, advocateId) {
        const docs = getStorage(ADV_STORAGE_KEYS.DOCUMENTS, []);
        return docs
          .filter(d => (!caseId || d.case_id === caseId) && d.advocate_id === advocateId)
          .sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
      }
    },

    // --------------------------------------------------------------------------
    // CLIENT MANAGEMENT (Strict Advocate Isolation)
    // --------------------------------------------------------------------------
    clients: {
      getAll(advocateId, searchQuery = '') {
        if (!advocateId) return [];
        let clients = getStorage(ADV_STORAGE_KEYS.CLIENTS, []);
        
        // Strict isolation: only this advocate's clients
        clients = clients.filter(cl => cl.advocate_id === advocateId);

        if (searchQuery && searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          clients = clients.filter(cl => 
            (cl.full_name && cl.full_name.toLowerCase().includes(q)) ||
            (cl.email && cl.email.toLowerCase().includes(q)) ||
            (cl.phone && cl.phone.includes(q)) ||
            (cl.city && cl.city.toLowerCase().includes(q))
          );
        }

        // Attach active cases count to each client
        const cases = getStorage(ADV_STORAGE_KEYS.CASES, []);
        return clients.map(cl => {
          const clientCases = cases.filter(c => c.client_id === cl.id && c.advocate_id === advocateId);
          return {
            ...cl,
            total_cases: clientCases.length,
            active_cases: clientCases.filter(c => c.status !== 'resolved' && c.status !== 'closed').length
          };
        }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      },

      getById(clientId, advocateId) {
        if (!clientId || !advocateId) return null;
        const clients = getStorage(ADV_STORAGE_KEYS.CLIENTS, []);
        const client = clients.find(cl => cl.id === clientId && cl.advocate_id === advocateId);
        if (!client) return null;

        const cases = getStorage(ADV_STORAGE_KEYS.CASES, []);
        const clientCases = cases.filter(c => c.client_id === clientId && c.advocate_id === advocateId);

        return {
          ...client,
          cases: clientCases
        };
      },

      create({ advocate_id, full_name, email, phone, city, state, private_notes }) {
        if (!advocate_id) throw new Error('Advocate ID is required.');
        if (!full_name || !full_name.trim()) throw new Error('Client name is required.');
        if (!phone || !phone.trim()) throw new Error('Client phone number is required.');

        const newClient = {
          id: generateId('cli'),
          advocate_id,
          full_name: full_name.trim(),
          email: email ? email.trim() : '',
          phone: phone.trim(),
          city: city ? city.trim() : '',
          state: state ? state.trim() : 'Maharashtra',
          private_notes: private_notes ? private_notes.trim() : '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const clients = getStorage(ADV_STORAGE_KEYS.CLIENTS, []);
        clients.unshift(newClient);
        setStorage(ADV_STORAGE_KEYS.CLIENTS, clients);

        return newClient;
      },

      update(clientId, advocateId, updates) {
        if (!clientId || !advocateId) throw new Error('Client ID and Advocate ID required.');
        const clients = getStorage(ADV_STORAGE_KEYS.CLIENTS, []);
        const idx = clients.findIndex(cl => cl.id === clientId && cl.advocate_id === advocateId);
        if (idx === -1) throw new Error('Client not found or unauthorized.');

        clients[idx] = {
          ...clients[idx],
          ...updates,
          updated_at: new Date().toISOString()
        };

        setStorage(ADV_STORAGE_KEYS.CLIENTS, clients);
        return clients[idx];
      }
    },

    // --------------------------------------------------------------------------
    // APPOINTMENTS & CONSULTATION MANAGEMENT
    // --------------------------------------------------------------------------
    appointments: {
      getAll(advocateId, filters = {}) {
        if (!advocateId) return [];
        let apts = getStorage(ADV_STORAGE_KEYS.APPOINTMENTS, []);
        apts = apts.filter(a => a.advocate_id === advocateId);

        if (filters.status && filters.status !== 'all') {
          apts = apts.filter(a => a.status === filters.status);
        }

        apts.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
        return apts;
      },

      create({ advocate_id, client_id, case_id, scheduled_at, duration_minutes, meeting_type, meeting_notes, status }) {
        if (!advocate_id) throw new Error('Advocate ID is required.');
        if (!scheduled_at) throw new Error('Scheduled date and time are required.');

        const clients = getStorage(ADV_STORAGE_KEYS.CLIENTS, []);
        const client = clients.find(cl => cl.id === client_id && cl.advocate_id === advocate_id) || null;

        const cases = getStorage(ADV_STORAGE_KEYS.CASES, []);
        const cse = cases.find(c => c.id === case_id && c.advocate_id === advocate_id) || null;

        const newApt = {
          id: generateId('apt'),
          advocate_id,
          client_id: client ? client.id : null,
          case_id: cse ? cse.id : null,
          client_name: client ? client.full_name : 'Direct Consultation',
          case_title: cse ? cse.title : 'General Consultation',
          scheduled_at: new Date(scheduled_at).toISOString(),
          duration_minutes: Number(duration_minutes) || 30,
          meeting_type: meeting_type || 'office_consultation',
          meeting_notes: meeting_notes ? meeting_notes.trim() : '',
          status: status || 'scheduled',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const apts = getStorage(ADV_STORAGE_KEYS.APPOINTMENTS, []);
        apts.push(newApt);
        setStorage(ADV_STORAGE_KEYS.APPOINTMENTS, apts);

        return newApt;
      },

      update(appointmentId, advocateId, updates) {
        if (!appointmentId || !advocateId) throw new Error('Appointment ID and Advocate ID required.');
        const apts = getStorage(ADV_STORAGE_KEYS.APPOINTMENTS, []);
        const idx = apts.findIndex(a => a.id === appointmentId && a.advocate_id === advocateId);
        if (idx === -1) throw new Error('Appointment not found or unauthorized.');

        apts[idx] = {
          ...apts[idx],
          ...updates,
          updated_at: new Date().toISOString()
        };

        setStorage(ADV_STORAGE_KEYS.APPOINTMENTS, apts);
        return apts[idx];
      }
    },

    // --------------------------------------------------------------------------
    // CASE-LINKED AUDITS & REBUTTALS
    // --------------------------------------------------------------------------
    audits: {
      getAll(advocateId) {
        if (!advocateId) return [];
        const audits = getStorage(ADV_STORAGE_KEYS.AUDITS, []);
        return audits.filter(a => a.advocate_id === advocateId);
      },

      save({ advocate_id, case_id, document_name, risk_score, concern_level, clauses_data, summary }) {
        if (!advocate_id) throw new Error('Advocate ID required.');
        const newAudit = {
          id: generateId('aud'),
          advocate_id,
          case_id: case_id || null,
          document_name: document_name || 'Lease Agreement',
          risk_score: risk_score || 0,
          concern_level: concern_level || 'REVIEW',
          clauses_data: clauses_data || [],
          summary: summary || '',
          created_at: new Date().toISOString()
        };

        const audits = getStorage(ADV_STORAGE_KEYS.AUDITS, []);
        audits.unshift(newAudit);
        setStorage(ADV_STORAGE_KEYS.AUDITS, audits);

        // If linked to a case, also create a note in that case
        if (case_id) {
          AdvocateDB.cases.addNote(
            case_id,
            advocate_id,
            `📄 Agreement Audit Executed: "${document_name}" (Risk Score: ${risk_score}/100 - ${concern_level}). Identified ${clauses_data ? clauses_data.length : 0} statutory clauses requiring review.`
          );
        }

        return newAudit;
      }
    },

    rebuttals: {
      getAll(advocateId) {
        if (!advocateId) return [];
        const rebuttals = getStorage(ADV_STORAGE_KEYS.REBUTTALS, []);
        return rebuttals.filter(r => r.advocate_id === advocateId);
      },

      save({ advocate_id, case_id, dispute_category, landlord_message, client_explanation, draft_rebuttal }) {
        if (!advocate_id) throw new Error('Advocate ID required.');
        const newRebuttal = {
          id: generateId('reb'),
          advocate_id,
          case_id: case_id || null,
          dispute_category: dispute_category || 'general_dispute',
          landlord_message: landlord_message || '',
          client_explanation: client_explanation || '',
          draft_rebuttal: draft_rebuttal || '',
          created_at: new Date().toISOString()
        };

        const rebuttals = getStorage(ADV_STORAGE_KEYS.REBUTTALS, []);
        rebuttals.unshift(newRebuttal);
        setStorage(ADV_STORAGE_KEYS.REBUTTALS, rebuttals);

        // If linked to a case, add note to case
        if (case_id) {
          AdvocateDB.cases.addNote(
            case_id,
            advocate_id,
            `⚖️ Legal Rebuttal Drafted: Prepared formal response under statutory framework for dispute category "${dispute_category}".`
          );
        }

        return newRebuttal;
      }
    }
  };

  // Expose on global window object
  window.ClauseShieldAdvocateDB = AdvocateDB;

})(window);
