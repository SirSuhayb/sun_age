import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import InviteAcceptPage from './InviteAcceptPage';

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { code } = resolvedParams;

  return {
    title: `Join Solara - Invite ${code}`,
    description: 'Accept your friend\'s invitation to join Solara and discover your cosmic identity together.',
    openGraph: {
      title: 'Join me on Solara!',
      description: 'Calculate your Solar Age and discover your cosmic archetype. Join the community!',
      images: [
        {
          url: '/og-invite.png',
          width: 1200,
          height: 630,
          alt: 'Join Solara - Cosmic Age Calculator',
        },
      ],
    },
  };
}

export default async function InvitePage({ params }: PageProps) {
  const resolvedParams = await params;
  const { code } = resolvedParams;

  if (!code) {
    redirect('/');
  }

  return <InviteAcceptPage inviteCode={code} />;
}