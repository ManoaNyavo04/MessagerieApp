import { Alert, Autocomplete, Box, Button, Checkbox, FormControlLabel, Modal, Paper, Snackbar, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { searchAllUser } from '../Utilisateur/UtilisateurService';
import { createNewEspaceTravail } from './EspaceTravailService';
import { getAllPole } from '../Pole/PoleService';

interface Props {
    open: boolean;
    onClose: () => void;
    onGroupCreated?: () => void; // facultatif : pour actualiser les discussions après création
    token: string;
}
const CreerEspaceTravail: React.FC<Props> = ({ open, onClose, onGroupCreated, token }) => {
    const [step, setStep] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [userResults, setUserResults] = useState<any[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
    const [espaceName, setEspaceName] = useState('');
    const [pole, setPole] = useState<any[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [selectedPole, setSelectedPole] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);


    // Snackbar
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");


    // Rechercher utilisateur
    useEffect(() => {
        if (!searchTerm.trim()) return;

        const timeout = setTimeout(async () => {
            try {
                const res = await searchAllUser(token, searchTerm);
                console.log('Résultat de recherche :', res);

                setUserResults(res);
            } catch (err) {
                console.error("Erreur recherche utilisateurs :", err);
            }
        }, 400);

        if (open) {   // seulement quand le modal s’ouvre
            getAllPole(token)
                .then((res) => {
                    setPole(res);
                    console.log("Pôles chargés :", res);
                })
                .catch((err) => console.error("Erreur chargement pôles :", err));
        }

        return () => clearTimeout(timeout);
    }, [searchTerm, token]);

    const toggleSelect = (user: any) => {
        setSelectedUserIds(prev =>
            prev.includes(user.id_utilisateur)
                ? prev.filter(id => id !== user.id_utilisateur)
                : [...prev, user.id_utilisateur]
        );
    };

    const handleCreateEspaceTravail = async () => {
        if (!selectedPole) {
            setSnackbarMessage("⚠️ Veuillez choisir un pôle.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        setLoading(true); // démarrer le loading

        try {
            const payload = {
                nom: espaceName,
                id_pole: selectedPole?.id_pole ?? null,
                utilisateurs: selectedUserIds
            };

            const result = await createNewEspaceTravail(token, payload);

            setSnackbarMessage("✅ Espace de travail créé avec succès !");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);

            setTimeout(() => {
                onClose();
                onGroupCreated?.();
            }, 1000);

        } catch (error) {
            console.error("Erreur création groupe :", error);
            setSnackbarMessage("❌ Erreur lors de l’ajout : " + error);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            setLoading(false); // arrêter le loading
        }
    };


    const handleClose = () => {
        setStep(1);
        setSearchTerm('');
        setSelectedUsers([]);
        setEspaceName('');
        setUserResults([]);
        onClose();
    };
    return (
        <Modal open={open} onClose={handleClose}>
            <Box>
                <Paper sx={{ p: 4, width: 500, mx: 'auto', mt: 10 }}>
                    {step === 1 && (
                        <>
                            <Typography variant="h6" gutterBottom>Ajouter des membres</Typography>
                            <TextField
                                fullWidth
                                label="Rechercher utilisateur"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                sx={{ mb: 2 }}
                            />
                            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                                {userResults.map((user, index) => (
                                    <FormControlLabel
                                        key={user.id_utilisateur}
                                        control={
                                            <Checkbox
                                                checked={selectedUserIds.includes(user.id_utilisateur)}
                                                onChange={() => toggleSelect(user)}
                                            />
                                        }
                                        label={`${user.nom} ${user.prenom ?? ''} (${user.matricule})`}
                                    />
                                ))}

                                {userResults.length === 0 && <Typography>Aucun utilisateur trouvé.</Typography>}
                            </Box>
                            <Box sx={{ textAlign: 'right', mt: 2 }}>
                                <Button variant="contained" onClick={() => setStep(2)} disabled={selectedUserIds.length === 0}>
                                    Suivant
                                </Button>

                            </Box>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <Typography variant="h6" gutterBottom>Informations du groupe</Typography>

                            {/* Autocomplétion des pôles */}
                            <Autocomplete
                                options={pole}
                                value={selectedPole}
                                onChange={(event, newValue) => setSelectedPole(newValue)}
                                isOptionEqualToValue={(opt, val) => opt.id_pole === val.id_pole}
                                getOptionLabel={(option) => option.pole || ""}
                                renderInput={(params) => (
                                    <TextField {...params} label="Pôle / Rôle" sx={{ mb: 2 }} />
                                )}
                            />

                            {/* Nom du groupe */}
                            <TextField
                                fullWidth
                                label="Nom du groupe"
                                value={espaceName}
                                onChange={(e) => setEspaceName(e.target.value)}
                                sx={{ mb: 2 }}
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Button onClick={() => setStep(1)}>Retour</Button>
                                <Button
                                    variant="contained"
                                    onClick={handleCreateEspaceTravail}
                                    disabled={!espaceName || !selectedPole || loading}
                                >
                                    {loading ? "Loading..." : "Créer"}
                                </Button>

                            </Box>
                        </>
                    )}

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

            </Box>
        </Modal>
    )
}

export default CreerEspaceTravail

