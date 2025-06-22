import React, { useContext, useRef, useState } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContent);

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [verifiedOtp, setVerifiedOtp] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
  const inputRefs = useRef([]);

  axios.defaults.withCredentials = true;

  // Step 1: Submit email
  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/send-reset-otp`, { email });
      if (data.success) {
        toast.success(data.message);
        setIsEmailSent(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  // Step 2: Handle OTP input
  const handleInput = (e, index) => {
    const value = e.target.value;
    if (value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('Text').slice(0, 6);
    const chars = paste.split('');

    inputRefs.current.forEach((input) => {
      if (input) input.value = '';
    });

    chars.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
        if (index < 5 && inputRefs.current[index + 1]) {
          inputRefs.current[index + 1].focus();
        }
      }
    });
  };

  // Step 2: Submit OTP
  const onSubmitOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = inputRefs.current.map((input) => input.value).join('');
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/verify-reset-otp`, {
        email,
        otp: enteredOtp,
      });
      if (data.success) {
        toast.success(data.message);
        setVerifiedOtp(enteredOtp); // Store OTP for final reset step
        setIsOtpSubmitted(true);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed');
    }
  };

  // Step 3: Submit new password
  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/reset-password`, {
        email,
        otp: verifiedOtp,
        newPassword,
      });
      if (data.success) {
        toast.success(data.message);
        navigate('/login');
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt="logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      {/* Step 1: Email Submission */}
      {!isEmailSent && (
        <form onSubmit={onSubmitEmail} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold mb-4 text-center">Reset Password</h1>
          <p className="text-center mb-6 text-indigo-300">Enter your registered email address</p>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img className="w-3 h-3" src={assets.mail_icon} alt="email icon" />
            <input
              type="email"
              placeholder="Email"
              className="bg-transparent outline-none text-white w-full"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>
          <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3">
            Submit
          </button>
        </form>
      )}

      {/* Step 2: OTP Submission */}
      {!isOtpSubmitted && isEmailSent && (
        <form onSubmit={onSubmitOtp} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold mb-4 text-center">Verify OTP</h1>
          <p className="text-center mb-6 text-indigo-300">
            Enter the 6-digit OTP sent to your email
          </p>
          <div className="flex justify-between mb-8">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  required
                  className="w-12 h-12 bg-[#333A5C] text-center text-white text-xl rounded-md"
                  ref={(el) => (inputRefs.current[index] = el)}
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                />
              ))}
          </div>
          <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full">
            Verify Email
          </button>
        </form>
      )}

      {/* Step 3: New Password Entry */}
      {isOtpSubmitted && isEmailSent && (
        <form onSubmit={onSubmitNewPassword} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
          <h1 className="text-white text-2xl font-semibold mb-4 text-center">New Password</h1>
          <p className="text-center mb-6 text-indigo-300">Enter your new password</p>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img className="w-3 h-3" src={assets.lock_icon} alt="lock icon" />
            <input
              type="password"
              placeholder="New password"
              className="bg-transparent outline-none text-white w-full"
              onChange={(e) => setNewPassword(e.target.value)}
              value={newPassword}
              required
            />
          </div>
          <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
