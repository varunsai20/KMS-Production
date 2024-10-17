import "./App.css";
import Lander from "./pages/LandingPage/Lander-Logedin";
import ArticlePage from "./pages/ArticlePage/ArticlePage";
import SearchResults from "./pages/SearchResultsPage/SearchResults";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Lander />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/article/:pmid" element={<ArticlePage />} />
        </Routes>
        </div>  
    </Router>
  );
}

export default App;
