import { LOGIN_URL } from "../../URL/Url";

export interface LoginResponse {
  token: string;
  profilUtilisateur: {
    id: number;
    nom: string;
    prenom: string;
    role: string;
  };
}

export async function loginService(mlle: string, passe: string): Promise<LoginResponse> {
  try {
    const res = await fetch(`${LOGIN_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matricule: mlle,
        mdp: passe
      }),
    });

    if (!res.ok) {
      const errorMsg = await res.text();
      throw new Error(errorMsg || `Erreur ${res.status}`);
    }

    return await res.json();
  } catch (error: any) {
    console.error("Erreur de connexion :", error);
    throw new Error(error.message || "Erreur de connexion.");
  }
}