/**
 * departments.js
 * Complete department catalogue with:
 *  — Designations per dept
 *  — Hierarchy levels (L1 = senior, higher L = junior)
 *  — KPI categories per dept
 *  — Default KRAs per designation
 *
 * Used by: UserManagement, DeptHierarchy, GoalSetting, KPI/KRA, TaskEval, Reports
 */

// ─── Department list ──────────────────────────────────────────────
export const DEPARTMENTS = [
  'Human Resources',
  'Software Development',
  'Sales & Service',
  'IT Infrastructure',
  'BPO / KPO',
  'Administration',
];

// ─── Designations + hierarchy level per department ───────────────
// level: 1 = highest (Director/VP), higher number = junior
export const DEPT_HIERARCHY = {
  'Human Resources': [
    { title: 'HR Director',         level: 1, category: 'Leadership' },
    { title: 'HR Manager',          level: 2, category: 'Management' },
    { title: 'HR Business Partner', level: 3, category: 'Senior'     },
    { title: 'Recruiter',           level: 3, category: 'Senior'     },
    { title: 'HR Executive',        level: 4, category: 'Executive'  },
    { title: 'HR Assistant',        level: 5, category: 'Junior'     },
  ],

  'Software Development': [
    { title: 'VP Engineering',      level: 1, category: 'Leadership' },
    { title: 'Engineering Manager', level: 2, category: 'Management' },
    { title: 'Tech Lead',           level: 3, category: 'Senior'     },
    { title: 'Senior Engineer',     level: 3, category: 'Senior'     },
    { title: 'Engineer',            level: 4, category: 'Mid'        },
    { title: 'Junior Engineer',     level: 5, category: 'Junior'     },
    { title: 'QA Lead',             level: 3, category: 'Senior'     },
    { title: 'QA Engineer',         level: 4, category: 'Mid'        },
    { title: 'DevOps Engineer',     level: 3, category: 'Senior'     },
    { title: 'Intern',              level: 6, category: 'Intern'     },
  ],

  'Sales & Service': [
    { title: 'VP Sales',                    level: 1, category: 'Leadership' },
    { title: 'Sales Manager',               level: 2, category: 'Management' },
    { title: 'Regional Sales Manager',      level: 2, category: 'Management' },
    { title: 'Senior Sales Executive',      level: 3, category: 'Senior'     },
    { title: 'Sales Executive',             level: 4, category: 'Executive'  },
    { title: 'Customer Success Manager',    level: 3, category: 'Senior'     },
    { title: 'Support Lead',                level: 3, category: 'Senior'     },
    { title: 'Support Executive',           level: 4, category: 'Executive'  },
    { title: 'Field Agent',                 level: 5, category: 'Junior'     },
  ],

  'IT Infrastructure': [
    { title: 'IT Director',               level: 1, category: 'Leadership' },
    { title: 'Infrastructure Manager',    level: 2, category: 'Management' },
    { title: 'Network Architect',         level: 2, category: 'Management' },
    { title: 'Senior Network Engineer',   level: 3, category: 'Senior'     },
    { title: 'Network Engineer',          level: 4, category: 'Mid'        },
    { title: 'System Administrator',      level: 4, category: 'Mid'        },
    { title: 'Security Engineer',         level: 3, category: 'Senior'     },
    { title: 'IT Support Lead',           level: 3, category: 'Senior'     },
    { title: 'IT Support Executive',      level: 4, category: 'Executive'  },
    { title: 'Helpdesk Technician',       level: 5, category: 'Junior'     },
  ],

  'BPO / KPO': [
    { title: 'Operations Director',       level: 1, category: 'Leadership' },
    { title: 'Operations Manager',        level: 2, category: 'Management' },
    { title: 'Team Lead – Chat',          level: 3, category: 'Senior'     },
    { title: 'Team Lead – Voice',         level: 3, category: 'Senior'     },
    { title: 'Team Lead – Email',         level: 3, category: 'Senior'     },
    { title: 'Senior Agent',              level: 4, category: 'Mid'        },
    { title: 'Agent – Chat',              level: 5, category: 'Junior'     },
    { title: 'Agent – Voice',             level: 5, category: 'Junior'     },
    { title: 'Agent – Email',             level: 5, category: 'Junior'     },
    { title: 'Quality Analyst',           level: 4, category: 'Mid'        },
    { title: 'Trainer',                   level: 3, category: 'Senior'     },
  ],

  'Administration': [
    { title: 'GM Administration',        level: 1, category: 'Leadership' },
    { title: 'Administration Manager',   level: 2, category: 'Management' },
    { title: 'Reception Manager',        level: 3, category: 'Senior'     },
    { title: 'Senior Receptionist',      level: 4, category: 'Mid'        },
    { title: 'Receptionist',             level: 5, category: 'Junior'     },
    { title: 'FMS Manager',              level: 3, category: 'Senior'     },
    { title: 'Facility Executive',       level: 4, category: 'Mid'        },
    { title: 'Office Assistant',         level: 5, category: 'Junior'     },
    { title: 'Security Supervisor',      level: 4, category: 'Mid'        },
  ],
};

// ─── Helper: flat designation list per dept (for dropdowns) ──────
export const DESIGNATIONS_BY_DEPT = Object.fromEntries(
  Object.entries(DEPT_HIERARCHY).map(([dept, items]) => [
    dept,
    items.map(i => i.title),
  ])
);

// ─── Approval chain: designation at L1/L2/L3 per dept ────────────
// L1 = direct reporting manager, L2 = HOD/senior, L3 = HR / Super Admin
export const APPROVAL_CHAIN = {
  'Human Resources':      { L1: 'HR Manager',          L2: 'HR Director',        L3: 'Super Admin' },
  'Software Development': { L1: 'Tech Lead',            L2: 'Engineering Manager', L3: 'VP Engineering' },
  'Sales & Service':      { L1: 'Sales Manager',        L2: 'Regional Sales Manager', L3: 'VP Sales' },
  'IT Infrastructure':    { L1: 'IT Support Lead',      L2: 'Infrastructure Manager', L3: 'IT Director' },
  'BPO / KPO':            { L1: 'Team Lead – Chat',     L2: 'Operations Manager', L3: 'Operations Director' },
  'Administration':       { L1: 'Reception Manager',    L2: 'Administration Manager', L3: 'GM Administration' },
};

// ─── KPI Categories per department ───────────────────────────────
export const KPI_CATEGORIES = {
  'Human Resources': [
    'Recruitment Turnaround Time',
    'Employee Retention Rate',
    'Training Completion Rate',
    'HR Policy Compliance',
    'Employee Satisfaction Score',
    'Onboarding Effectiveness',
  ],
  'Software Development': [
    'Sprint Velocity',
    'Code Quality (Bug Rate)',
    'On-time Delivery',
    'Code Review Participation',
    'Test Coverage %',
    'Incident Response Time',
    'Documentation Score',
  ],
  'Sales & Service': [
    'Revenue vs Target',
    'Lead Conversion Rate',
    'Customer Satisfaction (CSAT)',
    'Average Deal Size',
    'Pipeline Value',
    'Ticket Resolution Time',
    'First Call Resolution Rate',
  ],
  'IT Infrastructure': [
    'System Uptime %',
    'Mean Time to Resolve (MTTR)',
    'Ticket SLA Compliance',
    'Security Incident Count',
    'Patch Compliance %',
    'Change Success Rate',
  ],
  'BPO / KPO': [
    'Average Handle Time (AHT)',
    'Customer Satisfaction (CSAT)',
    'First Call Resolution (FCR)',
    'Quality Score',
    'Attendance & Punctuality',
    'Shrinkage Rate',
    'Upsell / Cross-sell Rate',
  ],
  'Administration': [
    'Facility Maintenance Score',
    'Visitor Handling Efficiency',
    'Vendor SLA Compliance',
    'Cost Savings %',
    'Asset Management Score',
    'Response Time to Requests',
  ],
};

// ─── Default KRAs per designation ────────────────────────────────
export const DEFAULT_KRAS = {
  // Human Resources
  'HR Director':         ['Strategic HR Planning', 'Policy Governance', 'Executive Hiring', 'Culture & Engagement'],
  'HR Manager':          ['Talent Acquisition', 'Performance Management', 'L&D Oversight', 'Compliance'],
  'HR Business Partner': ['Business Alignment', 'Employee Relations', 'Change Management'],
  'Recruiter':           ['Sourcing & Screening', 'Interview Coordination', 'Offer Management'],
  'HR Executive':        ['On-boarding', 'Payroll Support', 'Employee Records'],
  'HR Assistant':        ['Admin Support', 'Data Entry', 'Documentation'],

  // Software Development
  'VP Engineering':      ['Engineering Strategy', 'Budget Planning', 'Team Scaling', 'Architecture'],
  'Engineering Manager': ['Sprint Planning', 'Team Performance', 'Technical Roadmap', 'Stakeholder Mgmt'],
  'Tech Lead':           ['Technical Design', 'Code Review', 'Mentoring', 'Sprint Execution'],
  'Senior Engineer':     ['Feature Development', 'Code Quality', 'Documentation', 'Mentoring Juniors'],
  'Engineer':            ['Feature Development', 'Bug Fixes', 'Unit Testing', 'Code Reviews'],
  'Junior Engineer':     ['Task Completion', 'Learning & Development', 'Bug Fixes'],
  'QA Lead':             ['Test Strategy', 'QA Automation', 'Team Leadership'],
  'QA Engineer':         ['Test Case Writing', 'Manual Testing', 'Defect Tracking'],
  'DevOps Engineer':     ['CI/CD Pipeline', 'Infrastructure', 'Monitoring & Alerting'],

  // Sales & Service
  'VP Sales':            ['Revenue Strategy', 'Market Expansion', 'Team Leadership'],
  'Sales Manager':       ['Team Target Achievement', 'Pipeline Management', 'Client Relationships'],
  'Sales Executive':     ['Lead Generation', 'Client Meetings', 'Quota Achievement'],
  'Support Lead':        ['Team SLA Management', 'Escalation Handling', 'Quality Assurance'],
  'Support Executive':   ['Ticket Resolution', 'Customer Communication', 'CSAT'],

  // IT Infrastructure
  'IT Director':         ['IT Strategy', 'Budget', 'Vendor Management', 'Security Policy'],
  'Infrastructure Manager': ['Capacity Planning', 'SLA Management', 'Team Leadership'],
  'Senior Network Engineer': ['Network Design', 'Troubleshooting', 'Documentation'],
  'Network Engineer':    ['Configuration', 'Monitoring', 'Incident Response'],
  'System Administrator':['Server Management', 'Backup & Recovery', 'Patch Management'],
  'Helpdesk Technician': ['Ticket Resolution', 'User Support', 'Asset Tracking'],

  // BPO / KPO
  'Operations Director': ['P&L Ownership', 'Client Management', 'Capacity Planning'],
  'Operations Manager':  ['Floor Management', 'KPI Achievement', 'Roster Management'],
  'Team Lead – Chat':    ['Team AHT', 'Quality Scores', 'Coaching'],
  'Team Lead – Voice':   ['Team AHT', 'FCR Rate', 'Coaching'],
  'Team Lead – Email':   ['Response Time', 'Quality Score', 'Coaching'],
  'Agent – Chat':        ['Handle Time', 'CSAT', 'Accuracy'],
  'Agent – Voice':       ['FCR', 'CSAT', 'Adherence'],
  'Agent – Email':       ['Response Time', 'Resolution Rate', 'Quality'],
  'Quality Analyst':     ['Audit Score', 'Calibration', 'Feedback Delivery'],

  // Administration
  'GM Administration':   ['Operational Efficiency', 'Cost Control', 'Vendor Strategy'],
  'Administration Manager': ['Facility Management', 'Team Oversight', 'Vendor SLAs'],
  'Reception Manager':   ['Front Desk Operations', 'Visitor Experience', 'Staff Management'],
  'Receptionist':        ['Visitor Handling', 'Call Management', 'Record Keeping'],
  'FMS Manager':         ['Facility Maintenance', 'Housekeeping', 'Safety Compliance'],
  'Facility Executive':  ['Daily Maintenance', 'Asset Tracking', 'Vendor Coordination'],
};
