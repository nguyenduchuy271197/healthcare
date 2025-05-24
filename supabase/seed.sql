-- Healthcare Appointment Booking Application - Seed Data
-- Description: Creates sample data for development and testing
-- Dependencies: Requires initial_schema.sql to be run first

-- ============================================================================
-- DISABLE RLS AND CONSTRAINTS TEMPORARILY FOR SEEDING
-- ============================================================================

-- Disable RLS for seeding (will re-enable at the end)
alter table user_profiles disable row level security;
alter table patients disable row level security;
alter table doctors disable row level security;
alter table doctor_schedules disable row level security;
alter table appointments disable row level security;
alter table medical_records disable row level security;
alter table prescriptions disable row level security;
alter table prescription_items disable row level security;
alter table payments disable row level security;
alter table reviews disable row level security;
alter table notifications disable row level security;

-- Temporarily disable all triggers and constraints for seeding
SET session_replication_role = replica;

-- ============================================================================
-- CLEAR EXISTING DATA
-- ============================================================================

-- Clear existing data in reverse dependency order
delete from notifications;
delete from reviews;
delete from payments;
delete from prescription_items;
delete from prescriptions;
delete from medical_records;
delete from appointments;
delete from doctor_schedules;
delete from doctors;
delete from patients;
delete from user_profiles;

-- Clear auth.users (will cascade to dependent tables)
delete from auth.users where id in (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440005',
  '550e8400-e29b-41d4-a716-446655440010',
  '550e8400-e29b-41d4-a716-446655440011',
  '550e8400-e29b-41d4-a716-446655440012',
  '550e8400-e29b-41d4-a716-446655440013',
  '550e8400-e29b-41d4-a716-446655440014',
  '550e8400-e29b-41d4-a716-446655440015',
  '550e8400-e29b-41d4-a716-446655440016',
  '550e8400-e29b-41d4-a716-446655440017',
  '550e8400-e29b-41d4-a716-446655440018',
  '550e8400-e29b-41d4-a716-446655440019'
);

-- ============================================================================
-- SAMPLE AUTH USERS (Required for foreign key constraint)
-- ============================================================================

-- Insert into auth.users first (required for user_profiles foreign key)
insert into auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_user_meta_data, raw_app_meta_data) values
-- Doctors
('550e8400-e29b-41d4-a716-446655440001', 'dr.nguyen.minh@hospital.com', now(), now(), now(), '{"full_name": "Dr. Nguyễn Văn Minh"}', '{"role": "doctor"}'),
('550e8400-e29b-41d4-a716-446655440002', 'dr.tran.lan@hospital.com', now(), now(), now(), '{"full_name": "Dr. Trần Thị Lan"}', '{"role": "doctor"}'),
('550e8400-e29b-41d4-a716-446655440003', 'dr.le.nam@hospital.com', now(), now(), now(), '{"full_name": "Dr. Lê Hoàng Nam"}', '{"role": "doctor"}'),
('550e8400-e29b-41d4-a716-446655440004', 'dr.pham.huong@hospital.com', now(), now(), now(), '{"full_name": "Dr. Phạm Thị Hương"}', '{"role": "doctor"}'),
('550e8400-e29b-41d4-a716-446655440005', 'dr.hoang.tuan@hospital.com', now(), now(), now(), '{"full_name": "Dr. Hoàng Minh Tuấn"}', '{"role": "doctor"}'),

-- Patients
('550e8400-e29b-41d4-a716-446655440010', 'nguyen.mai@email.com', now(), now(), now(), '{"full_name": "Nguyễn Thị Mai"}', '{"role": "patient"}'),
('550e8400-e29b-41d4-a716-446655440011', 'tran.hung@email.com', now(), now(), now(), '{"full_name": "Trần Văn Hùng"}', '{"role": "patient"}'),
('550e8400-e29b-41d4-a716-446655440012', 'le.hoa@email.com', now(), now(), now(), '{"full_name": "Lê Thị Hoa"}', '{"role": "patient"}'),
('550e8400-e29b-41d4-a716-446655440013', 'pham.duc@email.com', now(), now(), now(), '{"full_name": "Phạm Minh Đức"}', '{"role": "patient"}'),
('550e8400-e29b-41d4-a716-446655440014', 'vo.lananh@email.com', now(), now(), now(), '{"full_name": "Võ Thị Lan Anh"}', '{"role": "patient"}'),
('550e8400-e29b-41d4-a716-446655440015', 'nguyen.son@email.com', now(), now(), now(), '{"full_name": "Nguyễn Thanh Sơn"}', '{"role": "patient"}'),
('550e8400-e29b-41d4-a716-446655440016', 'tran.bich@email.com', now(), now(), now(), '{"full_name": "Trần Thị Bích"}', '{"role": "patient"}'),
('550e8400-e29b-41d4-a716-446655440017', 'le.khoi@email.com', now(), now(), now(), '{"full_name": "Lê Minh Khôi"}', '{"role": "patient"}'),
('550e8400-e29b-41d4-a716-446655440018', 'pham.thu@email.com', now(), now(), now(), '{"full_name": "Phạm Thị Thu"}', '{"role": "patient"}'),
('550e8400-e29b-41d4-a716-446655440019', 'hoang.tai@email.com', now(), now(), now(), '{"full_name": "Hoàng Văn Tài"}', '{"role": "patient"}');

-- ============================================================================
-- SAMPLE USER PROFILES
-- ============================================================================

-- Sample user profiles (using realistic UUIDs for testing)
insert into user_profiles (id, role, full_name, phone, address, date_of_birth, gender, avatar_url, is_verified, email_notifications, sms_notifications) values
-- Doctors
('550e8400-e29b-41d4-a716-446655440001', 'doctor', 'Dr. Nguyễn Văn Minh', '+84901234567', '123 Lê Lợi, Quận 1, TP.HCM', '1980-03-15', 'Nam', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400', true, true, true),
('550e8400-e29b-41d4-a716-446655440002', 'doctor', 'Dr. Trần Thị Lan', '+84901234568', '456 Nguyễn Huệ, Quận 1, TP.HCM', '1975-07-22', 'Nữ', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', true, true, false),
('550e8400-e29b-41d4-a716-446655440003', 'doctor', 'Dr. Lê Hoàng Nam', '+84901234569', '789 Pasteur, Quận 3, TP.HCM', '1985-11-08', 'Nam', 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400', true, true, true),
('550e8400-e29b-41d4-a716-446655440004', 'doctor', 'Dr. Phạm Thị Hương', '+84901234570', '321 Võ Văn Tần, Quận 3, TP.HCM', '1978-12-03', 'Nữ', 'https://images.unsplash.com/photo-1594824242436-3a649838c4c7?w=400', true, true, true),
('550e8400-e29b-41d4-a716-446655440005', 'doctor', 'Dr. Hoàng Minh Tuấn', '+84901234571', '654 Cách Mạng Tháng 8, Quận 10, TP.HCM', '1982-04-17', 'Nam', 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400', true, true, false),

-- Patients
('550e8400-e29b-41d4-a716-446655440010', 'patient', 'Nguyễn Thị Mai', '+84912345678', '12 Nguyễn Thị Minh Khai, Quận 3, TP.HCM', '1990-05-20', 'Nữ', 'https://images.unsplash.com/photo-1494790108755-2616c99c9406?w=400', false, true, true),
('550e8400-e29b-41d4-a716-446655440011', 'patient', 'Trần Văn Hùng', '+84912345679', '45 Lý Tự Trọng, Quận 1, TP.HCM', '1988-09-12', 'Nam', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', false, true, false),
('550e8400-e29b-41d4-a716-446655440012', 'patient', 'Lê Thị Hoa', '+84912345680', '78 Hai Bà Trưng, Quận 1, TP.HCM', '1995-02-28', 'Nữ', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', false, true, true),
('550e8400-e29b-41d4-a716-446655440013', 'patient', 'Phạm Minh Đức', '+84912345681', '90 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM', '1992-08-15', 'Nam', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', false, false, true),
('550e8400-e29b-41d4-a716-446655440014', 'patient', 'Võ Thị Lan Anh', '+84912345682', '156 Cống Quỳnh, Quận 1, TP.HCM', '1987-11-07', 'Nữ', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', false, true, false),
('550e8400-e29b-41d4-a716-446655440015', 'patient', 'Nguyễn Thanh Sơn', '+84912345683', '234 Lê Văn Sỹ, Quận 3, TP.HCM', '1991-06-22', 'Nam', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', false, true, true),
('550e8400-e29b-41d4-a716-446655440016', 'patient', 'Trần Thị Bích', '+84912345684', '67 Trần Hưng Đạo, Quận 5, TP.HCM', '1993-01-10', 'Nữ', 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400', false, true, true),
('550e8400-e29b-41d4-a716-446655440017', 'patient', 'Lê Minh Khôi', '+84912345685', '89 Nguyễn Đình Chiểu, Quận 3, TP.HCM', '1989-10-30', 'Nam', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', false, false, false),
('550e8400-e29b-41d4-a716-446655440018', 'patient', 'Phạm Thị Thu', '+84912345686', '123 Bùi Viện, Quận 1, TP.HCM', '1994-03-18', 'Nữ', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', false, true, false),
('550e8400-e29b-41d4-a716-446655440019', 'patient', 'Hoàng Văn Tài', '+84912345687', '45 Nam Kỳ Khởi Nghĩa, Quận 3, TP.HCM', '1996-07-25', 'Nam', 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400', false, true, true);

-- ============================================================================
-- DOCTOR INFORMATION
-- ============================================================================

insert into doctors (id, license_number, specialization, qualification, experience_years, consultation_fee, bio, clinic_address, is_available, verified_at) values
('550e8400-e29b-41d4-a716-446655440001', 'MD001234', 'Nội khoa', 'Tiến sĩ Y khoa, Đại học Y Dược TP.HCM', 15, 200000.00, 'Bác sĩ chuyên khoa I về Nội khoa với hơn 15 năm kinh nghiệm trong điều trị các bệnh lý nội khoa thường gặp.', 'Bệnh viện Chợ Rẫy, 201B Nguyễn Chí Thanh, Quận 5, TP.HCM', true, '2023-01-15 10:00:00+07'),
('550e8400-e29b-41d4-a716-446655440002', 'MD001235', 'Sản phụ khoa', 'Thạc sĩ Y khoa, Đại học Y Dược Huế', 12, 250000.00, 'Bác sĩ chuyên khoa II về Sản phụ khoa, có kinh nghiệm trong việc theo dõi thai kỳ và điều trị các bệnh lý phụ khoa.', 'Bệnh viện Từ Dũ, 284 Cống Quỳnh, Quận 1, TP.HCM', true, '2023-02-20 14:30:00+07'),
('550e8400-e29b-41d4-a716-446655440003', 'MD001236', 'Nhi khoa', 'Tiến sĩ Y khoa, Đại học Y khoa Phạm Ngọc Thạch', 10, 180000.00, 'Bác sĩ chuyên khoa I về Nhi khoa, chuyên điều trị các bệnh lý ở trẻ em từ sơ sinh đến 16 tuổi.', 'Bệnh viện Nhi đồng 1, 341 Sư Vạn Hạnh, Quận 10, TP.HCM', true, '2023-03-10 09:15:00+07'),
('550e8400-e29b-41d4-a716-446655440004', 'MD001237', 'Tim mạch', 'Thạc sĩ Y khoa, Đại học Y Dược TP.HCM', 8, 300000.00, 'Bác sĩ chuyên khoa I về Tim mạch, có kinh nghiệm trong điều trị các bệnh lý về tim và mạch máu.', 'Viện Tim Thành phố, 1A Lý Tự Trọng, Quận 1, TP.HCM', true, '2023-04-05 16:45:00+07'),
('550e8400-e29b-41d4-a716-446655440005', 'MD001238', 'Da liễu', 'Tiến sĩ Y khoa, Đại học Y Dược Hà Nội', 7, 220000.00, 'Bác sĩ chuyên khoa I về Da liễu, điều trị các bệnh lý về da, tóc, móng và các vấn đề thẩm mỹ da.', 'Bệnh viện Da liễu TP.HCM, 2 Nguyễn Thông, Quận 3, TP.HCM', true, '2023-05-12 11:20:00+07');

-- ============================================================================
-- PATIENT INFORMATION
-- ============================================================================

insert into patients (id, emergency_contact_name, emergency_contact_phone, blood_type, allergies, chronic_conditions, insurance_number, insurance_provider, medical_history) values
('550e8400-e29b-41d4-a716-446655440010', 'Nguyễn Văn Nam', '+84903456789', 'A+', array['Thuốc kháng sinh Penicillin'], '{}'::text[], 'SV123456789', 'Bảo hiểm xã hội', 'Không có tiền sử bệnh lý đặc biệt'),
('550e8400-e29b-41d4-a716-446655440011', 'Trần Thị Hoa', '+84903456790', 'O+', array['Tôm cua'], array['Cao huyết áp'], 'SV123456790', 'Bảo hiểm xã hội', 'Phát hiện cao huyết áp từ năm 2020'),
('550e8400-e29b-41d4-a716-446655440012', 'Lê Văn Minh', '+84903456791', 'B+', '{}'::text[], '{}'::text[], 'SV123456791', 'Bảo hiểm xã hội', 'Không có tiền sử bệnh lý'),
('550e8400-e29b-41d4-a716-446655440013', 'Phạm Thị Lan', '+84903456792', 'AB+', array['Sữa'], array['Tiểu đường type 2'], 'SV123456792', 'Bảo hiểm xã hội', 'Được chẩn đoán tiểu đường type 2 năm 2019'),
('550e8400-e29b-41d4-a716-446655440014', 'Võ Văn Tùng', '+84903456793', 'A-', '{}'::text[], '{}'::text[], 'SV123456793', 'Bảo hiểm xã hội', 'Không có tiền sử bệnh lý đặc biệt'),
('550e8400-e29b-41d4-a716-446655440015', 'Nguyễn Thị Hương', '+84903456794', 'O-', array['Hải sản'], '{}'::text[], 'SV123456794', 'Prudential', 'Dị ứng hải sản từ nhỏ'),
('550e8400-e29b-41d4-a716-446655440016', 'Trần Văn Long', '+84903456795', 'B-', '{}'::text[], array['Hen suyễn'], 'SV123456795', 'Bảo hiểm xã hội', 'Hen suyễn từ thời thơ ấu'),
('550e8400-e29b-41d4-a716-446655440017', 'Lê Thị Mai', '+84903456796', 'AB-', array['Thuốc giảm đau'], '{}'::text[], 'SV123456796', 'Bảo hiểm xã hội', 'Dị ứng với một số thuốc giảm đau'),
('550e8400-e29b-41d4-a716-446655440018', 'Phạm Văn Đức', '+84903456797', 'A+', '{}'::text[], '{}'::text[], 'SV123456797', 'AIA', 'Không có tiền sử bệnh lý'),
('550e8400-e29b-41d4-a716-446655440019', 'Hoàng Thị Linh', '+84903456798', 'O+', array['Phấn hoa'], '{}'::text[], 'SV123456798', 'Bảo hiểm xã hội', 'Viêm mũi dị ứng theo mùa');

-- ============================================================================
-- DOCTOR SCHEDULES
-- ============================================================================

insert into doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, is_active) values
-- Dr. Nguyễn Văn Minh (Nội khoa)
('550e8400-e29b-41d4-a716-446655440001', 1, '08:00', '12:00', 30, true), -- Thứ 2
('550e8400-e29b-41d4-a716-446655440001', 1, '14:00', '18:00', 30, true),
('550e8400-e29b-41d4-a716-446655440001', 3, '08:00', '12:00', 30, true), -- Thứ 4
('550e8400-e29b-41d4-a716-446655440001', 3, '14:00', '18:00', 30, true),
('550e8400-e29b-41d4-a716-446655440001', 5, '08:00', '12:00', 30, true), -- Thứ 6

-- Dr. Trần Thị Lan (Sản phụ khoa)
('550e8400-e29b-41d4-a716-446655440002', 2, '08:00', '12:00', 45, true), -- Thứ 3
('550e8400-e29b-41d4-a716-446655440002', 2, '14:00', '17:00', 45, true),
('550e8400-e29b-41d4-a716-446655440002', 4, '08:00', '12:00', 45, true), -- Thứ 5
('550e8400-e29b-41d4-a716-446655440002', 4, '14:00', '17:00', 45, true),
('550e8400-e29b-41d4-a716-446655440002', 6, '08:00', '12:00', 45, true), -- Thứ 7

-- Dr. Lê Hoàng Nam (Nhi khoa)
('550e8400-e29b-41d4-a716-446655440003', 1, '08:00', '12:00', 20, true), -- Thứ 2
('550e8400-e29b-41d4-a716-446655440003', 1, '13:00', '17:00', 20, true),
('550e8400-e29b-41d4-a716-446655440003', 2, '08:00', '12:00', 20, true), -- Thứ 3
('550e8400-e29b-41d4-a716-446655440003', 4, '08:00', '12:00', 20, true), -- Thứ 5
('550e8400-e29b-41d4-a716-446655440003', 6, '08:00', '12:00', 20, true), -- Thứ 7

-- Dr. Phạm Thị Hương (Tim mạch)
('550e8400-e29b-41d4-a716-446655440004', 1, '09:00', '12:00', 60, true), -- Thứ 2
('550e8400-e29b-41d4-a716-446655440004', 1, '14:00', '16:00', 60, true),
('550e8400-e29b-41d4-a716-446655440004', 3, '09:00', '12:00', 60, true), -- Thứ 4
('550e8400-e29b-41d4-a716-446655440004', 5, '09:00', '12:00', 60, true), -- Thứ 6

-- Dr. Hoàng Minh Tuấn (Da liễu)
('550e8400-e29b-41d4-a716-446655440005', 2, '08:00', '12:00', 30, true), -- Thứ 3
('550e8400-e29b-41d4-a716-446655440005', 2, '14:00', '18:00', 30, true),
('550e8400-e29b-41d4-a716-446655440005', 4, '08:00', '12:00', 30, true), -- Thứ 5
('550e8400-e29b-41d4-a716-446655440005', 4, '14:00', '18:00', 30, true),
('550e8400-e29b-41d4-a716-446655440005', 6, '08:00', '12:00', 30, true); -- Thứ 7

-- ============================================================================
-- APPOINTMENTS
-- ============================================================================

insert into appointments (patient_id, doctor_id, appointment_date, appointment_time, duration_minutes, status, reason, notes, consultation_fee, confirmed_at, completed_at) values
-- Completed appointments
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', '2024-01-15', '09:00', 30, 'completed', 'Khám sức khỏe định kỳ', 'Bệnh nhân khỏe mạnh', 200000.00, '2024-01-10 14:30:00+07', '2024-01-15 09:30:00+07'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', '2024-01-18', '10:30', 30, 'completed', 'Đau đầu thường xuyên', 'Cần theo dõi huyết áp', 200000.00, '2024-01-15 16:00:00+07', '2024-01-18 11:00:00+07'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', '2024-01-20', '14:00', 45, 'completed', 'Khám thai định kỳ', 'Thai kỳ phát triển bình thường', 250000.00, '2024-01-18 10:00:00+07', '2024-01-20 14:45:00+07'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440004', '2024-01-22', '09:00', 60, 'completed', 'Khám tim mạch', 'Chỉ số tim mạch ổn định', 300000.00, '2024-01-20 09:30:00+07', '2024-01-22 10:00:00+07'),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440005', '2024-01-25', '08:30', 30, 'completed', 'Điều trị mụn trứng cá', 'Được kê thuốc bôi ngoài', 220000.00, '2024-01-23 15:20:00+07', '2024-01-25 09:00:00+07'),

-- Confirmed appointments (future)
('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440001', '2024-02-05', '09:30', 30, 'confirmed', 'Tái khám dạ dày', 'Theo dõi sau điều trị', 200000.00, '2024-02-01 10:15:00+07', null),
('550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440003', '2024-02-06', '08:20', 20, 'confirmed', 'Khám ho kéo dài', 'Trẻ ho 2 tuần', 180000.00, '2024-02-03 14:00:00+07', null),
('550e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440002', '2024-02-07', '15:30', 45, 'confirmed', 'Khám phụ khoa', 'Khám định kỳ', 250000.00, '2024-02-05 09:45:00+07', null),

-- Pending appointments
('550e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440004', '2024-02-10', '14:00', 60, 'pending', 'Đau ngực', 'Cần khám gấp', 300000.00, null, null),
('550e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440005', '2024-02-12', '10:00', 30, 'pending', 'Nấm da', 'Ngứa kéo dài', 220000.00, null, null),

-- Cancelled appointment
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', '2024-01-30', '16:00', 20, 'cancelled', 'Khám cho con', 'Không thể đến được', 180000.00, '2024-01-28 12:00:00+07', null);

-- ============================================================================
-- MEDICAL RECORDS
-- ============================================================================

insert into medical_records (appointment_id, patient_id, doctor_id, diagnosis, symptoms, treatment_plan, follow_up_required, follow_up_date, notes) values
(1, '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'Sức khỏe bình thường', 'Không có triệu chứng bất thường', 'Duy trì lối sống lành mạnh, tập thể dục đều đặn', false, null, 'Các chỉ số xét nghiệm đều trong giới hạn bình thường'),
(2, '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'Tăng huyết áp nhẹ', 'Đau đầu, chóng mặt nhẹ', 'Điều chỉnh chế độ ăn uống, giảm muối, uống thuốc hạ áp', true, '2024-02-18', 'Huyết áp 140/90 mmHg, cần theo dõi thường xuyên'),
(3, '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 'Thai kỳ 20 tuần bình thường', 'Không có triệu chứng bất thường', 'Tiếp tục bổ sung acid folic, khám thai định kỳ', true, '2024-02-20', 'Thai nhi phát triển bình thường, không có dị tật'),
(4, '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440004', 'Rối loạn nhịp tim nhẹ', 'Hồi hộp, đánh trống ngực', 'Uống thuốc điều hòa nhịp tim, hạn chế caffeine', true, '2024-02-22', 'ECG cho thấy nhịp tim không đều nhẹ, cần theo dõi'),
(5, '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440005', 'Mụn trứng cá mức độ vừa', 'Mụn viêm ở vùng mặt', 'Sử dụng thuốc bôi chứa tretinoin, rửa mặt đúng cách', true, '2024-02-25', 'Cần kiểm soát stress và chế độ ăn uống');

-- ============================================================================
-- PRESCRIPTIONS
-- ============================================================================

insert into prescriptions (medical_record_id, patient_id, doctor_id, status, total_amount, instructions, valid_until) values
(2, '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'active', 180000.00, 'Uống thuốc đúng giờ, không bỏ lỡ liều', '2024-02-18'),
(4, '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440004', 'active', 250000.00, 'Uống thuốc sau ăn, tránh hoạt động mạnh', '2024-02-22'),
(5, '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440005', 'active', 120000.00, 'Bôi thuốc vào buổi tối, tránh ánh nắng mặt trời', '2024-03-25');

-- ============================================================================
-- PRESCRIPTION ITEMS
-- ============================================================================

insert into prescription_items (prescription_id, medication_name, dosage, frequency, duration, quantity, unit_price, instructions) values
-- Prescription 1 (Tăng huyết áp)
(1, 'Amlodipine', '5mg', '1 lần/ngày', '30 ngày', 30, 120000.00, 'Uống vào buổi sáng sau ăn'),
(1, 'Losartan', '50mg', '1 lần/ngày', '30 ngày', 30, 60000.00, 'Uống cùng với Amlodipine'),

-- Prescription 2 (Rối loạn nhịp tim)
(2, 'Propranolol', '40mg', '2 lần/ngày', '14 ngày', 28, 150000.00, 'Uống sáng và tối sau ăn'),
(2, 'Aspirin', '81mg', '1 lần/ngày', '30 ngày', 30, 100000.00, 'Uống sau ăn sáng'),

-- Prescription 3 (Mụn trứng cá)
(3, 'Tretinoin gel 0.025%', '1 tuýp', '1 lần/ngày', '60 ngày', 1, 120000.00, 'Bôi mỏng vào buổi tối, rửa tay sau khi bôi');

-- ============================================================================
-- PAYMENTS
-- ============================================================================

insert into payments (appointment_id, patient_id, doctor_id, amount, payment_method, status, transaction_id, payment_gateway, paid_at) values
(1, '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 200000.00, 'credit_card', 'completed', 'TXN202401150001', 'VNPay', '2024-01-15 09:35:00+07'),
(2, '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 200000.00, 'bank_transfer', 'completed', 'TXN202401180001', 'Banking', '2024-01-18 11:05:00+07'),
(3, '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 250000.00, 'wallet', 'completed', 'TXN202401200001', 'MoMo', '2024-01-20 14:50:00+07'),
(4, '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440004', 300000.00, 'credit_card', 'completed', 'TXN202401220001', 'VNPay', '2024-01-22 10:05:00+07'),
(5, '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440005', 220000.00, 'cash', 'completed', null, null, '2024-01-25 09:05:00+07'),
(6, '550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440001', 200000.00, 'credit_card', 'pending', null, null, null),
(7, '550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440003', 180000.00, 'wallet', 'pending', null, null, null);

-- ============================================================================
-- REVIEWS
-- ============================================================================

insert into reviews (appointment_id, patient_id, doctor_id, rating, comment, is_anonymous) values
(1, '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 5, 'Bác sĩ khám rất kỹ, tư vấn nhiệt tình. Phòng khám sạch sẽ.', false),
(2, '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 4, 'Bác sĩ giải thích rõ ràng về tình trạng bệnh. Thời gian chờ hơi lâu.', false),
(3, '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 5, 'Bác sĩ rất chuyên nghiệp, kinh nghiệm trong khám thai. Rất hài lòng.', false),
(4, '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440004', 4, 'Khám tim mạch rất kỹ lưỡng. Bác sĩ tận tâm.', true),
(5, '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440005', 5, 'Điều trị mụn hiệu quả. Bác sĩ tư vấn chế độ chăm sóc da rất chi tiết.', false);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

insert into notifications (user_id, type, title, message, data, is_read) values
-- Appointment reminders
('550e8400-e29b-41d4-a716-446655440015', 'appointment_reminder', 'Nhắc nhở lịch khám', 'Bạn có lịch khám với BS. Nguyễn Văn Minh vào 09:30 ngày 05/02/2024', '{"appointment_id": 6}', false),
('550e8400-e29b-41d4-a716-446655440016', 'appointment_reminder', 'Nhắc nhở lịch khám', 'Bạn có lịch khám với BS. Lê Hoàng Nam vào 08:20 ngày 06/02/2024', '{"appointment_id": 7}', false),

-- Appointment confirmations
('550e8400-e29b-41d4-a716-446655440015', 'appointment_confirmed', 'Lịch khám đã được xác nhận', 'Lịch khám của bạn với BS. Nguyễn Văn Minh đã được xác nhận', '{"appointment_id": 6}', true),
('550e8400-e29b-41d4-a716-446655440016', 'appointment_confirmed', 'Lịch khám đã được xác nhận', 'Lịch khám của bạn với BS. Lê Hoàng Nam đã được xác nhận', '{"appointment_id": 7}', true),

-- Payment success
('550e8400-e29b-41d4-a716-446655440010', 'payment_success', 'Thanh toán thành công', 'Bạn đã thanh toán thành công 200,000 VNĐ cho lịch khám', '{"payment_id": 1}', true),
('550e8400-e29b-41d4-a716-446655440011', 'payment_success', 'Thanh toán thành công', 'Bạn đã thanh toán thành công 200,000 VNĐ cho lịch khám', '{"payment_id": 2}', true),

-- New prescriptions
('550e8400-e29b-41d4-a716-446655440011', 'new_prescription', 'Đơn thuốc mới', 'Bạn có đơn thuốc mới từ BS. Nguyễn Văn Minh', '{"prescription_id": 1}', false),
('550e8400-e29b-41d4-a716-446655440013', 'new_prescription', 'Đơn thuốc mới', 'Bạn có đơn thuốc mới từ BS. Phạm Thị Hương', '{"prescription_id": 2}', false),

-- Follow-up required
('550e8400-e29b-41d4-a716-446655440011', 'follow_up_required', 'Cần tái khám', 'Bạn cần tái khám với BS. Nguyễn Văn Minh vào ngày 18/02/2024', '{"medical_record_id": 2}', false),
('550e8400-e29b-41d4-a716-446655440012', 'follow_up_required', 'Cần khám thai định kỳ', 'Bạn cần khám thai định kỳ với BS. Trần Thị Lan vào ngày 20/02/2024', '{"medical_record_id": 3}', false);

-- ============================================================================
-- RE-ENABLE RLS AND CONSTRAINTS
-- ============================================================================

-- Re-enable all triggers and constraints
SET session_replication_role = DEFAULT;

-- Re-enable RLS for all tables
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

-- ============================================================================
-- UPDATE STATISTICS
-- ============================================================================

-- Update doctor ratings and review counts (will be handled by triggers)
-- The triggers should automatically update average_rating and total_reviews

-- Update table statistics
analyze user_profiles;
analyze patients;
analyze doctors;
analyze doctor_schedules;
analyze appointments;
analyze medical_records;
analyze prescriptions;
analyze prescription_items;
analyze payments;
analyze reviews;
analyze notifications;

-- ============================================================================
-- VERIFICATION QUERIES (Optional - for testing)
-- ============================================================================

-- Uncomment the following lines to verify the seed data
/*
select 'User Profiles' as table_name, count(*) as record_count from user_profiles
union all
select 'Patients', count(*) from patients
union all
select 'Doctors', count(*) from doctors
union all
select 'Doctor Schedules', count(*) from doctor_schedules
union all
select 'Appointments', count(*) from appointments
union all
select 'Medical Records', count(*) from medical_records
union all
select 'Prescriptions', count(*) from prescriptions
union all
select 'Prescription Items', count(*) from prescription_items
union all
select 'Payments', count(*) from payments
union all
select 'Reviews', count(*) from reviews
union all
select 'Notifications', count(*) from notifications;
*/
