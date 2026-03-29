import { useEffect, useRef, useCallback } from 'react';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

/**
 * Lightweight WebSocket hook for admin live feed.
 * Reconnects automatically on disconnect.
 */
export function useAdminWebSocket({ onEvent, channel = 'admin' } = {}) {
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const ws = new WebSocket(`${WS_URL}?token=${token}&channel=${channel}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.debug('[AdminWS] Connected');
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
          reconnectTimer.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onEventRef.current) onEventRef.current(data);
        } catch {
          // non-JSON frames ignored
        }
      };

      ws.onclose = (e) => {
        console.debug('[AdminWS] Closed', e.code);
        // Reconnect unless intentionally closed (code 1000)
        if (e.code !== 1000) {
          reconnectTimer.current = setTimeout(connect, 3000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      reconnectTimer.current = setTimeout(connect, 5000);
    }
  }, [channel]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) wsRef.current.close(1000, 'unmount');
    };
  }, [connect]);

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { send };
}
