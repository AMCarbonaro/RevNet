import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EmailAnalytics from '@/components/email/EmailAnalytics';

const EmailAnalyticsPage = async () => {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/auth/signin');
  }

  return <EmailAnalytics />;
};

export default EmailAnalyticsPage;
