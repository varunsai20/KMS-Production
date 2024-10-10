import "./App.css";
import LandingPage from "./pages/LandingPage/LandingPage";
import ArticlePage from "./pages/ArticlePage/ArticlePage";
import SearchResults from "./pages/SearchResultsPage/SearchResults";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import TextProvider from "./components/Notes/TextProvider";
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/article/:pmid" element={<ArticlePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
