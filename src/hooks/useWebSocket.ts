'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
}

export function useWebSocket(namespace: string = '/') {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<WebSocketState>({ connected: false, connecting: false, error: null });

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';
    setState(s => ({ ...s, connecting: true }));

    const socket = io(wsUrl + namespace, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => setState({ connected: true, connecting: false, error: null }));
    socket.on('disconnect', () => setState(s => ({ ...s, connected: false })));
    socket.on('connect_error', (err) => setState({ connected: false, connecting: false, error: err.message }));

    return () => { socket.disconnect(); };
  }, [namespace]);

  const emit = useCallback((event: string, data?: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  const on = useCallback((event: string, handler: (...args: unknown[]) => void) => {
    socketRef.current?.on(event, handler);
    return () => { socketRef.current?.off(event, handler); };
  }, []);

  return { socket: socketRef.current, ...state, emit, on };
}
