"use client";
import { useState } from "react";
import Image from "next/image";
import Cookies from "js-cookie";
import { useRouter } from 'next/navigation';


export default function LoginPage() {
const router = useRouter();
const [email, setEmail] = useState(Cookies.get("remember_email") || "");
const [password, setPassword] = useState(Cookies.get("remember_password") || "");
const [remember, setRemember] = useState(!!Cookies.get("remember_email"));
const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
const [showPassword, setShowPassword] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrors({});

  if (!email) {
    setErrors((prev) => ({ ...prev, email: "Email is required" }));
    return;
  }
  if (!password) {
    setErrors((prev) => ({ ...prev, password: "Password is required" }));
    return;
  }

  try {
    const response = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      if (Array.isArray(data.message)) {
        const fieldErrors: { email?: string; password?: string } = {};
        data.message.forEach((msg: string) => {
          if (msg.toLowerCase().includes("email")) fieldErrors.email = msg;
          if (msg.toLowerCase().includes("password")) fieldErrors.password = msg;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: data.message || "Login failed" });
      }
      return;
    }

    // ✅ Store email/password if remember is checked
    if (remember) {
      Cookies.set("remember_email", email, { expires: 30, path: "/" });
      Cookies.set("remember_password", password, { expires: 30, path: "/" });
    } else {
      Cookies.remove("remember_email");
      Cookies.remove("remember_password");
    }

    // ✅ Redirect
    router.push("/dashboard");

  } catch (err) {
    if (err instanceof Error) {
      setErrors({ general: err.message });
    } else {
      setErrors({ general: "Something went wrong" });
    }
  }
};


  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center px-6 py-8">
      <div className="flex flex-col items-center justify-center mx-auto md:h-screen lg:py-0 w-full max-w-md">
        <a
  href="#"
  className="flex items-center mb-6 text-2xl text-blue-400 dark:text-blue-300"
  style={{ fontFamily: "'Lobster', cursive" }}
>
  <Image
    className="mr-2"
    src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg"
    alt="logo"
    width={32}
    height={32}
  />
  TaskSync
</a>

        <div className="w-full bg-white rounded-lg shadow dark:border dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Sign in to your account
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6" noValidate>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="name@email.com"
                  required
                  className={`bg-gray-50 border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}/>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.email}</p>
                )}
              </div>
              <div className="relative">
  <label
    htmlFor="password"
    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
    Password
  </label>

  <input
    type={showPassword ? "text" : "password"}
    name="password"
    id="password"
    autoComplete="current-password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="••••••••"
    required
    className={`bg-gray-50 border ${
      errors.password ? "border-red-500" : "border-gray-300"
    } text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 pr-10
      dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
  />

  {/* Toggle button */}
  <button
    type="button"
    onClick={() => setShowPassword((prev) => !prev)}
    className="absolute right-3 top-[38px] text-gray-500 dark:text-gray-300"
    tabIndex={-1}
  >
    {showPassword ? (
      // Eye icon (visible)
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ) : (
      // Eye off icon (hidden)
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a10.05 10.05 0 011.658-3.033M9.88 9.88a3 3 0 104.24 4.24M3 3l18 18" />
      </svg>
    )}
  </button>

  {errors.password && (
    <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.password}</p>
  )}
</div>

              {/* General errors below inputs */}
              {errors.general && (
                <p className="text-red-600 text-center text-sm mb-2">{errors.general}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="remember"
                      name="remember" 
                      aria-describedby="remember"
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      autoComplete="on" 
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50
                                 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700
                                 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="remember" className="text-gray-500 dark:text-gray-300">
                      Remember me
                    </label>
                  </div>
                </div>
                <a href="/forgot-password"
                  className="text-sm font-medium text-blue-400 hover:underline dark:text-blue-300">
                  Forgot password?
                </a>
              </div>
              <button className="btn btn-outline btn-primary btn-lg mx-auto block">Login</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
