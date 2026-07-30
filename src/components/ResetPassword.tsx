import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { XCircleIcon, LoaderIcon, EyeIcon, EyeOffIcon, BrainCircuitIcon, CheckCircleIcon, ArrowLeftIcon, LockIcon } from './Icons';

interface ResetPasswordProps {
  onComplete: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ onComplete }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const isSubmitting = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      isSubmitting.current = false;
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      isSubmitting.current = false;
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      // Invalidate the recovery session so the user must log in with the new password
      await supabase.auth.signOut();
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Your reset link may have expired.');
    } finally {
      isSubmitting.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F7FF] font-sans text-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden w-full absolute inset-0 z-[100]">
      {/* Background styling elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 -z-10 pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 sm:p-12 relative z-10 border border-slate-100">
        
        <div className="flex items-center gap-3 mb-10 justify-center">
          <BrainCircuitIcon className="w-8 h-8 text-blue-600" />
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-[0.15em] text-[#0f172a] font-serif leading-none mb-1">SYLLOSPHERE</span>
          </div>
        </div>

        {success ? (
          <div className="text-center animate-[fadeIn_0.3s_ease-out]">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-8 h-8" />
            </div>
            <h2 className="text-[28px] font-bold text-[#0f172a] mb-3 tracking-tight">Password Updated</h2>
            <p className="text-slate-500 font-medium mb-8">
              Your password has been updated successfully. You can now log in with your new password.
            </p>
            <button
              onClick={onComplete}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 text-base"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            <h2 className="text-[28px] font-bold text-[#0f172a] mb-2 tracking-tight text-center">
              Set New Password
            </h2>
            <p className="text-[15px] text-slate-500 mb-8 font-medium text-center">
              Please enter your new password below.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-bold text-[#0f172a] block mb-2">
                  New Password
                </label>
                <div className="relative">
                  <LockIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-12 text-[#0f172a] text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 font-medium shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-[#0f172a] block mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <LockIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-12 text-[#0f172a] text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 font-medium shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm flex items-start gap-2 font-medium">
                  <XCircleIcon className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 text-base mt-4"
              >
                {loading ? (
                  <>
                    <LoaderIcon className="w-5 h-5 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
              
              <button
                type="button"
                onClick={onComplete}
                className="w-full py-3.5 mt-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm border border-slate-200"
              >
                <ArrowLeftIcon className="w-4 h-4" /> Back to Login
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
