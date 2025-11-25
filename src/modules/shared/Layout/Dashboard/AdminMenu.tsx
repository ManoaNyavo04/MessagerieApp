
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // ou votre StyledLink personnalisé
// import SelectBox from '@/components/SelectBox'; // adapter selon votre structure
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DevicesIcon from '@mui/icons-material/Devices';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import SelectBox from './SelectBox';
import AddIcon from '@mui/icons-material/Add';
import { addNavigation } from '../../Slices/listeNavigationSlice';
import { styled, Tooltip } from '@mui/material';
import CreerEspaceTravail from '../../../EspaceTravail/CreerEspaceTravail';

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
  const [openModal, setOpenModal] = useState(false);
  const token = localStorage.getItem("token");
  return (
    <>
      

      {/* ===== AUTRE LIEN ===== */}
      <StyledLink to={"/espace-travail"}>
        <SelectBox onClick={() => addNavigation({ title: "Espace de travail", link: "/espace-travail", isActive: true })}>
          <ListItemButton>
            <ListItemIcon sx={{ marginRight: -2.5 }}>
              <Tooltip title="Espace de travail" arrow placement="right">
                <WorkspacesIcon  sx={{ color: 'white' }} />
              </Tooltip>
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ sx: { fontWeight: 'bold' } }} primary="Espace de travail" />
          </ListItemButton>
        </SelectBox>
      </StyledLink>

      <StyledLink to={"/gestion-utilisateur"}>
        <SelectBox onClick={() => addNavigation({ title: "Gestion des utilisateurs", link: "/gestion-utilisateur", isActive: true })}>
          <ListItemButton>
            <ListItemIcon sx={{ marginRight: -2.5 }}>
              <Tooltip title="Gestion des utilisateurs" arrow placement="right">
                <DevicesIcon sx={{ color: 'white' }} />
              </Tooltip>
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ sx: { fontWeight: 'bold' } }} primary="Membres" />
          </ListItemButton>
        </SelectBox>
      </StyledLink>

      {/* ===== MENU : Espace de travail ===== */}
      <SelectBox
        onClick={() => {
          setOpenModal(true);
          addNavigation({
            title: "Espace de travail",
            isActive: true
          });
        }}
      >
        <ListItemButton>
          <ListItemIcon sx={{ marginRight: -2.5 }}>
            <Tooltip title="Ajouter un espace de travail" arrow placement="right">
              <AddIcon sx={{ color: 'white' }} />
            </Tooltip>
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{ sx: { fontWeight: 'bold' } }}
            primary="Créer un espace de travail"
          />
        </ListItemButton>
      </SelectBox>

      {/* ===== MODAL ===== */}
      <CreerEspaceTravail
        open={openModal}
        onClose={() => setOpenModal(false)}
        token={token ?? ""}
        onGroupCreated={() => console.log("Groupe créé")}
      />
    </>
  );
}

export default AdminMenu