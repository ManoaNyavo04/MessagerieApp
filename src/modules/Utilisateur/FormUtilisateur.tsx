import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Autocomplete,
  CircularProgress,
  Grid,
} from "@mui/material";
import { Cancel } from "@mui/icons-material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { addUtilisateurService, UpdateUtilisateurDto, updateUtilisateurService, Utilisateur, UtilisateurDto } from "./UtilisateurService";
import { getAllRolesService, Role } from "../Role/RoleService";

interface FormUtilisateurProps {
  open: boolean;
  onClose: () => void;
  utilisateur?: Utilisateur | null;
  onUpdated?: () => void;
}

const FormUtilisateur = ({ open, onClose, utilisateur, onUpdated }: FormUtilisateurProps) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [matricule, setMatricule] = useState("");
  const [pending, setPending] = useState(false);

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const token = localStorage.getItem("token");

  const showSuccess = (message: string) => {
    setSnackbarSeverity("success");
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const showError = (message: string) => {
    setSnackbarSeverity("error");
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  // 🔹 Charger les rôles et remplir les champs si édition
  useEffect(() => {
    if (!token) return;

    getAllRolesService(token)
      .then(data => setRoles(data))
      .catch(err => console.error("Erreur chargement rôles :", err));

    if (utilisateur) {
      setNom(utilisateur.nom);
      setPrenom(utilisateur.prenom);
      setMatricule(utilisateur.matricule);
      setSelectedRole(
        utilisateur.id_role
          ? { id_role: utilisateur.id_role, role: utilisateur.role }
          : null
      );
    } else {
      setNom("");
      setPrenom("");
      setMatricule("");
      setSelectedRole(null);
    }
  }, [utilisateur, token]);

  // 🔹 Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      showError("Veuillez choisir un rôle.");
      return;
    }

    if (!token) {
      showError("Token non trouvé.");
      return;
    }

    const payloadUpdate: UpdateUtilisateurDto = {
      nom,
      prenom,
      matricule,
      id_role: selectedRole.id_role,
    };

    setPending(true);

    try {
      if (utilisateur) {
        // 🔵 MODE UPDATE
        await updateUtilisateurService(utilisateur.id_utilisateur, payloadUpdate, token);

        showSuccess("Utilisateur modifié avec succès !");
      } else {
        // 🟢 MODE AJOUT
        await addUtilisateurService(payloadUpdate, token);

        showSuccess("Utilisateur ajouté avec succès !");
      }

      setTimeout(() => {
        onClose();
        window.location.reload();
        // onUpdated?.();
      }, 800);

    } catch (error: any) {
      showError("Erreur : " + (error.message || error));
    } finally {
      setPending(false);
    }
  };

  



  return (
    <Modal open={open} onClose={onClose}>
      <Box>
        <Paper
          elevation={4}
          sx={{
            p: 4,
            width: 500,
            mx: "auto",
            mt: 10,
            borderRadius: 3,
            position: "relative",
          }}
        >
          <Typography variant="h6" gutterBottom textAlign="center">
            {utilisateur ? "Modifier l'utilisateur" : "Ajout d’un utilisateur"}
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Nom"
                  fullWidth
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Prénom"
                  fullWidth
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Matricule"
                  fullWidth
                  value={matricule}
                  onChange={(e) => setMatricule(e.target.value)}
                />
              </Grid>

              <Grid item xs={6}>
                <Autocomplete
                  options={roles}
                  getOptionLabel={(option) => option.role}
                  value={selectedRole}
                  onChange={(e, value) => setSelectedRole(value)}
                  renderInput={(params) => (
                    <TextField {...params} label="Rôle" fullWidth />
                  )}
                />
              </Grid>
            </Grid>

            <Box sx={{ textAlign: "right", mt: 3 }}>
              <Button
                onClick={onClose}
                variant="outlined"
                color="error"
                sx={{ mr: 1, textTransform: "capitalize" }}
                startIcon={<Cancel />}
                disabled={pending}
              >
                Annuler
              </Button>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                startIcon={<FontAwesomeIcon icon={faCheckCircle} />}
                disabled={pending}
              >
                {pending ? <CircularProgress size={20} /> : "Valider"}
              </Button>
            </Box>
          </form>
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

export default FormUtilisateur;
