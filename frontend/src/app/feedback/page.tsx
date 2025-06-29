"use client";
import React, { useState, useEffect } from "react";import DashboardLayout from "../components/layouts/DashboardLayout";
import FAQModal from "../components/modals/FAQModal";
import { useAuthGuard } from "@/hooks/useAuthGuard";

interface User {
  name: string;
  email: string;
}

export default function FeedbackPage() {
 const [errors, setErrors] = useState<Record<string, string>>({});
  const [isModalOpen, setModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  useAuthGuard();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("http://localhost:3001/auth/me", {
          credentials: "include", // send cookies
        });
        if (res.ok) {
          const userData = await res.json();
          setUser({ name: userData.username, email: userData.email });
        }
      } catch (error) {
        console.error("Failed to fetch user info", error);
      }
    }
    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({}); 

    const formData = new FormData(e.currentTarget);
    const data = {
      name: user?.name, 
      email: user?.email,
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    const res = await fetch("http://localhost:3001/feedback", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      if (Array.isArray(result.message)) {
        const fieldErrors: Record<string, string> = {};
        result.message.forEach((msg: string) => {
          if (msg.toLowerCase().includes("name")) fieldErrors.name = msg;
          if (msg.toLowerCase().includes("email")) fieldErrors.email = msg;
          if (msg.toLowerCase().includes("subject")) fieldErrors.subject = msg;
          if (msg.toLowerCase().includes("message")) fieldErrors.message = msg;
        });
        setErrors(fieldErrors);
      } else {
        alert("Submission failed.");
      }
      return;
    }

    alert("Feedback submitted successfully!");
    e.currentTarget.reset();
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-black">
        <div className="py-6 flex flex-col justify-center sm:py-12">
          <div className="relative py-3 sm:max-w-xl sm:mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black dark:from-indigo-700 dark:to-purple-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl" />
            <div className="relative px-4 py-10 bg-white dark:bg-gray-800 shadow-lg sm:rounded-3xl sm:p-20 text-gray-900 dark:text-white">
              <div className="text-center pb-6">
                <h1 className="text-3xl">Support & Feedback</h1>
                <p className="text-gray-500 dark:text-gray-300">
                  Fill out the form below to send us your thoughts.
                </p>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <input
                    className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 shadow-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    type="text"
                    placeholder="Name"
                    name="name"
                    value={user?.name || ""}
                    readOnly
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>

                <div className="mb-4">
                  <input
                    className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 shadow-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={user?.email || ""}
                    readOnly
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                <div className="mb-4">
                  <input
                    className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 shadow-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    type="text"
                    placeholder="Subject"
                    name="subject"
                  />
                  {errors.subject && <p className="text-red-600 text-sm mt-1">{errors.subject}</p>}
                </div>

                <div className="mb-4">
                  <textarea
                    className="w-full h-32 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 shadow-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Type your message here..."
                    name="message"
                  />
                  {errors.message && <p className="text-red-600 text-sm mt-1">{errors.message}</p>}
                </div>

                <div className="flex justify-between">
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Send ➤
                  </button>
                  <button
                    type="reset"
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => setErrors({})}
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

{/* Footer Cards Section */}
<div className="bg-black py-12 px-4 sm:px-8">
  <div className="flex flex-col sm:flex-row justify-center items-stretch gap-6 max-w-6xl mx-auto">
    {/* Contact Card */}
    <div className="card bg-primary text-primary-content w-full sm:w-80">
      <div className="card-body space-y-3">
        <h2 className="card-title">Email or Call Us</h2>
        <p>{"We're always happy to hear from you."}</p>
        <div className="flex items-center gap-2">
          <span>✉️</span>
          <a href="mailto:something@gmail.com" className="underline hover:text-indigo-300">
            something@gmail.com
          </a>
        </div>
        <div className="flex items-center gap-2">
          <span>📞</span>
          <span className="font-mono">+88018191*****</span>
        </div>
      </div>
    </div>

    {/* FAQ Card */}
    <div className="card bg-primary text-primary-content w-full sm:w-80">
      <div className="card-body space-y-3">
        <h2 className="card-title">More Support</h2>
        <p>Have questions? Explore our FAQ section to find quick answers.</p>
        <button className="btn btn-secondary" onClick={() => setModalOpen(true)}>
          FAQs
        </button>
      </div>
    </div>

    {/* Location Text Card */}
    <div className="card bg-primary text-primary-content w-full sm:w-80">
      <div className="card-body space-y-3">
        <h2 className="card-title">Locate Us</h2>
        <p>Our office is in a vibrant area of Dhaka.</p>
        <a
          href="https://www.google.com/maps?q=Gulshan+1,+Dhaka,+Bangladesh"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-indigo-300"
        >
          📍 Gulshan 1, Dhaka, Bangladesh
        </a>
      </div>
    </div>
  </div>

  {/* Full-Width Map */}
  <div className="mt-8 rounded overflow-hidden max-w-6xl mx-auto">
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.4071333400225!2d90.41115067593139!3d23.768347778678993!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c795fdb13227%3A0x38b1c41dc17d4ff1!2sGulshan%201%2C%20Dhaka%201213!5e0!3m2!1sen!2sbd!4v1689765998573!5m2!1sen!2sbd"
      width="100%"
      height="240"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    ></iframe>
  </div>
</div>



        <FAQModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      </div>
    </DashboardLayout>
  );
}
