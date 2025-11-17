import { Button, IconButton } from '@mui/material'
import React from 'react'
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../Slices/authSlice';
import { Logout } from '@mui/icons-material';

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
    <IconButton sx={{ color : '#cad2da' }} onClick={handleLogout}>
        <Logout />
        {/* Se Deconnecter */}
    </IconButton>
  )
}

export default BtnLogout