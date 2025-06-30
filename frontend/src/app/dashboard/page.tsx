'use client';
import { useEffect, useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import DashboardLayout from "../components/layouts/DashboardLayout";
import CalendarWithTasks from "../components/widgets/CalendarWithTasks";
import TaskTable from "../components/widgets/TaskTable";
type Task = {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  time?: string;
};
export default function DashboardPage() {
  useAuthGuard();
const [tasks, setTasks] = useState<Task[]>([]);
  
const [stats, setStats] = useState({
    totalManagers: 0,
    totalEmployees: 0,
    totalUsers: 0,
    totalProjects: 0,
    totalProjectsWithTeam: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch("http://localhost:3001/dashboard/stats", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Dashboard stats:", data);
        setStats(data);
      }
    };
    const fetchTasks = async () => {
      const res = await fetch("http://localhost:3001/personal-tasks", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    };

    
    fetchStats();
    fetchTasks();
  }, []);

async function onRemoveTasks(taskIds: number[]) {
  try {
    for (const id of taskIds) {
      const res = await fetch(`http://localhost:3001/personal-tasks/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        console.error(`Failed to delete task id=${id}`);
      }
    }
    // Update local state after deletion
    setTasks(prev => prev.filter(task => !taskIds.includes(task.id)));
  } catch (error) {
    console.error("Error deleting tasks:", error);
  }
}





  const managerPercent = stats.totalUsers > 0
    ? Math.round((stats.totalManagers / stats.totalUsers) * 100)
    : 0;

  const employeePercent = stats.totalUsers > 0
    ? Math.round((stats.totalEmployees / stats.totalUsers) * 100)
    : 0;

  const projectTeamPercent = stats.totalProjects > 0
    ? Math.round((stats.totalProjectsWithTeam / stats.totalProjects) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row gap-6 mt-6">

        {/* Stats panel on left */}
        <div className="stats shadow bg-neutral text-neutral-content rounded-lg flex-grow min-w-[300px]">

          {/* Total Managers */}
          <div className="stat flex items-center justify-between gap-6">
            <div>
              <div className="stat-title">Total Managers</div>
              <div className="stat-value text-blue-400">{stats.totalManagers}</div>
              <div className="stat-desc">Assigned manager roles</div>
            </div>
            <div
              className="radial-progress bg-blue-400 text-primary-content border-blue-400 border-4"
              style={{ "--value": managerPercent } as React.CSSProperties}
              role="progressbar"
              aria-valuenow={managerPercent}
              aria-label="Managers percentage"
            >
              {managerPercent}%
            </div>
          </div>

          {/* Total Employees */}
          <div className="stat flex items-center justify-between gap-6">
            <div>
              <div className="stat-title">Total Employees</div>
              <div className="stat-value text-pink-500">{stats.totalEmployees}</div>
              <div className="stat-desc">All employees in system</div>
            </div>
            <div
              className="radial-progress bg-pink-500 text-primary-content border-pink-500 border-4"
              style={{ "--value": employeePercent } as React.CSSProperties}
              role="progressbar"
              aria-valuenow={employeePercent}
              aria-label="Employees percentage"
            >
              {employeePercent}%
            </div>
          </div>

          {/* Total Projects */}
          <div className="stat flex items-center justify-between gap-6">
            <div>
              <div className="stat-title">Total Projects</div>
              <div className="stat-value text-cyan-400">{stats.totalProjects}</div>
              <div className="stat-desc">Current projects with assigned team</div>
            </div>
            <div
              className="radial-progress bg-cyan-400 text-primary-content border-cyan-400 border-4"
              style={{ "--value": projectTeamPercent } as React.CSSProperties}
              role="progressbar"
              aria-valuenow={projectTeamPercent}
              aria-label="Projects with assigned team percentage"
            >
              {projectTeamPercent}%
            </div>
          </div>
        </div>
{/* Calendar + Tasks panel on right */}
        <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-sm">
          <CalendarWithTasks />
        </div>
        

      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Personal Task List</h2>
<TaskTable tasks={tasks} onRemoveTasks={onRemoveTasks} />
      </div>
    </DashboardLayout>
  );
}
