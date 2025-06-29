'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from "../components/layouts/DashboardLayout";
import Image from 'next/image';
import RequestUserModal from '../components/modals/RequestUserModal';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import ConfirmAddUserModal from '../components/modals/ConfirmAddUserModal';
import { useAuthGuard } from '@/hooks/useAuthGuard';

type User = {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  isDisabled?: boolean | null;
};

export default function UserManagementPage() {
const {loading: authLoading } = useAuthGuard();

  const [managers, setManagers] = useState<User[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
const [dataLoading, setDataLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [managersPage, setManagersPage] = useState(1);
const [employeesPage, setEmployeesPage] = useState(1);
const [showModal, setShowModal] = useState(false);
const [modalRole, setModalRole] = useState<'manager' | 'employee' | null>(null);
const [requestUsers, setRequestUsers] = useState<RequestUser[]>([]);
const [searchTerm, setSearchTerm] = useState('');
const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');
const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
const [changeRoleUser, setChangeRoleUser] = useState<User | null>(null);
const [currentRoleForChange, setCurrentRoleForChange] = useState<'manager' | 'employee' | null>(null);
const [showChangeRoleModal, setShowChangeRoleModal] = useState(false);
const [pendingAddUserId, setPendingAddUserId] = useState<number | null>(null);
const [showConfirmAddModal, setShowConfirmAddModal] = useState(false);
const [loadingAddUser, setLoadingAddUser] = useState(false);
const [selectedDisableUser, setSelectedDisableUser] = useState<User | null>(null);
const [showDisableModal, setShowDisableModal] = useState(false);

const openDisableModal = (user: User) => {
  setSelectedDisableUser(user);
  setShowDisableModal(true);
};

const cancelDisable = () => {
  setSelectedDisableUser(null);
  setShowDisableModal(false);
};

const confirmDisableUser = async () => {
  if (!selectedDisableUser) return;

  try {
    const url = selectedDisableUser.isDisabled
      ? `http://localhost:3001/manage-users/enable/${selectedDisableUser.id}`
      : `http://localhost:3001/manage-users/disable/${selectedDisableUser.id}`;

    const res = await fetch(url, {
      method: 'PATCH',
      credentials: 'include',
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to toggle user status');
    }

    const data = await res.json();
    toast.success(data.message);
    fetchUsers();
  } catch (err) {
    console.error(err);
    if (err instanceof Error) toast.error(err.message);
    else toast.error('Error toggling user status');
  } finally {
    cancelDisable();
  }
};

const openChangeRoleModal = (user: User, currentRole: 'manager' | 'employee') => {
  setChangeRoleUser(user);
  setCurrentRoleForChange(currentRole);
  setShowChangeRoleModal(true);
};
const closeChangeRoleModal = () => {
  setChangeRoleUser(null);
  setCurrentRoleForChange(null);
  setShowChangeRoleModal(false);
};
const handleConfirmRoleChange = async () => {
  if (!changeRoleUser || !currentRoleForChange) return;

  const newRole = currentRoleForChange === 'manager' ? 'employee' : 'manager';

  try {
    const res = await fetch(
      `http://localhost:3001/manage-users/change-role/${changeRoleUser.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      }
    );

    if (!res.ok) {
      const errRes = await res.json();
      throw new Error(errRes.message || 'Failed to change role');
    }

    const result = await res.json();

toast.success(result.message || "Role changed successfully");
    closeChangeRoleModal();
    fetchUsers();
  } catch (err: unknown) {
  if (err instanceof Error) {
    toast.error(err.message || 'Failed to change user role.');
  } else {
    toast.error('Failed to change user role.');
  }
  console.error('Error changing role:', err);
}
};

const openModal = (role: 'manager' | 'employee') => {
  setModalRole(role);
  fetchRequestUsers(); 
  setShowModal(true);
};

const closeModal = () => {
  setShowModal(false);
  setModalRole(null);
};

useEffect(() => {
  const handler = setTimeout(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 600);

  return () => {
    clearTimeout(handler);
  };
}, [searchTerm]);
const handleSearchAndFilter = useCallback(async () => {
  try {
    setDataLoading(true);
    setError(null);

    let managersUrl = "http://localhost:3001/manage-users/all-managers";
    let employeesUrl = "http://localhost:3001/manage-users/all-employees";

    const params = new URLSearchParams();

if (debouncedSearchTerm.trim()) params.append("term", debouncedSearchTerm.trim());
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    if (searchTerm || (startDate && endDate)) {
      if (debouncedSearchTerm.trim()) {
        managersUrl = `http://localhost:3001/manage-users/search-managers?term=${encodeURIComponent(debouncedSearchTerm.trim())}`;
        employeesUrl = `http://localhost:3001/manage-users/search-employees?term=${encodeURIComponent(debouncedSearchTerm.trim())}`;
      } else if (startDate && endDate) {
        managersUrl = `http://localhost:3001/manage-users/filter-managers-by-date?startDate=${startDate}&endDate=${endDate}`;
        employeesUrl = `http://localhost:3001/manage-users/filter-employees-by-date?startDate=${startDate}&endDate=${endDate}`;
      } else {
        managersUrl = "http://localhost:3001/manage-users/all-managers";
        employeesUrl = "http://localhost:3001/manage-users/all-employees";
      }
    }

    const resManagers = await fetch(managersUrl, { credentials: "include" });
    if (!resManagers.ok) throw new Error("Failed to fetch filtered managers");
    let managersData: User[] = await resManagers.json();

    const resEmployees = await fetch(employeesUrl, { credentials: "include" });
    if (!resEmployees.ok) throw new Error("Failed to fetch filtered employees");
    let employeesData: User[] = await resEmployees.json();

    managersData = managersData
      .map((user) => ({
        ...user,
        avatarUrl: user.avatarUrl
          ? `http://localhost:3001${user.avatarUrl}`
          : undefined,
      }))
      .sort((a, b) => a.id - b.id);

    employeesData = employeesData
      .map((user) => ({
        ...user,
        avatarUrl: user.avatarUrl
          ? `http://localhost:3001${user.avatarUrl}`
          : undefined,
      }))
      .sort((a, b) => a.id - b.id);

    setManagers(managersData);
    setEmployees(employeesData);

    setManagersPage(1);
    setEmployeesPage(1);
  } catch (err: unknown) {
    if (err instanceof Error) setError(err.message);
    else setError("An unexpected error occurred.");
  } finally {
    setDataLoading(false);
  }
}, [
  debouncedSearchTerm,
  startDate,
  endDate,
  setManagers,
  setEmployees,
  setManagersPage,
  setEmployeesPage,
  setDataLoading,
  setError,
]);

useEffect(() => {
  handleSearchAndFilter();
}, [debouncedSearchTerm, startDate, endDate, handleSearchAndFilter]);

const renderEntryInfo = (currentPage: number, totalItems: number): string => {
  const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const end = Math.min(start + ITEMS_PER_PAGE - 1, totalItems);
  return `Showing ${start}–${end} out of ${totalItems} entries`;
};

type RequestUser = {
  id: number;
  name: string;
  email: string;
};

const fetchRequestUsers = async () => {
  try {
    const res = await fetch('http://localhost:3001/manage-users/request-users', {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch request users');
    const data = await res.json();
    setRequestUsers(data);
  } catch (error) {
    console.error('Error fetching request users', error);
  }
};

const handleAddUserRequest = (userId: number) => {
  setPendingAddUserId(userId);
  setShowConfirmAddModal(true);
};
const handleConfirmAddUser = async () => {
  if (!pendingAddUserId || !modalRole) return;

  setLoadingAddUser(true);

  try {
    const res = await fetch(`http://localhost:3001/manage-users/add-${modalRole}/${pendingAddUserId}`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Failed to add user');
    }

    const result = await res.json();
    toast.success(result.message || `Successfully added user as ${modalRole}`);
    setShowConfirmAddModal(false);
    setPendingAddUserId(null);
    fetchUsers();
    closeModal();
  } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error('An unexpected error occurred.');
    }
  } finally {
    setLoadingAddUser(false);
  }
};

const handleCancelAddUser = () => {
  setShowConfirmAddModal(false);
  setPendingAddUserId(null);
};


const ITEMS_PER_PAGE = 10;
const paginatedManagers = managers.slice(
  (managersPage - 1) * ITEMS_PER_PAGE,
  managersPage * ITEMS_PER_PAGE
);

const paginatedEmployees = employees.slice(
  (employeesPage - 1) * ITEMS_PER_PAGE,
  employeesPage * ITEMS_PER_PAGE
);

const renderDivider = (text: string, colorClass: string) => (
  <div className={`divider ${colorClass} text-lg font-semibold`}>
    {text}
  </div>
);

const renderPagination = (
  totalItems: number,
  currentPage: number,
  setPage: React.Dispatch<React.SetStateAction<number>>
) => {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  if (totalPages <= 1) return null; 

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="join flex justify-center mt-4">
      {pages.map((page) => (
        <button
          key={page}
className={`join-item btn ${
  page === currentPage ? 'bg-gray-300 border-gray-300 text-gray-700' : ''
}`}

          onClick={() => setPage(page)}
        >
          {page}
        </button>
      ))}
    </div>
  );
};

const fetchUsers = async () => {
  try {
    setDataLoading(true);
    setError(null);

    const resManagers = await fetch('http://localhost:3001/manage-users/all-managers', {
      credentials: 'include',
    });
    if (!resManagers.ok) throw new Error('Failed to fetch managers');
    let managersData: User[] = await resManagers.json();

    const resEmployees = await fetch('http://localhost:3001/manage-users/all-employees', {
      credentials: 'include',
    });
    if (!resEmployees.ok) throw new Error('Failed to fetch employees');
    let employeesData: User[] = await resEmployees.json();

    managersData = managersData.map(user => ({
      ...user,
      avatarUrl: user.avatarUrl ? `http://localhost:3001${user.avatarUrl}` : undefined,
    })).sort((a, b) => a.id - b.id);

    employeesData = employeesData.map(user => ({
      ...user,
      avatarUrl: user.avatarUrl ? `http://localhost:3001${user.avatarUrl}` : undefined,
    })).sort((a, b) => a.id - b.id);

    setManagers(managersData);
    setEmployees(employeesData);
  } catch (err: unknown) {
  console.error(err);
  if (err instanceof Error) {
    setError(err.message);
  } else {
    setError('An unexpected error occurred.');
  }
} finally {
  setDataLoading(false);
}
}


const handleClearFilters = () => {
  setSearchTerm('');
  setStartDate('');
  setEndDate('');
  fetchUsers(); 
};

const exportCSV = (role: 'manager' | 'employee') => {
  const url = `http://localhost:3001/manage-users/export-csv-by-role?role=${role}`;
  window.open(url, '_blank');
};

useEffect(() => {
  fetchUsers();
}, []);

  if (dataLoading) return <DashboardLayout><div>Loading users...</div></DashboardLayout>;
  if (error) return <DashboardLayout><div className="text-red-600">Error: {error}</div></DashboardLayout>;

const renderTable = (
  title: string,
  users: User[],
  currentPage: number,
  role: 'manager' | 'employee',
  extraClass = ''
) => (
  <section className={`mb-12 ${extraClass}`}>
    {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
    {users.length === 0 ? (
      <p>No {title.toLowerCase()} found.</p>
    ) : (
      <div className="overflow-x-auto rounded-lg shadow-sm border">
        
        <table className="table w-full text-sm">
          <thead className="bg-gray-200 text-gray-800">
            <tr>
              <th>#</th>
              <th>Profile Picture</th>
              <th>Name</th>
              <th>Email</th>
              <th>Joining date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
<tr
  key={user.id}
  className={`hover:bg-gray-100 ${
  user.isDisabled ? 'bg-gray-200 text-gray-500 opacity-60' : ''
}`}

>
    <th>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</th>
    <td>
      {user.avatarUrl ? (
        <Image
          src={user.avatarUrl}
          alt={user.username}
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-500">N/A</div>
      )}
    </td>
    <td>{user.username}</td>
    <td>{user.email}</td>
    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
    <td>
      <button
  onClick={() => openChangeRoleModal(user, role)}
  disabled={!!user.isDisabled}
  className="btn btn-sm btn-primary"
>
  Change Role
</button>
      <button
  onClick={() => openDisableModal(user)}
  className={`btn btn-sm ${user.isDisabled ? 'btn-warning' : 'btn-error'}`}
>
  {user.isDisabled ? 'Enable' : 'Disable'}
</button>

    </td>
  </tr>
))}

          </tbody>
        </table>
      </div>
    )}
  </section>
);

if (authLoading || dataLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

return (
  <DashboardLayout>
    <div
      className="max-w-7xl mx-auto p-6 bg-white rounded shadow mt-10"
      style={{ fontFamily: "'Zilla Slab', serif" }}
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-purple-600 italic">
        User Management
      </h1>

      <div className="flex justify-center flex-wrap gap-4 mt-8 mb-8">
        <button className="btn btn-primary" onClick={() => openModal('manager')}>
          Add Manager
        </button>
        <button className="btn btn-secondary" onClick={() => openModal('employee')}>
          Add Employee
        </button>
        <div className="w-6" />
        <button
          className="btn btn-sm btn-outline"
          onClick={() => exportCSV('manager')}
        >
          Export Managers
        </button>
        <button
          className="btn btn-sm btn-outline"
          onClick={() => exportCSV('employee')}
        >
          Export Employees
        </button>
      </div>

<div className="flex flex-nowrap justify-end gap-4 overflow-auto mb-6 max-w-5xl mx-auto px-6 py-3 rounded">
  <div className="flex gap-6 items-center">
  <div className="flex items-center gap-2">
    <label htmlFor="startDate" className="text-sm font-medium text-gray-700">
      Start Date:
    </label>
    <input
      id="startDate"
      type="date"
      value={startDate}
      onChange={e => setStartDate(e.target.value)}
      className="input input-sm input-bordered bg-gray-100"
    />
  </div>

  <div className="flex items-center gap-2">
    <label htmlFor="endDate" className="text-sm font-medium text-gray-700">
      End Date:
    </label>
    <input
      id="endDate"
      type="date"
      value={endDate}
      onChange={e => setEndDate(e.target.value)}
      className="input input-sm input-bordered bg-gray-100"
    />
  </div>
</div>

<button
  className="btn btn-sm btn-soft btn-error"
  onClick={handleClearFilters}
>
  Clear
</button>


  <input
  type="text"
  placeholder="🔍 Search users..."
  value={searchTerm}
  onChange={e => setSearchTerm(e.target.value)}
  className="input input-sm input-bordered w-48 bg-gray-100 ml-6"
/>

</div>

      <div className="flex flex-col lg:flex-row gap-6 mt-10">
        <div className="flex-1">
          {renderDivider('Managers', 'divider-primary')}
{renderTable('', paginatedManagers, managersPage, 'manager')}
<p className="text-sm text-gray-500 mt-2 text-center">
  {renderEntryInfo(managersPage, managers.length)}
</p>
          {renderPagination(managers.length, managersPage, setManagersPage)}
        </div>

        <div className="flex-1">
          {renderDivider('Employees', 'divider-secondary')}
        {renderTable('', paginatedEmployees, employeesPage, 'employee')}
        <p className="text-sm text-gray-500 mt-2 text-center">
  {renderEntryInfo(employeesPage, employees.length)}
</p>
          {renderPagination(employees.length, employeesPage, setEmployeesPage)}
        </div>
      </div>
    </div>

    {showModal && modalRole && (
      <RequestUserModal
        role={modalRole}
        users={requestUsers}
        onAdd={handleAddUserRequest}
        onClose={closeModal}
      />
    )}

    {showChangeRoleModal && changeRoleUser && currentRoleForChange && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full text-center">
      <h3 className="text-lg font-semibold mb-4">
        Are you sure you want to change role from{' '}
        <span className="font-bold text-blue-600">{currentRoleForChange}</span> to{' '}
        <span className="font-bold text-red-600">
          {currentRoleForChange === 'manager' ? 'employee' : 'manager'}
        </span>{' '}
        for <span className="italic">{changeRoleUser.username}</span>?
      </h3>
      <div className="flex justify-center gap-4 mt-6">
        <button className="btn btn-sm btn-error" onClick={handleConfirmRoleChange}>
          Yes, Change
        </button>
        <button className="btn btn-sm" onClick={closeChangeRoleModal}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
{showConfirmAddModal && (
  <ConfirmAddUserModal
    role={modalRole!}
    onConfirm={handleConfirmAddUser}
    onCancel={handleCancelAddUser}
    loading={loadingAddUser}
  />
)}
{selectedDisableUser && showDisableModal && (
  <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <h2 className="text-lg font-semibold mb-4">
        {selectedDisableUser.isDisabled ? 'Enable User' : 'Disable User'}
      </h2>
      <p className="mb-4">
        Are you sure you want to {selectedDisableUser.isDisabled ? 'enable' : 'disable'} user{' '}
        <strong>{selectedDisableUser.username}</strong>?
      </p>
      <div className="flex justify-end gap-2">
        <button className="btn btn-outline" onClick={cancelDisable}>Cancel</button>
        <button className="btn btn-primary" onClick={confirmDisableUser}>
          Confirm
        </button>
      </div>
    </div>
  </div>
)}

  </DashboardLayout>
);


}
