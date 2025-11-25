import React from 'react';
import { Link } from 'react-router-dom';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ChatIcon from '@mui/icons-material/Chat';
import AddIcon from '@mui/icons-material/Add';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material';
import SelectBox from './SelectBox';
import { addNavigation } from '../../Slices/listeNavigationSlice';

const StyledLink = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: 'inherit',
  ":hover": {
    background: '#acb2d5',
    fontFamily: 'Rubik',
  },
  fontFamily: 'Rubik',
}));

const UserMenu = () => {
  return (
    <>
      {/* ======= MENU : Discussion ======= */}
      <StyledLink to={"/messagerie"}>
        <SelectBox onClick={() => { addNavigation({ title: "Discussion", link: "/messagerie", isActive: true }); }}>
          <ListItemButton>
            <ListItemIcon sx={{ marginRight: -2.5 }}>
              <Tooltip title="Ouvrir la messagerie" arrow placement="right">
                <ChatIcon sx={{ color: 'white' }} />
              </Tooltip>
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ sx: { fontWeight: 'bold' } }} primary="Discussion" />
          </ListItemButton>
        </SelectBox>
      </StyledLink>

      

      {/* ======= MENU : Membre Espace de travail ======= */}
      <StyledLink to={"/membre-espace-travail"}>
        <SelectBox onClick={() => { addNavigation({ title: "Membre", link: "", isActive: true }); }}>
          <ListItemButton>
            <ListItemIcon sx={{ marginRight: -2.5 }}>
              <Tooltip title="Membre de l'espace de travail" arrow placement="right">
                <GroupAddIcon sx={{ color: 'white' }} /> 
              </Tooltip>
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ sx: { fontWeight: 'bold' } }} primary="Membre" />
          </ListItemButton>
        </SelectBox>
      </StyledLink>
    </>
  );
};

export default UserMenu;
