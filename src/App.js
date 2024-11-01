import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import dayjs from 'dayjs';
import Lander from "./pages/LandingPage/Lander-Logedin";
import Login from "./pages/Authentication/Login/Login";
import SignUpForm from "./pages/Authentication/SignUp/Signup";
import SearchResults from "./pages/SearchResultsPage/SearchResults";
import ArticlePage from "./pages/ArticlePage/ArticlePage";
import CreateResearcher from './pages/Admin/CreateResearcher';
import CreateAdmin from './pages/Admin/CreateAdmins';
import Admin from './pages/Admin/Admin';
import Researchers from './pages/Admin/Researchers';
import Profile from './components/Profile';
import EditResearcher from './pages/Admin/EditResearcher';
import ProtectedRoute from './protectedRoute';
import { login,updateTokens } from "./redux/reducers/LoginAuth"; // Import login action

function App() {
  const dispatch = useDispatch();
  const { access_token, refresh_token, user_id, iat, exp } = useSelector((state) => state.auth);
  const checkAndRefreshToken = async () => {
    const now = dayjs().unix();
    const expirationTime = exp - 60; // Check for refresh 1 minute before expiration
  
    if (now >= expirationTime) {
      try {
        const response = await axios.post('http://13.127.207.184:80/auth/refresh', {
          refresh_token,
        });
  
        dispatch(
          updateTokens({
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
            iat: response.data.iat,
            exp: response.data.exp,
          })
        );
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (access_token && refresh_token && exp) {
        checkAndRefreshToken();
      }
    }, 1800 * 1000); // Check every minute (60,000 milliseconds)
  
    return () => clearInterval(interval);
  });
  

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Lander />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUpForm />} />

          {/* Protected Routes */}
          <Route path="/search" element={<SearchResults />} />
          <Route path="/article/:pmid" element={<ArticlePage />} />

          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>}>
            <Route path="users" element={<Researchers />} />
            <Route path="users/create" element={<CreateResearcher />} />
            <Route path="users/edit/:user_id" element={<EditResearcher />} />
            <Route path="users/profile/:user_id" element={<Profile />} />
          </Route>

          {/* User Profile Route */}
          <Route path="/users/profile/:user_id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;