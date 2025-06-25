import React from 'react';
import { Grid } from '@mui/material';
import Paper from '@mui/material/Paper';
import { Typography } from '@mui/material';

const TestGrid = () => {
  return (
    <Grid container spacing={2}>
  {/* Colonne gauche - Liste des discussions */}
  <Grid item xs={12} md={4}> {/* This Grid is a child of the container and acts as an item */}
    <Paper sx={{ p: 2, height: '80vh', overflowY: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Discussions
      </Typography>
      {/* ... other content for discussion list */}
    </Paper>
  </Grid>

  {/* Colonne droite - Contenu de la discussion */}
  <Grid item xs={12} md={8}> {/* Another Grid item */}
    <Paper sx={{ p: 2, height: '80vh', overflowY: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Contenu de la discussion
      </Typography>
      {/* ... other content for discussion content */}
    </Paper>
  </Grid>
</Grid>
  );
};

export default TestGrid;

