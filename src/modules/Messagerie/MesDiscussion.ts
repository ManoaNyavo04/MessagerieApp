import { USER_DISCUSSION } from "../../URL/Url";

export async function getMesDiscussions(token: string): Promise<any[]> {
  try {
    const response = await fetch(`${USER_DISCUSSION}/getMesDiscussions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Erreur getMesDiscussions:", error);
    throw new Error("Impossible de charger les discussions");
  }
}

export async function getMessages(token: string, targetId: number, type: string) {
   const res = await fetch(`${USER_DISCUSSION}/messages?targetId=${targetId}&type=${type}`, {
    headers: {
      method: 'GET',
      Authorization: `Bearer ${token}`, // les backticks manquaient
    },
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la récupération des messages");
  }

  return await res.json(); // retourne une liste de MessageModel
}

