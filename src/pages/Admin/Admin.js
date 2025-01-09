import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import AdminNav from '../../components/Admin/Admin-Nav';
import './Admin.css'; // You can add styles for the main layout if needed
import Header from '../../components/Header-New';
const Admin = () => {
  const navigate = useNavigate();

  // React.useEffect(() => {
  //   navigate("/admin/users");
  // }, []);

  return (
    <div className='AdminPage' style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <div style={{ display: 'flex', flexGrow: 1 }}>
        <AdminNav />
        <div style={{ flexGrow: 1, padding: '20px', overflowY: 'auto' }}>
          <Outlet /> {/* Outlet will render the component for the current route */}
        </div>
      </div>
    </div>
  );
};

export default Admin;
