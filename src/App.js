import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Lander from "./pages/LandingPage/Lander-Logedin";
import Login from "./pages/Authentication/Login/Login";
import SignUpForm from "./pages/Authentication/SignUp/Signup";
import SearchResults from "./pages/SearchResultsPage/SearchResults";
import ArticlePage from "./pages/ArticlePage/ArticlePage";
import CreateResearcher from './pages/Admin/CreateResearcher';
import CreateAdmin from './pages/Admin/CreateAdmins';
import Admin from './pages/Admin/Admin';
import Dashboard from './pages/Admin/Dashboard';
import Researchers from './pages/Admin/Researchers';
import AdminComp from './pages/Admin/Admin-Comp';
import Profile from './components/Profile';
import EditResearcher from './pages/Admin/EditResearcher';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Lander />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/article/:pmid" element={<ArticlePage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Admin />}>
            <Route path="users" element={<Researchers />} />
            <Route path="users/create" element={<CreateResearcher />} />
            <Route path="users/edit/:user_id" element={<EditResearcher />} />
            <Route path="users/profile/:user_id" element={<Profile />} />
          </Route>

          {/* User Profile Route */}
          <Route path="/users/profile/:user_id" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
