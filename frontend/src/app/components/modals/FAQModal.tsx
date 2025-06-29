"use client";

import React, { useState } from "react";

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const faqs = [
  {
    question: "How do I reset my password?",
    answer: "Click on “Forgot password” at the login page and follow the instructions sent to your email.",
  },
  {
    question: "Can I change my email address?",
    answer: "Yes, go to your profile settings and update your email address.",
  },
  {
    question: "How to contact support?",
    answer: "Email us at support@example.com or call +88018191***** during business hours.",
  },
  {
    question: "How do I add or manage users?",
    answer: "Go to the 'User Management' section from the sidebar where you can add managers/employees.",
  },
  {
    question: "How do I change roles of users?",
    answer: "In the User Management panel, click 'change role' for any user from any table.",
  },
];

const FAQModal: React.FC<FAQModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Support Center FAQs</h2>

          {/* Search input with icon, aligned right and smaller */}
          <div className="relative w-48">
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <svg
              className="w-5 h-5 text-gray-400 dark:text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M16.65 16.65A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
            </svg>
          </div>

          <button
            onClick={onClose}
            className="ml-4 text-gray-500 hover:text-red-500 text-2xl font-bold"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="collapse collapse-plus bg-base-100 border border-base-300 dark:bg-gray-800 dark:border-gray-700 rounded"
              >
                <input
                  type="radio"
                  name="faq-accordion"
                  defaultChecked={index === 0}
                  className="peer"
                />
                <div className="collapse-title font-semibold text-gray-900 dark:text-white">
                  {faq.question}
                </div>
                <div className="collapse-content text-sm text-gray-700 dark:text-gray-300">
                  {faq.answer}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic dark:text-gray-400">No matching FAQs found.</p>
          )}
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQModal;
