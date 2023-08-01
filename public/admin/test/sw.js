const socket = new WebSocket("ws://localhost:3001");
socket.addEventListener("message", ({ data }) => {
    const packet = JSON.parse(data);
    registration.showNotification(packet.info);
  });