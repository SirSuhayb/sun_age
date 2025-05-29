import sdk from '@farcaster/frame-sdk';

// Define the FrameActionPayload type based on the SDK's usage
type FrameActionPayload = {
  buttonIndex: number;
  inputText?: string;
  state?: string;
  transactionId?: string;
  url?: string;
};

export async function sendFrameNotification(
  fid: number,
  message: string,
  action?: FrameActionPayload
) {
  try {
    const response = await fetch('https://api.neynar.com/v2/farcaster/frame/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || '',
      },
      body: JSON.stringify({
        fid,
        message,
        action,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send notification: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending frame notification:', error);
    throw error;
  }
} 