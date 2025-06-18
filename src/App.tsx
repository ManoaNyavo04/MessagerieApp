import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './modules/Login/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route>
        <Route path="/se-connecter" element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
