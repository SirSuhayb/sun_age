// Types for the invite and friend system

export interface Invite {
  id: string;
  invite_code: string;
  inviter_unified_user_id: string;
  invitee_phone_number?: string;
  invitee_farcaster_fid?: number;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expires_at: string;
  accepted_at?: string;
  accepted_by_unified_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface FriendConnection {
  id: string;
  user1_unified_id: string;
  user2_unified_id: string;
  status: 'active' | 'blocked';
  connected_via_invite_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPrivacySettings {
  id: string;
  unified_user_id: string;
  share_sol_age_with_friends: boolean;
  share_archetype_with_friends: boolean;
  share_journal_entries_with_friends: boolean;
  share_milestones_with_friends: boolean;
  allow_friend_invites: boolean;
  discoverable_by_phone: boolean;
  discoverable_by_farcaster: boolean;
  created_at: string;
  updated_at: string;
}

export interface Friend {
  friend_unified_id: string;
  email?: string;
  phone_number?: string;
  farcaster_fid?: number;
  sol_age?: number;
  archetype?: string;
  connected_at: string;
  can_see_sol_age: boolean;
  can_see_archetype: boolean;
  can_see_journal_entries: boolean;
  can_see_milestones: boolean;
}

// API Request/Response types
export interface CreateInviteRequest {
  inviter_unified_user_id: string;
  invitee_phone_number?: string;
  invitee_farcaster_fid?: number;
}

export interface CreateInviteResponse {
  success: boolean;
  invite: {
    invite_code: string;
    expires_at: string;
    invitee_phone_number?: string;
    invitee_farcaster_fid?: number;
    created_at: string;
  };
}

export interface AcceptInviteRequest {
  invite_code: string;
  accepting_unified_user_id: string;
}

export interface AcceptInviteResponse {
  success: boolean;
  message: string;
  invite: Invite;
  friendConnection: FriendConnection;
}

export interface GetInvitesResponse {
  sentInvites: Invite[];
  receivedInvites: Invite[];
}

export interface GetFriendsResponse {
  friends: Friend[];
}

export interface GetPrivacySettingsResponse {
  privacySettings: UserPrivacySettings;
}

export interface UpdatePrivacySettingsRequest {
  unified_user_id: string;
  share_sol_age_with_friends?: boolean;
  share_archetype_with_friends?: boolean;
  share_journal_entries_with_friends?: boolean;
  share_milestones_with_friends?: boolean;
  allow_friend_invites?: boolean;
  discoverable_by_phone?: boolean;
  discoverable_by_farcaster?: boolean;
}

export interface UpdatePrivacySettingsResponse {
  success: boolean;
  privacySettings: UserPrivacySettings;
}

// UI Component Props
export interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  userUnifiedId: string;
  onInviteCreated?: (invite: CreateInviteResponse['invite']) => void;
}

export interface FriendsListProps {
  userUnifiedId: string;
  friends: Friend[];
  onRemoveFriend?: (friendId: string) => void;
}

export interface PrivacySettingsProps {
  userUnifiedId: string;
  settings: UserPrivacySettings;
  onSettingsUpdated?: (settings: UserPrivacySettings) => void;
}

// Invite sharing related types
export interface InviteShareOptions {
  inviteCode: string;
  inviterName?: string;
  inviterArchetype?: string;
  inviterSolAge?: number;
}

export interface ShareWithInviteOptions {
  content: {
    type: 'sol_age' | 'journal_entry' | 'roll' | 'pledge';
    title: string;
    description: string;
    data: any;
  };
  includeInvite?: boolean;
  inviteCode?: string;
  userName?: string;
  profilePicUrl?: string;
}