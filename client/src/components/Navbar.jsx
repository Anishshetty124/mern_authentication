import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
const Navbar = () => {
  
  const navigate = useNavigate();
  const {userData,backendUrl,setUserData,setIsLoggedIn}=useContext(AppContent);
  const sendVerifyOtp =async(req,res)=>{
    try {
      axios.defaults.withCredentials = true;
      const {data} = await axios.post(`${backendUrl}/api/auth/send-verify-otp`);
      if(data.success){
        navigate('/email-verify');
        toast.success(data.message);
      }else{
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
      
    }
  }
  const logout =async () =>{
    try {
      axios.defaults.withCredentials = true;
      const {data} = await axios.post(`${backendUrl}/api/auth/logout`);
      data.success && setIsLoggedIn(false);
      data.success && setUserData(null);
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    }
  }
  //used to navigate to other page by a function
  return (

    <div className='w-full flex justify-between items-center p-4 sm:p-6 
    sm:px-24 absolute top-0' >
        <img src={assets.logo} alt="logo" className='w-28 sm:w-32 ' />
        {userData
        ?(<div className='w-9 h-9 flex items-center justify-center rounded-full bg-black text-white relative group'>{userData.name[0].toUpperCase()}
        <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10'>
          <ul className='list-none m-0 p-2 bg-gray-100 text-sm'>
            {!userData.isAccountVerified && <li onClick={sendVerifyOtp} className='py-1 px-2 hover:bg-gray-200 cursor-pointer'>Verify email</li> }
            <li onClick={logout} className='py-1 px-2 hover:bg-gray-200 cursor-pointer pr-10'>Logout</li>
          </ul>
        </div>
        </div>)
        :(<button 
         onClick={() => navigate('/login')} className='flex items-center gap-2 border border-grey-800 rounded-full px-6 py-2 text-grey-800 hover:bg-grey-300 transition-all'
         >Login <img src={assets.arrow_icon} alt="arrow" /></button>)}
        
    </div>
  )
}

export default Navbar