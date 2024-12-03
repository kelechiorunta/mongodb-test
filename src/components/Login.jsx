import React, { useState } from 'react';
import { User, Email, Lock, LogIn } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    console.log(formData);
    try{
        const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/auth/login`,
             {email: formData.email, password: formData.password}, { withCredentials: true });
             console.log(res?.data?.message);
             console.log(res?.data?.user);
             localStorage.setItem('userData', JSON.stringify(res?.data?.user))
             navigate('/', {state: JSON.parse(localStorage.getItem('userData'))}, { replace: true });
             window.location.href = '/'
            //  window.history.pushState({ noBack: true }, '', '/');
            // window.history.go(-(window.history.length - 1));
    }
    catch(err){
        console.error(err?.message);
        localStorage.clear();
    }
    // Add login logic here
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md space-y-6"
      >
        <h2 className="text-xl font-bold text-gray-700 text-center">Login</h2>

        {/* Username Field */}
        <div className="flex items-center border-b border-gray-300 py-2">
          <User className="text-gray-500 w-5 h-5 mr-3" />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="appearance-none bg-transparent border-none w-full text-gray-700 placeholder-gray-400 focus:outline-none"
            required
            autoComplete='true'
          />
        </div>

        {/* Password Field */}
        <div className="flex items-center border-b border-gray-300 py-2">
          <Lock className="text-gray-500 w-5 h-5 mr-3" />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            className="appearance-none bg-transparent border-none w-full text-gray-700 placeholder-gray-400 focus:outline-none"
            required
            autoComplete='true'
          />
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex justify-between items-center">
          <label className="inline-flex items-center text-sm text-gray-600">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              className="form-checkbox text-blue-500 focus:ring-blue-400 focus:outline-none h-4 w-4 mr-2"
            />
            Remember Me
          </label>
          <a
            href="/forgot-password"
            className="text-sm text-blue-500 hover:underline"
          >
            Forgot Password?
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="flex items-center justify-center w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-300"
        >
          <LogIn className="w-5 h-5 mr-2" />
          Login
        </button>
      </form>
    </div>
  );
}