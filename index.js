const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let rooms = {};

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room ${roomId}`);
  });

  socket.on("play", (data) => {
    socket.to(data.roomId).emit("play", data);
  });

  socket.on("pause", (data) => {
    socket.to(data.roomId).emit("pause", data);
  });

  socket.on("seek", (data) => {
    socket.to(data.roomId).emit("seek", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
