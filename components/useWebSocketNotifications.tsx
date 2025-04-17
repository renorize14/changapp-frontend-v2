import env from '../config/env';

export function useWebSocketNotifications(userEmail: string) {
    
    const socket = new WebSocket(`${env.API_WS}`);

    socket.onopen = function () {
      console.log("Conectado al servidor WebSocket");
    };

    socket.onmessage = function (event) {
      const message = JSON.parse(event.data);

      console.log(message)
    };

    socket.onerror = function (error) {
      console.error("Error en WebSocket:", error);
    };

    socket.onclose = function () {
      console.log("Conexión WebSocket cerrada");
    };

    function sendMessage() {

      socket.send(JSON.stringify("msg"));
    }

}
