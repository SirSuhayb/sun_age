"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { useToast } from '~/components/ui/use-toast';
import type { Invite } from '~/types/invite';

interface InviteAcceptPageProps {
  inviteCode: string;
}

export default function InviteAcceptPage({ inviteCode }: InviteAcceptPageProps) {
  const [invite, setInvite] = useState<Invite | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchInviteDetails();
  }, [inviteCode]);

  const fetchInviteDetails = async () => {
    try {
      const response = await fetch(`/api/invites?invite_code=${encodeURIComponent(inviteCode)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch invite details');
      }

      setInvite(data.invite);
      
      // Check if invite is expired or already accepted
      if (data.invite.status !== 'pending') {
        setError(`This invite is ${data.invite.status}.`);
      } else if (new Date(data.invite.expires_at) < new Date()) {
        setError('This invite has expired.');
      }
      
    } catch (error) {
      console.error('Error fetching invite:', error);
      setError(error instanceof Error ? error.message : 'Failed to load invite');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    // For now, we'll redirect to the main app to create an account first
    // In a real implementation, you'd need to handle authentication
    
    // Store the invite code in localStorage so we can accept it after account creation
    if (typeof window !== 'undefined') {
      localStorage.setItem('pendingInviteCode', inviteCode);
    }
    
    toast({
      title: "Welcome to Solara!",
      description: "Create your account to accept this invite and connect with your friend.",
    });
    
    // Redirect to the main app
    router.push('/');
  };

  const handleCreateAccount = () => {
    // Store invite code and redirect to main app for account creation
    if (typeof window !== 'undefined') {
      localStorage.setItem('pendingInviteCode', inviteCode);
    }
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-4xl mb-4">🌞</div>
              <div>Loading invite...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-4xl mb-4">❌</div>
              <div className="text-lg font-medium">Invite Not Available</div>
              <div className="text-gray-600">{error}</div>
              <Button 
                onClick={() => router.push('/')}
                className="bg-[#d4af37] hover:bg-[#e6c75a] text-black"
              >
                Go to Solara
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
      <Card className="w-full max-w-md border border-[#d4af37] shadow-lg">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🌟</div>
          <CardTitle className="font-serif text-2xl">
            You're Invited to Join Solara!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Invite Code</div>
              <div className="font-mono text-lg font-bold">{inviteCode}</div>
            </div>
            
            <div className="text-gray-600">
              Someone wants to share their cosmic journey with you on Solara, 
              where you can calculate your Solar Age and discover your cosmic archetype.
            </div>
            
            <div className="text-sm text-gray-500">
              Expires: {new Date(invite.expires_at).toLocaleDateString()}
            </div>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={handleAcceptInvite}
              disabled={isAccepting}
              className="w-full bg-[#d4af37] hover:bg-[#e6c75a] text-black font-semibold py-3"
            >
              {isAccepting ? 'Accepting...' : '🌞 Accept Invite & Join Solara'}
            </Button>
            
            <div className="text-xs text-center text-gray-500">
              By accepting, you'll create a Solara account and connect with your friend
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <div className="text-center space-y-2">
              <div className="text-sm text-gray-600">Already have a Solara account?</div>
              <Button
                variant="outline"
                onClick={handleCreateAccount}
                className="w-full"
              >
                Sign in to accept invite
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}