
import React, { useState } from 'react';


interface LoginPageProps {
    onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const loginBackgroundImage = new URL('../Images/Cement_BG_login.jpg', import.meta.url).href;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email === 'CemHub@gmail.com' && password === 'CemHub@123') {
            setError('');
            onLogin();
        } else if (!email || !password) {
            setError('Please enter both email and password.');
        } else {
            setError('Invalid email or password.');
        }
    };

    return (
  <div
  className="flex items-center justify-center min-h-screen relative overflow-hidden"
  style={{
    backgroundImage: `url("${loginBackgroundImage}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }}
>


            {/* Multi-layered gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0B1F3B]/80 via-[#0B1F3B]/60 to-transparent backdrop-blur-[3px]"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00AEEF]/20 to-transparent opacity-30"></div>

            <div className="w-full max-w-md p-10 space-y-8 bg-white/90 rounded-3xl shadow-2xl border border-white/40 relative z-10 backdrop-blur-xl transition-all duration-500">
                <div className="flex flex-col items-center space-y-4">
                    <div className="text-5xl font-black tracking-tighter text-[#003A8F] drop-shadow-sm">
                        CemHub
                    </div>
                    <div className="h-1.5 w-16 bg-[#00AEEF] rounded-full shadow-sm"></div>
                </div>
                
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-[#1A1A1A]">Portal Access</h2>
                    <p className="text-sm text-gray-500 mt-2 font-medium">Geo-Intelligence Supply Chain Engine</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="group">
                        <label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 group-focus-within:text-[#003A8F] transition-colors">Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-4 mt-1 bg-gray-50/50 border border-gray-200 rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-[#003A8F]/50 focus:border-[#003A8F] transition-all text-gray-800"
                            placeholder="CemHub@gmail.com"
                        />
                    </div>
                    <div className="group">
                        <label htmlFor="password-input" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 group-focus-within:text-[#003A8F] transition-colors">Password</label>
                        <input
                            id="password-input"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-4 mt-1 bg-gray-50/50 border border-gray-200 rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-[#003A8F]/50 focus:border-[#003A8F] transition-all text-gray-800"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-50 text-[#C62828] rounded-2xl text-xs font-bold border border-red-100 animate-pulse">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full px-4 py-5 text-lg font-black text-white bg-gradient-to-r from-[#003A8F] to-[#00AEEF] rounded-2xl hover:from-[#0B1F3B] hover:to-[#003A8F] focus:outline-none focus:ring-4 focus:ring-[#003A8F]/20 transition-all duration-300 shadow-xl hover:shadow-[#003A8F]/40 transform hover:-translate-y-1 active:scale-95"
                        >
                            SECURE SIGN IN
                        </button>
                    </div>
                </form>

                <div className="flex justify-between text-[10px] font-bold text-gray-400 pt-6 border-t border-gray-100">
                    <span className="tracking-widest opacity-60">SYSTEM v2.5.0-STABLE</span>
                    <a href="#" className="hover:text-[#003A8F] transition-colors underline decoration-dotted">Forgot Access?</a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
