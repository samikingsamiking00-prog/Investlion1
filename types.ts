
export interface UserProfile {
  uid: string;
  phone: string;
  balance: number;
  totalDeposit: number;
  totalWithdraw: number;
  inviteCode: string;
  referredBy?: string;
  status: 'active' | 'disabled';
  isAdmin?: boolean;
  createdAt: number;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  investAmount: number;
  dailyIncome: number;
  duration: number;
  totalIncome: number;
}

export interface ActivePlan {
  id: string;
  uid: string;
  planId: string;
  planName: string;
  dailyIncome: number;
  purchaseDate: number;
  lastClaimDate: number;
  expiryDate: number;
  status: 'running' | 'completed';
}

export interface DepositRequest {
  id: string;
  uid: string;
  phone: string;
  amount: number;
  method: 'EasyPaisa' | 'JazzCash';
  txId: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
}

export interface WithdrawRequest {
  id: string;
  uid: string;
  phone: string;
  amount: number;
  accountNumber: string;
  method: 'EasyPaisa' | 'JazzCash';
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
}

export interface ReferralBonus {
  id: string;
  inviterUid: string;
  inviteeUid: string;
  amount: number;
  timestamp: number;
}
