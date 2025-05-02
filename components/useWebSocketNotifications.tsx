import { useEffect, useRef } from 'react';
import env from '../config/env';

export function useWebSocketNotifications(onMessage: (msg: any) => void) {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(`${env.API_WS}`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket conectado");
    };

    socket.onmessage = (event) => {
      console.log("📨 Mensaje recibido:", event.data);
      const message = JSON.parse(event.data);
      onMessage(message); // callback al componente
    };

    socket.onerror = (error) => {
      console.error("❌ Error en WebSocket:", error);
    };

    socket.onclose = () => {
      console.log("🔌 Conexión cerrada");
    };

    return () => {
      socket.close();
    };
  }, []);
}