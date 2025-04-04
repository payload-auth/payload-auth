'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadClerkInstance } from '../../utils/load-clerk-instance';

export function AfterLoginForm({ redirectOnLoginTo }: { redirectOnLoginTo: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccessful, setLoginSuccessful] = useState(false);

  useEffect(() => {
    loadClerkInstance().catch((err: any) => console.error('Error loading clerk:', err));
  }, []);

  useEffect(() => {
    const form = document.querySelector('form.login__form');
    if (!form) return;

    const onSubmit = async (event: any) => {
      event.preventDefault();
      setIsLoading(true);

      try {
        const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
        if (!emailInput) throw new Error('Email input not found');

        const passwordInput = form.querySelector('input[name="password"]') as HTMLInputElement;
        if (!passwordInput) throw new Error('Password input not found');

        const email = emailInput.value;
        if (!email) throw new Error('Email is required');

        const password = passwordInput.value;
        if (!password) throw new Error('Password is required');

        const clerk = await loadClerkInstance();
        if (!clerk) return;
        const signInAttempt = await clerk.client?.signIn.create({
          identifier: email,
          password,
          strategy: 'password',
        });

        if (signInAttempt?.status !== 'complete') {
          console.error(JSON.stringify(signInAttempt, null, 2));
          return;
        }

        setLoginSuccessful(true);
        document.querySelector('.payload-toast-item')?.remove();
        await clerk.setActive({ session: signInAttempt.createdSessionId });
        router.push(redirectOnLoginTo ?? '/admin');
      } catch (error) {
        console.log('Error logging in:', error);
      } finally {
        setIsLoading(false);
      }
    };

    form.addEventListener('submit', onSubmit);
    return () => form.removeEventListener('submit', onSubmit);
  }, []);

  return (
    <>
      <style>{`
        .payload-toast-item {
          opacity: ${isLoading || loginSuccessful ? '0' : '1'} !important;
        }
      `}</style>
    </>
  );
}
