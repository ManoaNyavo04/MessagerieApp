import React, { JSX } from 'react'
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux-hooks';

const AdminRoute = () => {
  const { profilUtilisateur } = useAppSelector((state) => state.auth);

  if (!profilUtilisateur || profilUtilisateur.role !== "1") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;