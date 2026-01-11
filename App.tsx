
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ref, onValue, set, get, update, push } from 'firebase/database';
import { auth, db } from './firebase';
import { 
  Home, 
  User as UserIcon, 
  Wallet, 
  Package, 
  ShieldCheck, 
  LogOut, 
  PlusCircle, 
  Clock, 
  TrendingUp,
  CreditCard,
  ArrowDownCircle,
  ArrowUpCircle,
  Copy,
  Users,
  LayoutDashboard
} from 'lucide-react';

import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Plans from './components/Plans';
import Deposit from './components/Deposit';
import Withdraw from './components/Withdraw';
import Profile from './components/Profile';
import MyProducts from './components/MyProducts';
import AdminPanel from './components/AdminPanel';
import { UserProfile, ActivePlan } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        const userRef = ref(db, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          setUserProfile(data);
          setLoading(false);
        });
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Income Processor: Runs when the app is focused or user navigates
  // Calculates hourly income for all active plans
  const processEarnings = async () => {
    if (!currentUser || !userProfile) return;

    const plansRef = ref(db, `activePlans/${currentUser.uid}`);
    const snapshot = await get(plansRef);
    if (snapshot.exists()) {
      const activePlans: { [key: string]: ActivePlan } = snapshot.val();
      const now = Date.now();
      let totalEarnings = 0;
      const updates: any = {};

      Object.entries(activePlans).forEach(([key, plan]) => {
        if (plan.status === 'running') {
          const hoursPassed = Math.floor((now - plan.lastClaimDate) / (1000 * 60 * 60));
          if (hoursPassed >= 1) {
            const hourlyRate = plan.dailyIncome / 24;
            const earnings = hoursPassed * hourlyRate;
            totalEarnings += earnings;
            updates[`activePlans/${currentUser.uid}/${key}/lastClaimDate`] = plan.lastClaimDate + (hoursPassed * 3600000);
            
            // Check if plan expired
            if (now >= plan.expiryDate) {
              updates[`activePlans/${currentUser.uid}/${key}/status`] = 'completed';
            }
          }
        }
      });

      if (totalEarnings > 0) {
        updates[`users/${currentUser.uid}/balance`] = (userProfile.balance || 0) + totalEarnings;
        await update(ref(db), updates);
      }
    }
  };

  useEffect(() => {
    if (currentUser) {
      processEarnings();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">InvestLion is loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-grow pb-20">
          <Routes>
            <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!currentUser ? <Register /> : <Navigate to="/" />} />
            
            <Route path="/" element={currentUser ? <Dashboard userProfile={userProfile} /> : <Navigate to="/login" />} />
            <Route path="/plans" element={currentUser ? <Plans /> : <Navigate to="/login" />} />
            <Route path="/deposit" element={currentUser ? <Deposit userProfile={userProfile} /> : <Navigate to="/login" />} />
            <Route path="/withdraw" element={currentUser ? <Withdraw userProfile={userProfile} /> : <Navigate to="/login" />} />
            <Route path="/profile" element={currentUser ? <Profile userProfile={userProfile} /> : <Navigate to="/login" />} />
            <Route path="/my-products" element={currentUser ? <MyProducts /> : <Navigate to="/login" />} />
            
            <Route path="/admin/*" element={currentUser && userProfile?.isAdmin ? <AdminPanel /> : <Navigate to="/" />} />
          </Routes>
        </main>

        {currentUser && <BottomNav isAdmin={userProfile?.isAdmin} />}
      </div>
    </Router>
  );
};

const BottomNav: React.FC<{ isAdmin?: boolean }> = ({ isAdmin }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50 shadow-lg">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        <Link to="/" className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isActive('/') ? 'text-red-500' : 'text-gray-500'}`}>
          <Home size={24} />
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </Link>
        <Link to="/plans" className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isActive('/plans') ? 'text-red-500' : 'text-gray-500'}`}>
          <TrendingUp size={24} />
          <span className="text-[10px] mt-1 font-medium">Invest</span>
        </Link>
        <Link to="/my-products" className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isActive('/my-products') ? 'text-red-500' : 'text-gray-500'}`}>
          <Package size={24} />
          <span className="text-[10px] mt-1 font-medium">Products</span>
        </Link>
        <Link to="/profile" className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isActive('/profile') ? 'text-red-500' : 'text-gray-500'}`}>
          <UserIcon size={24} />
          <span className="text-[10px] mt-1 font-medium">Profile</span>
        </Link>
        {isAdmin && (
          <Link to="/admin" className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isActive('/admin') ? 'text-red-500' : 'text-gray-500'}`}>
            <ShieldCheck size={24} />
            <span className="text-[10px] mt-1 font-medium">Admin</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default App;
