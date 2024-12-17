import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const RestrictedRoute = ({ children }) => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RestrictedRoute;
