export async function getStaff() {
  const res = await fetch("/api/staff");
  if (!res.ok) throw new Error("Failed to fetch");
  const data = await res.json();
  return data.data;
}

export async function addStaff(data: any) {
  const res = await fetch("/api/staff", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return res.json()
}