import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EmailTemplateEditor from '@/components/email/EmailTemplateEditor';

const EmailTemplatesPage = async () => {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/auth/signin');
  }

  return <EmailTemplateEditor />;
};

export default EmailTemplatesPage;
