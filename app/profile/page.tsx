"use client";

import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Sidebar from "../components/sidebar";

export default function Page() {
  const supabase = createClient();

  const [employee, setEmployee] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (data) setEmployee(data);
    };
    fetchEmployee();
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setIsSaving(true);
    let imageUrl = employee.profile_image;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const fileName = `${employee.id}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("profile_image")
        .upload(fileName, imageFile, { upsert: true });

      if (uploadError) {
        toast.error("Failed to upload image.");
        setIsSaving(false);
        return;
      }

      const { data } = supabase.storage.from("profile_image").getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    const { error } = await supabase
      .from("employee")
      .update({
        staff_name: employee.staff_name,
        staff_email: employee.staff_email,
        staff_phoneNum: employee.staff_phoneNum,
        profile_image: imageUrl,
      })
      .eq("id", employee.id);

    setIsSaving(false);
    if (!error) {
      setEmployee({ ...employee, profile_image: imageUrl });
      setIsEditing(false);
      setImageFile(null);
      setImagePreview(null);
      toast.success("Profile updated!");
    } else {
      toast.error("Failed to update profile.");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setImageFile(null);
    setImagePreview(null);
  };

  const avatarSrc = imagePreview || employee.profile_image || "/default-profile.png";

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 min-w-0 p-4 pt-16 md:p-8 md:pt-8">
        {/* Top Navbar */}
        <div className="flex justify-end mb-6 relative pl-10 md:pl-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <div className="w-9 h-9 rounded-full bg-orange-700 text-white flex items-center justify-center font-bold text-sm">
              {employee.staff_name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{employee.staff_name}</p>
              <p className="text-xs text-slate-400">{employee.staff_role}</p>
            </div>
          </button>

          {showMenu && (
            <div className="absolute top-14 right-0 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
              <Link href="/profile" className="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-200">
                👤 Profile Details
              </Link>
              <button onClick={handleLogout} className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm text-red-500">
                🚪 Logout
              </button>
            </div>
          )}
        </div>

        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">My Profile</h1>
          <p className="text-slate-400 text-sm mt-1">View and edit your account details</p>
        </div>

        <div className="max-w-xl space-y-4">
          {/* Avatar card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 relative">
                <Image
                  src={avatarSrc}
                  alt="Profile picture"
                  fill
                  className="rounded-full object-cover border-4 border-slate-100"
                />
              </div>
              {isEditing && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </>
              )}
            </div>

            <div>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{employee.staff_name}</p>
              <span className="inline-block mt-1 text-xs font-semibold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">
                {employee.staff_role}
              </span>
              {isEditing && (
                <p className="text-xs text-slate-400 mt-2">Tap the photo to change it</p>
              )}
            </div>
          </div>

          {/* Details card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={employee.staff_name}
                  onChange={(e) => setEmployee({ ...employee, staff_name: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              ) : (
                <p className="text-slate-800 dark:text-slate-100 text-sm font-medium">{employee.staff_name}</p>
              )}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700" />

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={employee.staff_email}
                  onChange={(e) => setEmployee({ ...employee, staff_email: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              ) : (
                <p className="text-slate-800 dark:text-slate-100 text-sm font-medium">{employee.staff_email}</p>
              )}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700" />

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={employee.staff_phoneNum}
                  onChange={(e) => setEmployee({ ...employee, staff_phoneNum: e.target.value })}
                  className="w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              ) : (
                <p className="text-slate-800 dark:text-slate-100 text-sm font-medium">{employee.staff_phoneNum || "—"}</p>
              )}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700" />

            {/* Role — always read-only */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Role
              </label>
              <p className="text-slate-800 dark:text-slate-100 text-sm font-medium">{employee.staff_role}</p>
            </div>
          </div>

          {/* Action buttons */}
          {isEditing ? (
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl px-4 py-3 transition shadow-sm"
              >
                {isSaving ? (
                  <span className="w-4 h-4 border-2 border-orange-300 border-t-white rounded-full animate-spin" />
                ) : null}
                {isSaving ? "Saving…" : "Save Changes"}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-semibold text-sm rounded-xl px-4 py-3 transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl px-4 py-3 transition"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
