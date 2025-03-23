import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCodeBlockById } from "../../services/api";
import socket from "../../services/socket";
import styles from "./CodeBlockPage.module.css";
import Editor from "@monaco-editor/react";

interface CodeBlock {
  _id: string;
  title: string;
  initialCode: string;
  solution: string;
}

const CodeBlockPage = () => {
  const { id: blockId } = useParams<{ id: string }>();
  const [block, setBlock] = useState<CodeBlock | null>(null);
  const [code, setCode] = useState(""); 
  const [role, setRole] = useState<"mentor" | "student">("student");
  const [showSmiley, setShowSmiley] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!blockId) return;

    const fetchBlock = async () => {
      try {
        const data = await fetchCodeBlockById(blockId);
        setBlock(data);
        setCode(data.initialCode); 
      } catch (err) {
        console.error("❌ Failed to fetch code block:", err);
      }
    };

    fetchBlock();
  }, [blockId]);

  useEffect(() => {
    if (!blockId) return;
  
    socket.emit("join-room", blockId);
  
    socket.on("role", (receivedRole: "mentor" | "student") => {
      setRole(receivedRole);
    });
  
    socket.on("code-change", (newCode: string) => {
      setCode(newCode);
    });
  
    socket.on("show-smiley", () => {
      setShowSmiley(true);
    });
  
    socket.on("room-closed", () => {
      alert("🚪 The mentor left the room. You'll be redirected to the lobby.");
      navigate("/");
    });
  
    return () => {
      socket.emit("leave-room", blockId);
      socket.off("role");
      socket.off("code-change");
      socket.off("show-smiley");
      socket.off("room-closed");
    };
  }, [blockId]);
  
 
  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      socket.emit("code-change", { roomId: blockId, code: value });
    }
  };

  if (!block) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{block.title}</h1>
      <h3 className={styles.role}>
        Role: {role === "mentor" ? "👨‍🏫 Mentor" : "🧑‍🎓 Student"}
      </h3>
     { showSmiley && (
       <div className={styles.smiley}>
       🎉 Correct! Great job!
     </div>
)    }

      <Editor
        height="600px"
        width="1000px"
        defaultLanguage="javascript"
        value={code}
        onChange={handleCodeChange}
        theme="vs-dark"
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          readOnly: role === "mentor",
        }}
      />
    </div>
  );
};

export default CodeBlockPage;
