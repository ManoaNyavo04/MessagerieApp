
import React, { useState } from 'react';
import { Link as StyledLink } from 'react-router-dom'; // ou votre StyledLink personnalisé
// import SelectBox from '@/components/SelectBox'; // adapter selon votre structure
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DevicesIcon from '@mui/icons-material/Devices';

const AdminMenu = () => {
  return (
    <>
            <StyledLink to={""}>
            {/* <SelectBox> */}
                <ListItemButton>
                <ListItemIcon sx={{ marginRight: -2.5 }}>
                    <DevicesIcon sx={{color: 'white'}}/>
                </ListItemIcon>
                <ListItemText primaryTypographyProps={{ sx: { fontWeight: 'bold' } }}  primary="Gestion espace de travail" />
                </ListItemButton>
            {/* </SelectBox> */}
            </StyledLink>

            <StyledLink to={"/gestion-utilisateur"}>
            {/* <SelectBox> */}
                <ListItemButton>
                <ListItemIcon sx={{ marginRight: -2.5 }}>
                    <DevicesIcon sx={{color: 'white'}}/>
                </ListItemIcon>
                <ListItemText primaryTypographyProps={{ sx: { fontWeight: 'bold' } }}  primary="Membres" />
                </ListItemButton>
            {/* </SelectBox> */}
            </StyledLink>
        </>
  )
}

export default AdminMenu