"use client";
import { useState, useEffect } from "react";

interface UserType {
  id: string;
  avatarUrl?: string | null;
  username: string;
  email: string;
  role?: { name: string };
}

interface ProfileUpdateModalProps {
  user: UserType; 
  onClose: () => void;
  onUpdate: (updatedUser: UserType) => void; 
}

export default function ProfileUpdateModal({ user, onClose, onUpdate }: ProfileUpdateModalProps) {
  const [name, setName] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  useEffect(() => {
    setName(user?.username ?? "");
    setEmail(user?.email ?? "");
    setError(null);
  }, [user]);


  const isUnchanged = name === user?.username && email === user?.email;
  const isInvalid = name.trim().length < 2 || email.trim().length < 5; // basic length check

  const handleSubmit = async () => {
  setLoading(true);
  setError(null);
  try {
    const res = await fetch("http://localhost:3001/user/profile", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: email.trim() }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Update failed");
    }

    const updatedUser = await res.json();
    onUpdate(updatedUser);
    onClose();
  } catch (err) {
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("Update failed");
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-md shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-center">Update Profile</h2>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Name</label>
           <input
  type="text"
  className="input input-bordered w-full bg-gray-100 disabled:bg-gray-200 disabled:text-gray-400"
  value={name}
  onChange={(e) => setName(e.target.value)}
  disabled={loading}
/>
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
  type="email"
  className="input input-bordered w-full bg-gray-100 disabled:bg-gray-200 disabled:text-gray-400"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  disabled={loading}
/>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-outline" disabled={loading}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || isUnchanged || isInvalid}
            className="btn btn-primary"
            title={
              isUnchanged
                ? "No changes to save"
                : isInvalid
                ? "Please enter valid name and email"
                : undefined
            }
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}
