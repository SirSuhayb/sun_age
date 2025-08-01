import { ethers } from 'ethers';

// Contract addresses
const SOLAR_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_SOLAR_TOKEN_ADDRESS as `0x${string}`;
const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS as `0x${string}`;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_WALLET_PRIVATE_KEY;

// SOLAR Token ABI
const SOLAR_TOKEN_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)'
];

export interface TokenDistribution {
  recipientAddress: string;
  amount: number;
  reason: string;
  claimId?: string;
  platform?: string;
}

export interface DistributionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  amount: number;
  recipientAddress: string;
}

export class TokenDistributor {
  private provider: ethers.JsonRpcProvider;
  private adminWallet?: ethers.Wallet;
  private solarContract?: ethers.Contract;

  constructor() {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    
    if (ADMIN_PRIVATE_KEY) {
      this.adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, this.provider);
      this.solarContract = new ethers.Contract(SOLAR_TOKEN_ADDRESS, SOLAR_TOKEN_ABI, this.adminWallet);
      console.log(`[TokenDistributor] Initialized with admin wallet: ${this.adminWallet.address}`);
      console.log(`[TokenDistributor] Treasury address: ${TREASURY_ADDRESS}`);
    }
  }

  /**
   * Distribute SOLAR tokens to a recipient
   */
  async distributeTokens(distribution: TokenDistribution): Promise<DistributionResult> {
    try {
      // Validate recipient address
      if (!ethers.isAddress(distribution.recipientAddress)) {
        throw new Error('Invalid recipient address');
      }

      // Check treasury balance (admin wallet should have tokens to distribute from treasury)
      const treasuryBalance = await this.getTreasuryBalance();
      const requiredAmount = ethers.parseUnits(distribution.amount.toString(), 18);
      
      if (treasuryBalance < requiredAmount) {
        throw new Error('Insufficient tokens in treasury');
      }

      let transactionHash: string;

      if (this.adminWallet && this.solarContract) {
        // Real blockchain transaction from treasury to recipient
        // Admin wallet needs to have approval to transfer from treasury, or we transfer from treasury directly
        const tx = await this.solarContract.transferFrom(TREASURY_ADDRESS, distribution.recipientAddress, requiredAmount);
        await tx.wait();
        transactionHash = tx.hash;
        
        console.log(`Successfully distributed ${distribution.amount} SOLAR from treasury to ${distribution.recipientAddress}`);
        console.log(`Transaction hash: ${transactionHash}`);
      } else {
        // Simulate transaction for development
        console.log('No admin wallet configured, simulating token distribution...');
        console.log(`Would distribute ${distribution.amount} SOLAR from treasury ${TREASURY_ADDRESS} to ${distribution.recipientAddress}`);
        transactionHash = '0x' + Math.random().toString(16).slice(2).padEnd(64, '0');
      }

      // Record the distribution
      await this.recordDistribution({
        ...distribution,
        transactionHash,
        status: 'confirmed'
      });

      return {
        success: true,
        transactionHash,
        amount: distribution.amount,
        recipientAddress: distribution.recipientAddress
      };

    } catch (error) {
      console.error('Token distribution error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Distribution failed',
        amount: distribution.amount,
        recipientAddress: distribution.recipientAddress
      };
    }
  }

  /**
   * Distribute tokens for journal entry claims
   */
  async distributeJournalClaim(
    userFid: number,
    walletAddress: string,
    entryId: string,
    shareId: string
  ): Promise<DistributionResult> {
    return await this.distributeTokens({
      recipientAddress: walletAddress,
      amount: 10000, // 10,000 SOLAR for journal claims
      reason: 'Journal Entry Share',
      claimId: `${userFid}_${entryId}_${shareId}`,
      platform: 'journal'
    });
  }

  /**
   * Distribute tokens for Sol Age claims
   */
  async distributeSolAgeClaim(
    walletAddress: string,
    solAge: number,
    archetype: string,
    platform: string,
    shareId: string
  ): Promise<DistributionResult> {
    return await this.distributeTokens({
      recipientAddress: walletAddress,
      amount: 1000, // 1,000 SOLAR for Sol Age claims
      reason: 'Sol Age Share',
      claimId: `${shareId}`,
      platform
    });
  }

  /**
   * Distribute tokens for roll earnings
   */
  async distributeRollEarnings(
    walletAddress: string,
    amount: number,
    rollTitle: string,
    rarity: string
  ): Promise<DistributionResult> {
    return await this.distributeTokens({
      recipientAddress: walletAddress,
      amount,
      reason: `Roll Earnings: ${rollTitle} (${rarity})`,
      claimId: `${Date.now()}_roll`,
      platform: 'surprise_me'
    });
  }

  /**
   * Get admin wallet balance
   */
  async getAdminBalance(): Promise<bigint> {
    if (!this.adminWallet) {
      return BigInt(0);
    }

    try {
      const balance = await this.solarContract!.balanceOf(this.adminWallet.address);
      return balance;
    } catch (error) {
      console.error('Error fetching admin balance:', error);
      return BigInt(0);
    }
  }

  /**
   * Get treasury balance
   */
  async getTreasuryBalance(): Promise<bigint> {
    if (!this.solarContract) {
      return BigInt(0);
    }

    try {
      const balance = await this.solarContract.balanceOf(TREASURY_ADDRESS);
      console.log(`[TokenDistributor] Treasury balance: ${ethers.formatUnits(balance, 18)} SOLAR`);
      return balance;
    } catch (error) {
      console.error('Error fetching treasury balance:', error);
      return BigInt(0);
    }
  }

  /**
   * Get user's SOLAR balance
   */
  async getUserBalance(userAddress: string): Promise<number> {
    try {
      const solarContract = new ethers.Contract(SOLAR_TOKEN_ADDRESS, SOLAR_TOKEN_ABI, this.provider);
      const balance = await solarContract.balanceOf(userAddress);
      return Number(ethers.formatUnits(balance, 18));
    } catch (error) {
      console.error('Error fetching user balance:', error);
      return 0;
    }
  }

  /**
   * Record distribution in database
   */
  private async recordDistribution(data: TokenDistribution & {
    transactionHash: string;
    status: string;
  }) {
    // TODO: Implement database recording
    console.log('Recording token distribution:', data);
  }

  /**
   * Batch distribute tokens to multiple recipients
   */
  async batchDistribute(distributions: TokenDistribution[]): Promise<DistributionResult[]> {
    const results: DistributionResult[] = [];
    
    for (const distribution of distributions) {
      const result = await this.distributeTokens(distribution);
      results.push(result);
      
      // Add delay between transactions to avoid nonce issues
      if (this.adminWallet) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  /**
   * Check if admin wallet is configured
   */
  isConfigured(): boolean {
    return !!this.adminWallet && !!this.solarContract;
  }

  /**
   * Get admin wallet address
   */
  getAdminAddress(): string | null {
    return this.adminWallet?.address || null;
  }
}

export const tokenDistributor = new TokenDistributor(); 