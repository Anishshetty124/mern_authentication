// Importing required tools
import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContent = createContext();

export const AppContextProvider = (props) => {
  axios.defaults.withCredentials = true;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`);
      if (data.success) {
        setUserData(data.userData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch user data");
    }
  };

  const getAuthState = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`);
      if (data.success) {
        setIsLoggedIn(true);
        await getUserData();
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (error) {
      // Show toast only if the user was previously logged in
      if (isLoggedIn) {
        toast.error(error.response?.data?.message || "Session expired, please login again.");
      }
      setIsLoggedIn(false);
      setUserData(null);
    }
  };

  useEffect(() => {
    getAuthState();
  }, []);

  const value = {
    backendUrl,
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
    getUserData,
  };

  return (
    <AppContent.Provider value={value}>
      {props.children}
    </AppContent.Provider>
  );
};

// Import React functions to create context and use state
// Create a context to hold shared values like user info and backend URL
// Create a provider component to wrap around your entire React app
// Get your backend API URL from the .env file
// Create a state to check if the user is logged in or not
// Create a state to store the logged-in user's data
// Group all the states and values to share them using context
// Return the provider component and pass the values to all child components
// Show all other components inside this provider so they can access the shared values

// First, we bring in the tools we need from React: to make context and use state

// We are creating a container (called context) to hold and share data between components

// This is the main provider component — we’ll use it to wrap our whole app

// We are getting the backend link (like http://localhost:5000) from the .env file

// This line is to check whether the user is logged in (true or false)

// This is to store user’s information (like name, email) after login

// We are putting all the data we want to share in one object

// This part gives access to the shared data to all parts of the app

// We also show all the child components inside this provider so they can use the data
