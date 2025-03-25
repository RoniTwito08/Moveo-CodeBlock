import http from "http";
import app, { connectDB } from "./server";
import { Server } from "socket.io";
import CodeBlock from "./models/CodeBlock"; 
import { setupSocket } from "./socket/socketHandlers";

const PORT = process.env.PORT;
const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin:  ['https://moveo-codeblock.netlify.app', 'http://localhost:5173'],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
export const rooms: Record<string, { mentorId: string | null; participants: Set<string> }> = {};

const codeBlocks: { _id: string; solution: string; explanation: string }[] = [];


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
    setupSocket(io, rooms, codeBlocks);
    server.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  });
