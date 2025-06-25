import React, { useEffect, useState } from 'react'
import { useAppSelector } from '../hooks/redux-hooks';
import { Outlet, useNavigate } from 'react-router-dom';

const PrivateRoute = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? <Outlet /> : null;
};

export default PrivateRoute;