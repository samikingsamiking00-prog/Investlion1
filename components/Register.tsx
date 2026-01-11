
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set, get, update, push } from 'firebase/database';
import { auth, db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, UserPlus, ShieldCheck, ChevronRight } from 'lucide-react';
import { UserProfile } from '../types';

const Register: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (phone.length < 10) {
      setError('Enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');

    const email = `${phone}@investlion.com`;
    const userInviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userProfile: UserProfile = {
        uid: user.uid,
        phone: `+92${phone}`,
        balance: 0,
        totalDeposit: 0,
        totalWithdraw: 0,
        inviteCode: userInviteCode,
        referredBy: inviteCode || '',
        status: 'active',
        isAdmin: false,
        createdAt: Date.now()
      };

      // Save user profile
      await set(ref(db, `users/${user.uid}`), userProfile);
      // Save invite code mapping
      await set(ref(db, `invites/${userInviteCode}`), user.uid);

      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Registration failed. Phone might be already in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="h-48 bg-lion-red rounded-b-[40px] flex flex-col items-center justify-center p-6 text-white text-center">
        <h1 className="text-3xl font-bold">InvestLion</h1>
        <p className="mt-1 opacity-90">Start your journey today</p>
      </div>

      <div className="flex-1 px-8 py-10 -mt-8 bg-white rounded-t-[40px] shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Account</h2>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="relative">
            <label className="text-xs font-semibold text-gray-400 uppercase block mb-1">Mobile Number</label>
            <div className="flex items-center border-b-2 border-gray-100 focus-within:border-lion-red transition-colors py-2">
              <Phone className="text-gray-400 mr-3" size={20} />
              <span className="text-gray-700 font-medium mr-1">+92</span>
              <input 
                type="tel" 
                placeholder="3001234567"
                className="w-full bg-transparent outline-none text-gray-700 font-medium"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
          </div>

          <div className="relative">
            <label className="text-xs font-semibold text-gray-400 uppercase block mb-1">Password</label>
            <div className="flex items-center border-b-2 border-gray-100 focus-within:border-lion-red transition-colors py-2">
              <Lock className="text-gray-400 mr-3" size={20} />
              <input 
                type="password" 
                placeholder="Create password"
                className="w-full bg-transparent outline-none text-gray-700 font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="relative">
            <label className="text-xs font-semibold text-gray-400 uppercase block mb-1">Confirm Password</label>
            <div className="flex items-center border-b-2 border-gray-100 focus-within:border-lion-red transition-colors py-2">
              <ShieldCheck className="text-gray-400 mr-3" size={20} />
              <input 
                type="password" 
                placeholder="Confirm password"
                className="w-full bg-transparent outline-none text-gray-700 font-medium"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="relative">
            <label className="text-xs font-semibold text-gray-400 uppercase block mb-1">Invitation Code (Optional)</label>
            <div className="flex items-center border-b-2 border-gray-100 focus-within:border-lion-red transition-colors py-2">
              <UserPlus className="text-gray-400 mr-3" size={20} />
              <input 
                type="text" 
                placeholder="Enter invite code"
                className="w-full bg-transparent outline-none text-gray-700 font-medium"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-lion-red hover:bg-red-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-red-200 flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50 mt-4"
          >
            {loading ? 'Creating...' : (
              <>
                <span>Register</span>
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-gray-500">
          Already have an account? 
          <Link to="/login" className="text-lion-red font-bold ml-1">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
