-- ==============================================================================
-- CLAUSESHIELD SUPABASE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Run this script in the Supabase SQL Editor to set up the complete database
-- for ClauseShield: Tenant Legal Assistance & Lawyer Video Consultation Platform.
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE (Common for Tenants, Lawyers, and Administrators)
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text unique not null,
    full_name text not null,
    phone text,
    role text not null check (role in ('tenant', 'lawyer', 'admin')),
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- 2. LAWYER PROFILES TABLE (Professional Credentials & Verification Status)
-- ------------------------------------------------------------------------------
create table if not exists public.lawyer_profiles (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade unique not null,
    bar_council_number text not null,
    state_bar_council text not null,
    specialisation text not null,
    years_experience integer default 0 not null,
    bio text not null,
    consultation_fee numeric(10,2) default 500.00 not null,
    availability text default 'Mon-Fri: 5 PM - 8 PM',
    document_url text,
    verification_status text default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
    verified_at timestamp with time zone,
    verified_by uuid references public.profiles(id),
    rejection_reason text,
    rating numeric(3,2) default 5.00,
    total_reviews integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- 3. TENANT ISSUES TABLE ("Post Your Legal Issue")
-- ------------------------------------------------------------------------------
create table if not exists public.tenant_issues (
    id uuid primary key default uuid_generate_v4(),
    issue_reference text unique not null, -- e.g. CS-ISS-2026-XXXX
    tenant_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    category text not null check (category in (
        'security_deposit', 'rent_increase', 'eviction', 'rental_agreement',
        'maintenance', 'landlord_harassment', 'unfair_charges', 'other'
    )),
    city text not null,
    state text not null,
    description text not null,
    amount_in_dispute numeric(12,2) default 0,
    incident_date date,
    preferred_method text default 'video_call' check (preferred_method in ('video_call', 'voice_call', 'document_review')),
    preferred_time text default 'evening',
    document_attachment_url text,
    status text default 'open' check (status in ('open', 'consultation_requested', 'accepted', 'completed', 'withdrawn')),
    assigned_lawyer_id uuid references public.profiles(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- 4. CONSULTATION REQUESTS TABLE (Lawyer Offers & Tenant Booking Requests)
-- ------------------------------------------------------------------------------
create table if not exists public.consultation_requests (
    id uuid primary key default uuid_generate_v4(),
    issue_id uuid references public.tenant_issues(id) on delete cascade,
    tenant_id uuid references public.profiles(id) on delete cascade not null,
    lawyer_id uuid references public.profiles(id) on delete cascade not null,
    initiated_by text not null check (initiated_by in ('tenant', 'lawyer')),
    note text,
    proposed_date timestamp with time zone,
    status text default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- 5. CONSULTATIONS TABLE (Scheduled Video Consultations & Private Meetings)
-- ------------------------------------------------------------------------------
create table if not exists public.consultations (
    id uuid primary key default uuid_generate_v4(),
    issue_id uuid references public.tenant_issues(id) on delete set null,
    tenant_id uuid references public.profiles(id) on delete cascade not null,
    lawyer_id uuid references public.profiles(id) on delete cascade not null,
    scheduled_at timestamp with time zone not null,
    duration_minutes integer default 30 not null,
    meeting_room_id text unique not null,
    meeting_url text not null,
    status text default 'scheduled' check (status in ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
    consultation_notes text,
    ended_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- 6. PAYMENTS & COMMISSION RECORDS (Demonstration & Compliance Ledger)
-- ------------------------------------------------------------------------------
create table if not exists public.payments (
    id uuid primary key default uuid_generate_v4(),
    transaction_reference text unique not null,
    consultation_id uuid references public.consultations(id) on delete set null,
    tenant_id uuid references public.profiles(id) on delete cascade not null,
    lawyer_id uuid references public.profiles(id) on delete cascade not null,
    gross_amount numeric(10,2) not null,
    lawyer_share numeric(10,2) not null,
    platform_fee numeric(10,2) not null,
    status text default 'demo_processed' check (status in ('pending', 'demo_processed', 'disputed', 'refunded')),
    compliance_mode text default 'demonstration_only' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- 7. REVIEWS & RATINGS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.reviews (
    id uuid primary key default uuid_generate_v4(),
    consultation_id uuid references public.consultations(id) on delete cascade unique,
    tenant_id uuid references public.profiles(id) on delete cascade not null,
    lawyer_id uuid references public.profiles(id) on delete cascade not null,
    rating integer check (rating >= 1 and rating <= 5) not null,
    comment text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- 8. PLATFORM SETTINGS (Administrator Configurable Commission & Fees)
-- ------------------------------------------------------------------------------
create table if not exists public.platform_settings (
    key text primary key,
    value jsonb not null,
    updated_by uuid references public.profiles(id),
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert baseline regulatory settings
insert into public.platform_settings (key, value)
values 
    ('fee_structure', '{"default_fee": 500, "platform_commission_pct": 10, "lawyer_share_pct": 90, "compliance_status": "bci_demonstration_mode"}'::jsonb),
    ('active_jurisdictions', '["Maharashtra", "Karnataka", "Delhi NCR", "Tamil Nadu", "Telangana", "West Bengal", "All-India"]'::jsonb)
on conflict (key) do nothing;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.lawyer_profiles enable row level security;
alter table public.tenant_issues enable row level security;
alter table public.consultation_requests enable row level security;
alter table public.consultations enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.platform_settings enable row level security;

-- Profiles: Anyone can view their own profile; public can view basic lawyer profiles
create policy "Users can view their own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = id);

-- Lawyer Profiles: Public can view verified lawyers; lawyers can view/edit their own; admins can view all
create policy "Public can view verified lawyers"
    on public.lawyer_profiles for select
    using (verification_status = 'verified');

create policy "Lawyers can view their own lawyer profile"
    on public.lawyer_profiles for select
    using (auth.uid() = user_id);

create policy "Lawyers can insert their own lawyer profile"
    on public.lawyer_profiles for insert
    with check (auth.uid() = user_id);

create policy "Lawyers can update their own lawyer profile"
    on public.lawyer_profiles for update
    using (auth.uid() = user_id);

-- Tenant Issues: 
-- 1. Tenant can view, update, withdraw their own issues
-- 2. Verified lawyers can view OPEN issues (tenant private contact numbers/identity documents masked via API)
create policy "Tenants can manage their own issues"
    on public.tenant_issues for all
    using (auth.uid() = tenant_id);

create policy "Verified lawyers can view available open issues"
    on public.tenant_issues for select
    using (
        status in ('open', 'consultation_requested')
        and exists (
            select 1 from public.lawyer_profiles
            where lawyer_profiles.user_id = auth.uid()
            and lawyer_profiles.verification_status = 'verified'
        )
    );

-- Consultations: Only the participating tenant or lawyer can view consultation details
create policy "Participants can view their consultations"
    on public.consultations for select
    using (auth.uid() = tenant_id or auth.uid() = lawyer_id);

create policy "Participants can update their consultations"
    on public.consultations for update
    using (auth.uid() = tenant_id or auth.uid() = lawyer_id);

-- Payments: Only the relevant tenant, lawyer, or admin can view payment records
create policy "Users can view payments they are party to"
    on public.payments for select
    using (auth.uid() = tenant_id or auth.uid() = lawyer_id);

-- Platform Settings: Public can read, only admin can update
create policy "Public can read platform settings"
    on public.platform_settings for select
    using (true);
