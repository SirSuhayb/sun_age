"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from './ui/use-toast';
import type { InviteModalProps, CreateInviteResponse } from '~/types/invite';

export function InviteModal({ 
  isOpen, 
  onClose, 
  userUnifiedId, 
  onInviteCreated 
}: InviteModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFarcaster, setInviteFarcaster] = useState('');
  const [activeTab, setActiveTab] = useState('email');
  const [createdInvite, setCreatedInvite] = useState<CreateInviteResponse['invite'] | null>(null);
  const { toast } = useToast();

  const handleCreateInvite = async () => {
    if (!inviteEmail && !inviteFarcaster) {
      toast({
        title: "Error",
        description: "Please enter an email or Farcaster username",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const payload: any = {
        inviter_unified_user_id: userUnifiedId,
      };

      if (activeTab === 'email' && inviteEmail) {
        payload.invitee_email = inviteEmail;
      } else if (activeTab === 'farcaster' && inviteFarcaster) {
        // For now, we'll treat the Farcaster input as a username
        // In a real implementation, you'd need to resolve this to an FID
        toast({
          title: "Coming Soon",
          description: "Farcaster invites will be available soon. Please use email for now.",
          variant: "default",
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create invite');
      }

      setCreatedInvite(data.invite);
      onInviteCreated?.(data.invite);
      
      toast({
        title: "Invite Created!",
        description: "Your invite has been created. Share the code below with your friend.",
      });

      // Reset form
      setInviteEmail('');
      setInviteFarcaster('');
      
    } catch (error) {
      console.error('Error creating invite:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create invite",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyInviteCode = async () => {
    if (!createdInvite) return;
    
    const inviteUrl = `${window.location.origin}/invite/${createdInvite.invite_code}`;
    
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast({
        title: "Copied!",
        description: "Invite link copied to clipboard",
      });
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = inviteUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "Copied!",
        description: "Invite link copied to clipboard",
      });
    }
  };

  const handleShareInvite = () => {
    if (!createdInvite) return;
    
    const inviteUrl = `${window.location.origin}/invite/${createdInvite.invite_code}`;
    const shareText = `🌞 Join me on Solara! Calculate your Solar Age and discover your cosmic archetype. Use my invite: ${inviteUrl}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join me on Solara!',
        text: shareText,
        url: inviteUrl,
      });
    } else {
      // Fallback to opening compose windows
      const encodedText = encodeURIComponent(shareText);
      
      // Try different sharing options
      const platforms = [
        { name: 'Email', url: `mailto:?subject=${encodeURIComponent('Join me on Solara!')}&body=${encodedText}` },
        { name: 'SMS', url: `sms:?body=${encodedText}` },
        { name: 'WhatsApp', url: `https://wa.me/?text=${encodedText}` },
        { name: 'Twitter', url: `https://twitter.com/intent/tweet?text=${encodedText}` },
      ];
      
      // For now, just copy to clipboard
      handleCopyInviteCode();
    }
  };

  const handleClose = () => {
    setCreatedInvite(null);
    setInviteEmail('');
    setInviteFarcaster('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-serif">
            {createdInvite ? '🌟 Invite Created!' : '👥 Invite a Friend'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {!createdInvite ? (
            <>
              <div className="text-center text-sm text-gray-600">
                Invite friends to join your cosmic journey on Solara
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="farcaster">Farcaster</TabsTrigger>
                </TabsList>
                
                <TabsContent value="email" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Friend's Email</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="friend@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="farcaster" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-farcaster">Farcaster Username</Label>
                    <Input
                      id="invite-farcaster"
                      type="text"
                      placeholder="@username"
                      value={inviteFarcaster}
                      onChange={(e) => setInviteFarcaster(e.target.value)}
                      disabled={isLoading}
                    />
                    <div className="text-xs text-orange-600">
                      Coming soon! Use email invites for now.
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateInvite}
                  disabled={isLoading}
                  className="flex-1 bg-[#d4af37] hover:bg-[#e6c75a] text-black"
                >
                  {isLoading ? 'Creating...' : 'Create Invite'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center space-y-4">
                <div className="text-sm text-gray-600">
                  Share this link with your friend:
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Invite Code</div>
                    <div className="font-mono text-lg font-bold tracking-wider">
                      {createdInvite.invite_code}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 text-center">
                    Expires: {new Date(createdInvite.expires_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCopyInviteCode}
                    className="flex-1"
                  >
                    📋 Copy Link
                  </Button>
                  <Button
                    onClick={handleShareInvite}
                    className="flex-1 bg-[#d4af37] hover:bg-[#e6c75a] text-black"
                  >
                    📤 Share
                  </Button>
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full"
              >
                Done
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}