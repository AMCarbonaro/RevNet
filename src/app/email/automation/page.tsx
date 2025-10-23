import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EmailAutomationBuilder from '@/components/email/EmailAutomationBuilder';

const EmailAutomationPage = async () => {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/auth/signin');
  }

  return <EmailAutomationBuilder />;
};

export default EmailAutomationPage;
