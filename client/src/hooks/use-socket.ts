import { useEffect, useState, useCallback } from 'react';
import { getSocketClient } from '@/lib/socket';
import type { SocketEvents } from '@shared/schema';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketClient = getSocketClient();

  useEffect(() => {
    const updateConnectionStatus = () => {
      setIsConnected(socketClient.isConnected);
    };

    // Check initial connection status
    updateConnectionStatus();

    // Set up interval to check connection status
    const interval = setInterval(updateConnectionStatus, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [socketClient]);

  const emit = useCallback(<K extends keyof SocketEvents>(type: K, data: SocketEvents[K]) => {
    socketClient.emit(type, data);
  }, [socketClient]);

  const on = useCallback(<K extends keyof SocketEvents>(
    type: K, 
    handler: (data: SocketEvents[K]) => void
  ) => {
    return socketClient.on(type, handler);
  }, [socketClient]);

  const off = useCallback(<K extends keyof SocketEvents>(
    type: K, 
    handler?: (data: SocketEvents[K]) => void
  ) => {
    socketClient.off(type, handler);
  }, [socketClient]);

  return {
    isConnected,
    emit,
    on,
    off,
    disconnect: () => socketClient.disconnect()
  };
}
