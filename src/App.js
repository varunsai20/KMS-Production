import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import Lander from "./pages/LandingPage/Lander-Logedin";
import Login from "./pages/Authentication/Login/Login";
import SignUpForm from "./pages/Authentication/SignUp/Signup";
import SearchResults from "./pages/SearchResultsPage/SearchResults";
import ArticlePage from "./pages/ArticlePage/ArticlePage";
import CreateResearcher from "./pages/Admin/CreateResearcher";
import CreateAdmin from "./pages/Admin/CreateAdmins";
import Admin from "./pages/Admin/Admin";
import Researchers from "./pages/Admin/Researchers";
import Profile from "./components/Profile";
import EditResearcher from "./pages/Admin/EditResearcher";
import ProtectedRoute from "./protectedRoute";
import DeriveInsights from "./pages/ArticlePage/DeriveInsights";
import LogoutHandler from "./LogoutHandler"; // Import the new HOC

function App() {
  const deriveInsights = useSelector((state) => state.deriveInsights?.active);
  const articlePath = deriveInsights ? "/article" : "/article/:pmid";

  return (
    <Router>
      <LogoutHandler>
        <div className="App">
          <Routes>
            <Route path="/" element={<Lander />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUpForm />} />
            <Route path="/deriveinsights" element={<DeriveInsights />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path={articlePath} element={<ArticlePage />} />

            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>}>
              <Route path="users" element={<Researchers />} />
              <Route path="users/create" element={<CreateResearcher />} />
              <Route path="users/edit/:user_id" element={<EditResearcher />} />
              <Route path="users/profile/:user_id" element={<Profile />} />
            </Route>

            <Route path="/users/profile/:user_id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
        </div>
      </LogoutHandler>
    </Router>
  );
}

export default App;
