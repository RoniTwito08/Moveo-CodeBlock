import http from "http";
import app, { connectDB } from "./server";
import { Server } from "socket.io";
import CodeBlock from "./models/CodeBlock"; 

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

type CodeBlockType = { _id: string; solution: string };
const codeBlocks: CodeBlockType[] = [];

io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  socket.on("join-room", (roomId: string) => {
    console.log("📥 join-room with ID:", roomId);
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

  socket.on("code-change", ({ roomId, code }) => {
    socket.to(roomId).emit("code-change", code);

    const currentBlock = codeBlocks.find((b) => b._id === roomId);
    if (currentBlock && code.trim() === currentBlock.solution.trim()) {
      io.to(roomId).emit("show-smiley");
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

connectDB()
  .then(async () => {
    const blocksFromDb = await CodeBlock.find();
    blocksFromDb.forEach((block) => {
      codeBlocks.push({
        _id: block._id.toString(),
        solution: block.solution,
      });
    });

    server.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  });
