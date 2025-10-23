import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SecurityDashboard from '@/components/security/SecurityDashboard';

const SecurityPage = async () => {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/auth/signin');
  }

  return (
    <SecurityDashboard 
      userId={session.user.id}
      userEmail={session.user.email || ''}
      userName={session.user.name || ''}
    />
  );
};

export default SecurityPage;
