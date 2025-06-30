"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import DashboardLayout from "../components/layouts/DashboardLayout";
import ProfileUpdateModal from "../components/modals/ProfileUpdateModal";
import ChangePasswordModal from "../components/modals/ChangePasswordModal";
import ImageCropModal from "../components/modals/ImageCropModal";

interface UserType {
  id: string;
  avatarUrl?: string | null;
  username: string;
  email: string;
  role?: { name: string };
}

export default function ProfilePage() {
  const { user, loading } = useAuthGuard();
  const [profileImage, setProfileImage] = useState<string | null>(null);
const [showModal, setShowModal] = useState(false);
const [currentUser, setCurrentUser] = useState<UserType | null>(null);
const [successMsg, setSuccessMsg] = useState<string | null>(null);
const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
const [successMsg2, setSuccessMsg2] = useState<string | null>(null);
const [selectedFile, setSelectedFile] = useState<File | null>(null);

useEffect(() => {
  if (user) {
    setCurrentUser({
      ...user,
      id: String(user.id), // explicitly convert to string
    });
  }
}, [user]);



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setSelectedFile(file);
};
const uploadCroppedImage = async (croppedBlob: Blob) => {
  const formData = new FormData();
  formData.append("file", croppedBlob, "avatar.jpg");

  try {
    const res = await fetch("http://localhost:3001/user/profile/avatar", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");

    const updatedUser = await res.json();
    setCurrentUser(updatedUser);

    const filename = updatedUser.avatarUrl.split("/").pop();
    setProfileImage(`http://localhost:3001/uploads/avatars/${filename}`);

    setSuccessMsg("Profile picture updated successfully!");
  } catch (err) {
    console.error("Upload error:", err);
  }
};


const handleProfileUpdate = (updatedUser: UserType) => {
  if (updatedUser.avatarUrl) {
  const filename = updatedUser.avatarUrl.split('/').pop();
  setProfileImage(`http://localhost:3001/uploads/avatars/${filename}`);
} else {
  setProfileImage(null);
}
setCurrentUser(updatedUser);
 setSuccessMsg("Profile updated successfully!");
    setShowModal(false);
};

useEffect(() => {
  if (!successMsg && !successMsg2) return;
  const timer = setTimeout(() => {
    setSuccessMsg(null);
    setSuccessMsg2(null);
  }, 3000);

  return () => clearTimeout(timer);
}, [successMsg, successMsg2]);


  useEffect(() => {
  if (currentUser?.avatarUrl) {
    const filename = currentUser.avatarUrl.split('/').pop();
    setProfileImage(`http://localhost:3001/uploads/avatars/${filename}`);
  }
}, [currentUser]);

  if (loading) return <div>Loading...</div>;
if (!currentUser) return <div>You must be logged in to see this page.</div>;


  return (
    <DashboardLayout>
      <div
        className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-10"
        style={{ fontFamily: "'Zilla Slab', serif" }}
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-600 italic">
  Profile
</h1>

{/* Success message */}
{successMsg && (
  <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow z-50">
    {successMsg}
  </div>
)}
{/* Success message2 */}
{successMsg2 && (
  <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow z-50">
    {successMsg2}
  </div>
)}

        <div className="flex flex-col items-center gap-4 mb-6">
          {profileImage ? (
            <Image
              src={profileImage}
alt={`${currentUser?.username ?? "User"}'s Profile Image`}
              width={150}
              height={150}
              className="rounded-full object-cover border-2 border-blue-400"
            />
          ) : (
            <div className="w-[150px] h-[150px] rounded-full bg-gray-300 flex items-center justify-center text-6xl text-white font-bold">
{currentUser.username?.charAt(0).toUpperCase() ?? "U"}            </div>
          )}
<>
  <label className="btn btn-outline btn-primary w-48 cursor-pointer">
    Upload Profile Picture
    <input
      type="file"
      accept="image/*"
      hidden
      onChange={handleFileChange}
    />
  </label>
</>
        </div>

        <div className="space-y-4 text-left">
          <div>
            <h2 className="font-semibold">Name:</h2>
<p>{currentUser.username}</p>          </div>
          <div>
            <h2 className="font-semibold">Email:</h2>
<p>{currentUser.email}</p>          </div>
          <div>
            <h2 className="font-semibold">Role:</h2>
<p>{currentUser.role?.name ?? "N/A"}</p>          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
<button
  className="btn btn-primary w-48"
  onClick={() => setShowModal(true)}
>
  Update Profile Info
</button>
          <button
  className="btn btn-outline w-48 text-yellow-600 border-yellow-600 hover:bg-yellow-600 hover:text-white"
  onClick={() => setShowChangePasswordModal(true)}
>
  Change Password
</button>

        </div>
      </div>
      {showModal && (
  <ProfileUpdateModal
    user={currentUser}
    onClose={() => setShowModal(false)}
    onUpdate={handleProfileUpdate}
  />
)}
{showChangePasswordModal && (
  <ChangePasswordModal
    onClose={() => setShowChangePasswordModal(false)}
    onSuccess={(msg) => {
      setSuccessMsg2(msg);
      setShowChangePasswordModal(false);
    }}
  />
)}

{selectedFile && (
  <ImageCropModal
    file={selectedFile}
    onClose={() => setSelectedFile(null)}
    onCropComplete={(croppedBlob) => {
      uploadCroppedImage(croppedBlob);
      setSelectedFile(null);
    }}
  />
)}

    </DashboardLayout>
  );
}
