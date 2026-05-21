import { createClient } from "@/utils/supabase/server";
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("employee").select("*");

  console.log("DATA:", data);
  console.log("ERROR:", error);

  return Response.json({ data, error });
}

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = await createClient();
  const { data, error } = await supabase.from("employee").insert([
    {
      name: body.name,
      email: body.email,
      password: body.password,
    },
  ]);
}
