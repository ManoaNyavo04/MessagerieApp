import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { baseUrl } from "../URL/Url";

const SignalRContext = createContext<HubConnection | null>(null);

export const useSignalR = () => useContext(SignalRContext);

interface SignalRProviderProps {
  children: React.ReactNode;
  token: string;
}

export const SignalRProvider: React.FC<SignalRProviderProps> = ({ children, token }) => {
  const [connection, setConnection] = useState<HubConnection | null>(null);

  useEffect(() => {
    if (!token) return;

    const conn = new HubConnectionBuilder()
      .withUrl(`${baseUrl}/chathub`, {
        accessTokenFactory: () => token 
      })
      .withAutomaticReconnect() 
      .build();

    conn.start()
      .then(() => console.log("SignalR connecté"))
      .then(() => setConnection(conn))
      .catch(err => console.error("Erreur SignalR:", err));


    return () => {
      conn.stop().catch(err => console.error("Erreur arrêt connexion SignalR:", err));
    };

  }, [token]); 

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