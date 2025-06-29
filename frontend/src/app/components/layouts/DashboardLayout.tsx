"use client";
import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import {
  HomeIcon, UserGroupIcon, ClipboardIcon, Cog6ToothIcon,
  DocumentTextIcon, LifebuoyIcon, UserCircleIcon, ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";
import { useAuthGuard } from "@/hooks/useAuthGuard";

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const { user, loading } = useAuthGuard();
  const pathname = usePathname();
  const router = useRouter();

  if (loading) return <div className="text-center mt-10">Loading...</div>;
 if (!user || user.role?.name.toLowerCase() !== "admin") {
  router.replace("/login");
  return null;
}

  const userName = user?.username ?? "NO_NAME";

  const handleLogout = async () => {
    await fetch("http://localhost:3001/auth/logout", {
  method: "POST",
  credentials: "include",
});
setTimeout(() => {
  router.push("/login");
}, 300);

  };

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
    { href: "/user-management", label: "User Management", icon: UserGroupIcon },
    { href: "/project-oversight", label: "Project Oversight", icon: ClipboardIcon },
    { href: "/system-settings", label: "System Settings", icon: Cog6ToothIcon },
    { href: "/reports-logs", label: "Reports & Logs", icon: DocumentTextIcon },
    { href: "/feedback", label: "Support & Feedback", icon: LifebuoyIcon },
  ];

  return (<div className="drawer h-screen">

    <input id="sidebar-drawer" type="checkbox" className="drawer-toggle" />

<div className="drawer-content flex flex-col h-screen">
      <div className="navbar bg-blue-50 shadow-sm flex-shrink-0">
        <div className="navbar-start">
          <label htmlFor="sidebar-drawer" className="btn btn-circle swap swap-rotate">
            <input type="checkbox" className="hidden" />
            <svg className="swap-off fill-current" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512">
              <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
            </svg>
            <svg className="swap-on fill-current" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512">
              <polygon points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
            </svg>
          </label>
        </div>

        <div className="navbar-center">
          <Image src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo" width={32} height={32} />
          <a href="/dashboard" style={{ fontFamily: "'Lobster', cursive", color: "navy" }} className="text-xl cursor-default">
            TaskSync
          </a>
        </div>

        <div className="navbar-end flex items-center gap-2">
          <button className="btn btn-ghost btn-circle relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="badge badge-xs badge-primary indicator-item absolute top-0 right-0"></span>
          </button>

          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <Image
                  src={
                    user?.avatarUrl
                      ? `http://localhost:3001/uploads/avatars/${user.avatarUrl.split('/').pop()}`
                      : "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                  }
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-blue-100 text-black rounded-box z-10 mt-3 w-52 p-2 shadow"
              style={{ fontFamily: "'Zilla Slab', serif" }}
            >
              <li className="px-4 py-2 font-semibold cursor-default text-violet-400 italic">Hello, {userName}!</li>
              <li>
                <a
                  href="/profile"
                  className={`flex items-center gap-2 rounded w-full text-left px-2 py-1 ${
                    pathname === "/profile" ? "bg-blue-200 font-semibold" : "hover:bg-blue-200"
                  }`}
                >
                  <UserCircleIcon className="h-5 w-5" />
                  Profile
                </a>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 hover:bg-blue-200 rounded w-full text-left px-2 py-1"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-auto p-4" style={{ fontFamily: "'Zilla Slab', serif" }}>
        {children}
      </div>
    </div>

    {/* Sidebar Drawer */}
    <div className="drawer-side z-50">
      <label htmlFor="sidebar-drawer" className="drawer-overlay"></label>
      <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
        {menuItems.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <a
              href={href}
              className={`flex items-center gap-2 rounded px-2 py-1 ${
                pathname === href ? "bg-blue-200 font-semibold" : "hover:bg-blue-200"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

}
