import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";

const SignalRContext = createContext<HubConnection | null>(null);

export const useSignalR = () => useContext(SignalRContext);

interface SignalRProviderProps {
  children: React.ReactNode;
  token: string; // 🔹 on reçoit le token ici
}

export const SignalRProvider: React.FC<SignalRProviderProps> = ({ children, token }) => {
  const [connection, setConnection] = useState<HubConnection | null>(null);

  useEffect(() => {
    if (!token) return; // ne pas connecter si pas de token

    const conn = new HubConnectionBuilder()
      .withUrl("http://localhost:5032/chathub", {
        accessTokenFactory: () => token // 🔹 on fournit le token
      })
      .withAutomaticReconnect() // 🔹 reconnexion automatique
      .build();

    conn.start()
      .then(() => console.log("SignalR connecté"))
      .then(() => setConnection(conn))
      .catch(err => console.error("Erreur SignalR:", err));


    return () => {
      conn.stop();
    };
  }, [token]); // 🔹 recrée connexion si le token change

  return (
    <SignalRContext.Provider value={connection}>
      {children}
    </SignalRContext.Provider>
  );
};


/*const SignalRContext = createContext<HubConnection | null>(null);

export const useSignalR = () => useContext(SignalRContext);

export const SignalRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connection, setConnection] = useState<HubConnection | null>(null);

  useEffect(() => {
    const conn = new HubConnectionBuilder()
      .withUrl("http://localhost:5032/chathub")
      .build();

    conn.start()
      .then(() => setConnection(conn))
      .catch(console.error);

    return () => {
      conn.stop();
    };
  }, []);

  return (
    <SignalRContext.Provider value={connection}>
      {children}
    </SignalRContext.Provider>
  );
};*/