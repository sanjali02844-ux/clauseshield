/**
 * ClauseShield — Indian Tenancy Legal References & Statutory Repository
 * ======================================================================
 * Strict Legal Accuracy Guidelines:
 * 1. Verified official acts, sections, and statutory doctrines.
 * 2. Distinction between Model Tenancy Act (non-self-executing framework)
 *    and enacted state legislation (e.g. Maharashtra Rent Control Act).
 * 3. Direct links to official India Code (legislative.gov.in) and Indian Kanoon.
 */

(function (window) {
  'use strict';

  const LEGAL_REFERENCES_DATA = [
    // --------------------------------------------------------------------------
    // 0. CONSTITUTIONAL PROTECTIONS & FUNDAMENTAL RIGHTS (LATEST CONSTITUTION)
    // --------------------------------------------------------------------------
    {
      id: 'ref-const-21',
      category: 'constitutional_law',
      category_label: 'Constitutional Protections & Fundamental Rights',
      act_name: 'Constitution of India, 1950',
      section: 'Article 21',
      title: 'Right to Shelter, Dignity, Privacy and Protection of Essential Utilities',
      short_explanation: 'The Supreme Court has firmly established that the Right to Shelter and basic utilities (electricity, water, sanitation) is an integral part of the Right to Life with dignity under Article 21. Forcible eviction without due process of law or disconnection of utilities is unconstitutional.',
      jurisdiction: 'Pan-India (Supreme Constitutional Safeguard)',
      applicability_notes: 'Anchored in Chameli Singh v. State of U.P. (1996) and Shantistar Builders v. N.K. Totame (1990). No lessor, landlord, or local authority can take the law into their own hands to dispossess a tenant or cut off life-sustaining utilities.',
      official_source_link: 'https://legislative.gov.in/constitution-of-india/',
      kanoon_search_url: 'https://indiankanoon.org/search/?formInput=Article+21+Constitution+right+to+shelter+tenant+eviction',
      last_verified_date: '2026-11-01',
      statutory_status: 'Supreme Fundamental Right'
    },
    {
      id: 'ref-const-300a',
      category: 'constitutional_law',
      category_label: 'Constitutional Protections & Fundamental Rights',
      act_name: 'Constitution of India, 1950',
      section: 'Article 300A',
      title: 'Right to Property & Protection of Lawful Tenant Possessory Rights',
      short_explanation: 'No person shall be deprived of their property or lawful possession save by authority of law. A tenant inducted into lawful possession holds protected civil rights and cannot be dispossessed or stripped of security deposit funds without lawful decree.',
      jurisdiction: 'Pan-India (Constitutional Protection)',
      applicability_notes: 'Under Bishandas v. State of Punjab and Krishna Ram Mahale v. Shobha Venkat Rao (1989), lawful possession cannot be taken with a strong hand or criminal force, even by the title owner, without due process of law.',
      official_source_link: 'https://legislative.gov.in/constitution-of-india/',
      kanoon_search_url: 'https://indiankanoon.org/search/?formInput=Article+300A+Constitution+lawful+possession+tenant',
      last_verified_date: '2026-11-01',
      statutory_status: 'Constitutional Right'
    },
    {
      id: 'ref-const-19',
      category: 'constitutional_law',
      category_label: 'Constitutional Protections & Fundamental Rights',
      act_name: 'Constitution of India, 1950',
      section: 'Article 19(1)(e) & Article 14',
      title: 'Freedom of Residence & Protection Against Discriminatory Tenancy Restrictions',
      short_explanation: 'Guarantees freedom to reside and settle anywhere in India. Discriminatory landlord or housing society restrictions (e.g. banning bachelors, dictating religious/dietary habits, arbitrary visitor curfews) are unconstitutional and contrary to public policy.',
      jurisdiction: 'Pan-India',
      applicability_notes: 'Applies to discriminatory society bylaws and arbitrary restrictions that violate equality before the law and public policy under Section 23 of the Indian Contract Act.',
      official_source_link: 'https://legislative.gov.in/constitution-of-india/',
      kanoon_search_url: 'https://indiankanoon.org/search/?formInput=Article+19+1+e+right+to+reside+tenant+discrimination',
      last_verified_date: '2026-11-01',
      statutory_status: 'Fundamental Freedom'
    },

    // --------------------------------------------------------------------------
    // 0B. LATEST CRIMINAL & PROCEDURAL CODES (JULY 1, 2024 ENACTED)
    // --------------------------------------------------------------------------
    {
      id: 'ref-bns-329',
      category: 'latest_criminal_code',
      category_label: 'Latest Criminal & Procedural Codes (BNS, BNSS, BSA 2023)',
      act_name: 'Bharatiya Nyaya Sanhita, 2023',
      section: 'Section 329(3) & 329(4)',
      title: 'Criminal House-Trespass & Unlawful Entry into Leased Premises',
      short_explanation: 'Criminalizes unauthorized entry into rented premises without mandatory statutory notice or using duplicate keys. A landlord who barges in or padlocks premises commits criminal house-trespass punishable with imprisonment.',
      jurisdiction: 'Pan-India (Replaced IPC 441/448 from July 1, 2024)',
      applicability_notes: 'Primary defense against landlords who enter premises unannounced, change door locks during tenant absence, or attempt physical lockouts without an eviction decree.',
      official_source_link: 'https://www.indiacode.nic.in/handle/123456789/20062?sam_handle=123456789/1362',
      kanoon_search_url: 'https://indiankanoon.org/search/?formInput=Bharatiya+Nyaya+Sanhita+Section+329+house+trespass',
      last_verified_date: '2026-11-01',
      statutory_status: 'Enacted Central Criminal Statute (In Force)'
    },
    {
      id: 'ref-bns-351',
      category: 'latest_criminal_code',
      category_label: 'Latest Criminal & Procedural Codes (BNS, BNSS, BSA 2023)',
      act_name: 'Bharatiya Nyaya Sanhita, 2023',
      section: 'Section 351(2) & 351(3)',
      title: 'Criminal Intimidation Against Tenants & Coercive Eviction Threats',
      short_explanation: 'Threatening a tenant with physical harm, reputational damage, property confiscation, or forceful eviction by hiring bouncers constitutes Criminal Intimidation punishable under Section 351 of BNS 2023.',
      jurisdiction: 'Pan-India (Replaced IPC 503/506 from July 1, 2024)',
      applicability_notes: 'Enables direct criminal police complaint and FIR when landlords or brokers use threatening language, aggressive WhatsApp messages, or physical intimidation to force eviction or surrender of deposit.',
      official_source_link: 'https://www.indiacode.nic.in/handle/123456789/20062?sam_handle=123456789/1362',
      kanoon_search_url: 'https://indiankanoon.org/search/?formInput=Bharatiya+Nyaya+Sanhita+Section+351+criminal+intimidation',
      last_verified_date: '2026-11-01',
      statutory_status: 'Enacted Central Criminal Statute (In Force)'
    },
    {
      id: 'ref-bns-316',
      category: 'latest_criminal_code',
      category_label: 'Latest Criminal & Procedural Codes (BNS, BNSS, BSA 2023)',
      act_name: 'Bharatiya Nyaya Sanhita, 2023',
      section: 'Section 316(2)',
      title: 'Criminal Breach of Trust (Misappropriation of Entrusted Security Deposit)',
      short_explanation: 'A security deposit is held in a fiduciary trust capacity. Dishonestly withholding, diverting, or refusing to refund deposit funds after keys are returned attracts criminal prosecution for Criminal Breach of Trust.',
      jurisdiction: 'Pan-India (Replaced IPC 405/406 from July 1, 2024)',
      applicability_notes: 'Landlords cannot treat security deposits as their private revenue. Arbitrary refusal to refund upon vacant possession gives rise to both civil claims and criminal complaints under Section 316.',
      official_source_link: 'https://www.indiacode.nic.in/handle/123456789/20062?sam_handle=123456789/1362',
      kanoon_search_url: 'https://indiankanoon.org/search/?formInput=Bharatiya+Nyaya+Sanhita+Section+316+criminal+breach+of+trust+security+deposit',
      last_verified_date: '2026-11-01',
      statutory_status: 'Enacted Central Criminal Statute (In Force)'
    },
    {
      id: 'ref-bns-324',
      category: 'latest_criminal_code',
      category_label: 'Latest Criminal & Procedural Codes (BNS, BNSS, BSA 2023)',
      act_name: 'Bharatiya Nyaya Sanhita, 2023',
      section: 'Section 324(1)',
      title: 'Mischief & Unlawful Disconnection of Essential Utilities',
      short_explanation: 'Intentionally cutting off electricity cables, tampering with water valves, or sabotaging essential amenities to cause wrongful loss and force a tenant out constitutes the cognizable offense of Mischief under Section 324 of BNS 2023.',
      jurisdiction: 'Pan-India (Replaced IPC 425/427 from July 1, 2024)',
      applicability_notes: 'Landlords attempting extrajudicial coercion via utility severance face immediate police intervention under Section 324 BNS alongside State Rent Control remedies.',
      official_source_link: 'https://www.indiacode.nic.in/handle/123456789/20062?sam_handle=123456789/1362',
      kanoon_search_url: 'https://indiankanoon.org/search/?formInput=Bharatiya+Nyaya+Sanhita+Section+324+mischief+utility+electricity',
      last_verified_date: '2026-11-01',
      statutory_status: 'Enacted Central Criminal Statute (In Force)'
    },
    {
      id: 'ref-bnss-164',
      category: 'latest_criminal_code',
      category_label: 'Latest Criminal & Procedural Codes (BNS, BNSS, BSA 2023)',
      act_name: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
      section: 'Section 164',
      title: 'Executive Magistrate Restraining Orders Against Forcible Dispossession',
      short_explanation: 'Empowers Executive Magistrates and local police authorities to issue immediate injunctive protection to safeguard a tenant in peaceful possession and restrain lessors from breaching the peace or attempting extrajudicial eviction.',
      jurisdiction: 'Pan-India (Replaced CrPC 145 from July 1, 2024)',
      applicability_notes: 'Urgent procedural protection invoked when there is an imminent apprehension of breach of peace or forced lock-out by the landlord or their agents.',
      official_source_link: 'https://www.indiacode.nic.in/handle/123456789/20063?sam_handle=123456789/1362',
      kanoon_search_url: 'https://indiankanoon.org/search/?formInput=Bharatiya+Nagarik+Suraksha+Sanhita+Section+164+possession+dispute',
      last_verified_date: '2026-11-01',
      statutory_status: 'Enacted Procedural Code (In Force)'
    },
    {
      id: 'ref-bsa-61',
      category: 'latest_criminal_code',
      category_label: 'Latest Criminal & Procedural Codes (BNS, BNSS, BSA 2023)',
      act_name: 'Bharatiya Sakshya Adhiniyam, 2023',
      section: 'Section 61 & Section 63',
      title: 'Admissibility of Electronic Records (WhatsApp, UPI, Email & Video Evidence)',
      short_explanation: 'Under the modernized evidence act, electronic records including WhatsApp communications, digital bank transaction receipts, emails, and date-stamped handover videos are directly admissible as primary/secondary evidence in court and rent authorities.',
      jurisdiction: 'Pan-India (Replaced Indian Evidence Act Section 65B from July 1, 2024)',
      applicability_notes: 'Validates move-out photographic evidence, WhatsApp notice exchanges, and digital deposit transfer proofs without archaic certificate technicalities.',
      official_source_link: 'https://www.indiacode.nic.in/handle/123456789/20064?sam_handle=123456789/1362',
      kanoon_search_url: 'https://indiankanoon.org/search/?formInput=Bharatiya+Sakshya+Adhiniyam+Section+61+63+electronic+evidence',
      last_verified_date: '2026-11-01',
      statutory_status: 'Enacted Evidence Statute (In Force)'
    },

    // --------------------------------------------------------------------------
    // 1. CENTRAL LEGISLATION — PROPERTY & CONTRACT LAW
    // --------------------------------------------------------------------------
    {
      id: 'ref-tpa-108m',
      category: 'central_legislation',
      category_label: 'Central Legislation (Property Law)',
      act_name: 'Transfer of Property Act, 1882',
      section: 'Section 108(m)',
      title: 'Lessee Duty to Restore Premises & Reasonable Wear and Tear Exemption',
      short_explanation: 'The tenant is duty-bound to restore the property in as good a condition as it was when put in possession, subject only to changes caused by reasonable wear and tear or irresistible force.',
      jurisdiction: 'Pan-India (Where state rent acts do not explicitly override)',
      applicability_notes: 'Foundational statutory defense against arbitrary repainting and deep-cleaning deductions. The burden of proving actual wilful damage beyond ordinary usage lies squarely on the lessor.',
      official_source_link: 'https://www.indiacode.nic.in/handle/123456789/2338?view_type=browse&sam_handle=123456789/1362',
      kanoon_search_url: 'https://indiankanoon.org/search/?formInput=Section+108(m)+Transfer+of+Property+Act+wear+and+tear',
      last_verified_date: '2026-01-15',
      statutory_status: 'Enacted Central Statute'
    },
    {
      id: 'ref-tpa-106',
      category: 'central_legislation',
      category_label: 'Central Legislation (Property Law)',
      act_name: 'Transfer of Property Act, 1882',
      section: 'Section 106',
      title: 'Duration of Certain Leases and Statutory Notice to Terminate',
      short_explanation: 'In the absence of a written contract or local law to the contrary, a lease of immovable property for residential purposes requires a mandatory 15-day written notice expiring with the end of a month of the tenancy.',
      jurisdiction: 'Pan-India (subject to local state rent control acts)',
      applicability_notes: 'Mandatory procedure for terminating periodic tenancies. Landlords cannot evict or demand instant move-out overnight without adequate statutory notice.',
      official_source_link: 'https://www.indiacode.nic.in/handle/123456789/2338?view_type=browse&sam_handle=123456789/1362',
      kanoon_search_url: 'https://indiankanoon.org/search/?formInput=Section+106+Transfer+of+Property+Act+15+days+notice',
      last_verified_date: '2026-01-15',
      statutory_status: 'Enacted Central Statute'
    },
    {
      id: 'ref-tpa-108f',
      category: 'central_legislation',
      category_label: 'Central Legislation (Property Law)',
      act_name: 'Transfer of Property Act, 1882',
      section: 'Section 108(f)',
      title: 'Lessor Duty to Make Repairs & Tenant Deduction Rights',
      short_explanation: 'If the lessor neglects to make, within reasonable time after notice, any repairs which he is bound to make to the property, the lessee may make the same himself, and deduct the expense with interest from the rent.',
      jurisdiction: 'Pan-India',
      applicability_notes: 'Applies where the lease agreement or statutory standard requires the landlord to maintain structural repairs (e.g. roof leakages, plumbing failures). Tenant must serve formal notice first.',
      official_source_link: 'https://www.indiacode.nic.in/handle/123456789/2338?view_type=browse&sam_handle=123456789/1362',
      kanoon_search_url: 'https://indiankanoon.org/search/?formInput=Section+108(f)+Transfer+of+Property+Act+repairs',
      last_verified_date: '2026-01-15',
      statutory_status: 'Enacted Central Statute'
    },
    {
      id: 'ref-contract-73',
      category: 'contract_law',
      category_label: 'Contract Law',
      act_name: 'Indian Contract Act, 1872',
      section: 'Section 73',
      title: 'Compensation for Loss or Damage Caused by Breach of Contract',
      short_explanation: 'A party who suffers from breach of contract is entitled to receive compensation for any loss or damage naturally arising in the usual course of things. Remote and indirect loss cannot be claimed.',
      jurisdiction: 'Pan-India',
      applicability_notes: 'Landlords cannot forfeit security deposits without demonstrating actual, quantifiable financial loss caused directly by the tenant.',
      official_source_link: 'https://www.indiacode.nic.in/handle/123456789/2187?view_type=browse&sam_handle=123456789/1362',
      kanoon_search_url: 'https://indiankanoon.org/search/?formInput=Section+73+Contract+Act+security+deposit+damage',
      last_verified_date: '2026-01-15',
      statutory_status: 'Enacted Central Statute'
    },
    {
      id: 'ref-contract-74',
      category: 'contract_law',
      category_label: 'Contract Law',
      act_name: 'Indian Contract Act, 1872',
      section: 'Section 74',
      title: 'Compensation for Breach where Penalty Stipulated (Prohibition of Punitive Clauses)',
      short_explanation: 'Even where an agreement names an amount to be paid in case of breach or stipulates penalty clauses (e.g. 3-month lock-in penalty), the court will only grant reasonable compensation not exceeding the amount named, and actual loss must be established.',
      jurisdiction: 'Pan-India',
      applicability_notes: 'Crucial for challenging aggressive lock-in forfeiture clauses. Established in landmark Supreme Court judgments (Fateh Chand v. Balkishan Dass; Maula Bux v. Union of India) that punitive forfeiture without actual loss is void in terrorem.',
      official_source_link: 'https://www.indiacode.nic.in/handle/123456789/2187?view_type=browse&sam_handle=123456789/1362',
      kanoon_search_url: 'https://indiankanoon.org/search/?formInput=Section+74+Contract+Act+penalty+deposit+forfeiture',
      last_verified_date: '2026-01-15',
      statutory_status: 'Enacted Central Statute'
    },
    {
      id: 'ref-sra-6',
      category: 'property_law',
      category_label: 'Property Law & Injunctions',
      act_name: 'Specific Relief Act, 1963',
      section: 'Section 6',
      title: 'Suit by Person Dispossessed of Immovable Property',
      short_explanation: 'If any person is dispossessed without his consent of immovable property otherwise than in due course of law, he may recover possession by suit notwithstanding any other title that may be set up.',
      jurisdiction: 'Pan-India',
      applicability_notes: 'Protects tenants against illegal lockouts, disconnection of electricity/water, and forcible dispossession by landlords without court decrees. Summary remedy available within 6 months.',
      official_source_link: 'https://www.indiacode.nic.in/handle/123456789/1583?view_type=browse&sam_handle=123456789/1362',
      kanoon_search_url: 'https://indiankanoon.org/search/?formInput=Section+6+Specific+Relief+Act+tenant+dispossessed',
      last_verified_date: '2026-01-15',
      statutory_status: 'Enacted Central Statute'
    },

    // --------------------------------------------------------------------------
    // 2. STATE-SPECIFIC TENANCY LEGISLATION (ENACTED)
    // --------------------------------------------------------------------------
    {
      id: 'ref-mrca-55',
      category: 'state_legislation',
      category_label: 'State Tenancy Legislation (Maharashtra)',
      act_name: 'Maharashtra Rent Control Act, 1999',
      section: 'Section 55',
      title: 'Mandatory Written Agreement & Registration of Tenancy',
      short_explanation: 'Any tenancy agreement or leave and license agreement entered into between landlord and tenant/licensee must be in writing and registered under the Registration Act, 1908. Responsibility for registration rests upon the landlord.',
      jurisdiction: 'State of Maharashtra',
      applicability_notes: 'If landlord fails to register the agreement, landlord is subject to statutory penalties (fine and imprisonment), and tenant terms are presumed true in dispute.',
      official_source_link: 'https://www.indiacode.nic.in/handle/123456789/12739?view_type=browse&sam_handle=123456789/2513',
      kanoon_search_url: 'https://indiankanoon.org/search/?formInput=Section+55+Maharashtra+Rent+Control+Act+registration',
      last_verified_date: '2026-02-01',
      statutory_status: 'Enacted State Statute'
    },
    {
      id: 'ref-mrca-29',
      category: 'state_legislation',
      category_label: 'State Tenancy Legislation (Maharashtra)',
      act_name: 'Maharashtra Rent Control Act, 1999',
      section: 'Section 29',
      title: 'Prohibition Against Cutting Off or Withholding Essential Supply',
      short_explanation: 'No landlord shall, without just or sufficient cause, cut off or withhold any essential supply or service enjoyed by the tenant (such as water supply, electricity, lights in passages, staircases, or conservancy).',
      jurisdiction: 'State of Maharashtra',
      applicability_notes: 'Magistrate or Small Causes Court can order immediate restoration and impose direct criminal penalties on offending landlord.',
      official_source_link: 'https://www.indiacode.nic.in/handle/123456789/12739?view_type=browse&sam_handle=123456789/2513',
      kanoon_search_url: 'https://indiankanoon.org/search/?formInput=Section+29+Maharashtra+Rent+Control+Act+essential+supply',
      last_verified_date: '2026-02-01',
      statutory_status: 'Enacted State Statute'
    },
    {
      id: 'ref-kra-27',
      category: 'state_legislation',
      category_label: 'State Tenancy Legislation (Karnataka)',
      act_name: 'Karnataka Rent Act, 1999',
      section: 'Section 27 & Chapter VI',
      title: 'Protection of Tenants Against Unlawful Eviction & Recovery Proceedings',
      short_explanation: 'A tenant cannot be evicted except upon an application made to the designated Court on statutory grounds (e.g. non-payment of standard rent after formal notice, bona fide own occupation).',
      jurisdiction: 'State of Karnataka (Bengaluru, Mysuru, Hubballi, etc.)',
      applicability_notes: 'Standard 11-month agreements in Karnataka are governed by general contract and lease rules unless exempted under premises threshold. Prohibits self-help eviction.',
      official_source_link: 'https://dpal.karnataka.gov.in/storage/pdf-files/Acts/34%20of%202001%20(E).pdf',
      kanoon_search_url: 'https://indiankanoon.org/search/?formInput=Section+27+Karnataka+Rent+Act+eviction',
      last_verified_date: '2026-02-10',
      statutory_status: 'Enacted State Statute'
    },
    {
      id: 'ref-drca-14',
      category: 'state_legislation',
      category_label: 'State Tenancy Legislation (Delhi)',
      act_name: 'Delhi Rent Control Act, 1958',
      section: 'Section 14 & Section 45',
      title: 'Protection Against Eviction & Restraint on Withholding Essential Services',
      short_explanation: 'Restricts landlord from evicting protected tenants except on specific statutory grounds. Section 45 explicitly prohibits cutting off water or electric supply.',
      jurisdiction: 'National Capital Territory of Delhi (Premises with rent <= Rs. 3,500/month are governed by Act; higher rents governed by Transfer of Property Act)',
      applicability_notes: 'Jurisdiction Note: Tenancies above Rs. 3,500/month in Delhi are exempted from DRCA per Section 3(c) and are governed by Transfer of Property Act, 1882.',
      official_source_link: 'https://www.indiacode.nic.in/handle/123456789/1376?view_type=browse&sam_handle=123456789/1362',
      kanoon_search_url: 'https://indiankanoon.org/search/?formInput=Delhi+Rent+Control+Act+Section+3c+exemption+3500',
      last_verified_date: '2026-02-01',
      statutory_status: 'Enacted State Statute'
    },
    {
      id: 'ref-tnrrrl-13',
      category: 'state_legislation',
      category_label: 'State Tenancy Legislation (Tamil Nadu)',
      act_name: 'Tamil Nadu Regulation of Rights and Responsibilities of Landlords and Tenants Act, 2017',
      section: 'Section 4, Section 13 & Section 21',
      title: 'Mandatory Tenancy Agreement, Security Deposit Cap & Rent Court Adjudication',
      short_explanation: 'Requires all tenancy agreements to be executed in writing and registered with the Rent Authority. Sets statutory duties for security deposit refunds upon handover.',
      jurisdiction: 'State of Tamil Nadu (Chennai, Coimbatore, Madurai, etc.)',
      applicability_notes: 'State enactment modernizing tenancy law. Displaces the old Tamil Nadu Buildings (Lease and Rent Control) Act, 1960. Both parties must submit tenancy details to online portal.',
      official_source_link: 'https://www.indiacode.nic.in/handle/123456789/14022?view_type=browse&sam_handle=123456789/2517',
      kanoon_search_url: 'https://indiankanoon.org/search/?formInput=Tamil+Nadu+Tenancy+Act+2017+security+deposit',
      last_verified_date: '2026-02-15',
      statutory_status: 'Enacted State Statute'
    },

    // --------------------------------------------------------------------------
    // 3. MODEL TENANCY ACT, 2021 (MODEL FRAMEWORK — JURISDICTION STATUS)
    // --------------------------------------------------------------------------
    {
      id: 'ref-mta-2021-cap',
      category: 'model_legislation',
      category_label: 'Model Tenancy Framework (Union Cabinet Model Act)',
      act_name: 'Model Tenancy Act, 2021',
      section: 'Section 11 & Section 13',
      title: 'Model Cap on Security Deposit (Max 2 Months for Residential) & Refund Timeline',
      short_explanation: 'Proposes that security deposit for residential premises shall not exceed two months rent, and must be refunded at the time of taking over vacant possession of the premises after making due deductions, if any.',
      jurisdiction: 'Model Legislation Only (Not automatically applicable pan-India)',
      applicability_notes: 'IMPORTANT LEGAL JURISDICTION NOTE: Under the Indian Constitution (Seventh Schedule, State List Item 18), "Land, rights in or over land, land tenures and the collection of rents" is a State subject. The Model Tenancy Act, 2021 is a guidance framework approved by the Union Cabinet. It DOES NOT automatically apply in a state unless the state legislature enacts corresponding legislation (e.g. UP Urban Tenancy Act 2021). Advocates must verify state-level adoption.',
      official_source_link: 'https://mohua.gov.in/upload/uploadfiles/files/Model_Tenancy_Act_English.pdf',
      kanoon_search_url: 'https://indiankanoon.org/search/?formInput=Model+Tenancy+Act+2021+security+deposit+state+adoption',
      last_verified_date: '2026-02-20',
      statutory_status: 'Model Legislation (Requires State Enactment)'
    },
    {
      id: 'ref-mta-2021-entry',
      category: 'model_legislation',
      category_label: 'Model Tenancy Framework (Union Cabinet Model Act)',
      act_name: 'Model Tenancy Act, 2021',
      section: 'Section 16',
      title: 'Landlord Notice Period Before Entering Premises (24-Hour Mandatory Prior Notice)',
      short_explanation: 'A landlord or property manager must give the tenant at least twenty-four hours advance notice in writing or electronically before entering the premises for inspection or repairs, and entry must occur during daylight hours (7 AM to 8 PM).',
      jurisdiction: 'Model Framework / Standard of Best Legal Practice',
      applicability_notes: 'Used by advocates to establish standards of quiet enjoyment and privacy against unauthorized intrusive inspections by landlords.',
      official_source_link: 'https://mohua.gov.in/upload/uploadfiles/files/Model_Tenancy_Act_English.pdf',
      kanoon_search_url: 'https://indiankanoon.org/search/?formInput=Model+Tenancy+Act+2021+Section+16+entry+notice',
      last_verified_date: '2026-02-20',
      statutory_status: 'Model Legislation (Requires State Enactment)'
    },

    // --------------------------------------------------------------------------
    // 4. CONSUMER PROTECTION
    // --------------------------------------------------------------------------
    {
      id: 'ref-cpa-2019-service',
      category: 'consumer_protection',
      category_label: 'Consumer Protection',
      act_name: 'Consumer Protection Act, 2019',
      section: 'Section 2(42) & Section 35',
      title: 'Deficiency in Service & Unfair Trade Practices by Commercial Lessors / PG Operators',
      short_explanation: 'A consumer may file a complaint before the District Consumer Disputes Redressal Commission for deficiency in service or unfair trade practice against commercial landlords, co-living operators, and property management firms.',
      jurisdiction: 'Pan-India',
      applicability_notes: 'Applicable where housing/coliving/student accommodation is provided commercially as a business service. Not typically applicable to purely private individual non-commercial residential leases.',
      official_source_link: 'https://www.indiacode.nic.in/handle/123456789/15256?view_type=browse&sam_handle=123456789/1362',
      kanoon_search_url: 'https://indiankanoon.org/search/?formInput=Consumer+Protection+Act+tenant+security+deposit+deficiency',
      last_verified_date: '2026-02-15',
      statutory_status: 'Enacted Central Statute'
    }
  ];

  window.ClauseShieldLegalReferences = {
    getAll() {
      return LEGAL_REFERENCES_DATA;
    },
    getByCategory(category) {
      if (!category || category === 'all') return LEGAL_REFERENCES_DATA;
      return LEGAL_REFERENCES_DATA.filter(ref => ref.category === category);
    },
    search(query) {
      if (!query || !query.trim()) return LEGAL_REFERENCES_DATA;
      const q = query.toLowerCase().trim();
      return LEGAL_REFERENCES_DATA.filter(ref => 
        ref.act_name.toLowerCase().includes(q) ||
        ref.section.toLowerCase().includes(q) ||
        ref.title.toLowerCase().includes(q) ||
        ref.short_explanation.toLowerCase().includes(q) ||
        ref.jurisdiction.toLowerCase().includes(q) ||
        ref.applicability_notes.toLowerCase().includes(q)
      );
    }
  };

})(window);
