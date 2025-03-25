import { useEffect } from "react";
import socket from "../services/socket";
import { useNavigate } from "react-router-dom";

type Role = "mentor" | "student";

interface UseCodeBlockSocketProps {
  blockId: string;
  setRole: (role: Role) => void;
  setCode: (code: string) => void;
  setExplanation: (text: string) => void;
  setShowSmiley: (show: boolean) => void;
  setStudentCount: (count: number) => void;
}

const useCodeBlockSocket = ({
  blockId,
  setRole,
  setCode,
  setExplanation,
  setShowSmiley,
  setStudentCount,
}: UseCodeBlockSocketProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!blockId) return;

    socket.emit("join-room", blockId);

    socket.on("role", setRole);

    socket.on("show-full-solution", ({ code, explanation }) => {
      setCode(code);
      setExplanation(explanation);
    });

    socket.on("code-change", setCode);
    socket.on("show-smiley", () => setShowSmiley(true));
    socket.on("update-student-count", setStudentCount);

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
      socket.off("update-student-count");
      socket.off("show-full-solution");
    };
  }, [blockId]);
};

export default useCodeBlockSocket;
