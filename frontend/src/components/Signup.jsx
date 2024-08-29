import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [formdata, setFormdata] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');

  const handleOnchange = (e) => {
    setFormdata({ ...formdata, [e.target.name]: e.target.value });
  };

  const handleSigninWithGoogle = async (response) => {
    const payload = response.credential;
    const server_res = await axios.post('http://localhost:8000/api/social/auth/google/', { access_token: payload });
    console.log(server_res.data);
  };

  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleSigninWithGoogle,
        });
        google.accounts.id.renderButton(document.getElementById('signInDiv'), {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'circle',
          width: '280',
        });
      };
      document.body.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  const { email, username, first_name, last_name, password, confirm_password } = formdata;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await axios.post('http://localhost:8000/api/auth/register/', formdata);
    console.log(response.data);
    const result = response.data;
    if (response.status === 201) {
      navigate('/otp/verify');
      toast.success(result.message);
    }
  };

  return (
    <div>
      <div className='form-container'>
        <div style={{ width: '100%' }} className='wrapper'>
          <h2>Create Account</h2>
          <form onSubmit={handleSubmit}>
            <div className='form-group'>
              <label>Email Address:</label>
              <input type='text' className='email-form' name='email' value={email} onChange={handleOnchange} />
            </div>
            <div className='form-group'>
              <label>Username:</label>
              <input type='text' className='email-form' name='username' value={username} onChange={handleOnchange} />
            </div>
            <div className='form-group'>
              <label>First Name:</label>
              <input type='text' className='email-form' name='first_name' value={first_name} onChange={handleOnchange} />
            </div>
            <div className='form-group'>
              <label>Last Name:</label>
              <input type='text' className='email-form' name='last_name' value={last_name} onChange={handleOnchange} />
            </div>
            <div className='form-group'>
              <label>Password:</label>
              <input type='text' className='email-form' name='password' value={password} onChange={handleOnchange} />
            </div>
            <div className='form-group'>
              <label>Confirm Password:</label>
              <input type='text' className='email-form' name='confirm_password' value={confirm_password} onChange={handleOnchange} />
            </div>
            <input type='submit' value='Submit' className='submitButton' />
          </form>
          <h3 className='text-option'>Or</h3>
          <div className='githubContainer'>
            <button>Sign up with Github</button>
          </div>
          <div className='googleContainer'>
            <div id='signInDiv' className='gsignIn'></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
