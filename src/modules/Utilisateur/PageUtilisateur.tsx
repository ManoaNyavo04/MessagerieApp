import React, { useEffect, useState } from 'react'
import { getAllUtilisateursService, rafraichir, Utilisateur } from './UtilisateurService';
import { Alert, Button, Chip, Grid, IconButton, Menu, MenuItem, Paper, Snackbar, Tooltip } from '@mui/material';
import GenericList from '../shared/components/GenericList';
import { FileOpen, MoreVert as MoreVertIcon, AdminPanelSettings as AdminPanelSettingsIcon, Person as PersonIcon, Refresh as RefreshIcon, Add as AddIcon } from '@mui/icons-material';
import FormUtilisateur from './FormUtilisateur';
import { addNavigation } from '../shared/Slices/listeNavigationSlice';
import { useAppDispatch } from '../shared/hooks/redux-hooks';
import FormAffectationUtilisateur from '../EspaceTravail/FormAffectationUtilisateur';

interface PageUtilisateurProps {
  onClose?: () => void;
}

const PageUtilisateur = ({ onClose }: PageUtilisateurProps) => {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [openAffectation, setOpenAffectation] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");



  const viewUser = (id: number) => {
    const user = utilisateurs.find(u => u.id === id);
    if (user) {
      console.log("Utilisateur sélectionné :", user);
    } else {
      console.warn("Utilisateur non trouvé pour l'id :", id);
    }
  };


  useEffect(() => {
    const token = localStorage.getItem("token"); // ou sessionStorage ou context
    if (!token) {
      console.error("Aucun token trouvé.");
      return;

    }

    getAllUtilisateursService(token)
      .then(data => {
        const dataAvecId = data.map(u => ({
          ...u,
          id: u.id_utilisateur // ✅ ici et pas u.id
        }));
        setUtilisateurs(dataAvecId);
      })
      .catch(err => {
        console.error("Erreur API :", err);
      });
  }, []);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<Utilisateur | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, user: Utilisateur) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };


  const handleEdit = () => {
    setOpenForm(true);
    handleMenuClose();
  };

  const handleDelete = () => {
    console.log("🗑️ Supprimer utilisateur :", selectedUser);
    handleMenuClose();
  };
  const handleOpenAffectation = () => {
    if (selectedUser) setOpenAffectation(true);
    handleMenuClose();
  };


  const handleCloseAffectation = () => {
    setOpenAffectation(false);
  };


  const actionColumn = {
    field: "actions",
    headerName: "Actions",
    width: 100,
    sortable: false,
    renderCell: (params: any) => (
      <>
        <IconButton onClick={(e) => handleMenuClick(e, params.row)}>
          <MoreVertIcon />
        </IconButton>
      </>
    )
  };

  const refreshData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Aucun token trouvé pour rafraîchir.");
      return;
    }

    try {
      const refresh = await rafraichir(token);

      // ⚠️ Si ton backend ne renvoie qu’un message (et non la liste complète),
      // recharge quand même les utilisateurs depuis l’API principale
      const newData = await getAllUtilisateursService(token);
      const dataAvecId = newData.map((u: any) => ({
        ...u,
        id: u.id_utilisateur
      }));

      // 🔍 Comparaison entre l’ancienne et la nouvelle liste
      const anciensIds = utilisateurs.map(u => u.id_utilisateur).sort();
      const nouveauxIds = dataAvecId.map(u => u.id_utilisateur).sort();

      const isIdentique =
        anciensIds.length === nouveauxIds.length &&
        anciensIds.every((id, idx) => id === nouveauxIds[idx]);

      if (isIdentique) {
        setSnackbarMessage("⚠️ Aucune mise à jour détectée.");
        setSnackbarSeverity("error");
      } else {
        setSnackbarMessage("✅ Synchronisation terminée avec succès !");
        setSnackbarSeverity("success");
      }

      setSnackbarOpen(true);
      setUtilisateurs(dataAvecId);

    } catch (err) {
      console.error("Erreur lors du rafraîchissement :", err);
      setSnackbarMessage("❌ Erreur lors du rafraîchissement.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };




  const columns = [
  actionColumn,
  {
    field: "role",
    headerName: "Rôle",
    width: 120,
    renderCell: (params: any) => {
      if (params.value === "admin") {
        return (
          <Tooltip title="Administrateur">
            <Chip
              icon={<AdminPanelSettingsIcon style={{ color: 'f87171', fontSize: 18 }} />}
              // label="Admin"
              // size="small"
              // sx={{ bgcolor: '#f87171', color: 'white', fontWeight: 'bold' }}
            />
          </Tooltip>
        )
      } else {
        return (
          <Tooltip title="Utilisateur">
            <Chip
              icon={<PersonIcon style={{ color: 'purple', fontSize: 20 }} />}
              // label="User"
              // size="small"
              sx={{ color: 'purple', fontWeight: 'bold' }}
            />
          </Tooltip>
        )
      }
    }
  },
  
  { field: "matricule", headerName: "Matricule", width: 150, sortable: true  },
  { field: "nom", headerName: "Nom", width: 150, sortable: true  },
  { field: "prenom", headerName: "Prénom", width: 150, sortable: true  },
  
];


  const handleOpenForm = () => setOpenForm(true);
  const handleCloseForm = () => setOpenForm(false);



  return (
    <>
      <Grid container spacing={1} sx={{ mt: 4 }}>
        <Grid item xs={12} md={12}>
          <Paper elevation={3} sx={{ p: 4, pt: 0.1 }} >

            <h3 style={{ marginBottom: -30, fontFamily: 'Rubik', fontSize: 20 }}>
              Liste des utilisateurs
            </h3>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 15 }}>
              {/* {(context.isAdminLogistique || context.isInformaticien) && */}
              <>
                {/* <FormArticle executable={actualiserDonnees} /> */}
                <Button size="large" sx={{ border: 'none' }} variant='outlined' onClick={handleOpenForm}>
                 <AddIcon />
                </Button>
                <Button size="large" sx={{ border: 'none' }} variant='outlined' onClick={refreshData}><RefreshIcon /></Button>
              </>
              {/* } */}
            </div>

            <GenericList<Utilisateur>
              rowClick={viewUser}
              columns={columns}
              rows={utilisateurs}


            />
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleEdit}>Modifier</MenuItem>
              <MenuItem onClick={handleDelete}>Supprimer</MenuItem>
              <MenuItem onClick={handleOpenAffectation}>Affecter</MenuItem>
            </Menu>

            <FormUtilisateur open={openForm} onClose={handleCloseForm} />
            <FormAffectationUtilisateur
              open={openAffectation}
              onClose={handleCloseAffectation}
              selectedUser={selectedUser}
            />

          </Paper>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Alert
              onClose={() => setSnackbarOpen(false)}
              severity={snackbarSeverity}
              variant="filled"
              sx={{ width: "100%", height: '200%' }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Grid>
      </Grid>
    </>
  )
}

export default PageUtilisateur


