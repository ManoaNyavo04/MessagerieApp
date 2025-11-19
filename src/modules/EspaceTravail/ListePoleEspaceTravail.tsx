import React, { useEffect, useState } from 'react'
import { deleteEspaceTravail, EspaceTravailWithPole, getAllPoleEspaceTravail } from './EspaceTravailService';
import { Alert, Button, Grid, IconButton, Menu, MenuItem, Paper, Snackbar } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import GenericList from '../shared/components/GenericList';

interface ListePoleEspaceTravailProps {
    onClose?: () => void;
}

const ListePoleEspaceTravail = ({ onClose }: ListePoleEspaceTravailProps) => {
    const [poles, setPoles] = useState<EspaceTravailWithPole[]>([]);
    const [openForm, setOpenForm] = useState(false);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedPole, setSelectedPole] = useState<EspaceTravailWithPole | null>(null);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const viewPole = (id: number) => {
        const pole = poles.find(u => u.idEspaceTravail === id);
        if (pole) {
            console.log("Utilisateur sélectionné :", pole);
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

        getAllPoleEspaceTravail(token)
            .then(data => {
                const dataAvecId = data.map(u => ({
                    ...u,
                    id: u.idEspaceTravail // ✅ ici et pas u.id
                }));
                setPoles(dataAvecId);
            })
            .catch(err => {
                console.error("Erreur API :", err);
            });
    }, []);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, user: EspaceTravailWithPole) => {
        setAnchorEl(event.currentTarget);
        setSelectedPole(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };


    const handleEdit = () => {
        setOpenForm(true);
        handleMenuClose();
    };

    const handleDelete = async () => {
        console.log("🗑️ Supprimer utilisateur :", selectedPole);
        if (!selectedPole) return;

        const confirmDel = window.confirm("Voulez-vous vraiment supprimer cet espace ?");
        if (!confirmDel) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("Token manquant");
                return;
            }

            // 🔥 Appel API
            await deleteEspaceTravail(selectedPole.idEspaceTravail, token);

            // 🆕 Mise à jour UI (sans recharger toute la page)
            setPoles(prev => prev.filter(p => p.idEspaceTravail !== selectedPole.idEspaceTravail));

            setSnackbarMessage("✅ Espace de travail créé avec succès !");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);

            setTimeout(() => {
                onClose?.();
            }, 1000);

            console.log("Espace supprimé avec succès");

        } catch (err) {
            console.error("Erreur suppression:", err);
        }

        handleMenuClose();
    };

    const handleOpenForm = () => setOpenForm(true);
    const handleCloseForm = () => setOpenForm(false);

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

    const columns = [
        actionColumn,
        { field: "nom", headerName: "Espace de travail", width: 150, sortable: true },
        { field: "pole", headerName: "Pôle", width: 250, sortable: true },

    ];
    return (
        <>
            <Grid container spacing={1} sx={{ mt: 4 }}>
                <Grid item xs={12} md={12}>
                    <Paper elevation={3} sx={{ p: 4, pt: 0.1 }} >

                        <h3 style={{ marginBottom: -30, fontFamily: 'Rubik', fontSize: 20 }}>
                            Liste des espaces de travail
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 15 }}>
                            {/* {(context.isAdminLogistique || context.isInformaticien) && */}
                            <>
                                {/* <FormArticle executable={actualiserDonnees} /> */}
                                <Button size="large" sx={{ border: 'none' }} variant='outlined' onClick={handleOpenForm}>
                                    <AddIcon />
                                </Button>
                            </>
                            {/* } */}
                        </div>

                        <GenericList<EspaceTravailWithPole>
                            rowClick={viewPole}
                            columns={columns}
                            rows={poles}


                        />
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            <MenuItem onClick={handleDelete}>Supprimer</MenuItem>
                        </Menu>

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
                            sx={{ width: "100%" }}
                        >
                            {snackbarMessage}
                        </Alert>
                    </Snackbar>

                </Grid>
            </Grid>
        </>
    )
}

export default ListePoleEspaceTravail