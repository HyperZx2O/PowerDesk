import { useEffect, useRef, useState } from 'react';
import { env } from '../env';
import { useDeviceStore } from '../store/deviceStore';
import { useAlertStore } from '../store/alertStore';
import { usePowerStore } from '../store/powerStore';
import { AlertSchema } from '../types/alert';

type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

interface SocketMessage {
  type: string;
  payload: unknown;
}

export function useOfficeSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');

  const updateDevice = useDeviceStore((state) => state.updateDevice);
  const addAlert = useAlertStore((state) => state.addAlert);
  const updateFromWsPayload = usePowerStore((state) => state.updateFromWsPayload);

  useEffect(() => {
    const handleMessage = (message: SocketMessage) => {
      const { type } = message;
      const payload = (message as Record<string, unknown>).device
        ?? (message as Record<string, unknown>).alert
        ?? (message as Record<string, unknown>).data
        ?? (message as Record<string, unknown>).payload;

      switch (type) {
        case 'device-update': {
          const update = payload as { id: string; [key: string]: unknown };
          updateDevice(update.id, update);
          break;
        }
        case 'alert-triggered': {
          const alertData = (payload as Record<string, unknown>) ?? message;
          const result = AlertSchema.safeParse(alertData);
          if (result.success) {
            addAlert(result.data);
          }
          break;
        }
        case 'power-update': {
          const powerData = (payload as Record<string, unknown>) ?? message;
          updateFromWsPayload(powerData);
          break;
        }
      }
    };

    const scheduleReconnect = () => {
      if (reconnectTimeoutRef.current !== null) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      const delay = Math.min(
        1000 * Math.pow(2, reconnectAttemptsRef.current),
        30000
      );

      reconnectAttemptsRef.current++;

      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect();
      }, delay);
    };

    const connect = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;

      try {
        const ws = new WebSocket(env.VITE_WS_URL);

        ws.onopen = () => {
          setStatus('connected');
          reconnectAttemptsRef.current = 0;
        };

        ws.onmessage = (event) => {
          try {
            const message: SocketMessage = JSON.parse(event.data);
            handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        ws.onclose = () => {
          setStatus('reconnecting');
          scheduleReconnect();
        };

        ws.onerror = () => {
          ws.close();
        };

        wsRef.current = ws;
      } catch {
        setStatus('disconnected');
        scheduleReconnect();
      }
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current !== null) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [updateDevice, addAlert, updateFromWsPayload]);

  return {
    status,
    isConnected: status === 'connected',
  };
}
