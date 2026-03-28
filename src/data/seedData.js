/**
 * data/seedData.js
 * Demo employee records loaded when localStorage is empty.
 * Covers all 6 departments and all 3 roles.
 * Passwords are shown here for demo only — in production these would be hashed.
 */

export const SEED_USERS = [
  // ── Super Admin ──────────────────────────────────────────────
  {
    id: 'EMP-0001', role: 'super_admin', status: 'active',
    name: 'Anjali Sharma',    email: 'anjali.sharma@company.com',
    phone: '+91 98765 43210', password: 'Admin@123',
    dept: 'Human Resources',  designation: 'HR Director',
    joined: '2019-03-01',     reportingTo: null,
  },

  // ── Admins ───────────────────────────────────────────────────
  {
    id: 'EMP-0002', role: 'admin', status: 'active',
    name: 'Ravi Kumar',       email: 'ravi.kumar@company.com',
    phone: '+91 98765 43211', password: 'Admin@123',
    dept: 'Software Development', designation: 'Engineering Manager',
    joined: '2020-06-15',     reportingTo: 'EMP-0001',
  },
  {
    id: 'EMP-0003', role: 'admin', status: 'active',
    name: 'Pooja Nair',       email: 'pooja.nair@company.com',
    phone: '+91 98765 43212', password: 'Admin@123',
    dept: 'Sales & Service',  designation: 'Sales Manager',
    joined: '2021-01-10',     reportingTo: 'EMP-0001',
  },

  // ── Software Development ─────────────────────────────────────
  {
    id: 'EMP-0004', role: 'employee', status: 'active',
    name: 'Karan Mehta',      email: 'karan.mehta@company.com',
    phone: '+91 98765 43213', password: 'Emp@1234',
    dept: 'Software Development', designation: 'Senior Engineer',
    joined: '2021-03-20',     reportingTo: 'EMP-0002',
  },
  {
    id: 'EMP-0005', role: 'employee', status: 'active',
    name: 'Sneha Reddy',      email: 'sneha.reddy@company.com',
    phone: '+91 98765 43214', password: 'Emp@1234',
    dept: 'Software Development', designation: 'QA Engineer',
    joined: '2022-07-01',     reportingTo: 'EMP-0002',
  },

  // ── IT Infrastructure ────────────────────────────────────────
  {
    id: 'EMP-0006', role: 'employee', status: 'active',
    name: 'Deepak Verma',     email: 'deepak.verma@company.com',
    phone: '+91 98765 43215', password: 'Emp@1234',
    dept: 'IT Infrastructure', designation: 'Senior Network Engineer',
    joined: '2020-09-10',     reportingTo: 'EMP-0001',
  },

  // ── BPO / KPO ────────────────────────────────────────────────
  {
    id: 'EMP-0007', role: 'employee', status: 'active',
    name: 'Sunita Pillai',    email: 'sunita.pillai@company.com',
    phone: '+91 98765 43216', password: 'Emp@1234',
    dept: 'BPO / KPO',        designation: 'Team Lead – Chat',
    joined: '2021-09-05',     reportingTo: 'EMP-0003',
  },
  {
    id: 'EMP-0008', role: 'employee', status: 'active',
    name: 'Mohammed Irfan',   email: 'irfan.m@company.com',
    phone: '+91 98765 43217', password: 'Emp@1234',
    dept: 'BPO / KPO',        designation: 'Agent – Voice',
    joined: '2023-01-15',     reportingTo: 'EMP-0007',
  },

  // ── Sales & Service ──────────────────────────────────────────
  {
    id: 'EMP-0009', role: 'employee', status: 'active',
    name: 'Priya Desai',      email: 'priya.desai@company.com',
    phone: '+91 98765 43218', password: 'Emp@1234',
    dept: 'Sales & Service',  designation: 'Sales Executive',
    joined: '2022-02-01',     reportingTo: 'EMP-0003',
  },

  // ── Administration ───────────────────────────────────────────
  {
    id: 'EMP-0010', role: 'employee', status: 'inactive',
    name: 'Arjun Singh',      email: 'arjun.singh@company.com',
    phone: '+91 98765 43219', password: 'Emp@1234',
    dept: 'Administration',   designation: 'Receptionist',
    joined: '2023-02-12',     reportingTo: 'EMP-0001',
  },

  // ── Human Resources ──────────────────────────────────────────
  {
    id: 'EMP-0011', role: 'employee', status: 'active',
    name: 'Lakshmi Iyer',     email: 'lakshmi.iyer@company.com',
    phone: '+91 98765 43220', password: 'Emp@1234',
    dept: 'Human Resources',  designation: 'Recruiter',
    joined: '2022-11-01',     reportingTo: 'EMP-0001',
  },
];

/** Counter to set after seeding (next ID will be EMP-0012) */
export const SEED_ID_COUNTER = SEED_USERS.length + 1;
