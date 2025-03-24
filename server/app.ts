import http from "http";
import app, { connectDB } from "./server";
import { Server } from "socket.io";
import CodeBlock from "./models/CodeBlock"; 

const PORT = process.env.PORT;
const server = http.createServer(app);
const BASE_URL = process.env.BASE_URL;

const io = new Server(server, {
  cors: {
    origin:  ['https://moveo-codeblock.netlify.app', 'http://localhost:3000'],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

type RoomData = {
  mentorId: string | null;
  participants: Set<string>;
};

export const rooms: Record<string, RoomData> = {};
const emitStudentCount = (roomId: string) => {
  const room = rooms[roomId];
  if (!room) return;
  const studentCount = room.participants.size - (room.mentorId ? 1 : 0);
  io.to(roomId).emit("update-student-count", studentCount);
};
type CodeBlockType = {
  _id: string;
  solution: string;
  explanation: string; 
};
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

    if (!mentorStillConnected) {
      room.mentorId = socket.id;
      socket.emit("role", "mentor");
      console.log(`🎓 Mentor assigned to room ${roomId}`);
    } else {
      socket.emit("role", "student");
      emitStudentCount(roomId);
      console.log(`🧑‍🎓 Student joined room ${roomId}`);
    }
  });

  socket.on("code-change", ({ roomId, code }) => {
    socket.to(roomId).emit("code-change", code);
  
    const currentBlock = codeBlocks.find((b) => b._id === roomId);
  
    const normalize = (str: string) => str.replace(/\s/g, "").trim();
  
    if (currentBlock && normalize(code) === normalize(currentBlock.solution)) {
  
      io.to(roomId).emit("show-full-solution", {
        code: currentBlock.solution,
        explanation: currentBlock.explanation,
      });
      const room = rooms[roomId];
    if (room && socket.id !== room.mentorId) {
      io.to(roomId).emit("show-smiley");
    }
    }
  });
  
  socket.on("show-solution", (roomId: string) => {
    const block = codeBlocks.find((b) => b._id === roomId);
    if (block) {
      io.to(roomId).emit("show-full-solution", {
        code: block.solution,
        explanation: block.explanation
      });
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
      }else {
        emitStudentCount(roomId);
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
        explanation: block.explanation,
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
