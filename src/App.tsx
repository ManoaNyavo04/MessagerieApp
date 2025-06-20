import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './modules/Login/Login';
import AdminRoute from './modules/shared/Layout/AdminRoute';
import UserRoute from './modules/shared/Layout/UserRoute';
import Dashboard from './modules/shared/Layout/Dashboard/Dashboard';
import UserHome from './modules/shared/Layout/Dashboard/UserHome';
import AdminHome from './modules/shared/Layout/Dashboard/AdminHome';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminHome />} />
          {/* ...autres routes admin */}
        </Route>

        {/* User Routes */}
        <Route element={<UserRoute />}>
          <Route path="/user" element={<UserHome />} />
          {/* ...autres routes user */}
        </Route>
      </Routes>

    </BrowserRouter>
  );
}

export default App;
