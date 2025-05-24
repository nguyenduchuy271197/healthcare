-- Healthcare Appointment Booking Application - Initial Schema
-- Description: Creates complete database schema for healthcare appointment system
-- Tables: users, user_profiles, patients, doctors, appointments, medical_records, prescriptions, payments, reviews, notifications
-- Features: RLS policies, JWT role handling, user registration triggers, file storage

-- ============================================================================
-- CUSTOM TYPES AND ENUMS
-- ============================================================================

create type user_role as enum ('patient', 'doctor');
create type appointment_status as enum ('pending', 'confirmed', 'completed', 'cancelled', 'rejected');
create type payment_status as enum ('pending', 'completed', 'failed', 'refunded');
create type payment_method as enum ('credit_card', 'bank_transfer', 'wallet', 'cash');
create type notification_type as enum ('appointment_reminder', 'appointment_confirmed', 'appointment_cancelled', 'payment_success', 'new_prescription', 'follow_up_required');
create type prescription_status as enum ('active', 'completed', 'cancelled');

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Bucket for user profile images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-images',
  'profile-images',
  true,
  5242880, -- 5MB limit
  array['image/jpeg', 'image/png', 'image/webp']
);

-- Bucket for medical documents (private)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'medical-documents',
  'medical-documents',
  false,
  10485760, -- 10MB limit
  array['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Bucket for prescriptions and invoices (private)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'prescriptions',
  'prescriptions',
  false,
  5242880, -- 5MB limit
  array['application/pdf', 'image/jpeg', 'image/png']
);

-- ============================================================================
-- MAIN TABLES
-- ============================================================================

-- User profiles table (extends auth.users)
create table user_profiles (
  id uuid references auth.users (id) on delete cascade primary key,
  role user_role not null,
  full_name text not null,
  phone text,
  address text,
  date_of_birth date,
  gender text,
  avatar_url text,
  is_verified boolean default false,
  email_notifications boolean default true,
  sms_notifications boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
comment on table user_profiles is 'Extended user profile information for both patients and doctors';

-- Patient specific information
create table patients (
  id uuid references user_profiles (id) on delete cascade primary key,
  emergency_contact_name text,
  emergency_contact_phone text,
  blood_type text,
  allergies text[],
  chronic_conditions text[],
  insurance_number text,
  insurance_provider text,
  medical_history text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
comment on table patients is 'Medical information specific to patients';

-- Doctor specific information
create table doctors (
  id uuid references user_profiles (id) on delete cascade primary key,
  license_number text unique,
  specialization text,
  qualification text,
  experience_years integer default 0,
  consultation_fee decimal(10,2) default 100.00,
  bio text,
  clinic_address text,
  is_available boolean default true,
  average_rating decimal(3,2) default 0,
  total_reviews integer default 0,
  verified_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
comment on table doctors is 'Professional information specific to doctors';

-- Doctor availability schedule
create table doctor_schedules (
  id bigint generated always as identity primary key,
  doctor_id uuid references doctors (id) on delete cascade not null,
  day_of_week integer not null check (day_of_week between 0 and 6), -- 0=Sunday, 6=Saturday
  start_time time not null,
  end_time time not null,
  slot_duration_minutes integer default 30,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(doctor_id, day_of_week, start_time)
);
comment on table doctor_schedules is 'Weekly schedule configuration for doctors';

-- Appointments
create table appointments (
  id bigint generated always as identity primary key,
  patient_id uuid references patients (id) on delete cascade not null,
  doctor_id uuid references doctors (id) on delete cascade not null,
  appointment_date date not null,
  appointment_time time not null,
  duration_minutes integer default 30,
  status appointment_status default 'pending',
  reason text not null,
  notes text,
  consultation_fee decimal(10,2) not null,
  reminder_sent boolean default false,
  confirmed_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
comment on table appointments is 'Patient appointments with doctors';

-- Medical records
create table medical_records (
  id bigint generated always as identity primary key,
  appointment_id bigint references appointments (id) on delete cascade not null,
  patient_id uuid references patients (id) on delete cascade not null,
  doctor_id uuid references doctors (id) on delete cascade not null,
  diagnosis text not null,
  symptoms text,
  treatment_plan text,
  follow_up_required boolean default false,
  follow_up_date date,
  notes text,
  attachments text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
comment on table medical_records is 'Medical examination records and diagnoses';

-- Prescriptions
create table prescriptions (
  id bigint generated always as identity primary key,
  medical_record_id bigint references medical_records (id) on delete cascade not null,
  patient_id uuid references patients (id) on delete cascade not null,
  doctor_id uuid references doctors (id) on delete cascade not null,
  status prescription_status default 'active',
  total_amount decimal(10,2),
  instructions text,
  valid_until date,
  dispensed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
comment on table prescriptions is 'Electronic prescriptions from doctors';

-- Prescription items
create table prescription_items (
  id bigint generated always as identity primary key,
  prescription_id bigint references prescriptions (id) on delete cascade not null,
  medication_name text not null,
  dosage text not null,
  frequency text not null,
  duration text not null,
  quantity integer not null,
  unit_price decimal(10,2),
  instructions text,
  created_at timestamptz default now()
);
comment on table prescription_items is 'Individual medications in a prescription';

-- Payments
create table payments (
  id bigint generated always as identity primary key,
  appointment_id bigint references appointments (id) on delete cascade not null,
  patient_id uuid references patients (id) on delete cascade not null,
  doctor_id uuid references doctors (id) on delete cascade not null,
  amount decimal(10,2) not null,
  payment_method payment_method not null,
  status payment_status default 'pending',
  transaction_id text,
  payment_gateway text,
  paid_at timestamptz,
  refunded_at timestamptz,
  refund_reason text,
  invoice_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
comment on table payments is 'Payment records for appointments';

-- Reviews and ratings
create table reviews (
  id bigint generated always as identity primary key,
  appointment_id bigint references appointments (id) on delete cascade not null,
  patient_id uuid references patients (id) on delete cascade not null,
  doctor_id uuid references doctors (id) on delete cascade not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  is_anonymous boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(appointment_id)
);
comment on table reviews is 'Patient reviews and ratings for doctors';

-- Notifications
create table notifications (
  id bigint generated always as identity primary key,
  user_id uuid references user_profiles (id) on delete cascade not null,
  type notification_type not null,
  title text not null,
  message text not null,
  data jsonb,
  is_read boolean default false,
  sent_at timestamptz default now(),
  read_at timestamptz,
  created_at timestamptz default now()
);
comment on table notifications is 'In-app notifications for users';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User profiles indexes
create index idx_user_profiles_role on user_profiles (role);
create index idx_user_profiles_created_at on user_profiles (created_at);

-- Doctors indexes
create index idx_doctors_specialization on doctors (specialization);
create index idx_doctors_is_available on doctors (is_available);
create index idx_doctors_average_rating on doctors (average_rating desc);

-- Appointments indexes
create index idx_appointments_patient_id on appointments (patient_id);
create index idx_appointments_doctor_id on appointments (doctor_id);
create index idx_appointments_date_time on appointments (appointment_date, appointment_time);
create index idx_appointments_status on appointments (status);
create index idx_appointments_created_at on appointments (created_at desc);

-- Medical records indexes
create index idx_medical_records_patient_id on medical_records (patient_id);
create index idx_medical_records_doctor_id on medical_records (doctor_id);
create index idx_medical_records_created_at on medical_records (created_at desc);

-- Prescriptions indexes
create index idx_prescriptions_patient_id on prescriptions (patient_id);
create index idx_prescriptions_doctor_id on prescriptions (doctor_id);
create index idx_prescriptions_status on prescriptions (status);

-- Payments indexes
create index idx_payments_patient_id on payments (patient_id);
create index idx_payments_status on payments (status);
create index idx_payments_created_at on payments (created_at desc);

-- Notifications indexes
create index idx_notifications_user_id on notifications (user_id);
create index idx_notifications_is_read on notifications (is_read);
create index idx_notifications_created_at on notifications (created_at desc);

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers to all relevant tables
create trigger update_user_profiles_updated_at
  before update on user_profiles
  for each row execute function update_updated_at_column();

create trigger update_patients_updated_at
  before update on patients
  for each row execute function update_updated_at_column();

create trigger update_doctors_updated_at
  before update on doctors
  for each row execute function update_updated_at_column();

create trigger update_doctor_schedules_updated_at
  before update on doctor_schedules
  for each row execute function update_updated_at_column();

create trigger update_appointments_updated_at
  before update on appointments
  for each row execute function update_updated_at_column();

create trigger update_medical_records_updated_at
  before update on medical_records
  for each row execute function update_updated_at_column();

create trigger update_prescriptions_updated_at
  before update on prescriptions
  for each row execute function update_updated_at_column();

create trigger update_payments_updated_at
  before update on payments
  for each row execute function update_updated_at_column();

create trigger update_reviews_updated_at
  before update on reviews
  for each row execute function update_updated_at_column();

-- Function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Create user profile with patient role by default
  insert into public.user_profiles (id, role, full_name, phone)
  values (
    new.id,
    'patient'::public.user_role,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.phone
  );
  
  -- Create patient record by default
  insert into public.patients (id) values (new.id);
  
  return new;
exception
  when others then
    -- Log error and continue - don't fail user creation
    raise log 'Error in handle_new_user: %', sqlerrm;
    return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user registration
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Function to update doctor rating when new review is added
create or replace function update_doctor_rating()
returns trigger as $$
begin
  update doctors 
  set 
    average_rating = (
      select round(avg(rating)::numeric, 2)
      from reviews 
      where doctor_id = new.doctor_id
    ),
    total_reviews = (
      select count(*)
      from reviews 
      where doctor_id = new.doctor_id
    )
  where id = new.doctor_id;
  
  return new;
end;
$$ language plpgsql;

-- Trigger to update doctor rating
create trigger update_doctor_rating_trigger
  after insert on reviews
  for each row execute function update_doctor_rating();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
alter table user_profiles enable row level security;
alter table patients enable row level security;
alter table doctors enable row level security;
alter table doctor_schedules enable row level security;
alter table appointments enable row level security;
alter table medical_records enable row level security;
alter table prescriptions enable row level security;
alter table prescription_items enable row level security;
alter table payments enable row level security;
alter table reviews enable row level security;
alter table notifications enable row level security;

-- User Profiles Policies
create policy "User profiles are viewable by everyone"
  on user_profiles for select
  to authenticated, anon
  using (true);

create policy "Users can update their own profile"
  on user_profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can insert their own profile"
  on user_profiles for insert
  to authenticated, anon
  with check (true);

create policy "Users can delete their own profile"
  on user_profiles for delete
  to authenticated
  using ((select auth.uid()) = id);

-- Patients Policies
create policy "Patient profiles are viewable by doctors and the patient themselves"
  on patients for select
  to authenticated
  using (
    (select auth.uid()) = id or
    exists (
      select 1 from user_profiles 
      where id = (select auth.uid()) and role = 'doctor'
    )
  );

create policy "Patients can update their own profile"
  on patients for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Patients can insert their own profile"
  on patients for insert
  to authenticated, anon
  with check (true);

create policy "Patients can delete their own profile"
  on patients for delete
  to authenticated
  using ((select auth.uid()) = id);

-- Doctors Policies
create policy "Doctor profiles are viewable by everyone"
  on doctors for select
  to authenticated, anon
  using (true);

create policy "Doctors can update their own profile"
  on doctors for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Doctors can insert their own profile"
  on doctors for insert
  to authenticated, anon
  with check (true);

create policy "Doctors can delete their own profile"
  on doctors for delete
  to authenticated
  using ((select auth.uid()) = id);

-- Doctor Schedules Policies
create policy "Doctor schedules are viewable by everyone"
  on doctor_schedules for select
  to authenticated, anon
  using (true);

create policy "Doctors can manage their own schedules"
  on doctor_schedules for insert
  to authenticated
  with check ((select auth.uid()) = doctor_id);

create policy "Doctors can update their own schedules"
  on doctor_schedules for update
  to authenticated
  using ((select auth.uid()) = doctor_id)
  with check ((select auth.uid()) = doctor_id);

create policy "Doctors can delete their own schedules"
  on doctor_schedules for delete
  to authenticated
  using ((select auth.uid()) = doctor_id);

-- Appointments Policies
create policy "Appointments are viewable by patients and doctors involved"
  on appointments for select
  to authenticated
  using (
    (select auth.uid()) = patient_id or 
    (select auth.uid()) = doctor_id
  );

create policy "Patients can create appointments"
  on appointments for insert
  to authenticated
  with check ((select auth.uid()) = patient_id);

create policy "Patients and doctors can update appointments"
  on appointments for update
  to authenticated
  using (
    (select auth.uid()) = patient_id or 
    (select auth.uid()) = doctor_id
  )
  with check (
    (select auth.uid()) = patient_id or 
    (select auth.uid()) = doctor_id
  );

create policy "Patients and doctors can cancel appointments"
  on appointments for delete
  to authenticated
  using (
    (select auth.uid()) = patient_id or 
    (select auth.uid()) = doctor_id
  );

-- Medical Records Policies
create policy "Medical records are viewable by patients and doctors involved"
  on medical_records for select
  to authenticated
  using (
    (select auth.uid()) = patient_id or 
    (select auth.uid()) = doctor_id
  );

create policy "Doctors can create medical records"
  on medical_records for insert
  to authenticated
  with check ((select auth.uid()) = doctor_id);

create policy "Doctors can update medical records"
  on medical_records for update
  to authenticated
  using ((select auth.uid()) = doctor_id)
  with check ((select auth.uid()) = doctor_id);

create policy "Doctors can delete medical records"
  on medical_records for delete
  to authenticated
  using ((select auth.uid()) = doctor_id);

-- Prescriptions Policies
create policy "Prescriptions are viewable by patients and doctors involved"
  on prescriptions for select
  to authenticated
  using (
    (select auth.uid()) = patient_id or 
    (select auth.uid()) = doctor_id
  );

create policy "Doctors can create prescriptions"
  on prescriptions for insert
  to authenticated
  with check ((select auth.uid()) = doctor_id);

create policy "Doctors can update prescriptions"
  on prescriptions for update
  to authenticated
  using ((select auth.uid()) = doctor_id)
  with check ((select auth.uid()) = doctor_id);

create policy "Doctors can delete prescriptions"
  on prescriptions for delete
  to authenticated
  using ((select auth.uid()) = doctor_id);

-- Prescription Items Policies
create policy "Prescription items are viewable by patients and doctors involved"
  on prescription_items for select
  to authenticated
  using (
    exists (
      select 1 from prescriptions p 
      where p.id = prescription_id and 
      ((select auth.uid()) = p.patient_id or (select auth.uid()) = p.doctor_id)
    )
  );

create policy "Doctors can create prescription items"
  on prescription_items for insert
  to authenticated
  with check (
    exists (
      select 1 from prescriptions p 
      where p.id = prescription_id and (select auth.uid()) = p.doctor_id
    )
  );

create policy "Doctors can update prescription items"
  on prescription_items for update
  to authenticated
  using (
    exists (
      select 1 from prescriptions p 
      where p.id = prescription_id and (select auth.uid()) = p.doctor_id
    )
  )
  with check (
    exists (
      select 1 from prescriptions p 
      where p.id = prescription_id and (select auth.uid()) = p.doctor_id
    )
  );

create policy "Doctors can delete prescription items"
  on prescription_items for delete
  to authenticated
  using (
    exists (
      select 1 from prescriptions p 
      where p.id = prescription_id and (select auth.uid()) = p.doctor_id
    )
  );

-- Payments Policies
create policy "Payments are viewable by patients and doctors involved"
  on payments for select
  to authenticated
  using (
    (select auth.uid()) = patient_id or 
    (select auth.uid()) = doctor_id
  );

create policy "Patients can create payments"
  on payments for insert
  to authenticated
  with check ((select auth.uid()) = patient_id);

create policy "Patients and doctors can update payments"
  on payments for update
  to authenticated
  using (
    (select auth.uid()) = patient_id or 
    (select auth.uid()) = doctor_id
  )
  with check (
    (select auth.uid()) = patient_id or 
    (select auth.uid()) = doctor_id
  );

create policy "Patients can delete payments"
  on payments for delete
  to authenticated
  using ((select auth.uid()) = patient_id);

-- Reviews Policies
create policy "Reviews are viewable by everyone"
  on reviews for select
  to authenticated, anon
  using (true);

create policy "Patients can create reviews"
  on reviews for insert
  to authenticated
  with check ((select auth.uid()) = patient_id);

create policy "Patients can update their own reviews"
  on reviews for update
  to authenticated
  using ((select auth.uid()) = patient_id)
  with check ((select auth.uid()) = patient_id);

create policy "Patients can delete their own reviews"
  on reviews for delete
  to authenticated
  using ((select auth.uid()) = patient_id);

-- Notifications Policies
create policy "Users can view their own notifications"
  on notifications for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "System can create notifications"
  on notifications for insert
  to authenticated, anon
  with check (true);

create policy "Users can update their own notifications"
  on notifications for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own notifications"
  on notifications for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Profile images policies (public bucket)
create policy "Profile images are publicly viewable"
  on storage.objects for select
  to authenticated, anon
  using (bucket_id = 'profile-images');

create policy "Users can upload their own profile images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'profile-images');

create policy "Users can update their own profile images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'profile-images')
  with check (bucket_id = 'profile-images');

create policy "Users can delete their own profile images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'profile-images');

-- Medical documents policies (private bucket)
create policy "Users can view their own medical documents"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'medical-documents');

create policy "Users can upload their own medical documents"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'medical-documents');

create policy "Users can update their own medical documents"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'medical-documents')
  with check (bucket_id = 'medical-documents');

create policy "Users can delete their own medical documents"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'medical-documents');

-- Prescriptions bucket policies (private bucket)
create policy "Users can view prescriptions they are involved in"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'prescriptions');

create policy "Authenticated users can upload prescription files"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'prescriptions');

create policy "Authenticated users can update prescription files"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'prescriptions')
  with check (bucket_id = 'prescriptions');

create policy "Authenticated users can delete prescription files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'prescriptions');
