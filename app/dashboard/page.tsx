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
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar/>

      {/* Main Content */}
      <div className="flex-1 min-w-0 p-4 pt-16 md:p-8 md:pt-8">
        {/* Top Navbar */}
        <div className="flex justify-end items-center mb-6 relative pl-10 md:pl-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow hover:bg-gray-50"
          >
            <div className="w-10 h-10 rounded-full bg-orange-700 text-white flex items-center justify-center font-bold">
              {employee.staff_name.charAt(0).toUpperCase()}
            </div>

            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">
                {employee.staff_name}
              </p>

              <p className="text-xs text-gray-500">{employee.staff_role}</p>
            </div>
          </button>

          {/* Dropdown */}
          {showMenu && (
            <div className="absolute top-16 right-0 w-48 bg-white rounded-xl shadow-lg border">
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {employee.staff_name}
          </h1>

          <p className="text-gray-500 mt-2">Here is today sales overview.</p>
        </div>

        {/* Sales Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Sales */}
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500 text-sm">Total Sales</p>

            <h2 className="text-3xl font-bold mt-2 text-green-600">
              RM 12,450
            </h2>

            <p className="text-sm text-green-500 mt-2">+12% from yesterday</p>
          </div>

          {/* Orders */}
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500 text-sm">Total Orders</p>

            <h2 className="text-3xl font-bold mt-2 text-orange-700">320</h2>

            <p className="text-sm text-orange-600 mt-2">+20 new orders</p>
          </div>

          {/* Customers */}
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-gray-500 text-sm">Customers</p>

            <h2 className="text-3xl font-bold mt-2 text-orange-700">120</h2>

            <p className="text-sm text-orange-600 mt-2">
              Active customers today
            </p>
          </div>
        </div>

        {/* Recent Sales Table */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Sales</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-gray-700 text-sm">
              <thead>
                <tr className="bg-orange-50 text-left text-orange-800">
                  <th className="p-2 md:p-3">Order ID</th>
                  <th className="p-2 md:p-3">Customer</th>
                  <th className="p-2 md:p-3 hidden sm:table-cell">Product</th>
                  <th className="p-2 md:p-3">Amount</th>
                  <th className="p-2 md:p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b">
                  <td className="p-2 md:p-3">#1001</td>
                  <td className="p-2 md:p-3">Ali</td>
                  <td className="p-2 md:p-3 hidden sm:table-cell">Latte</td>
                  <td className="p-2 md:p-3">RM 18</td>
                  <td className="p-2 md:p-3 text-green-600 font-semibold">Completed</td>
                </tr>

                <tr className="border-b">
                  <td className="p-2 md:p-3">#1002</td>
                  <td className="p-2 md:p-3">Siti</td>
                  <td className="p-2 md:p-3 hidden sm:table-cell">Cappuccino</td>
                  <td className="p-2 md:p-3">RM 22</td>
                  <td className="p-2 md:p-3 text-yellow-600 font-semibold">Pending</td>
                </tr>

                <tr className="border-b">
                  <td className="p-2 md:p-3">#1003</td>
                  <td className="p-2 md:p-3">John</td>
                  <td className="p-2 md:p-3 hidden sm:table-cell">Americano</td>
                  <td className="p-2 md:p-3">RM 15</td>
                  <td className="p-2 md:p-3 text-green-600 font-semibold">Completed</td>
                </tr>

                <tr>
                  <td className="p-2 md:p-3">#1004</td>
                  <td className="p-2 md:p-3">Maryam</td>
                  <td className="p-2 md:p-3 hidden sm:table-cell">Mocha</td>
                  <td className="p-2 md:p-3">RM 25</td>
                  <td className="p-2 md:p-3 text-red-600 font-semibold">Cancelled</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
