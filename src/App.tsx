import NotebookInventoryPage from "./components/pages/NotebookInventoryPage";
import { Toaster } from "react-hot-toast";
import "./index.css";

function App() {
  return (
    <main>
      <Toaster position="top-right" />
      <NotebookInventoryPage />
    </main>
  );
}

export default App;
