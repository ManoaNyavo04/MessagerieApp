// ListeMembre.tsx

import React, { useEffect, useState } from 'react';
import {
    Box, Paper, Typography, TextField, Button,
    Modal, FormControlLabel, Checkbox,
    List,
    ListItem,
    ListItemButton,
    ListItemText
} from '@mui/material';
import { ajouterNouveauMembre, getMembre } from './GroupeDiscussionService';
import { searchUser } from '../Utilisateur/UtilisateurService';

interface User {
    id_utilisateur: number;
    nom: string;
    prenom?: string;
    matricule: string;
    est_admin?: boolean;
}

interface ListeMembreProps {
    open: boolean;
    handleClose: () => void;
    idGroupe: number;
    token: string;
}

const ListeMembre: React.FC<ListeMembreProps> = ({ open, handleClose, idGroupe, token }) => {
    const [step, setStep] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [userResults, setUserResults] = useState<User[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [groupName, setGroupName] = useState('');
    const [groupDesc, setGroupDesc] = useState('');

    useEffect(() => {
        if (open && step === 1) {
            getMembre(token, idGroupe)
                .then((res) => {
                    setUserResults(res); // stocker les membres
                })
                .catch((err) => {
                    console.error("Erreur de chargement des membres :", err.message);
                });
        }

        if (!searchTerm.trim()) return;

        const timeout = setTimeout(async () => {
            try {
                const res = await searchUser(token, searchTerm);
                console.log('Résultat de recherche :', res);

                setUserResults(res);
            } catch (err) {
                console.error("Erreur recherche utilisateurs :", err);
            }
        }, 400);
    }, [open, step, token, idGroupe, searchTerm]);


    const toggleSelect = (user: User) => {
        const exists = selectedUserIds.includes(user.id_utilisateur);
        setSelectedUserIds((prev) =>
            exists ? prev.filter((id) => id !== user.id_utilisateur) : [...prev, user.id_utilisateur]
        );
    };

    const handleAddNewPeople = async () => {
        console.log('Ajout des membres au groupe', idGroupe);
        console.log('Membres sélectionnés:', selectedUserIds);
        try {
            const payload = {
                nom: groupName,
                description: groupDesc,
                utilisateurs: selectedUserIds // ⚠️ ne pas inclure l’utilisateur connecté ici
            };

            const result = await ajouterNouveauMembre(token, idGroupe, payload);

            console.log("Résultat ajout membre :", result);

            alert(`Le membre a été ajouté avec succès.`);

            handleClose();
        } catch (error) {
            console.error('Erreur lors de l\'ajout du membre :', error);
        }
        handleClose(); // Fermer après traitement
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box>
                <Paper sx={{ p: 4, width: 500, mx: 'auto', mt: 10 }}>
                    {step === 1 && (
                        <>
                            <Typography variant="h6" gutterBottom>Liste des membres du groupe</Typography>

                            <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
                                <List>
                                    {userResults.length > 0 ? (
                                        userResults.map((user) => (
                                            <ListItem key={user.id_utilisateur} disablePadding>
                                                <ListItemButton
                                                    onClick={() => console.log(`Membre cliqué : ${user.id_utilisateur} ${user.nom} ${user.prenom}`)}
                                                >
                                                    <ListItemText
                                                        primary={
                                                            `${user.nom} ${user.prenom ?? ''} (${user.matricule})` +
                                                            (user.est_admin ? ' (admin)' : '')
                                                        }
                                                        primaryTypographyProps={{ sx: { color: 'black' } }}
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                        ))
                                    ) : (
                                        <ListItem>
                                            <ListItemText primary="Aucun membre trouvé." />
                                        </ListItem>
                                    )}
                                </List>
                            </Box>

                            <Box sx={{ textAlign: 'right', mt: 2 }}>
                                <Button variant="contained" onClick={() => setStep(2)}>Ajouter des membres</Button>
                            </Box>
                        </>
                    )}


                    {step === 2 && (
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
                                {userResults.map((user) => (
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
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Button onClick={() => setStep(1)}>Retour</Button>
                                <Button variant="contained" onClick={handleAddNewPeople} disabled={selectedUserIds.length === 0}>
                                    Ajouter
                                </Button>
                            </Box>
                        </>
                    )}
                </Paper>
            </Box>
        </Modal>
    );
};

export default ListeMembre;
