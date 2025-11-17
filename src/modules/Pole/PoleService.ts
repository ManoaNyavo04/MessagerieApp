import { POLE_URL } from "../../URL/Url";

export async function getAllPole(token: string) {
  const response = await fetch(`${POLE_URL}/getAllPole`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  if (!response.ok) throw new Error("Erreur de chargement des espaces");
  return await response.json();
}