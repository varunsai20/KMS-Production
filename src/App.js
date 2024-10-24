import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Lander from "./pages/LandingPage/Lander-Logedin";
import Login from "./pages/Authentication/Login/Login";
import SignUpForm from "./pages/Authentication/SignUp/Signup";
import SearchResults from "./pages/SearchResultsPage/SearchResults";
import ArticlePage from "./pages/ArticlePage/ArticlePage";
import CreateResearcher from './pages/Admin/CreateResearcher';
import CreateAdmin from './pages/Admin/CreateAdmins';
// Import Admin Pages
import Admin from './pages/Admin/Admin'; // Admin layout wrapper
import Dashboard from './pages/Admin/Dashboard'; // Dashboard component
import Researchers from './pages/Admin/Researchers'; // Researchers component
import AdminComp from './pages/Admin/Admin-Comp';

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
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="researchers" element={<Researchers />} />
            <Route path="researchers/create" element={<CreateResearcher />} />
            <Route path="admins/create" element={<CreateAdmin />} />
            <Route path="admins" element={<AdminComp/>}/>
            {/* Add more admin-related routes here */}
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
