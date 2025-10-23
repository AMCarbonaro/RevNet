import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import TwoFactorSetup from '@/components/security/TwoFactorSetup';

const TwoFactorSetupPage = async () => {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/auth/signin');
  }

  return (
    <TwoFactorSetup 
      userId={session.user.id}
      userEmail={session.user.email || ''}
      userName={session.user.name || ''}
      onSetupComplete={(success) => {
        if (success) {
          // Redirect to security dashboard after successful setup
          window.location.href = '/security';
        }
      }}
    />
  );
};

export default TwoFactorSetupPage;
