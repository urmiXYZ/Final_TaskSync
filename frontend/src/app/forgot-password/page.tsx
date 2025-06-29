"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setMessage("");
  setError("");

  if (!email.trim()) {
    setError("Please enter your email.");
    return;
  }

  if (!emailRegex.test(email)) {
    setError("Please enter a valid email address.");
    return;
  }

    try {
      const res = await fetch("http://localhost:3001/user/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      setMessage(data.message);
      sessionStorage.setItem("resetEmail", email);
      router.push("/reset-password");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-100 dark:bg-gray-800 p-6 rounded shadow max-w-md w-full"
      >
        <h2 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-white">
          Forgot Password
        </h2>
        <input
  type="text"
  placeholder="Enter your email"
  className="w-full p-2 mb-3 rounded border border-gray-300 bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"
  value={email}
  onChange={(e) => {
    setEmail(e.target.value);
    if (error) setError(""); 
  }}
/>

        <button className="btn btn-primary w-full">Send Reset Code</button>
        {message && <p className="mt-2 text-green-600">{message}</p>}
        {error && <p className="mt-2 text-red-600">{error}</p>}
      </form>
    </section>
  );
}
