import React, { useState } from 'react';
import { Link as StyledLink } from 'react-router-dom'; // ou votre StyledLink personnalisé
// import SelectBox from '@/components/SelectBox'; // adapter selon votre structure
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DevicesIcon from '@mui/icons-material/Devices';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import ChatIcon from '@mui/icons-material/Chat';


const UserMenu = () => {
  return (
    <>
            <StyledLink to={""}>
            {/* <SelectBox> */}
                <ListItemButton>
                <ListItemIcon sx={{ marginRight: -2.5 }}>
                    <ChatIcon  sx={{color: 'white'}}/>
                </ListItemIcon>
                <ListItemText primaryTypographyProps={{ sx: { fontWeight: 'bold' } }}  primary="Discussion" />
                </ListItemButton>
            {/* </SelectBox> */}
            </StyledLink>

            <StyledLink to={""}>
            {/* <SelectBox> */}
                <ListItemButton>
                <ListItemIcon sx={{ marginRight: -2.5 }}>
                    <WorkspacesIcon  sx={{color: 'white'}}/>
                </ListItemIcon>
                <ListItemText primaryTypographyProps={{ sx: { fontWeight: 'bold' } }}  primary="Espace de travail" />
                </ListItemButton>
            {/* </SelectBox> */}
            </StyledLink>
        </>
  )
}

export default UserMenu