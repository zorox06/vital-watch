// Supabase-powered room manager using Realtime Broadcast for instant data streaming
import { supabase } from '@/integrations/supabase/client';

// =================== TYPES ===================
export interface RoomData {
  id: string;
  room_code: string;
  doctor_name: string;
  doctor_email: string | null;
  status: string;
  created_at: string;
}

// Generate random 6-digit room code
function generateRoomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// =================== ROOM CRUD (Database) ===================

// Create a new room in Supabase
export async function createRoom(doctorName: string, doctorEmail?: string): Promise<string | null> {
  const roomCode = generateRoomCode();

  const { error } = await supabase.from('rooms').insert({
    room_code: roomCode,
    doctor_name: doctorName,
    doctor_email: doctorEmail || null,
    status: 'active',
  });

  if (error) {
    console.error('Error creating room:', error);
    if (error.code === '23505') return createRoom(doctorName, doctorEmail);
    return null;
  }

  return roomCode;
}

// Validate if room exists and is active
export async function validateRoom(roomCode: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('rooms')
    .select('status')
    .eq('room_code', roomCode)
    .single();

  if (error || !data) return false;
  return data.status === 'active';
}

// Close a room
export async function closeRoom(roomCode: string): Promise<void> {
  await supabase
    .from('rooms')
    .update({ status: 'closed' })
    .eq('room_code', roomCode);
}

// =================== REALTIME BROADCAST (Instant Streaming) ===================

// Create a broadcast channel for a room
export function createRoomChannel(roomCode: string) {
  return supabase.channel(`vitals-${roomCode}`, {
    config: {
      broadcast: { self: false },
    },
  });
}

// Doctor subscribes to patient vitals via broadcast
export function subscribeToVitals(
  roomCode: string,
  onVitals: (data: { patientName: string; vitals: any; patientInfo: any }) => void,
  onPatientJoin: (data: { patientName: string; patientInfo: any }) => void,
  onPatientLeave: (data: { patientName: string }) => void,
) {
  const channel = createRoomChannel(roomCode);

  channel
    .on('broadcast', { event: 'vitals' }, (payload) => {
      onVitals(payload.payload);
    })
    .on('broadcast', { event: 'patient_join' }, (payload) => {
      onPatientJoin(payload.payload);
    })
    .on('broadcast', { event: 'patient_leave' }, (payload) => {
      onPatientLeave(payload.payload);
    })
    .subscribe();

  return channel;
}

// Patient sends vitals via broadcast
export function sendVitals(
  channel: ReturnType<typeof createRoomChannel>,
  patientName: string,
  vitals: any,
  patientInfo: any,
) {
  channel.send({
    type: 'broadcast',
    event: 'vitals',
    payload: { patientName, vitals, patientInfo },
  });
}

// Patient announces join
export function announceJoin(
  channel: ReturnType<typeof createRoomChannel>,
  patientName: string,
  patientInfo: any,
) {
  channel.send({
    type: 'broadcast',
    event: 'patient_join',
    payload: { patientName, patientInfo },
  });
}

// Patient announces leave
export function announceLeave(
  channel: ReturnType<typeof createRoomChannel>,
  patientName: string,
) {
  channel.send({
    type: 'broadcast',
    event: 'patient_leave',
    payload: { patientName },
  });
}
