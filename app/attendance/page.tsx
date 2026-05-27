"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import Sidebar from "../components/sidebar";

const MAX_WEEK_OFFSET = 10;

const monthNames = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

const dayAbbr = ["SUN","MON","TUE","WED","THU","FRI","SAT"];

const days = [
  "SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY",
];

const shifts: Record<number, string> = {
  1: "4PM – 5PM",
  2: "5PM – 6PM",
  3: "6PM – 7PM",
  4: "7PM – 8PM",
  5: "8PM – 9PM",
  6: "9PM – 10PM",
  7: "10PM – 11PM",
};

const hourLabels: Record<number, string> = {
  1: "4 – 5",
  2: "5 – 6",
  3: "6 – 7",
  4: "7 – 8",
  5: "8 – 9",
  6: "9 – 10",
  7: "10 – 11",
};

const shiftToTime: Record<number, number> = {
  1: 16,
  2: 17,
  3: 18,
  4: 19,
  5: 20,
  6: 21,
  7: 22,
};

const cardColors = [
  "bg-orange-50 border-l-[3px] border-orange-400 text-orange-900",
  "bg-teal-50 border-l-[3px] border-teal-500 text-teal-900",
];

type SelectedCell = {
  day: string;
  dayIndex: number;
  shift: number;
  dateStr: string; // YYYY-MM-DD
};

export default function AttendancePage() {
  const supabase = createClient();

  const [employee, setEmployee] = useState<any>(null);
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    localStorage.removeItem("id");
    window.location.href = "/login";
  };


  const getWeekDates = (offset = 0) => {
    const today = new Date();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay() + offset * 7);
    sunday.setHours(0, 0, 0, 0);
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    saturday.setHours(23, 59, 59, 999);
    return { sunday, saturday };
  };

  const getDayDate = (dayIndex: number, offset: number): Date => {
    const { sunday } = getWeekDates(offset);
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + dayIndex);
    return d;
  };

  const toDateStr = (d: Date) => d.toISOString().split("T")[0];

  const getWeekRange = (offset: number) => {
    const { sunday, saturday } = getWeekDates(offset);
    const fmt = (d: Date) => `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
    return `${fmt(sunday)} – ${fmt(saturday)}`;
  };

  const todayDayName = days[new Date().getDay()];
  const isCurrentWeek = weekOffset === 0;

  // ── Data fetching ─────────────────────────────────────────────────────────────

  useEffect(() => { fetchSchedule(weekOffset); }, [weekOffset]);

  const fetchSchedule = async (offset: number) => {
    setLoadingSchedule(true);
    const { sunday, saturday } = getWeekDates(offset);
    const { data, error } = await supabase
      .from("bookSchedule")
      .select("*, employee:staff_id (id, staff_name, staff_role)")
      .gte("schedule_date", toDateStr(sunday))
      .lte("schedule_date", toDateStr(saturday));
    setLoadingSchedule(false);
    if (!error) setScheduleData(data ?? []);
  };

  const getBaristas = (day: string, shift: number) =>
    scheduleData.filter((item: any) => {
      const itemDay = days[new Date(item.schedule_date).getDay()];
      return itemDay === day && item.schedule_shift === shiftToTime[shift];
    });

  useEffect(() => {
    const fetchEmployee = async () => {
      const userId = localStorage.getItem("id");
      if (!userId) return;
      const { data } = await supabase
        .from("employee").select("*").eq("id", userId).single();
      if (data) setEmployee(data);
    };
    fetchEmployee();
  }, []);

  // ── Booking actions ───────────────────────────────────────────────────────────

  const handleCellClick = (day: string, dayIndex: number, shift: number) => {
    const date = getDayDate(dayIndex, weekOffset);
    setSelectedCell({ day, dayIndex, shift, dateStr: toDateStr(date) });
  };

  const handleBook = async () => {
    if (!selectedCell || !employee) return;
    setActionLoading(true);

    console.log(selectedCell)

    // Check limit
    const { data: existing, error: checkErr } = await supabase
      .from("bookSchedule")
      .select("*")
      .eq("schedule_date", selectedCell.dateStr)
      .eq("schedule_shift", shiftToTime[selectedCell.shift]);

    if (checkErr) { setActionLoading(false); return; }
    if ((existing ?? []).length >= 2) {
      alert("This slot is already full.");
      setActionLoading(false);
      return;
    }
    if ((existing ?? []).find((i: any) => i.staff_id == employee.id)) {
      alert("You already booked this slot.");
      setActionLoading(false);
      return;
    }

    const { error } = await supabase.from("bookSchedule").insert([{
      staff_id: employee.id,
      schedule_date: selectedCell.dateStr,
      schedule_shift: shiftToTime[selectedCell.shift],
    }]);

    setActionLoading(false);
    if (!error) {
      setSelectedCell(null);
      fetchSchedule(weekOffset);
    }
  };

  const handleCancel = async (bookingId: number) => {
    setActionLoading(true);
    const { error } = await supabase
      .from("bookSchedule").delete().eq("id", bookingId);
    setActionLoading(false);
    if (!error) {
      setSelectedCell(null);
      fetchSchedule(weekOffset);
    }
  };

  // Close modal on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setSelectedCell(null);
      }
    };
    if (selectedCell) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [selectedCell]);

  // ── Derived modal data ────────────────────────────────────────────────────────

  const modalBaristas = selectedCell
    ? getBaristas(selectedCell.day, selectedCell.shift)
    : [];
  const isFull = modalBaristas.length >= 2;
  const myBooking = selectedCell
    ? modalBaristas.find((b: any) => b.staff_id == employee?.id)
    : null;

  // ── Loading state ─────────────────────────────────────────────────────────────

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading schedule…</p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Attendance Schedule
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {getWeekRange(weekOffset)} · Click any cell to book or cancel
            </p>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-100 transition"
            >
              <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-semibold text-sm">
                {employee.staff_name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800">{employee.staff_name}</p>
                <p className="text-xs text-slate-400">{employee.staff_role}</p>
              </div>
            </button>

            {showMenu && (
              <div className="absolute top-14 right-0 w-48 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
                <Link href="/profile" className="block px-4 py-3 hover:bg-slate-50 text-sm text-slate-700 transition">
                  👤 Profile Details
                </Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm text-red-500 transition">
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Week Navigation */}
        <div className="bg-white border-b border-slate-100 px-8 py-3 flex items-center gap-4">
          <button
            onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
            disabled={weekOffset === 0}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >←</button>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {Array.from({ length: MAX_WEEK_OFFSET + 1 }, (_, i) => {
              const { sunday } = getWeekDates(i);
              const label = i === 0 ? "This week" : i === 1 ? "Next week" : `Week ${i + 1}`;
              const sublabel = `${sunday.getDate()}.${sunday.getMonth() + 1}`;
              const isActive = weekOffset === i;
              return (
                <button
                  key={i}
                  onClick={() => setWeekOffset(i)}
                  className={`flex-shrink-0 flex flex-col items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isActive ? "bg-orange-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <span>{label}</span>
                  <span className={`text-[10px] font-normal mt-0.5 ${isActive ? "text-orange-200" : "text-slate-400"}`}>
                    {sublabel}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setWeekOffset((w) => Math.min(MAX_WEEK_OFFSET, w + 1))}
            disabled={weekOffset === MAX_WEEK_OFFSET}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >→</button>
        </div>

        {/* Grid */}
        <div className="flex-1 p-6 overflow-auto">
          <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-opacity duration-200 ${loadingSchedule ? "opacity-50" : "opacity-100"}`}>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-20 bg-white border-b border-r border-slate-200 p-3" />
                  {days.map((day, i) => {
                    const date = getDayDate(i, weekOffset);
                    const isToday = isCurrentWeek && day === todayDayName;
                    return (
                      <th key={day} className={`border-b border-r border-slate-200 p-3 text-center last:border-r-0 ${isToday ? "bg-orange-50" : "bg-white"}`}>
                        <span className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 ${isToday ? "text-orange-500" : "text-slate-400"}`}>
                          {dayAbbr[i]}
                        </span>
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${isToday ? "bg-orange-600 text-white shadow-md shadow-orange-200" : "text-slate-700 hover:bg-slate-100"}`}>
                          {date.getDate()}
                        </span>
                        <span className={`block text-[10px] mt-1 ${isToday ? "text-orange-400" : "text-slate-300"}`}>
                          {monthNames[date.getMonth()]}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {Object.keys(shifts).map((shiftKey) => {
                  const shift = Number(shiftKey);
                  const isLastRow = shift === 7;
                  return (
                    <tr key={shift}>
                      <td className={`border-r border-slate-100 bg-white px-3 py-2 text-right align-top w-20 ${!isLastRow ? "border-b" : ""}`}>
                        <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
                          {hourLabels[shift]}
                        </span>
                      </td>

                      {days.map((day, dayIndex) => {
                        const isToday = isCurrentWeek && day === todayDayName;
                        const baristas = getBaristas(day, shift);
                        const isCellFull = baristas.length >= 2;
                        const isMine = baristas.find((b: any) => b.staff_id == employee.id);
                        const isSelected =
                          selectedCell?.day === day && selectedCell?.shift === shift;

                        return (
                          <td
                            key={day}
                            onClick={() => handleCellClick(day, dayIndex, shift)}
                            className={`border-r border-slate-100 p-2 align-top h-20 last:border-r-0 cursor-pointer transition-colors group relative ${!isLastRow ? "border-b" : ""} ${
                              isSelected
                                ? "bg-orange-50 ring-2 ring-inset ring-orange-400"
                                : isToday
                                ? "bg-orange-50/40 hover:bg-orange-50"
                                : "hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex flex-col gap-1">
                              {baristas.map((item: any, index: number) => (
                                <div
                                  key={index}
                                  className={`rounded-lg px-2 py-1.5 text-xs font-semibold ${cardColors[index % cardColors.length]}`}
                                >
                                  <span className="block truncate leading-tight">
                                    {item.employee?.staff_name || "Unknown"}
                                  </span>
                                  <span className="block font-normal opacity-60 truncate text-[10px] mt-0.5">
                                    {item.employee?.staff_role || "—"}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* + icon shown on hover when cell is not full */}
                            {!isCellFull && !isMine && (
                              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-base font-bold shadow-sm">
                                  +
                                </span>
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Booking Modal ─────────────────────────────────────────────────── */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 overflow-hidden"
          >
            {/* Modal header */}
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                {selectedCell.day}
              </p>
              <p className="text-base font-bold text-slate-800">
                {shifts[selectedCell.shift]}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {(() => {
                  const d = new Date(selectedCell.dateStr + "T00:00:00");
                  return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
                })()}
              </p>
            </div>

            {/* Modal body */}
            <div className="px-5 py-4 space-y-3">
              {/* Who's booked */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Booked ({modalBaristas.length}/2)
                </p>
                {modalBaristas.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No one booked yet</p>
                ) : (
                  <div className="space-y-1.5">
                    {modalBaristas.map((b: any, i: number) => (
                      <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${cardColors[i % cardColors.length]}`}>
                        <span className="w-5 h-5 rounded-full bg-white/60 flex items-center justify-center font-bold text-[10px]">
                          {b.employee?.staff_name?.charAt(0) ?? "?"}
                        </span>
                        <div>
                          <span className="block leading-tight">{b.employee?.staff_name || "Unknown"}</span>
                          <span className="font-normal opacity-60 text-[10px]">{b.employee?.staff_role || "—"}</span>
                        </div>
                        {b.staff_id == employee.id && (
                          <span className="ml-auto text-[9px] font-bold uppercase tracking-widest opacity-60">You</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action */}
              {/* Action */}
{isFull && !myBooking ? (
  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
    <span className="text-amber-500 text-sm">⚠</span>
    <p className="text-xs text-amber-700 font-medium">
      This slot is full
    </p>
  </div>
) : myBooking ? (
  <button
    onClick={() => handleCancel(myBooking.id)}
    disabled={actionLoading}
    className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-semibold text-sm rounded-xl px-4 py-2.5 transition disabled:opacity-50"
  >
    {actionLoading ? (
      <span className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
    ) : (
      "✕"
    )}
    Cancel my booking
  </button>
) : (
  <button
    onClick={handleBook}
    disabled={actionLoading}
    className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm rounded-xl px-4 py-2.5 transition shadow-sm shadow-orange-200 disabled:opacity-50"
  >
    {actionLoading ? (
      <span className="w-4 h-4 border-2 border-orange-300 border-t-white rounded-full animate-spin" />
    ) : (
      "＋"
    )}
    Book this slot
  </button>
)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}