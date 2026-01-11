
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, onValue, update, get } from 'firebase/database';
import { 
  LayoutDashboard, 
  Users as UsersIcon, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Activity,
  Check,
  X,
  CreditCard,
  History
} from 'lucide-react';
import { UserProfile, DepositRequest, WithdrawRequest } from '../types';

const AdminPanel: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    pendingDeposits: 0,
    pendingWithdraws: 0,
    totalPlansSold: 0,
  });
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'deposits' | 'withdraws'>('dashboard');

  useEffect(() => {
    const usersRef = ref(db, 'users');
    onValue(usersRef, (snap) => {
      const data = snap.val();
      if (data) {
        const userList = Object.values(data) as UserProfile[];
        setUsers(userList);
        setStats(prev => ({ 
          ...prev, 
          totalUsers: userList.length,
          activeUsers: userList.filter(u => u.status === 'active').length 
        }));
      }
    });

    const depRef = ref(db, 'deposits');
    onValue(depRef, (snap) => {
      const data = snap.val();
      if (data) {
        const depList = Object.values(data) as DepositRequest[];
        setDeposits(depList);
        setStats(prev => ({
          ...prev,
          pendingDeposits: depList.filter(d => d.status === 'pending').length,
          totalDeposits: depList.filter(d => d.status === 'approved').reduce((sum, d) => sum + d.amount, 0)
        }));
      }
    });

    const withRef = ref(db, 'withdrawals');
    onValue(withRef, (snap) => {
      const data = snap.val();
      if (data) {
        const withList = Object.values(data) as WithdrawRequest[];
        setWithdrawals(withList);
        setStats(prev => ({
          ...prev,
          pendingWithdraws: withList.filter(w => w.status === 'pending').length,
          totalWithdrawals: withList.filter(w => w.status === 'approved').reduce((sum, w) => sum + w.amount, 0)
        }));
      }
    });
  }, []);

  const approveDeposit = async (dep: DepositRequest) => {
    try {
      const userRef = ref(db, `users/${dep.uid}`);
      const userSnap = await get(userRef);
      const user: UserProfile = userSnap.val();

      const updates: any = {};
      updates[`deposits/${dep.id}/status`] = 'approved';
      updates[`users/${dep.uid}/balance`] = (user.balance || 0) + dep.amount;
      updates[`users/${dep.uid}/totalDeposit`] = (user.totalDeposit || 0) + dep.amount;

      await update(ref(db), updates);
      alert('Deposit Approved!');
    } catch (err) {
      alert('Approval failed');
    }
  };

  const rejectDeposit = async (id: string) => {
    await update(ref(db, `deposits/${id}`), { status: 'rejected' });
    alert('Deposit Rejected');
  };

  const approveWithdraw = async (withd: WithdrawRequest) => {
    try {
      const userRef = ref(db, `users/${withd.uid}`);
      const userSnap = await get(userRef);
      const user: UserProfile = userSnap.val();

      if (user.balance < withd.amount) {
        alert('User has insufficient balance for this withdrawal now.');
        return;
      }

      const updates: any = {};
      updates[`withdrawals/${withd.id}/status`] = 'approved';
      updates[`users/${withd.uid}/balance`] = user.balance - withd.amount;
      updates[`users/${withd.uid}/totalWithdraw`] = (user.totalWithdraw || 0) + withd.amount;

      await update(ref(db), updates);
      alert('Withdrawal Approved!');
    } catch (err) {
      alert('Approval failed');
    }
  };

  const rejectWithdraw = async (id: string) => {
    await update(ref(db, `withdrawals/${id}`), { status: 'rejected' });
    alert('Withdrawal Rejected');
  };

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto pb-32">
      <div className="bg-lion-red p-6 rounded-3xl text-white shadow-xl">
        <h2 className="text-2xl font-bold flex items-center space-x-2">
          <ShieldCheck size={28} />
          <span>Admin Panel</span>
        </h2>
        <p className="text-sm opacity-80 mt-1">Management Console</p>
      </div>

      {/* Admin Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        <TabBtn active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={18}/>} label="Stats" />
        <TabBtn active={activeTab === 'deposits'} onClick={() => setActiveTab('deposits')} icon={<ArrowDownCircle size={18}/>} label={`Deposits (${stats.pendingDeposits})`} />
        <TabBtn active={activeTab === 'withdraws'} onClick={() => setActiveTab('withdraws')} icon={<ArrowUpCircle size={18}/>} label={`Withdraws (${stats.pendingWithdraws})`} />
        <TabBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<UsersIcon size={18}/>} label="Users" />
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-2 gap-4">
          <StatCard title="Total Users" value={stats.totalUsers} color="bg-blue-500" />
          <StatCard title="Active Users" value={stats.activeUsers} color="bg-green-500" />
          <StatCard title="Total Deposits" value={`Rs ${stats.totalDeposits}`} color="bg-lion-red" />
          <StatCard title="Total Withdraws" value={`Rs ${stats.totalWithdrawals}`} color="bg-orange-500" />
          <StatCard title="Pending Deposits" value={stats.pendingDeposits} color="bg-yellow-500" />
          <StatCard title="Pending Withdraws" value={stats.pendingWithdraws} color="bg-purple-500" />
        </div>
      )}

      {activeTab === 'deposits' && (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-700">Pending Deposits</h3>
          {deposits.filter(d => d.status === 'pending').map(dep => (
            <div key={dep.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800">{dep.phone}</span>
                <span className="text-lion-red font-bold text-lg">Rs {dep.amount}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl space-y-1">
                <p className="text-xs text-gray-500">Method: <span className="text-gray-800 font-bold">{dep.method}</span></p>
                <p className="text-xs text-gray-500">TxID: <span className="text-gray-800 font-bold break-all">{dep.txId}</span></p>
                <p className="text-[10px] text-gray-400">{new Date(dep.timestamp).toLocaleString()}</p>
              </div>
              <div className="flex space-x-3">
                <button onClick={() => approveDeposit(dep)} className="flex-1 bg-green-500 text-white py-2 rounded-xl flex items-center justify-center space-x-1 font-bold">
                  <Check size={18} /> <span>Approve</span>
                </button>
                <button onClick={() => rejectDeposit(dep.id)} className="flex-1 bg-red-100 text-lion-red py-2 rounded-xl flex items-center justify-center space-x-1 font-bold">
                  <X size={18} /> <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'withdraws' && (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-700">Pending Withdrawals</h3>
          {withdrawals.filter(w => w.status === 'pending').map(withd => (
            <div key={withd.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800">{withd.phone}</span>
                <span className="text-lion-red font-bold text-lg">Rs {withd.amount}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl space-y-1">
                <p className="text-xs text-gray-500">Method: <span className="text-gray-800 font-bold">{withd.method}</span></p>
                <p className="text-xs text-gray-500">Account: <span className="text-gray-800 font-bold">{withd.accountNumber}</span></p>
                <p className="text-[10px] text-gray-400">{new Date(withd.timestamp).toLocaleString()}</p>
              </div>
              <div className="flex space-x-3">
                <button onClick={() => approveWithdraw(withd)} className="flex-1 bg-green-500 text-white py-2 rounded-xl flex items-center justify-center space-x-1 font-bold">
                  <Check size={18} /> <span>Approve</span>
                </button>
                <button onClick={() => rejectWithdraw(withd.id)} className="flex-1 bg-red-100 text-lion-red py-2 rounded-xl flex items-center justify-center space-x-1 font-bold">
                  <X size={18} /> <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-700">All Users</h3>
          {users.map(u => (
            <div key={u.uid} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 space-y-2">
              <div className="flex justify-between items-center">
                <p className="font-bold text-gray-800">{u.phone}</p>
                <p className="text-sm font-bold text-lion-red">Rs {u.balance.toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase text-gray-400">
                <p>Deposit: <span className="text-gray-700">Rs {u.totalDeposit}</span></p>
                <p>Withdraw: <span className="text-gray-700">Rs {u.totalWithdraw}</span></p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TabBtn = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${active ? 'bg-lion-red text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-100'}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const StatCard = ({ title, value, color }: { title: string, value: string | number, color: string }) => (
  <div className={`p-4 rounded-3xl text-white shadow-lg ${color}`}>
    <p className="text-[10px] font-bold uppercase opacity-80">{title}</p>
    <p className="text-lg font-bold mt-1">{value}</p>
  </div>
);

const ShieldCheck = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 11 11 13 15 9"></polyline></svg>
);

export default AdminPanel;
