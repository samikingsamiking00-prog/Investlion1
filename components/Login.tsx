
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, ChevronRight } from 'lucide-react';

const Login: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Firebase Auth uses email, so we map phone to a pseudo-email for authentication
    const email = `${phone}@investlion.com`;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      setError('Invalid credentials. Please check your phone and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="h-64 bg-lion-red rounded-b-[40px] flex flex-col items-center justify-center p-6 text-white text-center shadow-lg">
        <div className="bg-white p-4 rounded-3xl mb-4">
           <img src="https://picsum.photos/120/120?random=1" alt="Logo" className="w-16 h-16 object-contain rounded-2xl" />
        </div>
        <h1 className="text-3xl font-bold">InvestLion</h1>
        <p className="mt-2 opacity-90">Grow your wealth with confidence</p>
      </div>

      <div className="flex-1 px-8 py-10 -mt-10 bg-white rounded-t-[40px]">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome Back</h2>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Mobile Number</label>
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
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Password</label>
            <div className="flex items-center border-b-2 border-gray-100 focus-within:border-lion-red transition-colors py-2">
              <Lock className="text-gray-400 mr-3" size={20} />
              <input 
                type="password" 
                placeholder="Enter password"
                className="w-full bg-transparent outline-none text-gray-700 font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-lion-red hover:bg-red-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-red-200 flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (
              <>
                <span>Sign In</span>
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-gray-500">
          Don't have an account? 
          <Link to="/register" className="text-lion-red font-bold ml-1">Register Now</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
