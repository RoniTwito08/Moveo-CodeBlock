import { Server, Socket } from "socket.io";

type RoomData = {
  mentorId: string | null;
  participants: Set<string>;
};

type CodeBlockType = {
  _id: string;
  solution: string;
  explanation: string;
};

//counter for the current student in a room
const emitStudentCount = (io: Server, roomId: string, rooms: Record<string, RoomData>) => {
  const room = rooms[roomId];
  if (!room) return;
  const studentCount = room.participants.size - (room.mentorId ? 1 : 0);
  io.to(roomId).emit("update-student-count", studentCount);
};

// Main socket.io setup function
export const setupSocket = (
  io: Server,
  rooms: Record<string, RoomData>,
  codeBlocks: CodeBlockType[]
) => {
  io.on("connection", (socket: Socket) => {
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

      const mentorStillConnected = room.mentorId && room.participants.has(room.mentorId);

      if (!mentorStillConnected) {
        room.mentorId = socket.id;
        socket.emit("role", "mentor");
        console.log(`🎓 Mentor assigned to room ${roomId}`);
      } else {
        socket.emit("role", "student");
        emitStudentCount(io, roomId, rooms);
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
          explanation: block.explanation,
        });
      }
    });
    socket.on("mentor-disconnect", (roomId: string) => {
      const room = rooms[roomId];
        if (room && socket.id === room.mentorId) {
          io.to(roomId).emit("room-closed");
          delete rooms[roomId];
          console.log(`👋 Mentor clicked disconnect — closed room ${roomId}`);
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
        } else {
          emitStudentCount(io, roomId, rooms);
        }
      }
    });
  });
};
