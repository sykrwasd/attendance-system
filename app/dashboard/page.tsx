import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";

export default async function Page() {
  const supabase = await createClient();

  const { data: employee, error } = await supabase
    .from("employee")
    .select("*")
    .eq("id", 3)
    .single(); // Kita ambil data pekerja dengan id 1 untuk contoh

  console.log("DATA:", employee);
  console.log("ERROR:", error);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-5 flex flex-col items-center">
        <div>
          <Image
            className="mb-4"
            src="/logo_amber.png"
            alt="Amber Coffee logo"
            width={200}
            height={200}
            priority
          />
        </div>
        <ul className="space-y-4 mt-15">
          <li>
            <Link href="/dashboard" className="hover:text-gray-300">
              Home
            </Link>
          </li>

          <li>
            <Link href="/dashboard/employee" className="hover:text-gray-300">
              attendance
            </Link>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 bg-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Welcome Azhad</h1>

        {/* Profile Card */}
        <div className="bg-white p-6 rounded-2xl shadow flex items-center gap-6">
          {/* Profile Image */}
          <div className="w-40 h-40 relative">
            <Image
              src="/profile_azhad.jpeg"
              alt="profile picture"
              fill
              className="rounded-full object-cover border-4 border-gray-300"
              priority
            />
          </div>

          {/* Profile Details */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {employee.staff_name.toUpperCase()}
              </h2>
              <div className="mt-2">
                <p className="text-gray-600">{employee.staff_name}</p>
                <p className="text-gray-600">{employee.staff_email}</p>
                <p className="text-gray-600">{employee.staff_phoneNum}</p>
                <p className="text-gray-600">{employee.staff_role.toUpperCase()}</p>
              </div>

              <button className="mt-4 bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-700">
                Edit Profile
              </button>
            </div>
        </div>
      </div>
    </div>
  );
}
