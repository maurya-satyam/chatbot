
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ username, room }) => {
    username = String(username || "").trim().slice(0, 30);
    room = String(room || "").trim().slice(0, 30);

    if (!username || !room) return;

    socket.data.username = username;
    socket.data.room = room;
    socket.join(room);

    socket.to(room).emit("user-joined", username);
    socket.emit("joined", { username, room });
  });

  socket.on("send-message", (message) => {
    const username = socket.data.username;
    const room = socket.data.room;

    if (!username || !room || typeof message !== "string") {
      return;
    }

    message = message.trim().slice(0, 1000);
    if (!message) return;

    io.to(room).emit("receive-message", {
      username,
      message,
      time: new Date().toLocaleTimeString()
    });
  });

  socket.on("disconnect", () => {
    const { username, room } = socket.data;

    if (username && room) {
      socket.to(room).emit("user-left", username);
    }

    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Chat server running on port ${PORT}`);
});