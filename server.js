const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }, // Allow connections from anywhere (your Spotify app)
});

// Store room data
const rooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    console.log(`Socket ${socket.id} joined ${roomName}`);

    // If room exists, sync the new user to the Host
    if (rooms[roomName]) {
      socket.emit("update_state", rooms[roomName]);
    }
  });

  // When someone changes the song/pauses
  socket.on("player_update", (data) => {
    const { room, uri, time, isPaused } = data;

    rooms[room] = {
      uri: uri,
      time: time,
      isPaused: isPaused,
      timestamp: Date.now(), // Record when this update happened
    };

    // Tell everyone else in the room to update
    socket.to(room).emit("update_state", rooms[room]);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
