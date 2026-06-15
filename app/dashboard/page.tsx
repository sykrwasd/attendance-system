"use client";

import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";

const shiftLabel: Record<number, string> = {
  16: "4PM – 5PM",
  17: "5PM – 6PM",
  18: "6PM – 7PM",
  19: "7PM – 8PM",
  20: "8PM – 9PM",
  21: "9PM – 10PM",
  22: "10PM – 11PM",
};

function toLocalDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getWeekBounds() {
  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  return { start: toLocalDateStr(sunday), end: toLocalDateStr(saturday) };
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short" });
}

export default function Page() {
  const supabase = createClient();

  const [employee, setEmployee] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [todayCount, setTodayCount] = useState<number>(0);
  const [myWeekCount, setMyWeekCount] = useState<number>(0);
  const [staffCount, setStaffCount] = useState<number>(0);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("id");
    window.location.href = "/login";
  };

  useEffect(() => {
    const init = async () => {
      const userId = localStorage.getItem("id");
      if (!userId) return;

      const { data: emp } = await supabase
        .from("employee")
        .select("*")
        .eq("id", userId)
        .single();

      if (!emp) return;
      setEmployee(emp);

      const today = toLocalDateStr(new Date());
      const { start, end } = getWeekBounds();

      const [todayRes, myWeekRes, staffRes, upcomingRes] = await Promise.all([
        // slots filled today (all staff)
        supabase.from("bookSchedule").select("id", { count: "exact" }).eq("schedule_date", today),
        // my shifts this week
        supabase.from("bookSchedule").select("id", { count: "exact" })
          .eq("staff_id", emp.id).gte("schedule_date", start).lte("schedule_date", end),
        // total staff
        supabase.from("employee").select("id", { count: "exact" }),
        // upcoming bookings from today
        supabase.from("bookSchedule")
          .select("*, employee:staff_id (staff_name, staff_role)")
          .gte("schedule_date", today)
          .order("schedule_date", { ascending: true })
          .order("schedule_shift", { ascending: true })
          .limit(10),
      ]);

      setTodayCount(todayRes.count ?? 0);
      setMyWeekCount(myWeekRes.count ?? 0);
      setStaffCount(staffRes.count ?? 0);
      setUpcoming(upcomingRes.data ?? []);
      setLoadingStats(false);
    };

    init();
  }, []);

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const today = toLocalDateStr(new Date());

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 min-w-0 p-4 pt-16 md:p-8 md:pt-8">
        {/* Top Navbar */}
        <div className="flex justify-end items-center mb-6 relative pl-10 md:pl-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <div className="w-10 h-10 rounded-full bg-orange-700 text-white flex items-center justify-center font-bold">
              {employee.staff_name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{employee.staff_name}</p>
              <p className="text-xs text-slate-400">{employee.staff_role}</p>
            </div>
          </button>

          {showMenu && (
            <div className="absolute top-16 right-0 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
              <Link href="/profile" className="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-200">
                👤 Profile Details
              </Link>
              <button onClick={handleLogout} className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-red-500">
                🚪 Logout
              </button>
            </div>
          )}
        </div>

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
            Welcome, {employee.staff_name}
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Here's the schedule overview.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Today's Slots Filled</p>
            {loadingStats ? (
              <div className="w-6 h-6 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin mt-3" />
            ) : (
              <>
                <h2 className="text-4xl font-bold mt-2 text-orange-600">{todayCount}</h2>
                <p className="text-xs text-slate-400 mt-2">shifts booked today</p>
              </>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">My Shifts This Week</p>
            {loadingStats ? (
              <div className="w-6 h-6 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin mt-3" />
            ) : (
              <>
                <h2 className="text-4xl font-bold mt-2 text-orange-600">{myWeekCount}</h2>
                <p className="text-xs text-slate-400 mt-2">shifts scheduled for you</p>
              </>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Total Staff</p>
            {loadingStats ? (
              <div className="w-6 h-6 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin mt-3" />
            ) : (
              <>
                <h2 className="text-4xl font-bold mt-2 text-orange-600">{staffCount}</h2>
                <p className="text-xs text-slate-400 mt-2">registered employees</p>
              </>
            )}
          </div>
        </div>

        {/* Upcoming Schedule */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Upcoming Schedule</h2>
            <Link href="/attendance" className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition">
              View full timetable →
            </Link>
          </div>

          {loadingStats ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            </div>
          ) : upcoming.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No upcoming shifts booked.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-sm">
                <thead>
                  <tr className="bg-orange-50 dark:bg-orange-900/20 text-left text-orange-800 dark:text-orange-400">
                    <th className="px-3 py-2 rounded-l-lg font-semibold">Staff</th>
                    <th className="px-3 py-2 font-semibold">Role</th>
                    <th className="px-3 py-2 font-semibold">Date</th>
                    <th className="px-3 py-2 rounded-r-lg font-semibold">Shift</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map((item: any, i: number) => {
                    const isMe = item.staff_id == employee.id;
                    const isToday = item.schedule_date === today;
                    return (
                      <tr key={item.id} className={`border-b border-slate-100 dark:border-slate-700 last:border-0 ${isMe ? "bg-orange-50/50 dark:bg-orange-900/10" : ""}`}>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {item.employee?.staff_name?.charAt(0) ?? "?"}
                            </div>
                            <span className="font-medium text-slate-800 dark:text-slate-100 truncate">
                              {item.employee?.staff_name ?? "Unknown"}
                              {isMe && <span className="ml-1.5 text-[10px] font-bold text-orange-500 uppercase">you</span>}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{item.employee?.staff_role ?? "—"}</td>
                        <td className="px-3 py-3">
                          <span className={`font-medium ${isToday ? "text-orange-600" : "text-slate-700 dark:text-slate-300"}`}>
                            {isToday ? "Today" : formatDate(item.schedule_date)}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {shiftLabel[item.schedule_shift] ?? item.schedule_shift}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
