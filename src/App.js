import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import Lander from "./pages/LandingPage/Lander-Logedin";
import Login from "./pages/Authentication/Login/Login";
import SignUpForm from "./pages/Authentication/SignUp/Signup";
import SearchResults from "./pages/SearchResultsPage/SearchResults";
import ArticlePage from "./pages/ArticlePage/ArticlePage";
import CreateResearcher from "./pages/Admin/CreateResearcher";
import Admin from "./pages/Admin/Admin";
import Researchers from "./pages/Admin/Researchers";
import Profile from "./components/Profile";
import EditResearcher from "./pages/Admin/EditResearcher";
import ProtectedRoute from "./protectedRoute";
import DeriveInsights from "./pages/ArticlePage/DeriveInsights";
import LogoutHandler from "./LogoutHandler";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Error500 from "./utils/Error500";

function App() {
  const deriveInsights = useSelector((state) => state.deriveInsights?.active);

  return (
    <Router>
      <LogoutHandler>
        <div className="App">
          <ToastContainer />
          <Routes>
            <Route path="/" element={<Lander />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUpForm />} />
            <Route path="/deriveinsights" element={<DeriveInsights />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/server-error" element={<Error500 />} />

            {/* Conditional Route for Articles */}
            {deriveInsights ? (
              <Route
                path="/article"
                element={<ArticlePage key="static-article" />} // Use key for static
              />
            ) : (
              <Route
                path="/article/:pmid"
                element={<ArticlePage key="dynamic-article" />} // Use key for dynamic
              />
            )}

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            >
              <Route path="users" element={<Researchers />} />
              <Route path="users/create" element={<CreateResearcher />} />
              <Route path="users/edit/:user_id" element={<EditResearcher />} />
              <Route path="users/profile/:user_id" element={<Profile />} />
            </Route>

            {/* Profile Route */}
            <Route
              path="/users/profile/:user_id"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Redirect unmatched routes */}
            {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
          </Routes>
        </div>
      </LogoutHandler>
    </Router>
  );
}

export default App;
