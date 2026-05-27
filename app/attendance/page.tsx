"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function AttendancePage() {
  const supabase = createClient();

  const [employee, setEmployee] = useState<any>(null);
  const [scheduleData, setScheduleData] = useState<any>([]);
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("id");

    window.location.href = "/login";
  };

  const days = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];

  const shifts: any = {
    1: "4.00PM - 7.30PM",
    2: "7.30PM - 11.00PM",
  };

  const getWeekDates = () => {
    const today = new Date();

    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay());

    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);

    return {
      sunday,
      saturday,
    };
  };

  const getWeekRange = () => {
    const { sunday, saturday } = getWeekDates();

    const formatDate = (date: Date) => {
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    };

    return `${formatDate(sunday)} - ${formatDate(saturday)}`;
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    const { sunday, saturday } = getWeekDates();

    const { data, error } = await supabase
      .from("bookSchedule")
      .select("*, employee:staff_id (id, staff_name, staff_role)")
      .gte("schedule_date", sunday.toISOString().split("T")[0])
      .lte("schedule_date", saturday.toISOString().split("T")[0]);
    console.log(data);

    if (error) {
      console.log(error);
      return;
    }

    setScheduleData(data);
  };

  const getBaristas = (day: string, shift: number) => {
    return scheduleData.filter((item: any) => {
      const date = new Date(item.schedule_date);

      const itemDay = days[date.getDay()];

      return itemDay === day && item.schedule_shift === shift;
    });
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
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-5 flex flex-col items-center">
        <Image
          className="mb-4"
          src="/logo_amber.png"
          alt="Amber Coffee logo"
          width={200}
          height={200}
          priority
        />

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

      {/* Content */}
      <div className="flex-1 p-8 bg-gray-100">
        <div className="flex justify-between items-start mb-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Attendance Schedule
            </h1>

            <p className="text-gray-500">Weekly schedule ({getWeekRange()})</p>
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow hover:bg-gray-50"
            >
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold">
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
              <div className="absolute top-16 right-0 w-48 bg-white rounded-xl shadow-lg border z-50">
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
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full border-collapse border border-sky-300 bg-white">
            <thead>
              <tr className="bg-sky-100 text-sky-700">
                <th className="border border-sky-300 p-3 w-15">DAY</th>

                <th className="border border-sky-300 p-3 w-70">
                  4.00PM - 7.30PM
                </th>

                <th className="border border-sky-300 p-3 w-70">
                  7.30PM - 11.00PM
                </th>
              </tr>
            </thead>

            <tbody>
              {days.map((day) => (
                <tr key={day} className="h-28">
                  <td className="border border-sky-300 bg-sky-50 font-bold text-sky-700 text-center">
                    {day}
                  </td>

                  {[1, 2].map((shift) => (
                    <td
                      key={shift}
                      className="border border-sky-300 align-top p-2 "
                    >
                      <div className="grid grid-cols-2 gap-2">
                        {getBaristas(day, shift).map(
                          (item: any, index: number) => (
                            <div
                              key={index}
                              className="bg-red-100 text-gray-800 px-3 py-2 rounded-lg text-sm font-medium"
                            >
                              {item.employee?.staff_name || "Unknown Employee"}
                              <span className="text-xs text-gray-500 ml-2">
                                ({item.employee?.staff_role || "Unknown Role"})
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
