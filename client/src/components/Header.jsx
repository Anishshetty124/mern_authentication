import React, { useContext } from 'react';
import { assets } from '../assets/assets';
import { AppContent } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { userData, isLoggedIn } = useContext(AppContent);
  const navigate = useNavigate();

  return (
    <div className='flex flex-col items-center mt-20 px-4 justify-center text-center text-gray-800'>
      <img src={assets.header_img} alt="header" className='rounded-full w-36 h-36 mb-6' />
      <h1 className='flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2'>
        hey, {userData ? userData.name : 'developer'}
        <img className='w-8 aspect-square' src={assets.hand_wave} alt="hand wave" />
      </h1>
      <h2 className='text-3xl sm:text-5xl font-semibold mb-4'>
        welcome to anish's mern auth project
      </h2>
      <p className='mb-8 max-w-md'>
        this is a simple auth app built with mern stack, it uses jwt for authentication
      </p>

      {isLoggedIn ? (
        <button
          onClick={() => navigate('/dashboard')}
          className='border border-gray-600 rounded-full px-8 py-2.5 hover:bg-gray-300 transition-all'
        >
          get started
        </button>
      ) : (
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/login')}
            className='border border-gray-600 rounded-full px-6 py-2.5 hover:bg-gray-300 transition-all'
          >
            Signup or Login
          </button>
          
        </div>
      )}
    </div>
  );
};

export default Header;
