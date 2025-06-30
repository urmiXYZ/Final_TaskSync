'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Role = {
  id: number;
  name: 'admin' | 'manager' | 'employee';
};

type User = {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  isDisabled?: boolean | null;
  latestSalary?: number;  // add this line
  role?: Role; 
};


export function useAuthGuard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:3001/auth/me', {
          credentials: 'include',
        });

        console.log('Auth/me response status:', res.status);

        if (!res.ok) {
          console.log('Redirecting to login');
          if (isMounted) {
            setUser(null);
            router.replace('/login');
          }
          return;
        }

        const data = await res.json();
        console.log('Auth/me user data:', data);

        if (data.isDisabled === true) {
          console.warn('User account is disabled. Redirecting to login.');
          if (isMounted) {
            setUser(null);
            router.replace('/login');
          }
          return;
        }

        if (isMounted) setUser(data);
      } catch (err) {
        console.error('AuthGuard error:', err);
        if (isMounted) router.replace('/login');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return { user, loading };
}
