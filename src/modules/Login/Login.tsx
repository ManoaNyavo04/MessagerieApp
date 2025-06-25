import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'; 
import { loginService } from './LoginService';
import {
  Container,
  CssBaseline,
  Box,
  Paper,
  TextField,
  Button,
} from "@mui/material";
import { Logout } from "@mui/icons-material";
import { loginSuccess } from '../shared/Slices/authSlice';
import { useAppDispatch } from '../shared/hooks/redux-hooks';

const Login = () => {
    const [matricule, setMatricule] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [alertType, setAlertType] = useState<"success" | "error">("success");
    const dispatch = useAppDispatch();
    const navigate = useNavigate();


    const handleLogin = async () => {
        if (!matricule || !password) {
        setMessage("Veuillez remplir tous les champs.");
        setAlertType("error");
        return;
        }

        try {
            const result = await loginService(matricule, password);
            // console.log("Résultat reçu :", result);

            const formattedResult = {
                token: result.token,
                profilUtilisateur: {
                    ...result.profilUtilisateur,
                    role: Number(result.profilUtilisateur.id_role),
                },
            };
            console.log("Résultat reçu :", formattedResult);

            localStorage.setItem("token", result.token);
            localStorage.setItem("profilUtilisateur", JSON.stringify(result.profilUtilisateur)); // <-- Ajoute ceci

            // ✅ Enregistrer dans Redux
            dispatch(loginSuccess(formattedResult));

            setMessage("Connexion réussie !");
            setAlertType("success");
            // console.log("huuuuu");

            if (formattedResult.profilUtilisateur) {
                console.log("huuuuu connecterrrr");
                navigate("/messagerie");
            }

            /*if (formattedResult.profilUtilisateur.role=== 1) {
                console.log("huuuuu adminnn");
                navigate("/admin");
            } else if (formattedResult.profilUtilisateur.role === 2) {
                console.log("huuuuu userrrrr");
                navigate("/messagerie");
            }*/

            } catch (error: any) {
            setMessage(error.message);
            setAlertType("error");
        }
    };

    return (
        <Container maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                mt: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                }}
            >
                <Paper sx={{ p: 2, backgroundColor: "rgba(255, 255, 255, 0.3)" }}>
                <img src="logo1.png" alt="logo parera" loading="lazy" />

                {message && (
                    <Box
                    sx={{
                        mt: 2,
                        mb: 2,
                        padding: "10px",
                        backgroundColor: alertType === "success" ? "#d4edda" : "#f8d7da",
                        color: alertType === "success" ? "#155724" : "#721c24",
                        borderRadius: "5px",
                    }}
                    >
                    {message}
                    </Box>
                )}

                <Box sx={{ mt: 1 }}>
                    <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleLogin();
                    }}
                    >
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Matricule (ex : PR00514)"
                        name="email"
                        autoFocus
                        value={matricule}
                        onChange={(e) => setMatricule(e.target.value)}
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="password"
                        name="password"
                        label="Mot de passe"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, background: "#1a2a4c" }}
                        startIcon={<Logout />}
                        type="submit"
                    >
                        Se connecter
                    </Button>
                    </form>
                </Box>
                </Paper>
            </Box>
            </Container>

    )
}
export default Login;


