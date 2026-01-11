
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { ActivePlan } from '../types';
import { Package, Clock, Play, CheckCircle, TrendingUp } from 'lucide-react';

const MyProducts: React.FC = () => {
  const [plans, setPlans] = useState<ActivePlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const plansRef = ref(db, `activePlans/${auth.currentUser.uid}`);
    const unsubscribe = onValue(plansRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPlans(Object.values(data));
      } else {
        setPlans([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const calculateRemainingDays = (expiry: number) => {
    const remaining = expiry - Date.now();
    return Math.max(0, Math.ceil(remaining / (1000 * 60 * 60 * 24)));
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading products...</div>;

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      <div className="bg-lion-red p-6 rounded-3xl text-white shadow-xl">
        <h2 className="text-2xl font-bold">My Portfolio</h2>
        <p className="text-sm opacity-80 mt-1">Track your active investments</p>
      </div>

      {plans.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 bg-gray-50 rounded-full text-gray-300">
            <Package size={48} />
          </div>
          <div>
            <p className="font-bold text-gray-800">No active plans</p>
            <p className="text-sm text-gray-500">You haven't purchased any plans yet.</p>
          </div>
          <button onClick={() => window.location.hash = '/plans'} className="text-lion-red font-bold">Browse Plans</button>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.sort((a, b) => b.purchaseDate - a.purchaseDate).map((plan) => (
            <div key={plan.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl ${plan.status === 'running' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                    {plan.status === 'running' ? <Play size={20} /> : <CheckCircle size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{plan.planName}</h3>
                    <p className={`text-[10px] font-bold uppercase ${plan.status === 'running' ? 'text-green-600' : 'text-gray-400'}`}>
                      {plan.status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lion-red font-bold">Rs {plan.dailyIncome}/day</p>
                  <p className="text-[10px] text-gray-400 uppercase font-medium">Daily Income</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-2xl flex items-center space-x-3">
                  <Clock className="text-lion-red" size={18} />
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Remaining</p>
                    <p className="text-sm font-bold text-gray-700">{calculateRemainingDays(plan.expiryDate)} Days</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl flex items-center space-x-3">
                  <TrendingUp className="text-lion-red" size={18} />
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Hourly</p>
                    <p className="text-sm font-bold text-gray-700">Rs {(plan.dailyIncome / 24).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {plan.status === 'running' && (
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-lion-red h-full rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (1 - calculateRemainingDays(plan.expiryDate)/50) * 100)}%` }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProducts;
