import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import AdminNav from '../../components/Admin/Admin-Nav';
import './Admin.css'; // You can add styles for the main layout if needed

const Admin = () => {
  const navigate = useNavigate();

  // Optionally redirect to Dashboard by default
  React.useEffect(() => {
    navigate("/admin/dashboard");
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      <AdminNav />
      <div style={{ width: '-webkit-fill-available' }}>
        <Outlet /> {/* Outlet will render the component for the current route */}
      </div>
    </div>
  );
};

export default Admin;
