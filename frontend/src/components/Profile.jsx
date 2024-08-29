import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import AxiosInstance from "../utils/AxiosInstance";

const Profile = () => {
  const jwt = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const refresh = JSON.parse(localStorage.getItem('refresh_token'));
  const navigate = useNavigate();

  useEffect(() => {
    if (!jwt || !user) {
      navigate('/login');
    } else {
      getSomeData();
    }
  }, []); // Empty dependency array to run on mount

  const getSomeData = async () => {
    try {
      const res = await AxiosInstance.get('auth/get-something/', {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      console.log(res.data);
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 403) {
        // Handle forbidden access
        toast.error("Access denied. You do not have permission to view this content.");
        navigate('/login');
      } else {
        toast.error("An error occurred while fetching data.");
      }
    }
  };

  const handleLogout = async () => {
    try {
      const res = await AxiosInstance.post('auth/logout/', { 'refresh_token': refresh });
      if (res.status === 204) {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        navigate('/login');
        toast.warn("Logout successful");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("An error occurred during logout.");
    }
  };

  return (
    <div className='container'>
      <h2>Hi {user && user.full_name}</h2>
      <p style={{ textAlign: 'center' }}>Welcome to your profile</p>
      <button onClick={handleLogout} className='logout-btn'>Logout</button>
    </div>
  );
};

export default Profile;
