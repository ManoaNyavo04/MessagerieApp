import { Button } from '@mui/material'
import React from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../Slices/authSlice';

const BtnLogout = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { profilUtilisateur } = useAppSelector((state) => state.auth);

    const handleLogout = async () => {
        try {
            dispatch(logout());
            localStorage.removeItem("token");
            navigate("/login");
        } catch (e) {
        console.error(e);
        }
    };
  return (
    <Button variant="contained" sx={{ borderRadius : 2 }}  onClick={handleLogout} >
              Se Deconnecter


    </Button>
  )
}

export default BtnLogout