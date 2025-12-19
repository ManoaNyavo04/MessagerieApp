import { Box, CircularProgress, Drawer, List, ListItem, ListItemText, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { serachMessages } from './MesDiscussion';

interface Props {
    open: boolean;
    onClose: () => void;
    discussion: any;
    currentUser: any;
    token: string;
    onSelectMessage: (idMessage: number) => void;
}

const RechercheMessage: React.FC<Props> = ({ open, onClose, discussion, currentUser, token, onSelectMessage }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const timer = setTimeout(() => {
            
            searchMessages();
        }, 400); // debounce

        return () => clearTimeout(timer);
    }, [query]);

    const searchMessages = async () => {
        if (!query.trim()) return;

        setLoading(true);
        try {
            const data = await serachMessages(
                token,
                discussion.id,
                discussion.type,
                query
            );
            setResults(data);
        } catch (err) {
            console.error("Erreur recherche message :", err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const highlight = (text: unknown) => {
        if (typeof text !== "string") return "";

        if (!query.trim()) return text;

        return text.replace(
            new RegExp(`(${query})`, "gi"),
            "<mark>$1</mark>"
        );
    };




    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: 350, p: 2 }}>
                <Typography variant="h6">Rechercher</Typography>

                <TextField
                    fullWidth
                    placeholder="Rechercher un message"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    sx={{ mt: 2 }}
                />

                {loading && <CircularProgress size={20} sx={{ mt: 2 }} />}

                <List>
                    {results.map(msg => (
                        <ListItem
                            button
                            key={msg.id_message}
                            onClick={() => {
                                onSelectMessage(msg.id_message);
                                onClose();
                            }}
                        >
                            <ListItemText
                                primary={
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: highlight(msg.contenu || msg.nom_original)
                                        }}
                                    />
                                }
                                secondary={new Date(msg.date_envoie).toLocaleString()}
                            />

                        </ListItem>
                    ))}
                </List>

                {!loading && query && results.length === 0 && (
                    <Typography sx={{ mt: 2 }} color="text.secondary">
                        Aucun résultat
                    </Typography>
                )}
            </Box>
        </Drawer>
    );
}

export default RechercheMessage