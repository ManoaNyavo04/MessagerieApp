import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './modules/Login/Login';
import AdminRoute from './modules/shared/Layout/AdminRoute';
import UserRoute from './modules/shared/Layout/UserRoute';
import Dashboard from './modules/shared/Layout/Dashboard/Dashboard';
import UserHome from './modules/shared/Layout/Dashboard/UserHome';
import AdminHome from './modules/shared/Layout/Dashboard/AdminHome';
import { useAppDispatch } from './modules/shared/hooks/redux-hooks';
import { loginSuccess } from './modules/shared/Slices/authSlice';
import Messagerie from './modules/Messagerie/Messagerie';
import PrivateRoute from './modules/shared/Layout/PrivateRoute';
import PageUtilisateur from './modules/Utilisateur/PageUtilisateur';
import MessageriePage from './modules/Messagerie/MessageriePage';
import { useSelector } from 'react-redux';
import { RootState } from './modules/shared/Store/store';
import { SignalRProvider } from './contexts/SignalRContext';



function App() {
  const dispatch = useAppDispatch(); 
  // const token = localStorage.getItem('token');
  const token = useSelector((state: RootState) => state.auth.token);

  return (
    <SignalRProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<Dashboard />}>
            <Route path="/admin" element={<AdminHome />} />
            <Route path="/gestion-utilisateur" element={<PageUtilisateur />} />
          </Route>
          
          {/* <Route path="/messagerie" element={<Messagerie />} /> */}
          {/* ...autres routes admin */}
        </Route>

        <Route element={<PrivateRoute />}>
          <Route element={<Dashboard />}>
            {/* <Route path="/messagerie" element={<Messagerie />} /> */}
            <Route path="/messagerie" element={<MessageriePage token={token || ''

            } />} />
            
          </Route>
        </Route>


        {/* User Routes */}
        {/* <Route element={<UserRoute />}>
          <Route path="/user" element={<UserHome />} />
          <Route path="/messagerie" element={<Messagerie />} />
        </Route> */}
      </Routes>

    </BrowserRouter>
    </SignalRProvider>
  );
}

export default App;
