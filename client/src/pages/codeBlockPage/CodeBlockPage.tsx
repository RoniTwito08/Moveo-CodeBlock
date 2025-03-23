import { useEffect, useState  } from "react";
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
  const [role, setRole] = useState<"mentor" | "student">("student");
  const navigate = useNavigate();



  useEffect(() => {
    if (!blockId) return;

    const fetchBlock = async () => {
      try {
        const data = await fetchCodeBlockById(blockId);
        setBlock(data);
      } catch (err) {
        console.error("❌ Failed to fetch code block:", err);
      }
    };

    fetchBlock();
  }, [blockId]);

  
  useEffect(() => {
    socket.on("room-closed", () => {
      alert("🚪 The mentor left the room. You'll be redirected to the lobby.");
      navigate("/");
    });
  
    return () => {
      socket.off("room-closed");
    };
  }, []);
  useEffect(() => {
    if (!blockId) return;
  
    socket.emit("join-room", blockId); 
  
    const handleRole = (receivedRole: "mentor" | "student") => {
      setRole(receivedRole);
      console.log(`👤 Assigned role: ${receivedRole}`);
    };
  
    socket.on("role", handleRole);
  
    return () => {
      socket.emit("leave-room", blockId); 
      socket.off("role", handleRole);
    };
  }, [blockId]);
  

  if (!block) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{block.title}</h1>
      <h3 className={styles.role}>
        Role: {role === "mentor" ? "👨‍🏫 Mentor" : "🧑‍🎓 Student"}
      </h3>

      <Editor
        height="600px"
        width="1000px"
        defaultLanguage="javascript"
        defaultValue={block.initialCode}
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
