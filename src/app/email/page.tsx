import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EmailCampaignManager from '@/components/email/EmailCampaignManager';

const EmailPage = async () => {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/auth/signin');
  }

  return <EmailCampaignManager />;
};

export default EmailPage;
