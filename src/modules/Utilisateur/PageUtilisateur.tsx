import React, { useEffect, useState } from 'react'
import { getAllUtilisateursService, Utilisateur } from './UtilisateurService';
import { Button, Grid, Paper } from '@mui/material';
import GenericList from '../shared/components/GenericList';
import { FileOpen } from '@mui/icons-material';

const PageUtilisateur = () => {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);

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



  const columns = [
    { field: "nom", headerName: "Nom", width: 150 },
    { field: "prenom", headerName: "Prénom", width: 150 },
    { field: "matricule", headerName: "Matricule", width: 150 },
    { field: "id_role", headerName: "Rôle", width: 120 },
  ];

  return (
    <>
      <Grid container spacing={1} sx={{ mt: 4 }}>
        <Grid item xs={12} md={12}>
          <Paper elevation={3} sx={{ p: 4, pt: 0.1 }} >

            <h3 style={{ marginBottom: -30, fontFamily: 'Rubik', fontSize: 20 }}>
              Liste des utilisateurs
            </h3>
            <div style={{ display: 'flex', justifyContent: 'flex-end' , marginBottom: 15}}>
              {/* {(context.isAdminLogistique || context.isInformaticien) && */}
                <>
                  {/* <FormArticle executable={actualiserDonnees} /> */}
                  <Button size="large" variant='outlined' startIcon={<FileOpen />} >Ajouter des utilisateurs</Button>
                  <Button size="large" variant='outlined' startIcon={<FileOpen />} >Ajouter des utilisateurs</Button>
                </>
              {/* } */}
            </div>

            <GenericList<Utilisateur>
              rowClick={viewUser}
              columns={columns}
              rows={utilisateurs}
            />
          </Paper>
        </Grid>
      </Grid>
    </>
  )
}

export default PageUtilisateur