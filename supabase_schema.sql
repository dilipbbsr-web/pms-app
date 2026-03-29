-- ============================================================
-- PerfManager Pro — Supabase Database Schema
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── 1. Users (Employees) ─────────────────────────────────────
create table if not exists public.users (
  id           text primary key,          -- EMP-0001 format
  name         text not null,
  email        text unique not null,
  phone        text,
  dept         text,
  designation  text,
  role         text default 'employee',   -- super_admin | admin | employee
  status       text default 'active',     -- active | inactive
  joined       text,
  reporting_to text,
  password     text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ── 2. Goals ─────────────────────────────────────────────────
create table if not exists public.goals (
  id            text primary key,
  employee_id   text references public.users(id) on delete cascade,
  title         text not null,
  description   text,
  category      text,
  priority      text default 'medium',
  status        text default 'draft',
  weight        numeric default 10,
  metric_type   text,
  target_value  text,
  current_value text default '0',
  kra_link      text,
  kpi_link      text,
  tags          text,
  dept          text,
  designation   text,
  start_date    text,
  target_date   text,
  progress      numeric default 0,
  approved_comment  text,
  rejected_comment  text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── 3. KPIs ──────────────────────────────────────────────────
create table if not exists public.kpis (
  id            text primary key,
  employee_id   text references public.users(id) on delete cascade,
  kpi_name      text not null,
  kra_link      text,
  period        text,
  quarter       text,
  year          text,
  weight        numeric default 10,
  target_value  text,
  actual_value  text,
  metric_unit   text default '%',
  achievement   numeric default 0,
  rating        numeric default 0,
  notes         text,
  dept          text,
  designation   text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── 4. Tasks ─────────────────────────────────────────────────
create table if not exists public.tasks (
  id              text primary key,
  title           text not null,
  description     text,
  assignee_id     text references public.users(id) on delete cascade,
  assigned_by     text references public.users(id),
  task_type       text,
  priority        text default 'medium',
  status          text default 'todo',   -- todo | in-progress | completed
  progress        numeric default 0,
  due_date        text,
  estimated_hours text,
  linked_goal     text,
  linked_kpi      text,
  tags            text,
  dept            text,
  designation     text,
  rating          numeric,
  eval_comment    text,
  evaluated_by    text,
  evaluated_at    timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 5. Appraisals ────────────────────────────────────────────
create table if not exists public.appraisals (
  id             text primary key,
  employee_id    text references public.users(id) on delete cascade,
  conducted_by   text references public.users(id),
  period         text,
  scores         jsonb default '{}',     -- { accuracy: 4, output: 3, ... }
  overall_score  numeric default 0,
  summary        text,
  strengths      text,
  improvement    text,
  goals_next     text,
  dept           text,
  designation    text,
  status         text default 'submitted',
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ── 6. Approvals (Log) ───────────────────────────────────────
create table if not exists public.approvals (
  id           text primary key,
  item_id      text not null,
  item_type    text not null,             -- Goal | Appraisal | KPI | Task
  employee_id  text references public.users(id) on delete cascade,
  reviewed_by  text references public.users(id),
  action       text not null,             -- approved | rejected
  level        text not null,             -- L1 | L2 | L3
  comment      text,
  reviewed_at  timestamptz default now()
);

-- ── 7. Notifications ─────────────────────────────────────────
create table if not exists public.notifications (
  id          text primary key,
  user_id     text references public.users(id) on delete cascade,
  type        text,
  title       text,
  message     text,
  read        boolean default false,
  priority    text default 'medium',
  created_at  timestamptz default now()
);

-- ============================================================
-- Row Level Security (RLS) — enable for all tables
-- ============================================================
alter table public.users        enable row level security;
alter table public.goals        enable row level security;
alter table public.kpis         enable row level security;
alter table public.tasks        enable row level security;
alter table public.appraisals   enable row level security;
alter table public.approvals    enable row level security;
alter table public.notifications enable row level security;

-- ── Allow all operations for now (app handles auth) ──────────
-- Users
create policy "Allow all users" on public.users for all using (true) with check (true);
-- Goals
create policy "Allow all goals" on public.goals for all using (true) with check (true);
-- KPIs
create policy "Allow all kpis" on public.kpis for all using (true) with check (true);
-- Tasks
create policy "Allow all tasks" on public.tasks for all using (true) with check (true);
-- Appraisals
create policy "Allow all appraisals" on public.appraisals for all using (true) with check (true);
-- Approvals
create policy "Allow all approvals" on public.approvals for all using (true) with check (true);
-- Notifications
create policy "Allow all notifications" on public.notifications for all using (true) with check (true);

-- ============================================================
-- Seed demo data (11 employees)
-- ============================================================
insert into public.users (id, name, email, phone, dept, designation, role, status, joined, reporting_to, password) values
('EMP-0001','Anjali Sharma',  'anjali.sharma@company.com', '+91 98765 43210','Human Resources',    'HR Director',            'super_admin','active','2019-03-01',null,       'Admin@123'),
('EMP-0002','Ravi Kumar',     'ravi.kumar@company.com',    '+91 98765 43211','Software Development','Engineering Manager',    'admin',     'active','2020-06-15','EMP-0001', 'Admin@123'),
('EMP-0003','Pooja Nair',     'pooja.nair@company.com',    '+91 98765 43212','Sales & Service',    'Sales Manager',          'admin',     'active','2021-01-10','EMP-0001', 'Admin@123'),
('EMP-0004','Karan Mehta',    'karan.mehta@company.com',   '+91 98765 43213','Software Development','Senior Engineer',        'employee',  'active','2021-03-20','EMP-0002', 'Emp@1234'),
('EMP-0005','Sneha Reddy',    'sneha.reddy@company.com',   '+91 98765 43214','Software Development','QA Engineer',            'employee',  'active','2022-07-01','EMP-0002', 'Emp@1234'),
('EMP-0006','Deepak Verma',   'deepak.verma@company.com',  '+91 98765 43215','IT Infrastructure',  'Senior Network Engineer','employee',  'active','2020-09-10','EMP-0001', 'Emp@1234'),
('EMP-0007','Sunita Pillai',  'sunita.pillai@company.com', '+91 98765 43216','BPO / KPO',          'Team Lead – Chat',       'employee',  'active','2021-09-05','EMP-0003', 'Emp@1234'),
('EMP-0008','Mohammed Irfan', 'irfan.m@company.com',       '+91 98765 43217','BPO / KPO',          'Agent – Voice',          'employee',  'active','2023-01-15','EMP-0007', 'Emp@1234'),
('EMP-0009','Priya Desai',    'priya.desai@company.com',   '+91 98765 43218','Sales & Service',    'Sales Executive',        'employee',  'active','2022-02-01','EMP-0003', 'Emp@1234'),
('EMP-0010','Arjun Singh',    'arjun.singh@company.com',   '+91 98765 43219','Administration',     'Receptionist',           'employee',  'inactive','2023-02-12','EMP-0001','Emp@1234'),
('EMP-0011','Lakshmi Iyer',   'lakshmi.iyer@company.com',  '+91 98765 43220','Human Resources',    'Recruiter',              'employee',  'active','2022-11-01','EMP-0001', 'Emp@1234')
on conflict (id) do nothing;
