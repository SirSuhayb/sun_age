"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import type { UserPrivacySettings, PrivacySettingsProps } from '~/types/invite';

export function PrivacySettings({ 
  userUnifiedId, 
  settings: initialSettings, 
  onSettingsUpdated 
}: PrivacySettingsProps) {
  const [settings, setSettings] = useState<UserPrivacySettings>(initialSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setSettings(initialSettings);
    setHasChanges(false);
  }, [initialSettings]);

  const handleSettingChange = (key: keyof UserPrivacySettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/privacy-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unified_user_id: userUnifiedId,
          share_sol_age_with_friends: settings.share_sol_age_with_friends,
          share_archetype_with_friends: settings.share_archetype_with_friends,
          share_journal_entries_with_friends: settings.share_journal_entries_with_friends,
          share_milestones_with_friends: settings.share_milestones_with_friends,
          allow_friend_invites: settings.allow_friend_invites,
          discoverable_by_phone: settings.discoverable_by_phone,
          discoverable_by_farcaster: settings.discoverable_by_farcaster,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update privacy settings');
      }

      setSettings(data.privacySettings);
      setHasChanges(false);
      onSettingsUpdated?.(data.privacySettings);
      
      toast({
        title: "Settings Saved",
        description: "Your privacy settings have been updated successfully.",
      });
      
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = () => {
    setSettings(initialSettings);
    setHasChanges(false);
  };

  const privacyOptions = [
    {
      key: 'share_sol_age_with_friends' as const,
      title: 'Sol Age',
      description: 'Allow friends to see your solar age (days lived)',
      icon: '☀️',
      category: 'sharing'
    },
    {
      key: 'share_archetype_with_friends' as const,
      title: 'Archetype',
      description: 'Allow friends to see your cosmic archetype',
      icon: '🌟',
      category: 'sharing'
    },
    {
      key: 'share_journal_entries_with_friends' as const,
      title: 'Journal Entries',
      description: 'Allow friends to see your shared journal entries',
      icon: '📓',
      category: 'sharing'
    },
    {
      key: 'share_milestones_with_friends' as const,
      title: 'Milestones',
      description: 'Allow friends to see your cosmic milestones',
      icon: '🎯',
      category: 'sharing'
    },
    {
      key: 'allow_friend_invites' as const,
      title: 'Friend Invites',
      description: 'Allow others to send you friend invitations',
      icon: '👥',
      category: 'discovery'
    },
    {
      key: 'discoverable_by_phone' as const,
      title: 'Phone Discovery',
      description: 'Allow others to find you by your phone number',
      icon: '📱',
      category: 'discovery'
    },
    {
      key: 'discoverable_by_farcaster' as const,
      title: 'Farcaster Discovery',
      description: 'Allow others to find you by your Farcaster profile',
      icon: '📢',
      category: 'discovery'
    }
  ];

  const sharingOptions = privacyOptions.filter(opt => opt.category === 'sharing');
  const discoveryOptions = privacyOptions.filter(opt => opt.category === 'discovery');

  return (
    <div className="space-y-6">
      {/* Sharing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-serif flex items-center gap-2">
            🔗 Sharing with Friends
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-gray-600 mb-4">
            Control what information your friends can see about your cosmic journey.
          </div>
          
          {sharingOptions.map((option) => (
            <div key={option.key} className="flex items-start space-x-3 py-2">
              <div className="text-lg mt-1">{option.icon}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor={option.key} className="font-medium">
                    {option.title}
                  </Label>
                  <Switch
                    id={option.key}
                    checked={settings[option.key]}
                    onCheckedChange={(checked) => handleSettingChange(option.key, checked)}
                    disabled={isLoading}
                  />
                </div>
                <div className="text-sm text-gray-500">
                  {option.description}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Discovery Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-serif flex items-center gap-2">
            🔍 Discovery & Invites
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-gray-600 mb-4">
            Control how others can find and connect with you.
          </div>
          
          {discoveryOptions.map((option) => (
            <div key={option.key} className="flex items-start space-x-3 py-2">
              <div className="text-lg mt-1">{option.icon}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor={option.key} className="font-medium">
                    {option.title}
                  </Label>
                  <Switch
                    id={option.key}
                    checked={settings[option.key]}
                    onCheckedChange={(checked) => handleSettingChange(option.key, checked)}
                    disabled={isLoading}
                  />
                </div>
                <div className="text-sm text-gray-500">
                  {option.description}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-amber-800">
                You have unsaved changes to your privacy settings.
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetSettings}
                  disabled={isLoading}
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveSettings}
                  disabled={isLoading}
                  className="bg-[#d4af37] hover:bg-[#e6c75a] text-black"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}