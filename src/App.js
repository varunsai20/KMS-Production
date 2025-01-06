import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useDispatch } from "react-redux";
import { setDeriveInsights } from "./redux/reducers/deriveInsights";
import LogoutHandler from "./LogoutHandler";
import Lander from "./pages/LandingPage/Lander-Logedin";
import Login from "./pages/Authentication/Login/Login";
import SignUpForm from "./pages/Authentication/SignUp/Signup";
import SearchResults from "./pages/SearchResultsPage/SearchResults";
import CreateResearcher from "./pages/Admin/CreateResearcher";
import Admin from "./pages/Admin/Admin";
import Researchers from "./pages/Admin/Researchers";
import Profile from "./components/Profile";
import EditResearcher from "./pages/Admin/EditResearcher";
import ProtectedRoute from "./protectedRoute";
import DeriveInsights from "./pages/ArticlePage/DeriveInsights";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { setNavigate } from "./helpers/navigationHelper";

import Error500 from "./utils/Error500";
// import ErrorBoundary from "./utils/ErrorBoundry";

import ArticleLayout from "./pages/ArticleDerive/ArticleLayout";
import ArticleContent from "./pages/ArticleDerive/ArticleContent";
import ArticleDerive from "./pages/ArticleDerive/ArticleDerive";

function AppRoutes() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  useEffect(() => {
    if (location.pathname === "/article/derive") {
      dispatch(setDeriveInsights(true));
    } else {
      dispatch(setDeriveInsights(false));
    }
  }, [location, dispatch]);

  return (
    <div className="App">
      <ToastContainer />

      <Routes>
        <Route path="/" element={<Lander />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/server-error" element={<Error500 />} />

        {/* Restricted Routes */}
        <Route
          path="/deriveinsights"
          element={
            <ProtectedRoute>
              <DeriveInsights />
            </ProtectedRoute>
          }
        />
        <Route path="/article" element={<ArticleLayout />}>
          <Route path="derive" element={<ArticleDerive />} />
          <Route path="content/:pmid" element={<ArticleContent />} />
        </Route>
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
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
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            </ProtectedRoute>
          }
        />

        {/* Redirect unmatched routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <LogoutHandler>
        <AppRoutes />
      </LogoutHandler>
    </Router>
  );
}

export default App;
