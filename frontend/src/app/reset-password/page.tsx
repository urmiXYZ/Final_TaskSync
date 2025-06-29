"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";

function ResetForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(180);
  const [email, setEmail] = useState(""); 
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
const storedEmail = sessionStorage.getItem("resetEmail");
  if (storedEmail) setEmail(storedEmail);
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
if (!storedEmail) {
    setError("No email found. Please go back to Forgot Password.");
    return;
  }
    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

 const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!token.trim()) return setError("Please enter the reset token.");
    if (!password.trim()) return setError("Please enter the new password.");

    try {
      const res = await fetch("http://localhost:3001/user/reset-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "reset-token": token.trim(),
        },
        body: JSON.stringify({ newPassword: password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");
      setMessage(data.message);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
  setError("Code is expired. Failed to reset password.");
}
  };
  const handleResend = async () => {
  try {
    const res = await fetch("http://localhost:3001/user/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    setMessage("New token sent to email.");
    setTimer(180); 
  } catch {
  setError("Failed to resend token.");
}
};

  return (
    <section className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleReset}
        className="bg-gray-100 dark:bg-gray-800 p-6 rounded shadow max-w-md w-full"
      >
        <h2 className="text-xl font-bold mb-4 text-center text-gray-900 dark:text-white">
          Reset Password
        </h2>

        <input
          type="text"
          placeholder="Enter reset token"
          className="w-full p-2 mb-3 rounded border bg-gray-200 dark:bg-gray-700"
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            if (error) setError("");
          }}
        />
  <div className="relative mb-3">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Enter new password"
    className="w-full p-2 rounded border bg-gray-200 dark:bg-gray-700 pr-10"
    value={password}
    onChange={(e) => {
      setPassword(e.target.value);
      if (error) setError("");
    }}
  />
  <button
    type="button"
    onClick={() => setShowPassword((prev) => !prev)}
    className="absolute right-3 top-2 text-gray-500 dark:text-gray-300"
    tabIndex={-1}
  >
    {showPassword ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a10.05 10.05 0 011.658-3.033M9.88 9.88a3 3 0 104.24 4.24M3 3l18 18" />
      </svg>
    )}
  </button>
</div>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
  <span>
    Code expires in: <span className="font-semibold">{formatTime(timer)}</span>
  </span>
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      handleResend();
    }}
    className="ml-2 font-medium text-orange-500 hover:underline dark:text-orange-400"
  >
    Resend Code
  </a>
</div>
{timer === 0 && (
  <p className="text-red-600 text-sm mt-2">
    Token expired. Please resend code.
  </p>
)}
<button
  type="submit"
  onClick={handleReset}
  disabled={timer === 0}
  className="btn btn-primary w-full disabled:opacity-50"
>
  Reset Password
</button>
        {message && <p className="mt-2 text-green-600">{message}</p>}
        {error && <p className="mt-2 text-red-600">{error}</p>}
      </form>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center p-8">Loading reset form...</div>}>
      <ResetForm />
    </Suspense>
  );
}
