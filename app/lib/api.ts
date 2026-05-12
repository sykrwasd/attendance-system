export async function getStaff() {
  const res = await fetch("/api/getStaff");
  if (!res.ok) throw new Error("Failed to fetch");
  const data = await res.json();
  return data.data;
}