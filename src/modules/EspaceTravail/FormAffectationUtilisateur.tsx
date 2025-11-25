import React, { useEffect, useState } from "react";
import {
    Box,
    Modal,
    Paper,
    Typography,
    Autocomplete,
    TextField,
    Button,
    Snackbar,
    Alert
} from "@mui/material";
import { Utilisateur } from "../Utilisateur/UtilisateurService";
import { affecterUtilisateurService, EspaceTravail, getAllEspaceTravailService } from "./EspaceTravailService";

interface Props {
    open: boolean;
    onClose: () => void;
    selectedUser: Utilisateur | null;
}

const FormAffectationUtilisateur: React.FC<Props> = ({ open, onClose, selectedUser }) => {
    const [espaces, setEspaces] = useState<EspaceTravail[]>([]);
    const [selectedEspace, setSelectedEspace] = useState<EspaceTravail | null>(null);
    const [loading, setLoading] = useState(false);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const token = localStorage.getItem("token");

    // 🔹 Charger les espaces à l'ouverture du modal
    useEffect(() => {
        if (open && token) {
            getAllEspaceTravailService(token)
                .then(data => setEspaces(data))
                .catch(err => console.error("Erreur chargement espaces:", err));
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!token || !selectedUser || !selectedEspace) return;
        setLoading(true);

        try {
            await affecterUtilisateurService(token, {
                id_utilisateur: selectedUser.id_utilisateur,
                id_espace_travail: selectedEspace.id_espace_travail
            });

            setSnackbarMessage(`✅ ${selectedUser.nom} a été affecté à l’espace ${selectedEspace.nom}`);
            setSnackbarSeverity("success");
            setSnackbarOpen(true);

            setTimeout(() => onClose(), 1000);
        } catch (err: any) {
            setSnackbarMessage("⚠️ " + (err.message || "Erreur lors de l’affectation"));
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box>
                <Paper sx={{ p: 4, width: 400, mx: "auto", mt: 10 }}>
                    <Typography variant="h6" gutterBottom>
                        Affecter l’utilisateur
                    </Typography>

                    {selectedUser && (
                        <Typography sx={{ mb: 2 }}>
                            👤 <strong>{selectedUser.nom} {selectedUser.prenom}</strong>
                        </Typography>
                    )}

                    <Autocomplete
                        options={espaces}
                        getOptionLabel={(e) => e.nom}
                        value={selectedEspace}
                        onChange={(e, value) => setSelectedEspace(value)}
                        renderInput={(params) => (
                            <TextField {...params} label="Sélectionner un espace" sx={{ mb: 2 }} />
                        )}
                    />

                    <Box sx={{ textAlign: "right", mt: 3 }}>
                        <Button onClick={onClose} sx={{ mr: 1 }}>Annuler</Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={!selectedEspace || loading}
                        >
                            {loading ? "En cours..." : "Affecter"}
                        </Button>
                    </Box>
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
    );
};

export default FormAffectationUtilisateur;
