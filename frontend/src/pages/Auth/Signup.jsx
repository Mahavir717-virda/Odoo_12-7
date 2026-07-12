import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Leaf, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Employee');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      await signup(name, email, password, role);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-bg-base bg-topo-auth items-center justify-center p-4 font-sans select-none">
      <div className="w-full max-w-[400px] bg-bg-card border border-border-sage rounded-2xl p-8 shadow-2xl shadow-brand/5 flex flex-col relative z-10">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand to-accent-env flex items-center justify-center shadow-lg shadow-brand/20">
              <Leaf className="w-4 h-4 text-bg-base" />
            </div>
            <h1 className="font-display font-extrabold text-text-primary text-xl tracking-wide leading-tight">EcoSphere</h1>
          </div>
          <p className="text-[10px] text-text-secondary font-bold tracking-wider uppercase mt-1">
            ESG Management Platform
          </p>
        </div>

        {/* Form Heading */}
        <h2 className="text-sm font-bold text-text-primary text-center uppercase tracking-wider mb-6 font-display">
          Create your account
        </h2>

        {/* Error message */}
        {error && (
          <div className="mb-4 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        {/* Input fields form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full name input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Deep Pathak"
                className="w-full pl-9 pr-4 py-2.5 bg-bg-base border border-border-sage rounded-lg text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-text-secondary" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-4 py-2.5 bg-bg-base border border-border-sage rounded-lg text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-text-secondary" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-bg-base border border-border-sage rounded-lg text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-text-secondary hover:text-text-primary transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-text-secondary" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-bg-base border border-border-sage rounded-lg text-sm text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-text-secondary hover:text-text-primary transition-colors"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Role selector Segmented Control */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block font-display">
              Assign Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-bg-base border border-border-sage rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-semibold"
              disabled={isLoading}
            >
              <option value="Employee">Employee (Default)</option>
              <option value="Admin">Admin</option>
              <option value="HR">HR</option>
              <option value="Manager">Manager</option>
              <option value="Sustainability Team">Sustainability Team</option>
              <option value="Compliance Team">Compliance Team</option>
            </select>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-brand to-accent-env hover:brightness-110 text-bg-base font-extrabold text-xs uppercase tracking-widest rounded-lg shadow-lg shadow-brand/10 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 pt-3 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-bg-base" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Creating account...</span>
              </>
            ) : (
              <span>Sign Up</span>
            )}
          </button>
        </form>

        {/* Footer Redirect link */}
        <div className="mt-6 text-center">
          <p className="text-xs text-text-secondary font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-brand hover:text-brand-hover hover:underline transition-colors ml-1 font-bold">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
