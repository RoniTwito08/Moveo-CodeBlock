import { BrowserRouter, Routes, Route } from "react-router-dom";
import LobbyPage from "./pages/lobbyPage/LobbyPage";
import CodeBlockPage from "./pages/codeBlockPage/CodeBlockPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LobbyPage />} />
        <Route path="/code-block/:id" element={<CodeBlockPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
