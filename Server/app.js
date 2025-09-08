// app.js
import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";

const app = express();
const Port = 3000;
const server = createServer(app);

const io = new Server(server, {
  cors: {
    // set this to your React URL(s)
    origin: ["http://localhost:3001", "http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

app.use(cors());

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (username) => {
    socket.username = (username || "User").trim();
    io.emit("chat_message", {
      type: "system",
      from: "System",
      message: `${socket.username} joined the chat`,
      senderId: null,
    });
  });

  socket.on("send_message", (message) => {
    if (!socket.username) return;
    io.emit("chat_message", {
      type: "user",
      from: socket.username,
      message,
      senderId: socket.id, // key for left/right alignment
    });
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      io.emit("chat_message", {
        type: "system",
        from: "System",
        message: `${socket.username} left the chat`,
        senderId: null,
      });
    }
    console.log("User disconnected:", socket.id);
  });
});

server.listen(Port, () => {
  console.log(`Server running on Port ${Port}`);
});
