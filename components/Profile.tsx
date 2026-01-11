
import React from 'react';
import { UserProfile } from '../types';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  Wallet, 
  Package, 
  Users 
} from 'lucide-react';

interface ProfileProps {
  userProfile: UserProfile | null;
}

const Profile: React.FC<ProfileProps> = ({ userProfile }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };

  if (!userProfile) return null;

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      <div className="bg-lion-red p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{userProfile.phone}</h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs bg-white/20 px-2 py-1 rounded-lg font-bold">Standard Account</span>
              <span className="text-xs bg-green-500/20 px-2 py-1 rounded-lg font-bold border border-green-500/30">Verified</span>
            </div>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Balance</p>
            <p className="text-lg font-bold text-gray-800">Rs {userProfile.balance.toLocaleString()}</p>
          </div>
          <div className="border-x border-gray-100">
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Deposits</p>
            <p className="text-lg font-bold text-gray-800">Rs {userProfile.totalDeposit.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Withdraws</p>
            <p className="text-lg font-bold text-gray-800">Rs {userProfile.totalWithdraw.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <MenuItem icon={<Wallet size={20} className="text-blue-500" />} title="Wallet Transactions" onClick={() => navigate('/deposit')} />
        <MenuItem icon={<Package size={20} className="text-orange-500" />} title="My Investments" onClick={() => navigate('/my-products')} />
        <MenuItem icon={<Users size={20} className="text-green-500" />} title="Referral Rewards" onClick={() => {}} />
        <MenuItem icon={<HelpCircle size={20} className="text-indigo-500" />} title="Help & Support" onClick={() => {}} />
        <MenuItem icon={<Settings size={20} className="text-gray-500" />} title="Account Settings" onClick={() => {}} />
      </div>

      <button 
        onClick={handleLogout}
        className="w-full bg-red-50 text-lion-red font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 active:scale-95 transition-all mt-4"
      >
        <LogOut size={20} />
        <span>Log Out</span>
      </button>

      <p className="text-center text-[10px] text-gray-400 uppercase font-bold tracking-widest">InvestLion v1.0.2</p>
    </div>
  );
};

const MenuItem = ({ icon, title, onClick }: { icon: React.ReactNode, title: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
  >
    <div className="flex items-center space-x-4">
      {icon}
      <span className="font-bold text-gray-700">{title}</span>
    </div>
    <ChevronRight size={18} className="text-gray-300" />
  </button>
);

export default Profile;
