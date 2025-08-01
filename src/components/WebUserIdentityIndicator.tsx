"use client";

import { useWebUserIdentity } from '~/hooks/useWebUserIdentity';
import { useFrameSDK } from '~/hooks/useFrameSDK';

export function WebUserIdentityIndicator() {
  const webIdentity = useWebUserIdentity();
  const { isInFrame, context } = useFrameSDK();

  // Don't show in Farcaster frames
  if (isInFrame) return null;
  
  // Don't show if loading
  if (webIdentity.isLoading) return null;

  const hasUserAccount = !!webIdentity.userAccountId;
  const hasAnonId = !!webIdentity.anonId;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-xs font-mono z-50">
      <div className="font-bold text-gray-700 mb-1">Web User Status</div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Anonymous ID:</span>
          <span className={hasAnonId ? 'text-green-600' : 'text-red-600'}>
            {hasAnonId ? '✓' : '✗'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>User Account:</span>
          <span className={hasUserAccount ? 'text-green-600' : 'text-yellow-600'}>
            {hasUserAccount ? '✓' : 'Pending'}
          </span>
        </div>
        {webIdentity.anonId && (
          <div className="text-gray-500 text-xs mt-1">
            ID: {webIdentity.anonId.slice(0, 8)}...
          </div>
        )}
        {webIdentity.userAccountId && (
          <div className="text-green-600 text-xs mt-1">
            Account: {webIdentity.userAccountId.slice(0, 8)}...
          </div>
        )}
      </div>
    </div>
  );
}