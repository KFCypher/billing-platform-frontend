import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type WebSocketMessage = {
  type: string;
  data: unknown;
};

type WebSocketConfig = {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
};

export function useWebSocket(config: WebSocketConfig = {}) {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = config;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        switch (message.type) {
          case 'subscription.created':
          case 'subscription.updated':
          case 'subscription.cancelled':
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
            queryClient.invalidateQueries({ queryKey: ['analytics', 'overview'] });
            toast.success('New subscription update received');
            break;

          case 'payment.succeeded':
          case 'payment.failed':
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['analytics', 'revenue'] });
            if (message.type === 'payment.succeeded') {
              toast.success('Payment received successfully');
            } else {
              toast.error('Payment failed');
            }
            break;

          case 'customer.created':
          case 'customer.updated':
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['analytics', 'customers'] });
            break;

          case 'webhook.received':
            queryClient.invalidateQueries({ queryKey: ['webhooks'] });
            break;

          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    },
    [queryClient]
  );

  const connect = useCallback(() => {
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!accessToken) return;

    try {
      const wsUrl = `${url}?token=${accessToken}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      wsRef.current.onmessage = handleMessage;

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          console.log(
            `Reconnecting... Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`
          );
          // Use setTimeout with a function that calls connect
          setTimeout(connect, reconnectInterval);
        } else {
          console.error('Max reconnection attempts reached');
          toast.error('Lost connection to server. Please refresh the page.');
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  // Include reconnectInterval and maxReconnectAttempts in dependencies
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, handleMessage]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    sendMessage,
    disconnect,
  };
}
