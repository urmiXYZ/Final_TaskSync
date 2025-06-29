"use client";

import { useState, useMemo } from "react";

interface ChangePasswordModalProps {
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export default function ChangePasswordModal({ onClose, onSuccess }: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const isMatch = confirmPassword === newPassword;
const isValidLength = newPassword.length >= 6 && newPassword.length <= 32;
const isInvalid =oldPassword.length < 6 ||!isValidLength ||newPassword.length === 0 ||!isMatch;

  const getPasswordChecks = (password: string) => ({
  hasUpper: /[A-Z]/.test(password),
  hasLower: /[a-z]/.test(password),
  hasNumber: /\d/.test(password),
  hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
});

  const { hasUpper, hasLower, hasNumber, hasSpecial } = useMemo(() => getPasswordChecks(newPassword), [newPassword]);

const passwordStrength = useMemo(() => {
  const rulesMet = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  if (newPassword.length === 0) return "";
  if (newPassword.length < 6) return "Very Weak";
  if (rulesMet <= 2) return "Weak";
  if (rulesMet === 3) return "Medium";
  if (rulesMet === 4) return "Strong";
  return "Very Weak";
}, [newPassword, hasUpper, hasLower, hasNumber, hasSpecial]);


  const strengthColor = {
    "": "",
    "Very Weak": "bg-red-500",
    "Weak": "bg-orange-400",
    "Medium": "bg-yellow-400",
    "Strong": "bg-green-500",
  }[passwordStrength];

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:3001/user/profile/password", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to change password");
      }

      const data = await res.json();
      onSuccess(data.message || "Password updated successfully");
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to change password");
      }
    } finally {
      setLoading(false);
    }
  };

  const EyeToggle = ({
  isVisible,
  toggle,
}: {
  isVisible: boolean;
  toggle: () => void;
}) => (
  <button
    type="button"
    onClick={toggle}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 focus:outline-none z-10"
    aria-label={isVisible ? "Hide password" : "Show password"}
    tabIndex={-1}
  >
      {isVisible ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.977 9.977 0 012.45-6.437m4.42 3.868a3 3 0 104.24 4.24"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 01-3 3m0-6a3 3 0 013 3"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.977 9.977 0 012.45-6.437m4.42 3.868a3 3 0 104.24 4.24"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3l18 18"
          />
        </svg>
      )}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-md shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-center">Change Password</h2>

        <div className="space-y-4">
          {/* Old password input */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="oldPassword">
              Old Password
            </label>
            <div className="relative overflow-visible">
              <input
                id="oldPassword"
                type={showOldPassword ? "text" : "password"}
                className="input input-bordered w-full bg-gray-100 pr-16"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                disabled={loading}
                minLength={6}
                autoComplete="current-password"
              />
              <EyeToggle isVisible={showOldPassword} toggle={() => setShowOldPassword((v) => !v)} />
            </div>
          </div>

          {/* New password input */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="newPassword">
              New Password
            </label>
            <div className="relative overflow-visible">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                className="input input-bordered w-full bg-gray-100 pr-16"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                minLength={6}
                maxLength={32}
                autoComplete="new-password"
              />
              <EyeToggle isVisible={showNewPassword} toggle={() => setShowNewPassword((v) => !v)} />
            </div>

            {/* Confirm new password input */}
<div>
  <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">
    Confirm New Password
  </label>
  <div className="relative">
    <input
      id="confirmPassword"
      type={showConfirmPassword ? "text" : "password"}
      className="input input-bordered w-full bg-gray-100 pr-16"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      disabled={loading}
      minLength={6}
      maxLength={32}
      autoComplete="new-password"
    />
    <EyeToggle
      isVisible={showConfirmPassword}
      toggle={() => setShowConfirmPassword((v) => !v)}
    />
  </div>
  {confirmPassword.length > 0 && (
    <p className={`text-sm mt-1 ${isMatch ? "text-green-600" : "text-red-500"}`}>
      {isMatch ? "✓ Passwords match" : "✘ Passwords do not match"}
    </p>
  )}
</div>


            {/* Strength bar */}
            {newPassword.length > 0 && (
              <>
                <div className="h-2 w-full rounded bg-gray-300 mt-2">
                  <div
                    className={`h-2 rounded transition-all duration-300 ease-in-out ${strengthColor}`}
                    style={{
                      width:
                        passwordStrength === "Very Weak"
                          ? "25%"
                          : passwordStrength === "Weak"
                          ? "50%"
                          : passwordStrength === "Medium"
                          ? "75%"
                          : passwordStrength === "Strong"
                          ? "100%"
                          : "0%",
                    }}
                  ></div>
                </div>
                <p
                  className={`mt-1 text-sm font-semibold ${
                    strengthColor.replace("bg-", "text-")
                  }`}
                >
                  Strength: {passwordStrength}
                </p>
              </>
            )}

            {/* Requirements checklist */}
            {newPassword.length > 0 && (
              <ul className="mt-2 space-y-1 ml-2 text-xs">
                <li className={hasUpper ? "text-green-600" : "text-red-500"}>
                  {hasUpper ? "✔" : "✘"} At least one uppercase letter
                </li>
                <li className={hasLower ? "text-green-600" : "text-red-500"}>
                  {hasLower ? "✔" : "✘"} At least one lowercase letter
                </li>
                <li className={hasNumber ? "text-green-600" : "text-red-500"}>
                  {hasNumber ? "✔" : "✘"} At least one number
                </li>
                <li className={hasSpecial ? "text-green-600" : "text-red-500"}>
                  {hasSpecial ? "✔" : "✘"} At least one special character (!@#$...)
                </li>
                <li className={isValidLength ? "text-green-600" : "text-red-500"}>
                  {isValidLength ? "✔" : "✘"} Length 6–32 characters
                </li>
              </ul>
            )}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-outline" disabled={loading}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={loading || isInvalid}
            title={isInvalid ? "Password must be 6–32 characters" : undefined}
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
