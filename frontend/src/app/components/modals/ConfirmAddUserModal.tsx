"use client";
export default function ConfirmAddUserModal({
  role,
  onConfirm,
  onCancel,
  loading,
}: {
  role: 'manager' | 'employee';
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded p-6 max-w-sm w-full shadow-lg text-center">
        <h3 className="text-lg font-semibold mb-4">Confirm Add User</h3>
        <p>Are you sure you want to add this user as <strong>{role}</strong>?</p>
        <div className="mt-6 flex justify-center gap-4">
          <button onClick={onCancel} disabled={loading} className="btn btn-outline">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="btn btn-primary">
            {loading ? 'Adding...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
