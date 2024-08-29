import axios from "axios";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";

// Retrieve tokens from local storage
let accessToken = localStorage.getItem('token') ? JSON.parse(localStorage.getItem('token')) : "";
let refreshToken = localStorage.getItem('refresh_token') ? JSON.parse(localStorage.getItem('refresh_token')) : "";

console.log('Access Token:', accessToken);

// Base URL for API requests
const baseURL = 'http://localhost:8000/api/';

// Create an Axios instance
const AxiosInstance = axios.create({
   baseURL: baseURL,
   headers: {
      'Content-Type': 'application/json',
      Authorization: accessToken ? `Bearer ${accessToken}` : ""
   },
});

// Axios request interceptor
AxiosInstance.interceptors.request.use(async req => {
   if (accessToken) {
      req.headers.Authorization = `Bearer ${accessToken}`;

      // Decode the token to check for expiration
      const user = jwtDecode(accessToken);
      const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

      if (!isExpired) return req;

      // Token has expired, refresh it
      try {
         const response = await axios.post(`${baseURL}auth/token/refresh/`, {
            refresh: refreshToken,
         });

         console.log('New Access Token:', response.data.access);

         // Update accessToken and localStorage
         accessToken = response.data.access;
         localStorage.setItem('token', JSON.stringify(accessToken));

         // Update request headers with the new access token
         req.headers.Authorization = `Bearer ${accessToken}`;
      } catch (error) {
         console.error('Error refreshing token:', error);
         // Handle token refresh failure (optional)
      }
   } else {
      req.headers.Authorization = accessToken ? `Bearer ${accessToken}` : "";
   }

   return req;
});

export default AxiosInstance;
