
import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { ref, push, set } from 'firebase/database';
import { UserProfile, WithdrawRequest } from '../types';
import { ArrowUpCircle, AlertCircle } from 'lucide-react';

interface WithdrawProps {
  userProfile: UserProfile | null;
}

const Withdraw: React.FC<WithdrawProps> = ({ userProfile }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'EasyPaisa' | 'JazzCash'>('EasyPaisa');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !accountNumber || !auth.currentUser || !userProfile) return;

    const withdrawAmount = Number(amount);

    if (withdrawAmount < 200) {
      alert('Minimum withdrawal is Rs 200');
      return;
    }

    if (withdrawAmount > userProfile.balance) {
      alert('Insufficient balance');
      return;
    }

    setLoading(true);

    try {
      const withdrawRequest: WithdrawRequest = {
        id: '',
        uid: auth.currentUser.uid,
        phone: userProfile.phone,
        amount: withdrawAmount,
        method,
        accountNumber,
        status: 'pending',
        timestamp: Date.now()
      };

      const newRef = push(ref(db, 'withdrawals'));
      withdrawRequest.id = newRef.key || '';
      
      // We don't deduct balance yet, admin will deduct when approving
      await set(newRef, withdrawRequest);

      alert('Withdrawal request submitted for approval!');
      setAmount('');
      setAccountNumber('');
    } catch (err) {
      alert('Failed to submit withdrawal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      <div className="bg-lion-red p-6 rounded-3xl text-white shadow-xl">
        <h2 className="text-2xl font-bold">Cash Out</h2>
        <p className="text-sm opacity-80 mt-1">Request withdrawal from your wallet</p>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">Available for withdraw</p>
            <p className="text-2xl font-bold text-lion-red">Rs {userProfile?.balance.toLocaleString()}</p>
          </div>
          <ArrowUpCircle className="text-lion-red" size={32} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Select Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => setMethod('EasyPaisa')}
                className={`py-3 rounded-xl font-bold border-2 transition-all ${method === 'EasyPaisa' ? 'border-lion-red bg-red-50 text-lion-red' : 'border-gray-100 text-gray-500'}`}
              >
                EasyPaisa
              </button>
              <button 
                type="button"
                onClick={() => setMethod('JazzCash')}
                className={`py-3 rounded-xl font-bold border-2 transition-all ${method === 'JazzCash' ? 'border-lion-red bg-red-50 text-lion-red' : 'border-gray-100 text-gray-500'}`}
              >
                JazzCash
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Withdraw Amount (Min: 200)</label>
            <input 
              type="number" 
              placeholder="Min Rs 200"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-4 font-bold text-gray-800 outline-none focus:border-lion-red transition-all"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Account Number</label>
            <input 
              type="tel" 
              placeholder="e.g. 03265740158"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-4 font-bold text-gray-800 outline-none focus:border-lion-red transition-all"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
          </div>

          <div className="flex items-start space-x-2 text-gray-400 text-[10px] p-2 bg-gray-50 rounded-lg">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <p>Withdrawals are processed within 24 hours. Admin will verify your transaction history before approval.</p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-lion-red hover:bg-red-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-red-200 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Submit Withdrawal'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Withdraw;
