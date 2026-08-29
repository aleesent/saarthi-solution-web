import { 
  Job, 
  Service, 
  Testimonial, 
  BlogPost, 
  FAQItem,
  PlacementItem,
  PlacementStats,
  EmployerPartner,
  EmployerInquiry,
  OfficeContact,
  ContactMessage,
  JobApplication
} from '../types';

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-silvassa-001',
    title: 'Assistant Factory Manager',
    companyName: 'Premier Industrial Manufacturing Corp (Client of Sarthi Solutions)',
    industry: 'Manufacturing & Industrial Operations',
    location: 'Silvassa (Dadra & Nagar Haveli)',
    salary: '₹35,000 - ₹50,000 / month',
    experience: '7–10 Years',
    qualification: "Bachelor's or Master's Degree (Technical or Commercial stream)",
    ageRange: '30–45 Years',
    employmentType: 'Full-time',
    genderPreference: 'Any',
    vacancies: 1,
    department: 'Plant Operations & Factory Management',
    isUrgent: true,
    isFeatured: true,
    category: 'Manufacturing',
    contactPerson: 'Raajesh V',
    contactPhone: '+919824322206',
    whatsappNumber: '+919824322206',
    description: 'Sarthi Solutions is urgently recruiting a highly competent Assistant Factory Manager for a reputed industrial manufacturing plant located in Silvassa. The ideal candidate will oversee plant operations, HR compliance, commercial dispatch systems, and government department liaising.',
    keyResponsibilities: [
      'Oversee day-to-day plant operations including production schedules, quality control, packaging, inventory management, and logistics.',
      'Manage HR & Statutory compliance: PF, ESIC, Professional Tax (PT), overtime regulations, gratuity, leave policies, and labor law adherence.',
      'Coordinate factory licensing renewals, labor dispute resolution, and represent company in government department meetings.',
      'Execute commercial operations: invoicing, quotation preparation, purchase orders (POs), work order contracts, and vendor coordination.',
      'Manage local market vendor relations for industrial tools, spare parts, machinery repair costing, and preventive plant maintenance.',
      'Prepare weekly and monthly executive reports using advanced MS Excel spreadsheets and professional business email correspondence.',
      'Liaise with CGWA (Central Ground Water Authority) and PCC (Pollution Control Committee) departments for environmental compliance.'
    ],
    keyRequirements: [
      "Educational Qualification: Bachelor's or Master's Degree in Technical (BE/BTech/Diploma) or Commercial Stream (BCom/MCom/MBA).",
      'Experience: 7 to 10 years of solid hands-on experience in factory management, industrial operations, or plant administration.',
      'Age Limit: Strictly between 30 and 45 years.',
      'English Proficiency: Excellent written and spoken English communication skills (mandatory for documentation & reporting).',
      'Computer Skills: Advanced MS Excel (VLOOKUP, Pivot Tables), MS Word, Outlook email drafting, and document management.',
      'Special Preference: Candidates with proven experience handling CGWA (Central Ground Water Authority) & PCC (Pollution Control Committee) compliance will be strongly preferred.'
    ],
    hrComplianceSkills: [
      'Provident Fund (PF) Compliance',
      'ESIC Management',
      'Professional Tax (PT)',
      'Factory License Renewal',
      'Labor Dispute Handling',
      'Gratuity & Overtime Audits',
      'Leave Management Systems'
    ],
    plantOperationsKnowledge: [
      'Production Line Management',
      'Quality Control (QC) Standards',
      'Raw Material & Finished Goods Inventory',
      'Warehouse Packaging & Storage',
      'Logistics & Supply Chain Management'
    ],
    commercialOpsKnowledge: [
      'Dispatch & Invoicing Systems',
      'Quotation & Purchase Orders (PO)',
      'Work Orders & Vendor Contracts',
      'Machinery Repair Cost Estimation',
      'Industrial Tooling & Spare Parts Sourcing'
    ],
    preferredDepartmentKnowledge: [
      'CGWA (Central Ground Water Authority) Approvals',
      'PCC (Pollution Control Committee) NOCS & Compliance'
    ],
    freshersEligible: false,
    postedDate: '2026-08-01'
  },
  {
    id: 'job-surat-sales-002',
    title: 'Sales Head - Elevator Component Manufacturing',
    companyName: 'Elevator Components Manufacturing Leader',
    industry: 'Elevator & Heavy Engineering Components',
    location: 'Bhestan Udhna Road, Surat',
    salary: 'Up to ₹70,000 / month',
    experience: '5–10 Years (Mandatory Elevator Industry)',
    qualification: 'BE / BTech Mechanical / Diploma or Graduate with relevant Elevator Sales Exp',
    ageRange: '28–48 Years',
    employmentType: 'Full-time',
    genderPreference: 'Male',
    vacancies: 1,
    department: 'Sales & Business Development',
    workingHours: '8:30 AM to 7:30 PM',
    isUrgent: true,
    isFeatured: true,
    category: 'Elevator',
    contactPerson: 'Raajesh V',
    contactPhone: '+919824322206',
    whatsappNumber: '+919824322206',
    description: 'Urgent hiring for Sales Head at a renowned Elevator Component Manufacturing unit situated at Bhestan Udhna Road, Surat. Elevator Industry Experience is MANDATORY. Freshers are not eligible. Immediate joining required.',
    keyResponsibilities: [
      'Drive B2B sales for elevator mechanical and electrical components across pan-India OEM clients and contractors.',
      'Lead a team of sales executives, establish monthly revenue targets, and manage key client relationships.',
      'Negotiate high-value supply contracts, manage payment recovery, and expand distribution network.',
      'Conduct technical product presentations and client site visits.'
    ],
    keyRequirements: [
      'MANDATORY: Prior experience in Elevator / Lift Manufacturing Industry is strictly required.',
      'Freshers are NOT eligible. Only candidates with proven sales background in elevator components will be interviewed.',
      'Immediate joining required within 7 to 15 days.',
      'Working Hours: 8:30 AM to 7:30 PM.'
    ],
    mandatoryIndustryExp: 'Elevator / Lift Component Manufacturing Industry Experience Mandatory',
    freshersEligible: false,
    postedDate: '2026-08-02'
  },
  {
    id: 'job-surat-qc-003',
    title: 'Quality Control (QC) Executive - Elevator Manufacturing',
    companyName: 'Elevator Components Manufacturing Leader',
    industry: 'Elevator & Heavy Engineering Components',
    location: 'Bhestan Udhna Road, Surat',
    salary: 'Up to ₹24,000 / month',
    experience: '2–5 Years (Elevator Components)',
    qualification: 'Diploma / BE Mechanical / Quality Assurance Certification',
    employmentType: 'Full-time',
    genderPreference: 'Male/Female',
    vacancies: 2,
    department: 'Quality Assurance & Quality Control',
    workingHours: '8:30 AM to 7:30 PM',
    isUrgent: true,
    isFeatured: true,
    category: 'Elevator',
    contactPerson: 'Raajesh V',
    contactPhone: '+919824322206',
    whatsappNumber: '+919824322206',
    description: 'Urgent vacancy for 2 Quality Control Executives at an Elevator Component Manufacturing company on Bhestan Udhna Road, Surat. Male and Female candidates with Elevator Industry experience welcome. Immediate joining.',
    keyResponsibilities: [
      'Inspect raw materials, sheet metal components, guide rails, brackets, and elevator safety assemblies.',
      'Perform dimensional checks using vernier calipers, micrometers, and height gauges as per engineering drawings.',
      'Maintain quality inspection logs, reject non-conforming items, and enforce zero-defect standards.'
    ],
    keyRequirements: [
      'MANDATORY: Elevator / Sheet Metal component inspection experience.',
      'Freshers strictly NOT eligible.',
      'Working Hours: 8:30 AM to 7:30 PM.',
      'Immediate Joining Required.'
    ],
    mandatoryIndustryExp: 'Elevator Manufacturing Quality Inspection Experience Required',
    freshersEligible: false,
    postedDate: '2026-08-02'
  },
  {
    id: 'job-surat-cad-004',
    title: 'AutoCAD Executive - Elevator Component Design',
    companyName: 'Elevator Components Manufacturing Leader',
    industry: 'Elevator & Engineering Design',
    location: 'Bhestan Udhna Road, Surat',
    salary: 'Up to ₹22,000 / month',
    experience: '2–4 Years (CAD Drafting in Elevator/Sheet Metal)',
    qualification: 'Diploma in Mechanical / ITI Draughtsman / AutoCAD Certification',
    employmentType: 'Full-time',
    genderPreference: 'Male/Female',
    vacancies: 2,
    department: 'Design & Engineering',
    workingHours: '8:30 AM to 7:30 PM',
    isUrgent: true,
    isFeatured: true,
    category: 'Elevator',
    contactPerson: 'Raajesh V',
    contactPhone: '+919824322206',
    whatsappNumber: '+919824322206',
    description: 'Urgent openings for 2 AutoCAD Design Executives at Elevator Manufacturing Plant at Bhestan Udhna Road, Surat. Must be expert in 2D/3D CAD drafting of elevator car frames, doors, and brackets.',
    keyResponsibilities: [
      'Create detailed 2D/3D AutoCAD drawings for elevator mechanical components, cabin structures, and shaft layouts.',
      'Prepare Bill of Materials (BOM) and fabrication drawings for laser cutting and CNC bending units.',
      'Modify existing engineering designs based on client site dimensions.'
    ],
    keyRequirements: [
      'Proficiency in AutoCAD 2D/3D drafting for elevator/sheet metal fabrication.',
      'Freshers NOT eligible. Elevator industry experience mandatory.',
      'Working Hours: 8:30 AM to 7:30 PM. Immediate joining required.'
    ],
    mandatoryIndustryExp: 'AutoCAD Drafting in Elevator / Mechanical Components Mandatory',
    freshersEligible: false,
    postedDate: '2026-08-02'
  },
  {
    id: 'job-surat-data-005',
    title: 'Data Entry Operator - Elevator Manufacturing Plant',
    companyName: 'Elevator Components Manufacturing Leader',
    industry: 'Elevator & Manufacturing Logistics',
    location: 'Bhestan Udhna Road, Surat',
    salary: 'Up to ₹18,000 / month',
    experience: '1–3 Years (Plant/Factory Office Exp)',
    qualification: 'Higher Secondary (12th) or Any Graduate',
    employmentType: 'Full-time',
    genderPreference: 'Male/Female',
    vacancies: 2,
    department: 'Plant Administration & Data Entry',
    workingHours: '8:30 AM to 7:30 PM',
    isUrgent: true,
    isFeatured: true,
    category: 'Elevator',
    contactPerson: 'Raajesh V',
    contactPhone: '+919824322206',
    whatsappNumber: '+919824322206',
    description: 'Urgent requirements for 2 Data Entry Operators for factory office inventory and dispatch documentation at Bhestan Udhna Road, Surat. Fast typing and MS Excel knowledge required.',
    keyResponsibilities: [
      'Enter daily production figures, raw material inward/outward records, and dispatch entry into system.',
      'Prepare delivery challans, goods receipt notes (GRN), and invoice entries.',
      'Maintain factory worker attendance records and stock inventory spreadsheets.'
    ],
    keyRequirements: [
      'Fast typing speed (30+ WPM) and good knowledge of MS Excel.',
      'Prior experience in manufacturing plant office or logistics preferred.',
      'Freshers NOT eligible. Working Hours: 8:30 AM to 7:30 PM.'
    ],
    mandatoryIndustryExp: 'Industrial Plant / Elevator Factory Office Exp Mandatory',
    freshersEligible: false,
    postedDate: '2026-08-02'
  },
  {
    id: 'job-vapi-hr-006',
    title: 'HR Manager & Talent Acquisition Lead',
    companyName: 'Gujarat Polymers & Chemical Industries',
    industry: 'Chemical & Manufacturing',
    location: 'GIDC Vapi, Gujarat',
    salary: '₹50,000 - ₹65,000 / month',
    experience: '6–10 Years',
    qualification: 'MBA HR / MSW / MHRD',
    employmentType: 'Full-time',
    genderPreference: 'Any',
    vacancies: 1,
    department: 'Human Resources',
    isUrgent: false,
    isFeatured: true,
    category: 'HR',
    contactPerson: 'Raajesh V',
    contactPhone: '+919824322206',
    whatsappNumber: '+919824322206',
    description: 'Leading chemical manufacturing unit in GIDC Vapi requires an experienced HR Manager to handle industrial relations, workforce recruitment, compliance audits, and performance management.',
    keyResponsibilities: [
      'Manage end-to-end recruitment for plant engineers, technicians, and corporate staff.',
      'Handle labor statutory compliances (PF, ESI, Factory Inspector audits, Contract Labor laws).',
      'Execute team engagement, appraisal cycles, and training programs.'
    ],
    keyRequirements: [
      'MBA in HR or equivalent degree with minimum 6 years experience in manufacturing setups.',
      'Fluent in Gujarati, Hindi, and English.',
      'In-depth knowledge of Gujarat Factory Act and labor regulations.'
    ],
    freshersEligible: false,
    postedDate: '2026-07-28'
  },
  {
    id: 'job-hazira-mech-007',
    title: 'Senior Mechanical Maintenance Engineer',
    companyName: 'Heavy Engineering & Fabrication Solutions',
    industry: 'Engineering & Heavy Machinery',
    location: 'Hazira GIDC, Surat',
    salary: '₹40,000 - ₹55,000 / month',
    experience: '5–8 Years',
    qualification: 'BE / BTech Mechanical Engineering',
    employmentType: 'Full-time',
    genderPreference: 'Male',
    vacancies: 3,
    department: 'Plant Maintenance & Engineering',
    isUrgent: true,
    isFeatured: true,
    category: 'Engineering',
    contactPerson: 'Raajesh V',
    contactPhone: '+919824322206',
    whatsappNumber: '+919824322206',
    description: 'Urgent opening for 3 Senior Mechanical Maintenance Engineers for heavy fabrication shop floor equipped with CNC machines, overhead cranes, and hydraulic presses.',
    keyResponsibilities: [
      'Execute preventive, breakdown, and predictive maintenance schedules for hydraulic machinery, compressors, and CNC units.',
      'Minimize machinery downtime and maintain spare parts inventory.',
      'Enforce strict shop-floor safety protocols (EHS).'
    ],
    keyRequirements: [
      'Degree in Mechanical Engineering with 5+ years experience in heavy engineering plant.',
      'Strong knowledge of hydraulic circuits, pneumatic systems, and gearboxes.'
    ],
    freshersEligible: false,
    postedDate: '2026-07-29'
  },
  {
    id: 'job-surat-it-008',
    title: 'Senior Full Stack Software Developer',
    companyName: 'Sarthi Tech Solutions (Enterprise Client)',
    industry: 'Information Technology',
    location: 'Ring Road, Surat / Hybrid',
    salary: '₹60,000 - ₹90,000 / month',
    experience: '3–6 Years',
    qualification: 'BE / BTech Computer Science / MCA',
    employmentType: 'Full-time',
    genderPreference: 'Any',
    vacancies: 2,
    department: 'Software Engineering',
    isUrgent: false,
    isFeatured: true,
    category: 'IT',
    contactPerson: 'Raajesh V',
    contactPhone: '+919824322206',
    whatsappNumber: '+919824322206',
    description: 'Modern IT enterprise client seeking skilled React, Node.js, and PostgreSQL full stack developers to build SaaS cloud applications and ERP systems.',
    keyResponsibilities: [
      'Develop scalable Web applications using React, TypeScript, Express, and PostgreSQL.',
      'Build RESTful APIs and integrate Cloud microservices.',
      'Participate in agile sprint planning and code reviews.'
    ],
    keyRequirements: [
      'Strong command over JavaScript/TypeScript, React ecosystem, and SQL databases.',
      'Good problem-solving abilities and communication skills.'
    ],
    freshersEligible: false,
    postedDate: '2026-07-30'
  }
];

export const SERVICES: Service[] = [
  {
    id: 'serv-1',
    title: 'Permanent Recruitment',
    shortDesc: 'End-to-end recruitment solutions for sourcing, vetting, and onboarding long-term talent tailored to your company culture.',
    fullDesc: 'We specialize in finding high-caliber, permanent talent across manufacturing, industrial, technical, IT, and corporate sectors. Our rigorous 5-stage screening ensures candidates possess both the technical skill set and cultural alignment required for long-term growth.',
    iconName: 'UserCheck',
    features: ['Multi-tier Candidate Vetting', 'Background & Reference Verification', 'Domain-Specific Technical Testing', 'Cultural Fitment Assessment', '90-Day Placement Guarantee']
  },
  {
    id: 'serv-2',
    title: 'Contract Staffing & Deputation',
    shortDesc: 'Flexible staffing solutions to scale your industrial workforce up or down based on production demands and project schedules.',
    fullDesc: 'Sarthi Solutions provides reliable contractual manpower for manufacturing, construction, and engineering projects. We handle payroll, attendance, statutory compliances, and replacement seamlessly.',
    iconName: 'Users',
    features: ['Rapid Workforce Mobilization', 'Full Statutory & Payroll Compliance', 'On-Site HR Coordinator Support', 'Flexible Short & Long-Term Contracts']
  },
  {
    id: 'serv-3',
    title: 'Executive Search & Leadership Hiring',
    shortDesc: 'Confidential headhunting and executive placement for Plant Heads, Factory Managers, VPs, and C-suite leadership.',
    fullDesc: 'Finding visionary leaders for manufacturing units and corporate entities requires deep industry networks and stealth headhunting. We identify seasoned directors, factory heads, and operations leaders who drive profitability.',
    iconName: 'Briefcase',
    features: ['Discreet Executive Sourcing', 'Leadership Capability Assessment', 'Compensation Benchmarking', 'C-Suite Negotiating Support']
  },
  {
    id: 'serv-4',
    title: 'HR Consultancy & Statutory Compliance',
    shortDesc: 'Expert advisory on labor laws, factory licensing, PF/ESIC audits, CGWA/PCC approvals, and dispute resolution.',
    fullDesc: 'Navigating industrial labor laws and factory compliance in Gujarat and Dadra & Nagar Haveli can be challenging. Sarthi Solutions offers comprehensive HR advisory, factory license renewals, and labor court representation.',
    iconName: 'ShieldCheck',
    features: ['PF, ESIC & PT Statutory Audits', 'Factory License Renewals', 'CGWA & PCC Environmental Clearance Support', 'Labor Dispute Handling']
  },
  {
    id: 'serv-5',
    title: 'Overseas Placement & International Hiring',
    shortDesc: 'Connecting Indian technical talent and skilled tradesmen with international employment opportunities in Gulf & GCC countries.',
    fullDesc: 'We assist skilled engineers, technicians, machine operators, and managers in securing lucrative overseas job roles with visa processing, document attestation, and flight arrangements.',
    iconName: 'Globe',
    features: ['Gulf / Middle East Recruitment', 'Visa & Emigration Assistance', 'Trade Testing & Certification', 'Pre-Departure Orientation']
  },
  {
    id: 'serv-6',
    title: 'Payroll Management & Outsourcing',
    shortDesc: 'Complete automated payroll processing, tax deduction (TDS/PT), leave management, and monthly salary disbursement.',
    fullDesc: 'Streamline your enterprise payroll processing with 100% accuracy and statutory compliance. We generate pay slips, calculate overtime, manage PF/ESI challans, and minimize administrative burden.',
    iconName: 'FileSpreadsheet',
    features: ['Automated Salary Processing', 'Form 16 & TDS Generation', 'Attendance & Overtime Sync', 'Statutory Challan Filing']
  },
  {
    id: 'serv-7',
    title: 'Industrial & Plant Hiring',
    shortDesc: 'Specialized hiring for plant managers, QC executives, CNC operators, maintenance engineers, and elevator component specialists.',
    fullDesc: 'Industrial setups demand candidates with hands-on shop-floor experience, machinery maintenance skills, and safety compliance knowledge. We maintain an extensive active database of Gujarat & Silvassa industrial talent.',
    iconName: 'Factory',
    features: ['Shop Floor Talent Database', 'Technical Trade Vetting', 'Safety & EHS Certification Verification', 'Immediate Joiner Pools']
  },
  {
    id: 'serv-8',
    title: 'Resume Building & Interview Coaching',
    shortDesc: 'Professional career counseling, ATS-optimized resume formatting, and mock interview practice for candidates.',
    fullDesc: 'We empower job seekers by crafting impact-driven resumes that pass corporate ATS filters, alongside one-on-one mock interview coaching with industry HR veterans.',
    iconName: 'FileText',
    features: ['ATS Resume Optimization', 'Mock HR & Technical Interviews', 'LinkedIn Profile Revamp', 'Salary Negotiation Strategies']
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Vikram Patel',
    role: 'Managing Director',
    company: 'Surat Elevator Components Ltd.',
    image: '/avatars/avatar-male.svg',
    avatar: '/avatars/avatar-male.svg',
    content: 'Sarthi Solutions fulfilled our urgent requirement for Sales Head and Quality Control Executives within 5 days! Their understanding of the Elevator Component Manufacturing industry is truly impressive.',
    rating: 5,
    type: 'Employer',
    status: 'approved',
    is_approved: true,
    location: 'Surat, Gujarat',
    date: '1 Aug 2026',
    createdAt: '2026-08-01T10:00:00.000Z'
  },
  {
    id: 't2',
    name: 'Rajesh Sharma',
    role: 'Assistant Factory Manager',
    company: 'Silvassa Industrial Mfg. Unit',
    image: '/avatars/avatar-male.svg',
    avatar: '/avatars/avatar-male.svg',
    content: 'Raajesh V and the Sarthi team guided me throughout my hiring process for Silvassa plant. Their transparent communication and interview prep gave me complete confidence!',
    rating: 5,
    type: 'Candidate',
    status: 'approved',
    is_approved: true,
    location: 'Silvassa, Dadra & Nagar Haveli',
    date: '2 Aug 2026',
    createdAt: '2026-08-02T11:00:00.000Z'
  },
  {
    id: 't3',
    name: 'Meera Deshmukh',
    role: 'Head of Human Resources',
    company: 'Gujarat Chemical Industries, Vapi',
    image: '/avatars/avatar-female.svg',
    avatar: '/avatars/avatar-female.svg',
    content: 'We have partnered with Sarthi Solutions for executive placements for over 4 years. Their candidate screening quality and statutory HR advisory are top-notch.',
    rating: 5,
    type: 'Employer',
    status: 'approved',
    is_approved: true,
    location: 'Vapi, Gujarat',
    date: '3 Aug 2026',
    createdAt: '2026-08-03T09:30:00.000Z'
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'b1',
    title: 'Key HR Compliances Every Factory Manager in Gujarat & Silvassa Must Master',
    excerpt: 'Essential guide on PF, ESIC, Factory Act licensing, CGWA ground water norms, and PCC regulations for smooth plant operations.',
    content: 'Operating a manufacturing plant in South Gujarat and Dadra & Nagar Haveli requires strict adherence to statutory labor laws and environmental guidelines. Here is a breakdown of critical compliance requirements...',
    category: 'HR Compliance',
    author: 'Raajesh V',
    date: 'July 28, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'b2',
    title: 'Hiring in Elevator Component Manufacturing: What Skills Matter Most?',
    excerpt: 'Insight into specialized requirements for Sales Heads, QC Engineers, and AutoCAD Designers in the elevator engineering sector.',
    content: 'The elevator component manufacturing sector requires high precision, sheet metal engineering, and strict quality control standards...',
    category: 'Industry Insights',
    author: 'Sarthi Recruitment Team',
    date: 'August 01, 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'b3',
    title: 'Top 10 Interview Questions for Assistant Factory Manager Candidates',
    excerpt: 'How to answer questions regarding commercial dispatch, labor dispute handling, and plant inventory management effectively.',
    content: 'When interviewing for senior plant leadership roles, candidates must demonstrate both technical commercial acumen and practical shop-floor leadership...',
    category: 'Career Advice',
    author: 'Raajesh V',
    date: 'June 15, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=600&q=80'
  }
];

export const FAQS: FAQItem[] = [
  {
    id: 'f1',
    question: 'How do I apply for the Assistant Factory Manager position in Silvassa?',
    answer: 'You can apply directly through our website by clicking "Apply Now" on the Assistant Factory Manager job card, or by contacting Raajesh V on WhatsApp/Call at +91 98243 22206 with your updated resume.',
    category: 'Candidates'
  },
  {
    id: 'f2',
    question: 'Are freshers eligible for the Elevator Component vacancies in Surat?',
    answer: 'No, as per client mandate, Elevator Industry Experience is strictly mandatory for Sales Head, QC Executive, AutoCAD, and Data Entry positions. Freshers are not eligible for these specific urgent vacancies.',
    category: 'Candidates'
  },
  {
    id: 'f3',
    question: 'What industries does Sarthi Solutions specialize in?',
    answer: 'We specialize in Manufacturing, Elevator & Engineering Components, Chemical & Polymers, Industrial Plant Operations, IT & Software, Sales & Marketing, HR & Finance, and Executive Headhunting.',
    category: 'General'
  },
  {
    id: 'f4',
    question: 'How quickly can Sarthi Solutions provide candidate profiles to employers?',
    answer: 'For urgent requirements, we present pre-screened, verified candidate profiles within 24 to 48 hours from our pre-vetted Gujarat & Silvassa talent database.',
    category: 'Employers'
  },
  {
    id: 'f5',
    question: 'Are candidate resume submissions and career counseling free of charge?',
    answer: 'Yes! Submitting your resume, registering on our candidate portal, and applying for job openings on Sarthi Solutions is 100% free for job seekers.',
    category: 'Candidates'
  }
];

export const INITIAL_PLACEMENT_STATS: PlacementStats = {
  totalPlacements: '10,480+',
  partnerEmployers: '520+',
  placementRate: '98.4%',
  averageTurnaround: '48 Hours'
};

export const INITIAL_PLACEMENTS: PlacementItem[] = [
  {
    id: 'plc-1',
    candidate: 'Rajesh Kumar M.',
    role: 'Assistant Factory Manager',
    company: 'Leading Plastic & Polymer Plant',
    location: 'Silvassa (D&NH)',
    salary: '₹6.5 LPA',
    category: 'Manufacturing',
    date: 'July 2026'
  },
  {
    id: 'plc-2',
    candidate: 'Anil V. Parmar',
    role: 'Sales Head (Elevator Components)',
    company: 'Elevator & Engineering Pvt Ltd',
    location: 'Surat, Gujarat',
    salary: '₹8.2 LPA',
    category: 'Elevator',
    date: 'July 2026'
  },
  {
    id: 'plc-3',
    candidate: 'Pooja R. Sharma',
    role: 'Quality Control Executive',
    company: 'Precision Components Plant',
    location: 'Surat, Gujarat',
    salary: '₹4.8 LPA',
    category: 'Quality Assurance',
    date: 'June 2026'
  },
  {
    id: 'plc-4',
    candidate: 'Siddharth Mehta',
    role: 'AutoCAD Design Executive',
    company: 'Industrial Metal Fabricators',
    location: 'Bhestan Udhna, Surat',
    salary: '₹4.2 LPA',
    category: 'Engineering',
    date: 'June 2026'
  },
  {
    id: 'plc-5',
    candidate: 'Sneha Patel',
    role: 'Senior Data Entry & MIS Executive',
    company: 'Textile Export Enterprise',
    location: 'Ring Road, Surat',
    salary: '₹3.6 LPA',
    category: 'Administration',
    date: 'May 2026'
  },
  {
    id: 'plc-6',
    candidate: 'Vikram Singh',
    role: 'Plant Maintenance Engineer',
    company: 'Heavy Machinery & Elevator Hub',
    location: 'Silvassa Industrial Estate',
    salary: '₹5.5 LPA',
    category: 'Manufacturing',
    date: 'May 2026'
  }
];

export const INITIAL_EMPLOYERS: EmployerPartner[] = [
  {
    id: 'emp-1',
    companyName: 'Premier Industrial Manufacturing Corp',
    industry: 'Manufacturing & Heavy Industrial Operations',
    location: 'Silvassa (Dadra & Nagar Haveli)',
    contactPerson: 'Harish Bhai Mehta',
    phone: '+91 98251 44556',
    email: 'hr@premierindus.com',
    activeOpenings: 3,
    partnershipType: 'Permanent Hiring',
    status: 'Active Partner',
    notes: 'Urgent requirement for Assistant Factory Manager and plant engineers.'
  },
  {
    id: 'emp-2',
    companyName: 'Elevator Components Manufacturing Leader',
    industry: 'Elevator & Heavy Engineering Components',
    location: 'Bhestan Udhna Road, Surat',
    contactPerson: 'Ketan Sheth',
    phone: '+91 94268 77889',
    email: 'careers@suratelevators.in',
    activeOpenings: 5,
    partnershipType: 'Permanent Hiring',
    status: 'Urgent Hiring',
    notes: 'Urgent mandates: Sales Head, QC Executive, AutoCAD Designer, Data Entry.'
  },
  {
    id: 'emp-3',
    companyName: 'Gujarat Polymers & Chemical Industries',
    industry: 'Chemical & Polymers',
    location: 'GIDC Vapi, Gujarat',
    contactPerson: 'Dinesh Shah',
    phone: '+91 98982 33441',
    email: 'talent@gujaratpolymers.com',
    activeOpenings: 2,
    partnershipType: 'Executive Search',
    status: 'Active Partner',
    notes: 'Seeking HR Manager & plant operations head.'
  },
  {
    id: 'emp-4',
    companyName: 'Heavy Engineering & Fabrication Solutions',
    industry: 'Engineering & Heavy Machinery',
    location: 'Hazira GIDC, Surat',
    contactPerson: 'Bhavesh Trivedi',
    phone: '+91 98790 11223',
    email: 'recruitment@haziraeng.com',
    activeOpenings: 4,
    partnershipType: 'Contract Staffing',
    status: 'Active Partner',
    notes: 'Deploying CNC mechanical maintenance engineers and shift technicians.'
  }
];

export const INITIAL_EMPLOYER_INQUIRIES: EmployerInquiry[] = [
  {
    id: 'inq-1',
    companyName: 'Surat Precision Gears Pvt Ltd',
    contactPerson: 'Ramesh Chawla',
    phone: '+91 98250 88991',
    email: 'ramesh@suratprecision.com',
    preferredTime: 'Morning (10:00 AM - 1:00 PM)',
    hiringUrgency: 'Urgent (Within 48 Hours)',
    note: 'Looking for 3 CNC Lathe Operators and 1 Shop-Floor Supervisor.',
    date: '2026-08-02',
    status: 'New',
    type: 'Callback Request'
  },
  {
    id: 'inq-2',
    companyName: 'Vapi Agro Chem Ltd',
    contactPerson: 'Sanjay Desai',
    phone: '+91 94271 55667',
    email: 'sanjay.desai@vapiagro.com',
    preferredTime: 'Afternoon (2:00 PM - 5:00 PM)',
    hiringUrgency: 'Standard (Within 1-2 Weeks)',
    note: 'Submitted JD for QC Chemical Analyst with 4+ years experience.',
    date: '2026-08-01',
    status: 'In Sourcing',
    type: 'Job Description Submission',
    jobDetails: {
      jobTitle: 'QC Chemical Analyst',
      industry: 'Chemical & Agro',
      location: 'GIDC Vapi',
      salaryOffered: '₹35,000 / month',
      experienceRequired: '3-6 Years',
      qualificationNeeded: 'M.Sc Chemistry'
    }
  }
];

export const INITIAL_OFFICES: OfficeContact[] = [
  {
    id: 'off-1',
    branchName: 'Surat Corporate & Engineering Hub',
    city: 'Surat',
    address: 'Bhestan Udhna Road & Ring Road Hub, Surat, Gujarat 395002',
    contactPerson: 'Raajesh V (Principal Consultant)',
    phone: '+91 98243 22206',
    whatsapp: '+919824322206',
    email: 'info@sarthisolutions.com',
    workingHours: 'Monday - Saturday: 8:30 AM – 7:30 PM',
    isHeadOffice: true,
    googleMapsUrl: 'https://maps.google.com/?q=Surat+Gujarat'
  },
  {
    id: 'off-2',
    branchName: 'Silvassa Industrial Plant Liaison Office',
    city: 'Silvassa',
    address: 'Near Industrial Estate, Silvassa, Dadra & Nagar Haveli (UT) 396230',
    contactPerson: 'Raajesh V / Plant Recruitment Desk',
    phone: '+91 98243 22206',
    whatsapp: '+919824322206',
    email: 'silvassa@sarthisolutions.com',
    workingHours: 'Monday - Saturday: 9:00 AM – 7:00 PM',
    isHeadOffice: false,
    googleMapsUrl: 'https://maps.google.com/?q=Silvassa+Dadra+and+Nagar+Haveli'
  },
  {
    id: 'off-3',
    branchName: 'Vapi GIDC Chemical & Industrial Desk',
    city: 'Vapi',
    address: 'GIDC Phase 1, Vapi, Gujarat 396195',
    contactPerson: 'Sarthi Regional Sourcing Desk',
    phone: '+91 98243 22206',
    whatsapp: '+919824322206',
    email: 'vapi@sarthisolutions.com',
    workingHours: 'Monday - Friday: 9:30 AM – 6:30 PM',
    isHeadOffice: false,
    googleMapsUrl: 'https://maps.google.com/?q=Vapi+GIDC+Gujarat'
  }
];

export const INITIAL_CONTACT_MESSAGES: ContactMessage[] = [
  {
    id: 'msg-1',
    name: 'Gaurav Joshi',
    email: 'gaurav.j@gmail.com',
    phone: '+91 98980 12345',
    subject: 'Assistant Factory Manager Vacancy Query',
    userType: 'Candidate',
    message: 'Hello Raajesh Sir, I have 8 years experience in Silvassa plastic extrusion plant. Is the Assistant Factory Manager position still open?',
    date: '2026-08-02',
    status: 'New'
  },
  {
    id: 'msg-2',
    name: 'Nilesh Panchal',
    email: 'nilesh.panchal@apexind.in',
    phone: '+91 94260 98765',
    subject: 'Requirement of 5 CNC Operators',
    userType: 'Employer',
    message: 'We require 5 experienced CNC lathe operators for our Hazira workshop. Please arrange candidate profiles immediately.',
    date: '2026-08-01',
    status: 'In Progress'
  }
];

export const INITIAL_JOB_APPLICATIONS: JobApplication[] = [
  {
    id: 'app-1',
    jobId: 'job-silvassa-001',
    jobTitle: 'Assistant Factory Manager',
    candidateName: 'Rajesh Kumar M.',
    phone: '+91 98765 43210',
    email: 'rajesh.k@gmail.com',
    qualification: 'B.Tech Mechanical + MBA (Operations)',
    experience: '8 Years (Silvassa & Surat Mfg Plants)',
    currentLocation: 'Silvassa / Surat',
    currentCTC: '₹5.5 LPA',
    expectedCTC: '₹6.5 LPA',
    noticePeriod: '15 Days (Immediate)',
    appliedDate: '2026-08-01',
    status: 'Interview Scheduled',
    interviewDate: '2026-08-06 at 11:30 AM',
    notes: 'Strong candidate with CGWA compliance & factory management background.'
  },
  {
    id: 'app-2',
    jobId: 'job-surat-sales-002',
    jobTitle: 'Sales Head - Elevator Component Manufacturing',
    candidateName: 'Mahesh Vyas',
    phone: '+91 98980 54321',
    email: 'mahesh.vyas@yahoo.co.in',
    qualification: 'BE Mechanical + MBA Marketing',
    experience: '7 Years (Elevator & Lift Manufacturing)',
    currentLocation: 'Surat, Gujarat',
    currentCTC: '₹7.0 LPA',
    expectedCTC: '₹8.5 LPA',
    noticePeriod: 'Immediate Joiner',
    appliedDate: '2026-08-02',
    status: 'Pre-Screened',
    notes: 'Mandatory elevator industry sales experience verified.'
  },
  {
    id: 'app-3',
    jobId: 'job-surat-qc-003',
    jobTitle: 'Quality Control (QC) Executive - Elevator Manufacturing',
    candidateName: 'Kavita Patel',
    phone: '+91 94260 88776',
    email: 'kavita.p@gmail.com',
    qualification: 'Diploma Mechanical + QA/QC Certified',
    experience: '3.5 Years (Sheet Metal & Elevator Components)',
    currentLocation: 'Udhna, Surat',
    currentCTC: '₹2.8 LPA',
    expectedCTC: '₹3.4 LPA',
    noticePeriod: 'Immediate',
    appliedDate: '2026-08-01',
    status: 'Shortlisted',
    notes: 'Hands-on vernier caliper, micrometer and height gauge experience.'
  }
];

export const INITIAL_CANDIDATES = [
  {
    id: 'cand-1',
    fullName: 'Rajesh Kumar M.',
    email: 'rajesh.k@gmail.com',
    phone: '+91 98765 43210',
    highestQualification: 'B.Tech Mechanical + MBA Operations',
    qualification: 'B.Tech Mechanical + MBA Operations',
    experienceYears: 8,
    experience: '8 Years',
    currentLocation: 'Silvassa / Surat',
    primarySkill: 'Factory Management & Statutory Compliance',
    additionalSkills: ['PF/ESIC Compliance', 'CGWA Compliance', 'MS Excel', 'Commercial Dispatch', 'Production Planning'],
    currentCompany: 'Western Polymers Ltd',
    currentDesignation: 'Assistant Plant Manager',
    currentSalary: '₹5.5 LPA',
    expectedSalary: '₹6.5 LPA',
    noticePeriod: '15 Days (Immediate)',
    status: 'Interview Scheduled' as const,
    resumeFileName: 'Rajesh_Kumar_Resume_2026.pdf',
    resumeFileType: 'application/pdf',
    resumeFileSize: 245000,
    resumeUploadDate: '2026-08-01',
    resumeUrl: '',
    resumeStoragePath: 'resumes/cand-1_Rajesh_Kumar_Resume_2026.pdf',
    notes: 'Strong candidate with CGWA compliance and factory management background.',
    appliedJobsCount: 2,
    createdAt: '2026-08-01T10:00:00.000Z'
  },
  {
    id: 'cand-2',
    fullName: 'Mahesh Vyas',
    email: 'mahesh.vyas@yahoo.co.in',
    phone: '+91 98980 54321',
    highestQualification: 'BE Mechanical + MBA Marketing',
    qualification: 'BE Mechanical + MBA Marketing',
    experienceYears: 7,
    experience: '7 Years',
    currentLocation: 'Surat, Gujarat',
    primarySkill: 'Elevator Components OEM Sales',
    additionalSkills: ['B2B Sales', 'Client Acquisition', 'Elevator Mechanics', 'Contract Negotiation', 'Team Leadership'],
    currentCompany: 'Apex Elevator Parts',
    currentDesignation: 'Senior Sales Engineer',
    currentSalary: '₹7.0 LPA',
    expectedSalary: '₹8.5 LPA',
    noticePeriod: 'Immediate Joiner',
    status: 'In Screening' as const,
    resumeFileName: 'Mahesh_Vyas_Elevator_Sales_CV.pdf',
    resumeFileType: 'application/pdf',
    resumeFileSize: 198000,
    resumeUploadDate: '2026-08-02',
    resumeUrl: '',
    resumeStoragePath: 'resumes/cand-2_Mahesh_Vyas_Elevator_Sales_CV.pdf',
    notes: 'Mandatory elevator industry sales experience verified.',
    appliedJobsCount: 1,
    createdAt: '2026-08-02T11:30:00.000Z'
  },
  {
    id: 'cand-3',
    fullName: 'Kavita Patel',
    email: 'kavita.p@gmail.com',
    phone: '+91 94260 88776',
    highestQualification: 'Diploma Mechanical Engineering + QA/QC Certified',
    qualification: 'Diploma Mechanical Engineering + QA/QC Certified',
    experienceYears: 3.5,
    experience: '3.5 Years',
    currentLocation: 'Udhna, Surat',
    primarySkill: 'Mechanical Quality Control & Calibration',
    additionalSkills: ['Vernier Caliper', 'Micrometer', 'Height Gauge', 'ISO 9001', 'Sheet Metal Inspection'],
    currentCompany: 'Precision Metalfab',
    currentDesignation: 'QC Inspector',
    currentSalary: '₹2.8 LPA',
    expectedSalary: '₹3.4 LPA',
    noticePeriod: 'Immediate',
    status: 'Shortlisted' as const,
    resumeFileName: 'Kavita_Patel_QC_Mechanical.pdf',
    resumeFileType: 'application/pdf',
    resumeFileSize: 180000,
    resumeUploadDate: '2026-08-01',
    resumeUrl: '',
    resumeStoragePath: 'resumes/cand-3_Kavita_Patel_QC_Mechanical.pdf',
    notes: 'Hands-on vernier caliper, micrometer and height gauge experience.',
    appliedJobsCount: 1,
    createdAt: '2026-08-01T14:15:00.000Z'
  }
];

export const INITIAL_INVOICES = [
  {
    id: 'inv-2026-001',
    invoiceNumber: 'INV-SS-2026-1048',
    invoiceDate: '2026-08-01',
    dueDate: '2026-08-16',
    poNumber: 'PO/IND/2026/894',
    placeOfSupply: '24 - Gujarat',
    clientName: 'Premier Industrial Manufacturing Corp',
    clientCompany: 'Premier Industrial Manufacturing Corp',
    clientGst: '24AABCS1429B1Z8',
    clientGstin: '24AABCS1429B1Z8',
    clientAddress: 'Plot No. 42-45, GIDC Industrial Estate, Silvassa Road, Vapi / Silvassa Border',
    clientContactPerson: 'Head - HR & Talent Acquisition',
    clientPhone: '+91 98240 11223',
    clientEmail: 'accounts@premierindustrial.com',
    billingType: 'Recruitment Consultancy Fee',
    taxMode: 'INTRA_STATE' as const,
    items: [
      {
        id: '1',
        description: 'Permanent Recruitment Fee - Assistant Factory Manager (Silvassa Plant)',
        candidateName: 'Rajesh Kumar M.',
        sacCode: '998512',
        annualCtc: 650000,
        feePercentage: 8.33,
        amount: 54145
      },
      {
        id: '2',
        description: 'Candidate Background Verification & Pre-employment Compliance Screening',
        candidateName: 'Rajesh Kumar M.',
        sacCode: '998512',
        annualCtc: 0,
        feePercentage: 0,
        amount: 3500
      }
    ],
    subtotal: 57645,
    discount: 0,
    taxableAmount: 57645,
    isInterState: false,
    cgstRate: 9,
    cgstAmount: 5188,
    sgstRate: 9,
    sgstAmount: 5188,
    igstRate: 0,
    igstAmount: 0,
    totalGst: 10376,
    grandTotal: 68021,
    totalInWords: 'Rupees Sixty-Eight Thousand Twenty-One Only',
    paymentStatus: 'Pending' as const,
    paymentMethod: 'RTGS / NEFT Transfer',
    transactionRef: '',
    notes: 'Placement fee for Assistant Factory Manager. Replacement warranty of 90 days active.',
    termsAndConditions: '1. Invoices are payable within 15 days from date of receipt.\n2. 90-day free candidate replacement warranty applies as per agreed SLA.\n3. Delayed payments subject to 1.5% interest per month.\n4. Cheques / RTGS payable in favor of "SARTHI SOLUTIONS".',
    pdfStoragePath: 'invoices/INV-SS-2026-1048.pdf',
    pdfUrl: '',
    createdAt: '2026-08-01T15:00:00.000Z'
  }
];

export const INITIAL_WEBSITE_SETTINGS = {
  companyName: 'SARTHI SOLUTIONS',
  proprietor: 'Raajesh V (Principal Recruitment Consultant)',
  tagline: 'Connecting Talent With Opportunity',
  gstin: '24ABCPS1234F1Z5',
  pan: 'ABCPS1234F',
  msme: 'UDYAM-GJ-24-0019284',
  address: 'Shop No. 12, Krishna Complex, Silvassa Road, Vapi / Surat, Gujarat - 396191',
  primaryPhone: '+91 98243 22206',
  whatsappNumber: '+91 98243 22206',
  email: 'sarthisolutions.silvassa@gmail.com',
  bankName: 'HDFC Bank Ltd',
  accountName: 'SARTHI SOLUTIONS',
  accountNumber: '50200088992211',
  ifscCode: 'HDFC0001248',
  branchName: 'GIDC Industrial Estate Branch, Vapi',
  termsConditions: '1. Candidates are verified against employer job description before dispatch.\n2. Replacement SLA valid for 90 days from date of candidate joining.\n3. Confidentiality of business operations maintained strictly.'
};

