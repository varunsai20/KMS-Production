import "./App.css";
import Lander from "./pages/LandingPage/Lander-Logedin";
import ArticlePage from "./pages/ArticlePage/ArticlePage";
import SearchResults from "./pages/SearchResultsPage/SearchResults";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Authentication/Login/Login";
import SignUpForm from "./pages/Authentication/SignUp/Signup";
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<SignUpForm />} />
          <Route path="/Login" element={<Login/>}></Route>
          <Route path="/search" element={<SearchResults />} />
          <Route path="/article/:pmid" element={<ArticlePage />} />
        </Routes>
        </div>  
    </Router>
  );
}

export default App;
