import { Alert, Avatar, Button, Chip, Grid, Menu, Paper, Snackbar } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import React, { useEffect, useState } from 'react'
import GenericList from '../shared/components/GenericList';
import { Utilisateur } from '../Utilisateur/UtilisateurService';
import { EspaceTravailMembre, getMembreEspaceTravail } from './EspaceTravailService';
import { get } from 'http';

interface ListeMembreProps {
    onClose?: () => void;
}
const ListeMembre = ({ onClose }: ListeMembreProps) => {
    const [membres, setMembres] = useState<EspaceTravailMembre[]>([]);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const viewUser = (id: number) => {
        const user = membres.find(m => m.idUtilisateur === id);
        if (user) {
            console.log("Membre sélectionné :", user);
        } else {
            console.warn("Membre non trouvé pour l'id :", id);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token"); // ou sessionStorage ou context
        if (!token) {
            console.error("Aucun token trouvé.");
            return;
        }
        getMembreEspaceTravail(token)
            .then(data => {
                const dataAvecId = data.map(u => ({
                    ...u,
                    id: u.idUtilisateur // ✅ ici et pas u.id
                }));
                setMembres(dataAvecId);
            })
            .catch(err => {
                console.error("Erreur API :", err);
            });
    }, []);

    const getAvatarUrl = (code?: string) =>
        code
            ? `https://10.5.100.7:8888/api/Dossier/profil/${code}`
            : "/avatar-default.png";

    const columns = [
        {
            field: "avatar",
            headerName: "",
            width: 60,
            sortable: false,
            renderCell: (params: any) => (
                <Avatar
                    src={getAvatarUrl(params.row.matricule)}
                    alt={params.row.matricule}
                    sx={{ width: 36, height: 36 }}
                />
            ),
        },
        { field: "matricule", headerName: "Matricule", width: 150, sortable: true },
        { field: "nom", headerName: "Nom", width: 150, sortable: true },
        { field: "prenom", headerName: "Prénom", width: 150, sortable: true },
    ];



    return (
        <>
            <Grid container spacing={1} sx={{ mt: 4 }}>
                <Grid item xs={12} md={12}>
                    <Paper elevation={3} sx={{ p: 4, pt: 0.1 }} >

                        <h3 style={{ fontFamily: 'Rubik', fontSize: 20 }}>
                            Membres de l'espace de travail
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 15 }}>

                        </div>

                        <GenericList<EspaceTravailMembre>
                            rowClick={viewUser}
                            columns={columns}
                            rows={membres}
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

export default ListeMembre