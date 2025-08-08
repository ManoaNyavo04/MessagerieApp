import { ROLE_URL } from "../../URL/Url";

export interface Role {
  id_role: number;
  role: string;
}

export async function getAllRolesService(token: string): Promise<Role[]> {
  try {
    const response = await fetch(`${ROLE_URL}/roles`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // ✅ ajout du token
      },
      
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(errorMsg || `Erreur ${response.status}`);
    }

    const roles: Role[] = await response.json();

    return roles;
  } catch (error: any) {
    console.error("Erreur lors de la récupération des rôles :", error);
    throw new Error(error.message || "Erreur de récupération des rôles.");
  }
}