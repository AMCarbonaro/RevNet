'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ProjectCreationWizard from '@/components/forms/ProjectCreationWizard';

export default function CreateProjectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-terminal-green text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <ProjectCreationWizard />;
}
