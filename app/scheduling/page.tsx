"use client";

import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Page() {
  const supabase = createClient();

  const [employee, setEmployee] = useState<any>(null);
  const [selectedBarista, setSelectedBarista] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // CHECK SHIFT LIMIT
    const { data: existingShift, error: shiftError } = await supabase
      .from("bookSchedule")
      .select("*")
      .eq("schedule_date", selectedDate)
      .eq("schedule_shift", selectedShift);

    if (shiftError) {
      console.log(shiftError);
      return;
    }

    // LIMIT 2 STAFF
    if (existingShift.length >= 2) {
      alert("This shift already has 2 baristas.");
      return;
    }

    // CHECK DUPLICATE STAFF
    const alreadyBooked = existingShift.find(
      (item: any) => item.staff_id == selectedBarista,
    );

    if (alreadyBooked) {
      alert("You already booked this shift.");
      return;
    }

    // INSERT
    const { data, error } = await supabase.from("bookSchedule").insert([
      {
        staff_id: selectedBarista,
        schedule_date: selectedDate,
        schedule_shift: selectedShift,
      },
    ]);

    if (error) {
      console.log(error);
      alert("Failed to create schedule");
    } else {
      console.log(data);

      alert("Schedule created successfully!");

      // RESET FORM
      setSelectedBarista("");
      setSelectedRole("");
      setSelectedShift("");
      setSelectedDate("");
    }
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
      console.log(data);

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
    <div className="min-h-screen flex bg-gray-100">
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

        <ul className="space-y-4 mt-10">
          <li>
            <Link href="/dashboard" className="hover:text-gray-300">
              Dashboard
            </Link>
          </li>

          <li>
            <Link href="/attendance" className="hover:text-gray-300">
              Book Schedule
            </Link>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        <div className="bg-white max-w-3xl rounded-2xl shadow-lg p-8 mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Booking Schedule
              </h1>

              <p className="text-gray-500 mt-1">
                Create barista working schedule
              </p>
            </div>

            <Link
              href="/attendance"
              className="text-sm bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-lg transition"
            >
              Back
            </Link>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Barista Name */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Barista Name
              </label>

              <select
                required
                name="barista"
                value={selectedBarista}
                onChange={(e) => setSelectedBarista(e.target.value)}
                className="text-gray-700 w-full border border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Select a barista
                </option>

                <option value={employee?.id}>{employee?.staff_name}</option>
              </select>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Role
              </label>

              <select
                required
                name="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="text-gray-700 w-full border border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Select a role
                </option>
                <option value={employee?.staff_role}>
                  {employee?.staff_role}
                </option>
              </select>
            </div>

            {/* Working Date */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Working Date
              </label>

              <input
                type="date"
                name="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="text-gray-700 w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Start & End Time */}
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Select Shift
              </label>

              <select
                required
                name="shift"
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="text-gray-700 w-full border border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Select a shift
                </option>
                <option value={1}>4.00 PM - 7.30 PM</option>
                <option value={2}>7.30 PM - 11.00 PM</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
