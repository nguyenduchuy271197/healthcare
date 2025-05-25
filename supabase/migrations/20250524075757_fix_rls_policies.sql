-- Fix RLS policies for payments and prescriptions
-- Description: Allow doctors to create payments for invoices and fix prescription policies

-- ============================================================================
-- FIX PAYMENTS POLICIES
-- ============================================================================

-- Drop existing payment policies
drop policy if exists "Patients can create payments" on payments;
drop policy if exists "Patients and doctors can update payments" on payments;
drop policy if exists "Patients can delete payments" on payments;

-- Create new payment policies that allow both patients and doctors
create policy "Patients and doctors can create payments"
  on payments for insert
  to authenticated
  with check (
    (select auth.uid()) = patient_id or 
    (select auth.uid()) = doctor_id
  );

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

create policy "Patients and doctors can delete payments"
  on payments for delete
  to authenticated
  using (
    (select auth.uid()) = patient_id or 
    (select auth.uid()) = doctor_id
  );

-- ============================================================================
-- FIX NOTIFICATIONS POLICIES
-- ============================================================================

-- Drop existing notification insert policy
drop policy if exists "System can create notifications" on notifications;

-- Create new notification policy that allows authenticated users to create notifications
create policy "Authenticated users can create notifications"
  on notifications for insert
  to authenticated
  with check (true);

-- Also allow service role to create notifications (for system notifications)
create policy "Service role can create notifications"
  on notifications for insert
  to service_role
  with check (true); 