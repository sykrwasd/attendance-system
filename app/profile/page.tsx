"use client";

import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";

export default function Page() {
  const supabase = createClient();

  const [employee, setEmployee] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("id");
    window.location.href = "/login";
  };

  useEffect(() => {
    const fetchEmployee = async () => {
      const userId = localStorage.getItem("id");

      if (!userId) return;

      const { data } = await supabase
        .from("employee")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) {
        setEmployee(data);
      }
    };

    fetchEmployee();
  }, []);

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar/>

      {/* Main Content */}
      <div className="flex-1 p-8 relative">

        {/* Top Navbar */}
        <div className="flex justify-end mb-6 relative">

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow border hover:bg-gray-50 transition"
          >

            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold">
              {employee.staff_name.charAt(0).toUpperCase()}
            </div>

            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">
                {employee.staff_name}
              </p>

              <p className="text-xs text-gray-500">
                {employee.staff_role}
              </p>
            </div>

          </button>

          {/* Dropdown */}
          {showMenu && (
            <div className="absolute top-16 right-0 w-52 bg-white rounded-2xl shadow-xl border overflow-hidden z-50">

              <Link
                href="/profile"
                className="block px-4 py-3 hover:bg-gray-100 text-sm text-gray-700"
              >
                👤 Profile Details
              </Link>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 text-sm text-red-500"
              >
                🚪 Logout
              </button>

            </div>
          )}

        </div>

        {/* Welcome */}
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Welcome {employee.staff_name}
        </h1>

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

            <div className="mt-2 space-y-1">
              <p className="text-gray-600">
                {employee.staff_name}
              </p>

              <p className="text-gray-600">
                {employee.staff_email}
              </p>

              <p className="text-gray-600">
                {employee.staff_phoneNum}
              </p>

              <p className="text-gray-600">
                {employee.staff_role}
              </p>
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