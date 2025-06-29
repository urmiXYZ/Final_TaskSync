'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import toast from 'react-hot-toast';
import TeamModal from '../components/modals/TeamModal';
import EditProjectModal from '../components/modals/EditProjectModal';
import type { Project } from '@/types/types';
import ChatModal from '../components/modals/ChatModal';

type ChatMessage = {
  id: number;
  senderId: number;
  sender: {
    username: string;
  };
  content: string;
  timestamp: string;
};

type ChatData = {
  conversationId: number;
  messages: ChatMessage[];
};


const ITEMS_PER_PAGE = 5;

export default function Project() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
const [newName, setNewName] = useState('');
const [newDesc, setNewDesc] = useState('');
const [selectedProject, setSelectedProject] = useState<Project | null>(null);
const [showTeamModal, setShowTeamModal] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);
const [showChat, setShowChat] = useState(false);
const [chatData, setChatData] = useState<ChatData | null>(null);

  useAuthGuard();

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  useEffect(() => {
    fetchProjects();
  }, [debouncedSearch]);

  async function fetchProjects() {
  setLoading(true);
  try {
    let url = `${BACKEND_URL}/projects/all`;

    if (debouncedSearch && debouncedSearch.trim() !== '') {
      const params = new URLSearchParams({ term: debouncedSearch });
      url = `${BACKEND_URL}/projects/search?${params.toString()}`;
    }

    const res = await fetch(url, {
      credentials: 'include', 
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch projects: ${res.status} ${res.statusText}`);
    }

    const data: Project[] = await res.json();
    setProjects(data);
    setCurrentPage(1);
  } catch (err) {
    console.error('Failed to fetch projects', err);
  } finally {
    setLoading(false);
  }
}

const handleSaveProject = (updatedProject: Project) => {
  setProjects((prevProjects) =>
    prevProjects.map((proj) =>
      proj.id === updatedProject.id ? updatedProject : proj
    )
  );
};
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProjects = projects.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);

  const renderEntryInfo = () => {
    if (projects.length === 0) return 'No projects to show.';
    const start = startIdx + 1;
    const end = Math.min(startIdx + ITEMS_PER_PAGE, projects.length);
    return `Showing ${start} to ${end} of ${projects.length} projects`;
  };

  const renderPagination = () => (
    <div className="flex justify-center items-center gap-2 mt-4">
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        className="btn btn-sm btn-outline"
      >
        Prev
      </button>
      <span className="text-sm">
        Page {currentPage} of {totalPages}
      </span>
      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        className="btn btn-sm btn-outline"
      >
        Next
      </button>
    </div>
  );

  const renderTable = () => (
    <div className="overflow-x-auto rounded-lg shadow-sm border">
      <table className="table w-full text-sm">
        <thead className="bg-gray-200 text-gray-800">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Description</th>
            <th>Assigned Manager</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProjects.map((project, idx) => (
            <tr
              key={project.id}
              className="hover:bg-gray-100"
            >
              <th>{startIdx + idx + 1}</th>
              <td>{project.name}</td>
              <td>{project.description}</td>
              <td>{project.owner?.username || 'None'}</td>
              <td>
              <button
    className="btn btn-sm btn-primary mr-2"
    onClick={() => {
      setSelectedProject(project);
      setShowTeamModal(true);
    }}
  >
    Assign/Change Team
  </button>
  <button
    className="btn btn-sm bg-yellow-400 hover:bg-yellow-500 text-black"
    onClick={() => {
      setSelectedProject(project);
      setShowEditModal(true);  
    }}
  >
    Edit
  </button>
  <button
  className="btn btn-sm bg-green-500 hover:bg-green-600 text-white"
  onClick={async () => {
    setSelectedProject(project);

    const res = await fetch(`${BACKEND_URL}/projects/${project.id}/chat`, { credentials: 'include' });
    const data = await res.json();
    setChatData(data);
    setShowChat(true);
  }}
>
 💬 Chat
</button>



</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const handleCreateProject = async () => {
  if (!newName.trim() || !newDesc.trim()) {
    toast.error("Project name and description are required.");
    return;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/projects/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newName, description: newDesc }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Failed to create project");
    }

    const newProject = await res.json();
    setProjects(prev => [newProject, ...prev]);
    toast.success("Project created successfully!");
    setNewName("");
    setNewDesc("");
    setShowModal(false);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    toast.error("Error: " + message);
  }
};



useEffect(() => {
  if (!loading && projects.length === 0 && debouncedSearch.trim()) {
    toast('No projects matched your search.', { icon: '🔍' });
  }
}, [loading, projects, debouncedSearch]);


  return (
    <DashboardLayout>
      <div className={showModal ? "blur-sm pointer-events-none" : ""}>
      <div
        className="max-w-7xl mx-auto p-6 bg-white rounded shadow mt-10"
        style={{ fontFamily: "'Zilla Slab', serif" }}
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-600 italic">
          Project Oversight
        </h1>

        <div className="mb-6 max-w-md mx-auto flex items-center gap-4">
  <button
    className="btn mb-0 bg-orange-500 hover:bg-orange-600 border-none"
    onClick={() => setShowModal(true)}
    style={{ lineHeight: '1.5' }}
  >
    ➕ Create Project
  </button>
  <input
    type="text"
    placeholder="🔍 Search projects by name or description..."
    className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
</div>


        {loading ? (
          <div className="text-center py-10 text-gray-600">Loading...</div>
        ) : projects.length === 0 ? (
          <p className="text-gray-600 text-center">No projects found.</p>
        ) : (
          <>
            {renderTable()}
            <p className="text-sm text-gray-500 mt-2 text-center">{renderEntryInfo()}</p>
            {renderPagination()}
          </>
        )}
      </div>
      </div>
      {showModal && (
  <div className="fixed inset-0 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded shadow w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Create New Project</h2>
      
      <input
        type="text"
        className={`input input-bordered w-full mb-3 bg-gray-100 ${
          !newName.trim() ? 'border-red-400' : ''
        }`}
        placeholder="Project Name"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
      />
      
      <textarea
        className={`textarea textarea-bordered w-full mb-4 bg-gray-100 ${
          !newDesc.trim() ? 'border-red-400' : ''
        }`}
        placeholder="Description"
        value={newDesc}
        onChange={(e) => setNewDesc(e.target.value)}
      />
      
      <div className="flex justify-end gap-2">
        <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
        <button className="btn btn-primary" onClick={handleCreateProject}>Create</button>
      </div>
    </div>
  </div>
)}

{showTeamModal && selectedProject && (
  <TeamModal
    project={selectedProject!} 
    onClose={() => {
      setShowTeamModal(false);
      setSelectedProject(null);
    }}
    onSaved={() => fetchProjects()}
  />
)}
{showEditModal && selectedProject && (
  <EditProjectModal
    project={selectedProject}
    onClose={() => setShowEditModal(false)}
    onSave={handleSaveProject}
  />
)}
{showChat && selectedProject && chatData && (
  <ChatModal
    project={selectedProject}
    chatData={chatData}
    onClose={() => setShowChat(false)}
  />
)}

    </DashboardLayout>
  );
}
