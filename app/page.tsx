"use client";

import Image from "next/image";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Kita cari terus dalam table 'employee'
    const { data, error } = await supabase
      .from("employee")
      .select("*")
      .eq("staff_email", email)
      .eq("password", password) // Ini semak password teks biasa
      .single(); // Kita nak satu result sahaja

    if (error || !data) {
      // Jika tak jumpa atau ada error
      alert("Email atau Password salah!");
      setIsLoading(false);
    } else {
      // Jika jumpa, maksudnya login berjaya
      console.log("Data pekerja:", data);
      alert(`Selamat kembali, ${data.staff_name}!`);

      // Simpan nama dalam LocalStorage supaya senang nak guna kat page lain nanti
      localStorage.setItem("id", data.id);

      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black p-6">
      <div className="w-full max-w-sm space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
        {/* Logo/Header Section */}
        <div className="flex flex-col items-center gap-2 text-center">
          <Image
            className="mb-4"
            src="/logo_amber.png"
            alt="Amber Coffee logo"
            width={200}
            height={200}
            priority
          />
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Welcome To Attendance System
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Enter your credentials to access your account
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none text-zinc-700 dark:text-zinc-300"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-10 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:focus:ring-white"
            />
          </div>

          <div className="space-y-2">
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex h-10 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:focus:ring-white"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-10 w-full items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Sign In
          </button>
        </form>

        <div className="text-center text-sm text-zinc-500">
          Don&apos;t have an account?{" "}
          <a
            href="/signup"
            className="font-medium text-black underline-offset-4 hover:underline dark:text-white"
          >
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
