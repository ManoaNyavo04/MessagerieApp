export async function getUtilisateur(id: number) {
  const res = await fetch(`http://localhost:5000/api/utilisateur/${id}`);
  return await res.json();
}
