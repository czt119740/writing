import { Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import LearnPage from "@/pages/LearnPage";
import EditorPage from "@/pages/EditorPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/learn" element={<LearnPage />} />
      <Route path="/editor" element={<EditorPage />} />
    </Routes>
  );
}
