import { useState, useEffect, useRef, useCallback } from 'react';
import { generateVitals, type Vitals } from '@/lib/mockData';
import {
    createRoom, closeRoom as closeRoomApi, validateRoom,
    createRoomChannel, subscribeToVitals,
    sendVitals, announceJoin, announceLeave,
} from '@/lib/roomManager';
import { getSession } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

// =================== TYPES ===================
interface PatientData {
    vitals: Vitals;
    history: Record<keyof Vitals, { timestamp: number; value: number }[]>;
    info: { age: number; gender: string; diagnosis: string };
}

// =================== DOCTOR HOOK ===================
export function useDoctorRoom() {
    const [roomCode, setRoomCode] = useState<string | null>(null);
    const [patients, setPatients] = useState<Record<string, PatientData>>({});
    const channelRef = useRef<ReturnType<typeof createRoomChannel> | null>(null);

    const startRoom = useCallback(async () => {
        const session = getSession();
        const doctorName = session?.name || 'Doctor';
        const doctorEmail = session?.email;
        const code = await createRoom(doctorName, doctorEmail);
        if (code) {
            setRoomCode(code);
        }
    }, []);

    // Subscribe to broadcast channel when room is created
    useEffect(() => {
        if (!roomCode) return;

        const channel = subscribeToVitals(
            roomCode,
            // On vitals received
            ({ patientName, vitals, patientInfo }) => {
                setPatients(prev => {
                    const existing = prev[patientName];
                    const now = Date.now();

                    if (existing) {
                        const newHistory = { ...existing.history };
                        for (const key of Object.keys(vitals) as (keyof Vitals)[]) {
                            if (!newHistory[key]) newHistory[key] = [];
                            newHistory[key] = [
                                ...newHistory[key],
                                { timestamp: now, value: vitals[key] }
                            ].slice(-60);
                        }
                        return {
                            ...prev,
                            [patientName]: {
                                vitals,
                                history: newHistory,
                                info: patientInfo,
                            },
                        };
                    } else {
                        const history = {} as Record<keyof Vitals, { timestamp: number; value: number }[]>;
                        for (const key of Object.keys(vitals) as (keyof Vitals)[]) {
                            history[key] = [{ timestamp: now, value: vitals[key] }];
                        }
                        return {
                            ...prev,
                            [patientName]: {
                                vitals,
                                history,
                                info: patientInfo,
                            },
                        };
                    }
                });
            },
            // On patient join
            ({ patientName, patientInfo }) => {
                console.log(`Patient ${patientName} joined the room`);
            },
            // On patient leave
            ({ patientName }) => {
                setPatients(prev => {
                    const updated = { ...prev };
                    delete updated[patientName];
                    return updated;
                });
            }
        );

        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomCode]);

    const closeRoomHandler = useCallback(async () => {
        if (roomCode) {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
            await closeRoomApi(roomCode);
            setRoomCode(null);
            setPatients({});
        }
    }, [roomCode]);

    return { roomCode, patients, startRoom, closeRoom: closeRoomHandler };
}

// =================== PATIENT HOOK ===================
export function usePatientRoom() {
    const [connected, setConnected] = useState(false);
    const [roomCode, setRoomCode] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [vitals, setVitals] = useState<Vitals | null>(null);
    const channelRef = useRef<ReturnType<typeof createRoomChannel> | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const session = getSession();
    const patientName = session?.name || 'Patient';
    const patientInfo = { age: 44, gender: 'F', diagnosis: 'Post-Surgery Recovery' };

    const joinRoomHandler = useCallback(async (code: string) => {
        setError(null);

        // Validate room exists
        const isValid = await validateRoom(code);
        if (!isValid) {
            setError('Invalid or expired room code. Please check and try again.');
            return;
        }

        // Create broadcast channel and subscribe
        const channel = createRoomChannel(code);
        channel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                // Announce joining
                announceJoin(channel, patientName, patientInfo);

                // Start streaming vitals
                const streamVitals = () => {
                    const newVitals = generateVitals(patientName);
                    setVitals(newVitals);
                    sendVitals(channel, patientName, newVitals, patientInfo);
                };

                // First vitals immediately
                streamVitals();

                // Then every 1 second
                intervalRef.current = setInterval(streamVitals, 1000);
            }
        });

        channelRef.current = channel;
        setRoomCode(code);
        setConnected(true);
    }, [patientName]);

    const leaveRoomHandler = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (channelRef.current) {
            announceLeave(channelRef.current, patientName);
            supabase.removeChannel(channelRef.current);
            channelRef.current = null;
        }
        setConnected(false);
        setRoomCode(null);
        setVitals(null);
    }, [patientName]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (channelRef.current) {
                announceLeave(channelRef.current, patientName);
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [patientName]);

    return {
        connected,
        roomCode,
        error,
        vitals,
        patientName,
        patientInfo,
        joinRoom: joinRoomHandler,
        leaveRoom: leaveRoomHandler,
    };
}
