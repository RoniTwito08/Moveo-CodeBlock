import { useEffect, useState } from "react";
import { useNavigate ,useLocation } from "react-router-dom";
import { fetchCodeBlocks, fetchActiveCodeBlockIds } from "../../services/api"; 
import styles from "./LobbyPage.module.css";

interface CodeBlock {
  _id: string;
  title: string;
  initialCode: string;
  solution: string;
  explanation: string;
  difficulty: number;
}

const LobbyPage = () => {
  const [blocks, setBlocks] = useState<CodeBlock[]>([]);
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const navigate = useNavigate();
  

  useEffect(() => {
    const getBlocks = async () => {
      try {
        const data = await fetchCodeBlocks();
        setBlocks(data);
      } catch (err) {
        console.error("❌ Failed to fetch code blocks:", err);
      }
    };

    getBlocks();
  }, []);

  useEffect(() => {
    const getActive = async () => {
      try {
        const ids = await fetchActiveCodeBlockIds();
        setActiveIds(ids);
      } catch (err) {
        console.error("❌ Failed to fetch active code blocks:", err);
      }
    };

    getActive();
    const interval = setInterval(getActive, 3000); 
    return () => clearInterval(interval);
  }, []);

  const handleClick = (blockId: string) => {
    navigate(`/code-block/${blockId}`);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Choose Code Block</h1>
      <div className={styles.blocks}>
      {blocks.map((block) => (
      <button
        key={block._id}
        onClick={() => handleClick(block._id)}
        className={`${styles.blockButton} ${
        activeIds.length > 0 && !activeIds.includes(block._id) ? styles.hidden : ""
    }`}
  >
      <div className={styles.blockTitle}>{block.title}</div>
      <div className={styles.difficulty}>
          {"⭐".repeat(block.difficulty)}
          {"☆".repeat(5 - block.difficulty)}
      </div>
      </button>
        ))}
      </div>
    </div>
  );
};

export default LobbyPage;
