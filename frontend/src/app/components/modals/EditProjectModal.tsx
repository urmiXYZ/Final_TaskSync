import React, { useState, useEffect } from "react";
import type { Project } from '@/types/types';

interface EditProjectModalProps {
  project: Project | null;
  onClose: () => void;
  onSave: (updatedProject: Project) => void;
}

export default function EditProjectModal({
  project,
  onClose,
  onSave,
}: EditProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (project) {
      setName(project.name || "");
      setDescription(project.description || "");
    }
  }, [project]);

  const handleSave = () => {
    if (!project) return;

    if (!name.trim()) {
      alert("Project name is required.");
      return;
    }

    onSave({ ...project, name: name.trim(), description: description.trim() });
    onClose();
  };


  return (
    <>
<div
  className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex justify-center items-center z-50"
  onClick={onClose}
/>

      {/* Modal container */}
      <div className="fixed inset-0 flex justify-center items-center z-60">
        <div
          className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative"
          onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
        >
          <h2 className="text-xl font-semibold mb-4">Edit Project</h2>

          <label className="block mb-2">
            Name:
            <input
              type="text"
              className="w-full border rounded px-3 py-2 mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </label>

          <label className="block mb-4">
            Description:
            <textarea
              className="w-full border rounded px-3 py-2 mt-1 resize-none"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <div className="flex justify-end gap-3">
            <button
              className="btn btn-sm bg-gray-300 hover:bg-gray-400"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
