
import React from 'react';
import { UserProfile } from '../types';
import { Link } from 'react-router-dom';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  TrendingUp, 
  Users, 
  Info,
  Gift,
  Bell
} from 'lucide-react';

interface DashboardProps {
  userProfile: UserProfile | null;
}

const Dashboard: React.FC<DashboardProps> = ({ userProfile }) => {
  if (!userProfile) return null;

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center py-2">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Hi, {userProfile.phone.slice(-4)}</h1>
          <p className="text-sm text-gray-500 font-medium">Welcome to InvestLion</p>
        </div>
        <div className="relative">
          <button className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-lion-red rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-sm opacity-80 font-medium uppercase tracking-wider">Available Balance</p>
          <div className="flex items-baseline mt-1">
            <span className="text-4xl font-bold">Rs {userProfile.balance.toLocaleString()}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/20">
            <div>
              <p className="text-xs opacity-70 uppercase">Total Deposit</p>
              <p className="text-lg font-bold">Rs {userProfile.totalDeposit.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs opacity-70 uppercase">Total Withdraw</p>
              <p className="text-lg font-bold">Rs {userProfile.totalWithdraw.toLocaleString()}</p>
            </div>
          </div>
        </div>
        {/* Decor */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/deposit" className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-3 transition-transform active:scale-95">
          <div className="p-3 bg-red-50 rounded-xl text-lion-red">
            <ArrowDownCircle size={24} />
          </div>
          <div>
            <p className="font-bold text-gray-800">Deposit</p>
            <p className="text-[10px] text-gray-400">Add Funds</p>
          </div>
        </Link>
        <Link to="/withdraw" className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-3 transition-transform active:scale-95">
          <div className="p-3 bg-green-50 rounded-xl text-green-600">
            <ArrowUpCircle size={24} />
          </div>
          <div>
            <p className="font-bold text-gray-800">Withdraw</p>
            <p className="text-[10px] text-gray-400">Cash Out</p>
          </div>
        </Link>
      </div>

      {/* referral Info */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Gift className="text-lion-red" size={20} />
            <h3 className="font-bold text-gray-800">Referral Program</h3>
          </div>
          <span className="text-[10px] bg-red-50 text-lion-red px-2 py-1 rounded-full font-bold uppercase">Reward: Rs200</span>
        </div>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Invite your friends and earn Rs200 instantly when they purchase any investment plan!
        </p>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <span className="text-sm font-bold text-gray-600 tracking-widest">{userProfile.inviteCode}</span>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(userProfile.inviteCode);
              alert('Code copied to clipboard!');
            }}
            className="text-lion-red text-xs font-bold flex items-center"
          >
            Copy Code
          </button>
        </div>
      </div>

      {/* Mini Ads / Stats */}
      <div className="bg-blue-600 rounded-2xl p-4 text-white flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-white/20 rounded-xl">
            <Info size={24} />
          </div>
          <div>
            <p className="font-bold">Official Support</p>
            <p className="text-xs opacity-80 text-white/80">Contact us on WhatsApp</p>
          </div>
        </div>
        <ChevronRight size={20} />
      </div>
    </div>
  );
};

const ChevronRight = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);

export default Dashboard;
