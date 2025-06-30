'use client';
import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import DashboardLayout from '../components/layouts/DashboardLayout';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import toast from 'react-hot-toast';

interface User {
  id: number;
  username: string;
  email: string;
}

interface EmployeePayment {
  user: User;
  amount: number;
}

const stripePromise = loadStripe('pk_test_51RKdxjRqOhZNInIVClBai60jwATOOucAlQiXRAqdP1iOprrRP05Z2vlfoAVt6MglYmMM4ZYGNYBJwRq1xVihBFFy00hCGr7wtS'); 

const ITEMS_PER_PAGE = 5;

const PaySalaryForm = ({ userId, amount, onSuccess }: { userId: number; amount: number; onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) {
      toast.error('Stripe not loaded');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/salary/initiate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to initiate payment');
      }

      const { clientSecret } = await res.json();
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.paymentIntent?.status === 'succeeded') {
        const confirmRes = await fetch('http://localhost:3001/salary/confirm', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ intentId: result.paymentIntent.id }),
        });

        if (!confirmRes.ok) {
          throw new Error('Failed to confirm payment');
        }

        toast.success(`Payment of $${amount} processed successfully`);
        onSuccess();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast.error('Error: ' + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 max-w-md">
      <div className="p-2 border rounded bg-gray-100">
        <CardElement />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary mt-2"
      >
        {loading ? 'Processing...' : 'Confirm Payment'}
      </button>
    </form>
  );
};

export default function SalaryPage() {
const [employees, setEmployees] = useState<EmployeePayment[]>([]);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  useAuthGuard();

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  useEffect(() => {
    async function fetchEligibleEmployees() {
      setLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/salary/eligible`, {
          credentials: 'include',
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch employees: ${res.statusText}`);
        }
        const data = await res.json();
        setEmployees(data);
        setCurrentPage(1);
      } catch (err) {
        console.error('Failed to fetch employees', err);
        toast.error('Failed to load eligible employees');
      } finally {
        setLoading(false);
      }
    }
    fetchEligibleEmployees();
  }, []);

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEmployees = employees.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(employees.length / ITEMS_PER_PAGE);

  const renderEntryInfo = () => {
    if (employees.length === 0) return 'No eligible employees to show.';
    const start = startIdx + 1;
    const end = Math.min(startIdx + ITEMS_PER_PAGE, employees.length);
    return `Showing ${start} to ${end} of ${employees.length} employees`;
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
            <th>Username</th>
            <th>Email</th>
            <th>Salary Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedEmployees.map(({ user, amount }, idx) => (
            <tr key={user.id} className="hover:bg-gray-100">
              <th>{startIdx + idx + 1}</th>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>${amount}</td>
              <td>
                {payingId === user.id ? (
                  <Elements stripe={stripePromise}>
                    <PaySalaryForm
                      userId={user.id}
                      amount={amount}
                      onSuccess={() => {
                        setPayingId(null);
                        setEmployees(prev =>
                          prev.filter(emp => emp.user.id !== user.id)
                        );
                      }}
                    />
                  </Elements>
                ) : (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setPayingId(user.id)}
                  >
                    Pay Salary
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6 bg-white rounded shadow mt-10" style={{ fontFamily: "'Zilla Slab', serif" }}>
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-600 italic">
           Salary Payments
        </h1>

        {loading ? (
          <div className="text-center py-10 text-gray-600">Loading...</div>
        ) : employees.length === 0 ? (
          <p className="text-gray-600 text-center">No eligible employees found.</p>
        ) : (
          <>
            {renderTable()}
            <p className="text-sm text-gray-500 mt-2 text-center">{renderEntryInfo()}</p>
            {renderPagination()}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

