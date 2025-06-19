import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './modules/Login/Login';
import AdminRoute from './modules/shared/Layout/AdminRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Login />} />
          {/* Ajoutez d'autres routes protégées ici */}
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
