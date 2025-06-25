import React, { JSX, useEffect } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux-hooks';

const AdminRoute = () => {
  const { profilUtilisateur } = useAppSelector((state) => state.auth);
  
    const navigate = useNavigate();
  
    useEffect(()=> {
      if(!profilUtilisateur || profilUtilisateur.id_role !== 1) {
        navigate("/login");
      }
    },[navigate, profilUtilisateur])



  return <Outlet />;
};

export default AdminRoute;