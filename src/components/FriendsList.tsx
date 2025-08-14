"use client";

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from './ui/use-toast';
import type { Friend, FriendsListProps } from '~/types/invite';

export function FriendsList({ 
  userUnifiedId, 
  friends: initialFriends = [], 
  onRemoveFriend 
}: FriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>(initialFriends);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFriends(initialFriends);
  }, [initialFriends]);

  const handleRemoveFriend = async (friendUnifiedId: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/friends', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_unified_id: userUnifiedId,
          friend_unified_id: friendUnifiedId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove friend');
      }

      // Remove friend from local state
      setFriends(prev => prev.filter(f => f.friend_unified_id !== friendUnifiedId));
      onRemoveFriend?.(friendUnifiedId);
      
      toast({
        title: "Friend Removed",
        description: "The friend connection has been removed successfully.",
      });
      
    } catch (error) {
      console.error('Error removing friend:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove friend",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (friends.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500 space-y-2">
            <div className="text-4xl mb-2">🌟</div>
            <div>No friends yet</div>
            <div className="text-sm">
              Invite friends to share your cosmic journey together!
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        {friends.length} cosmic companion{friends.length !== 1 ? 's' : ''}
      </div>
      
      {friends.map((friend) => (
        <Card key={friend.friend_unified_id} className="border border-gray-200">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                {/* Friend Identity */}
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">
                    {friend.email || `User ${friend.friend_unified_id.slice(0, 8)}`}
                  </div>
                  {friend.farcaster_fid && (
                    <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      Farcaster
                    </div>
                  )}
                </div>
                
                {/* Solar Information */}
                <div className="space-y-1">
                  {friend.can_see_sol_age && friend.sol_age && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">☀️ Sol Age:</span> {friend.sol_age.toLocaleString()} days
                    </div>
                  )}
                  
                  {friend.can_see_archetype && friend.archetype && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">🌟 Archetype:</span> {friend.archetype}
                    </div>
                  )}
                  
                  {(!friend.can_see_sol_age || !friend.sol_age) && 
                   (!friend.can_see_archetype || !friend.archetype) && (
                    <div className="text-sm text-gray-400 italic">
                      Solar information is private
                    </div>
                  )}
                </div>
                
                {/* Connection Date */}
                <div className="text-xs text-gray-400">
                  Connected {formatDate(friend.connected_at)}
                </div>
                
                {/* Privacy Indicators */}
                <div className="flex gap-1 mt-2">
                  {friend.can_see_journal_entries && (
                    <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      📓 Journal
                    </div>
                  )}
                  {friend.can_see_milestones && (
                    <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      🎯 Milestones
                    </div>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveFriend(friend.friend_unified_id)}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Remove
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}