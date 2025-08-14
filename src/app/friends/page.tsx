"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { InviteModal } from '~/components/InviteModal';
import { FriendsList } from '~/components/FriendsList';
import { PrivacySettings } from '~/components/PrivacySettings';
import { useToast } from '~/components/ui/use-toast';
import type { Friend, UserPrivacySettings, GetInvitesResponse } from '~/types/invite';

// Mock user ID for demo - in real app this would come from auth context
const MOCK_USER_UNIFIED_ID = 'demo-user-123';

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [privacySettings, setPrivacySettings] = useState<UserPrivacySettings | null>(null);
  const [invites, setInvites] = useState<GetInvitesResponse | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('friends');
  const { toast } = useToast();

  useEffect(() => {
    loadFriendsData();
  }, []);

  const loadFriendsData = async () => {
    setIsLoading(true);
    try {
      // Load friends
      const friendsResponse = await fetch(`/api/friends?unified_user_id=${MOCK_USER_UNIFIED_ID}`);
      if (friendsResponse.ok) {
        const friendsData = await friendsResponse.json();
        setFriends(friendsData.friends || []);
      }

      // Load privacy settings
      const privacyResponse = await fetch(`/api/privacy-settings?unified_user_id=${MOCK_USER_UNIFIED_ID}`);
      if (privacyResponse.ok) {
        const privacyData = await privacyResponse.json();
        setPrivacySettings(privacyData.privacySettings);
      }

      // Load invites
      const invitesResponse = await fetch(`/api/invites?unified_user_id=${MOCK_USER_UNIFIED_ID}`);
      if (invitesResponse.ok) {
        const invitesData = await invitesResponse.json();
        setInvites(invitesData);
      }

    } catch (error) {
      console.error('Error loading friends data:', error);
      toast({
        title: "Error",
        description: "Failed to load friends data. This is a demo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFriend = (friendId: string) => {
    setFriends(prev => prev.filter(f => f.friend_unified_id !== friendId));
  };

  const handlePrivacySettingsUpdated = (newSettings: UserPrivacySettings) => {
    setPrivacySettings(newSettings);
  };

  const handleInviteCreated = () => {
    setShowInviteModal(false);
    loadFriendsData(); // Reload invites
    toast({
      title: "Invite Sent!",
      description: "Your friend invitation has been created successfully.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-4xl mb-4">🌞</div>
              <div>Loading your cosmic connections...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border border-[#d4af37]">
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">👥</div>
            <CardTitle className="font-serif text-2xl">Cosmic Connections</CardTitle>
            <p className="text-gray-600">
              Manage your friends and privacy settings in the Solara universe
            </p>
          </CardHeader>
        </Card>

        {/* Demo Notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="text-center text-blue-800">
              <strong>🚧 Demo Mode:</strong> This is a demonstration of the invite system. 
              In the actual implementation, this would be integrated with user authentication.
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="friends">Friends ({friends.length})</TabsTrigger>
            <TabsTrigger value="invites">Invites ({invites?.sentInvites.length || 0})</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="invite">+ Invite</TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Your Cosmic Companions</h3>
              <Button
                onClick={() => setShowInviteModal(true)}
                className="bg-[#d4af37] hover:bg-[#e6c75a] text-black"
              >
                👥 Invite Friend
              </Button>
            </div>
            
            <FriendsList
              userUnifiedId={MOCK_USER_UNIFIED_ID}
              friends={friends}
              onRemoveFriend={handleRemoveFriend}
            />
          </TabsContent>

          <TabsContent value="invites" className="space-y-4">
            <h3 className="text-lg font-semibold">Invite Management</h3>
            
            {invites && (
              <div className="space-y-6">
                {/* Sent Invites */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-md">Sent Invites</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {invites.sentInvites.length === 0 ? (
                      <div className="text-center text-gray-500 py-4">
                        No sent invites yet
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {invites.sentInvites.map((invite) => (
                          <div key={invite.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <div>
                              <div className="font-mono font-bold">{invite.invite_code}</div>
                              <div className="text-sm text-gray-600">
                                {invite.invitee_email && `To: ${invite.invitee_email}`}
                                {invite.invitee_farcaster_fid && `To: FID ${invite.invitee_farcaster_fid}`}
                              </div>
                              <div className="text-xs text-gray-500">
                                {invite.status} • Expires {new Date(invite.expires_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs ${
                              invite.status === 'accepted' ? 'bg-green-100 text-green-700' :
                              invite.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {invite.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Received Invites */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-md">Received Invites</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {invites.receivedInvites.length === 0 ? (
                      <div className="text-center text-gray-500 py-4">
                        No received invites
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {invites.receivedInvites.map((invite) => (
                          <div key={invite.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <div>
                              <div className="font-mono font-bold">{invite.invite_code}</div>
                              <div className="text-sm text-gray-600">
                                From: User {invite.inviter_unified_user_id.slice(0, 8)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {invite.status} • Expires {new Date(invite.expires_at).toLocaleDateString()}
                              </div>
                            </div>
                            {invite.status === 'pending' && (
                              <Button size="sm" className="bg-[#d4af37] hover:bg-[#e6c75a] text-black">
                                Accept
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <h3 className="text-lg font-semibold">Privacy Settings</h3>
            
            {privacySettings ? (
              <PrivacySettings
                userUnifiedId={MOCK_USER_UNIFIED_ID}
                settings={privacySettings}
                onSettingsUpdated={handlePrivacySettingsUpdated}
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    Loading privacy settings...
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="invite" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">🌟 Invite a Friend</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600">
                  Share your cosmic journey with friends and explore the universe together!
                </p>
                <Button
                  onClick={() => setShowInviteModal(true)}
                  className="bg-[#d4af37] hover:bg-[#e6c75a] text-black"
                  size="lg"
                >
                  👥 Create Invite
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Invite Modal */}
        <InviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          userUnifiedId={MOCK_USER_UNIFIED_ID}
          onInviteCreated={handleInviteCreated}
        />
      </div>
    </div>
  );
}