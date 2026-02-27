-- VitalWatch Supabase Setup
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT UNIQUE NOT NULL,
  doctor_name TEXT NOT NULL,
  doctor_email TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create room_patients table (tracks who joined)
CREATE TABLE IF NOT EXISTS room_patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL REFERENCES rooms(room_code) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_info JSONB DEFAULT '{}',
  vitals JSONB DEFAULT '{}',
  connected BOOLEAN DEFAULT true,
  last_seen TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_patients ENABLE ROW LEVEL SECURITY;

-- 4. Allow anonymous access (for demo - no auth required)
CREATE POLICY "Allow all operations on rooms" ON rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on room_patients" ON room_patients FOR ALL USING (true) WITH CHECK (true);

-- 5. Enable Realtime on both tables
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE room_patients;

-- 6. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_room_patients_code ON room_patients(room_code);
