import http from 'http';
import app, { connectDB } from "./server";
import { Server } from "socket.io";

const PORT = process.env.PORT;
const server = http.createServer(app);
const BASE_URL = process.env.BASE_URL;

const io = new Server(server, {
  cors: {
    origin: BASE_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

type RoomData = {
  mentorId: string | null;
  participants: Set<string>;
};

export const rooms: Record<string, RoomData> = {};

io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  socket.on("join-room", (roomId: string) => {
    if (!rooms[roomId]) {
      rooms[roomId] = {
        mentorId: null,
        participants: new Set(),
      };
    }

    const room = rooms[roomId];
    room.participants.add(socket.id);
    socket.join(roomId);

    const mentorStillConnected =
      room.mentorId && room.participants.has(room.mentorId);

    if (!room.mentorId || !mentorStillConnected) {
      room.mentorId = socket.id;
      socket.emit("role", "mentor");
      console.log(`🎓 Mentor assigned to room ${roomId}`);
    } else {
      socket.emit("role", "student");
      console.log(`🧑‍🎓 Student joined room ${roomId}`);
    }
  });

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];

      room.participants.delete(socket.id);

      if (room.mentorId === socket.id) {
        io.to(roomId).emit("room-closed");
        delete rooms[roomId];
        console.log(`❌ Mentor left room ${roomId} – room closed`);
      }
    }
  });
});

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('❌ Server failed to start:', error);
  process.exit(1);
});
