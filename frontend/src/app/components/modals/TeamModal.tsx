import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface User {
  id: number;
  username: string;
  role: string; // 'manager' or 'employee'
}

interface Props {
  project: {
    id: number;
    name: string;
  };
  onClose: () => void;
  onSaved: () => void;
}

interface TeamAssignment {
  user: User;
  isLeader: boolean;
}


export default function TeamModal({ project, onClose, onSaved }: Props) {
  const projectId = project.id;  
  const [managers, setManagers] = useState<User[]>([]);
const [employees, setEmployees] = useState<User[]>([]);

  const [teamLeaderId, setTeamLeaderId] = useState<number | null>(null);
  const [members, setMembers] = useState<number[]>([0, 1]); // indexes for inputs
  const [selectedMembers, setSelectedMembers] = useState<{ [key: number]: number | null }>({
    0: null,
    1: null,
  });
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

useEffect(() => {
  async function fetchTeam() {
    const res = await fetch(`${BACKEND_URL}/projects/${projectId}/team`, {
      credentials: 'include',
    });
    if (res.ok) {
      const data: TeamAssignment[] = await res.json();
      const newMembers: number[] = [];
      const newSelected: { [key: number]: number | null } = {};

      data.forEach((member, idx) => {
        if (member.isLeader) {
          setTeamLeaderId(member.user.id);
        } else {
          newMembers.push(idx);
          newSelected[idx] = member.user.id;
        }
      });

      setMembers(newMembers.length ? newMembers : [0,1]);
      setSelectedMembers(Object.keys(newSelected).length ? newSelected : {0: null, 1: null});
    }
  }

  fetchTeam();
}, [projectId, BACKEND_URL]);

useEffect(() => {
  async function fetchUsers() {
    try {
      const [managersRes, employeesRes] = await Promise.all([
        fetch(`${BACKEND_URL}/manage-users/all-managers`, {
          credentials: 'include',
        }),
        fetch(`${BACKEND_URL}/manage-users/all-employees`, {
          credentials: 'include',
        }),
      ]);

      if (!managersRes.ok || !employeesRes.ok) {
        throw new Error('Failed to fetch users');
      }

      const managersData: User[] = await managersRes.json();
      const employeesData: User[] = await employeesRes.json();

      setManagers(managersData);
      setEmployees(employeesData);
    } catch (error) {
      toast.error('Error fetching users: ' + (error as Error).message);
    }
  }

  fetchUsers();
}, [BACKEND_URL]); 


  function addMemberInput() {
    if (members.length >= 5) {
      toast.error('Maximum 5 members allowed');
      return;
    }
    setMembers([...members, members.length]);
    setSelectedMembers({ ...selectedMembers, [members.length]: null });
  }

  function updateMember(index: number, userId: number) {
    setSelectedMembers({ ...selectedMembers, [index]: userId });
  }

  async function handleSubmit() {
    if (!teamLeaderId) {
      toast.error('Please select a team leader.');
      return;
    }
    const filteredMembers = Object.values(selectedMembers)
      .filter((id) => id && id !== teamLeaderId);

    if (filteredMembers.length < 2) {
      toast.error('Please select at least 2 team members.');
      return;
    }

    if (filteredMembers.length > 5) {
      toast.error('Maximum 5 team members allowed.');
      return;
    }

    const payload = [
      { userId: teamLeaderId, isLeader: true },
      ...filteredMembers.map((id) => ({ userId: id, isLeader: false })),
    ];

    try {
      const res = await fetch(`${BACKEND_URL}/projects/${projectId}/team`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ members: payload }),
});

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to assign team');
      }

      toast.success('Team assigned successfully!');
      onSaved();
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

return (
  <div className="fixed inset-0 backdrop-blur-sm bg-transparent flex items-center justify-center z-50">
    <div className="bg-white rounded p-6 w-full max-w-lg">
      <h2 className="text-xl font-bold mb-4">Assign Team Members</h2>

      <div className="mb-4">
        <label className="font-semibold">Team Leader (Manager)</label>
        <select
          className="input input-bordered w-full bg-gray-100"
          value={teamLeaderId ?? ''}
          onChange={(e) => setTeamLeaderId(Number(e.target.value))}
        >
          <option value="">Select team leader</option>
          {managers.map((m) => (
            <option key={m.id} value={m.id}>{m.username}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="font-semibold flex justify-between items-center">
          Team Members
          <button
            className="btn btn-sm btn-outline"
            onClick={addMemberInput}
            type="button"
          >
            + Add Member
          </button>
        </label>

        {members.map((idx) => (
          <select
            key={idx}
            className="input input-bordered w-full mt-2 bg-gray-100"
            value={selectedMembers[idx] ?? ''}
            onChange={(e) => updateMember(idx, Number(e.target.value))}
          >
            <option value="">Select member</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.username}</option>
            ))}
          </select>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit}>Save</button>
      </div>
    </div>
  </div>
);

}
