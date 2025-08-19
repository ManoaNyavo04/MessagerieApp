
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // ou votre StyledLink personnalisé
// import SelectBox from '@/components/SelectBox'; // adapter selon votre structure
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DevicesIcon from '@mui/icons-material/Devices';
import SelectBox from './SelectBox';
import { addNavigation } from '../../Slices/listeNavigationSlice';
import { styled } from '@mui/material';

const StyledLink = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: 'inherit',
  ":hover": {
    background: '#acb2d5',
    fontFamily: 'Rubik',
  },
  fontFamily: 'Rubik',

}))
type PathToActiveBox = {
  [key: string]: number;
};

const AdminMenu = () => {
  return (
    <>
            {/* <StyledLink to={""}>
            <SelectBox
            // isActive={activeBox === 1}
                  onClick={() => { addNavigation({ title: "Tableau de bord", link: "/", isActive: true }); }}>
                <ListItemButton>
                <ListItemIcon sx={{ marginRight: -2.5 }}>
                    <DevicesIcon sx={{color: 'white'}}/>
                </ListItemIcon>
                <ListItemText primaryTypographyProps={{ sx: { fontWeight: 'bold' } }}  primary="Gestion espace de travail" />
                </ListItemButton>
            </SelectBox>
            </StyledLink> */}

            <StyledLink to={"/gestion-utilisateur"}>
            <SelectBox onClick={() => { addNavigation({ title: "Gestion des utilisateurs", link: "/gestion-utilisateur", isActive: true }); }}>
                <ListItemButton>
                <ListItemIcon sx={{ marginRight: -2.5 }}>
                    <DevicesIcon sx={{color: 'white'}}/>
                </ListItemIcon>
                <ListItemText primaryTypographyProps={{ sx: { fontWeight: 'bold' } }}  primary="Membres" />
                </ListItemButton>
            </SelectBox>
            </StyledLink>
        </>
  )
}

export default AdminMenu