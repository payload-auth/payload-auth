'use client'

import { useEffect, useState } from 'react';
import { Clerk } from '@clerk/clerk-js';
import { useRouter } from 'next/navigation'

let clerk: Clerk | null = null
if(typeof window !== 'undefined') {
  clerk = new Clerk(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!);
  clerk.load();
}

export function AfterLoginForm({ redirectOnLoginTo }: { redirectOnLoginTo: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccessful, setLoginSuccessful] = useState(false);

  useEffect(() => {
    const form = document.querySelector('form.login__form');
    if (!form) return;

    const onSubmit = async (event: any) => {
      event.preventDefault();
      setIsLoading(true);

      
      try {
        const emailInput = form.querySelector('input[name="email"]') as HTMLInputElement;
        const passwordInput = form.querySelector('input[name="password"]') as HTMLInputElement;
        if (!emailInput || !passwordInput) throw new Error('Email or password input not found');

        const email = emailInput.value;
        if (!email) throw new Error('Email is required');
        const password = passwordInput.value;
        if (!password) throw new Error('Password is required');

        const signInAttempt = await clerk?.client?.signIn.create({
          identifier: email,
          password,
          strategy: 'password',
        });

        if (signInAttempt?.status === 'complete') {
          setLoginSuccessful(true);
          await clerk?.setActive({ session: signInAttempt.createdSessionId });
          router.push(redirectOnLoginTo ?? '/admin')
        } else {
          console.error(JSON.stringify(signInAttempt, null, 2));
        }
      } catch (error) {
        console.log('Error logging in:', error);
      } finally {
        setIsLoading(false);
      }
    };

    form.addEventListener('submit', onSubmit);
    return () => form.removeEventListener('submit', onSubmit);
  }, []);
  useEffect(() => { console.log('isLoading', isLoading) }, [isLoading])

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