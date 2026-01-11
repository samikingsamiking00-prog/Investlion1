
import React, { useState } from 'react';
import { DEPOSIT_ACCOUNT_NUMBER, DEPOSIT_HOLDER_NAME } from '../constants';
import { auth, db } from '../firebase';
import { ref, push, set } from 'firebase/database';
import { Copy, CheckCircle2, ChevronDown } from 'lucide-react';
import { UserProfile, DepositRequest } from '../types';

interface DepositProps {
  userProfile: UserProfile | null;
}

const Deposit: React.FC<DepositProps> = ({ userProfile }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'EasyPaisa' | 'JazzCash'>('EasyPaisa');
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(DEPOSIT_ACCOUNT_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !txId || !auth.currentUser) return;
    setLoading(true);

    try {
      const depositRequest: DepositRequest = {
        id: '', 
        uid: auth.currentUser.uid,
        phone: userProfile?.phone || '',
        amount: Number(amount),
        method,
        txId,
        status: 'pending',
        timestamp: Date.now()
      };

      const newRef = push(ref(db, 'deposits'));
      depositRequest.id = newRef.key || '';
      await set(newRef, depositRequest);

      alert('Deposit request submitted! Waiting for admin approval.');
      setAmount('');
      setTxId('');
    } catch (err) {
      alert('Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      <div className="bg-lion-red p-6 rounded-3xl text-white shadow-xl">
        <h2 className="text-2xl font-bold">Add Funds</h2>
        <p className="text-sm opacity-80 mt-1">Deposit amount to start investing</p>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Company Payment Account</label>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-500 font-medium">Account Holder</span>
              <span className="font-bold text-gray-800">{DEPOSIT_HOLDER_NAME}</span>
            </div>
            <div className="flex justify-between items-center mt-3">
              <span className="text-2xl font-bold text-lion-red tracking-tight">{DEPOSIT_ACCOUNT_NUMBER}</span>
              <button 
                onClick={handleCopy}
                className={`p-2 rounded-xl transition-all ${copied ? 'bg-green-500 text-white' : 'bg-red-50 text-lion-red'}`}
              >
                {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 font-medium">Use EasyPaisa or JazzCash for transfer</p>
          </div>
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
            <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Deposit Amount</label>
            <input 
              type="number" 
              placeholder="e.g. 500"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-4 font-bold text-gray-800 outline-none focus:border-lion-red transition-all"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Transaction ID (TxID)</label>
            <input 
              type="text" 
              placeholder="Enter 11 or 12 digit TxID"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-4 font-bold text-gray-800 outline-none focus:border-lion-red transition-all"
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-lion-red hover:bg-red-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-red-200 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Submit Deposit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Deposit;
