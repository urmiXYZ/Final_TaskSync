"use client";

import React, { useState } from "react";
import Image from "next/image";

type RequestUser = {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt?: string;
};

interface Props {
  role: "manager" | "employee";
  users: RequestUser[];
  onAdd: (id: number) => void;
  onClose: () => void;
}

export default function RequestUserModal({
  role,
  users,
  onAdd,
  onClose,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-lg w-[95%] max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto shadow-lg">
        <button
  className="absolute top-2 right-4 text-3xl font-bold"  
  onClick={onClose}
  aria-label="Close"
>
  ×
</button>
        <h2 className="text-2xl font-semibold mb-6 text-center text-orange-500">
          Add User as {role}
        </h2>

        <div className="flex justify-end mb-4">
          <input
            type="text"
            placeholder="🔍 Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered w-64 bg-gray-200 placeholder-gray-500 text-gray-700"
          />
        </div>

        {filteredUsers.length === 0 ? (
          <p className="text-center text-gray-600">No request users found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-sm border max-h-96 overflow-y-auto">
            <table className="table w-full text-sm">
              <thead className="bg-gray-200 text-gray-800">
                <tr>
                  <th>#</th>
                  <th>Profile</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-100">
                    <td>{index + 1}</td>
                    <td>
                      {user.avatarUrl ? (
                        <Image
                          src={user.avatarUrl}
                          alt={user.name}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-500">
                          N/A
                        </div>
                      )}
                    </td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <button
                        onClick={() => onAdd(user.id)}
                        className="btn btn-sm btn-success"
                      >
                        Add
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
