import React, { useContext, useEffect, useRef } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AppContent } from '../context/AppContext';


const EmailVerify = () => {
  axios.defaults.withCredentials = true;

  const { backendUrl, getUserData, isLoggedIn, userData } = useContext(AppContent);
  const navigate = useNavigate();
  const inputRefs = useRef([]);

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
    e.preventDefault(); // Prevent default paste behavior
    const paste = e.clipboardData.getData('Text').slice(0, 6);
    const chars = paste.split('');

    // Optional: clear previous inputs
    inputRefs.current.forEach((input) => {
      if (input) input.value = '';
    });

    chars.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
        // Move focus to the next box
        if (index < 5 && inputRefs.current[index + 1]) {
          inputRefs.current[index + 1].focus();
        }
      }
    });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const otpArray = inputRefs.current.map((input) => input.value.trim());
      const otp = otpArray.join('');
      const { data } = await axios.post(`${backendUrl}/api/auth/verify-Account`, { otp });

      if (data.success) {
        toast.success(data.message);
        getUserData();
        navigate('/');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Verification failed. Try again.");
    }
  };

  useEffect(() => {
    isLoggedIn && userData && userData.isAccountVerified && navigate('/');
  }, [isLoggedIn, userData]);
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt="logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      <form onSubmit={onSubmitHandler} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
        <h1 className="text-white text-2xl font-semibold mb-4 text-center">Email Verification</h1>
        <p className="text-center mb-6 text-indigo-300">Enter the 6-digit OTP sent to your email</p>

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

        <button className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full">
          Verify Email
        </button>
      </form>
    </div>
  );
};

export default EmailVerify;
