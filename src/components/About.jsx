import React, { useState, useEffect } from 'react'
import { FaSpinner } from 'react-icons/fa';
import axios from 'axios';

export default function About() {
    const [loadingFile, setLoadingFile] = useState(null);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
      });
      const [file, setFile] = useState(null);
    
      const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
      };
    
      const handleFileChange = (e) => {
        setFile(e.target.files[0]);
      };

      const handleFileSubmit = async (e) => {
        e.preventDefault();
    
        setLoadingFile(true)
    
            if (!file) {
                return setMessage('Please select a video file to upload.');
              }
          
              const form = new FormData();
              form.append('username', formData.username);
              form.append('email', formData.email);
              form.append('file', file);
          
              try {
                const data = {username: formData.username, email: formData.email}
                console.log(file)
                const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/file`, form, {
                  withCredentials: true,
                  headers: {
                    'Content-Type': 'multipart/form-data',
                  },
                });
                setMessage(res.data.message || 'Picture uploaded successfully!');
              } catch (err) {
                setMessage('Error uploading video. Please try again.');
                console.error(err);
              }
              finally{
                setLoadingFile(false)
              }
        
      };
  return (
    <div>
        <img className='rounded-md absolute -z-10 top-[0%] left-[0%] w-full max-h-[100%]'
        src={`${process.env.REACT_APP_BASE_URL}/stream/getFile`} alt="" width={60} height={30} />
        <h1>About</h1>
        <div className="p-6 max-w-md mx-auto bg-white rounded shadow-md mt-20">
        <h2 className="text-2xl font-bold mb-4">Upload File</h2>
        {message && <p className="mb-4 text-green-600">{message}</p>}
        <form onSubmit={handleFileSubmit}>
            {/* <div className="mb-4">
            <label className="block mb-2 font-medium">Username</label>
            <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                // required
            />
            </div>
            <div className="mb-4">
            <label className="block mb-2 font-medium">Email</label>
            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                // required
            />
            </div> */}
            <div className="mb-4">
            <label className="block mb-2 font-medium">Extra File</label>
            <input
                type="file"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border rounded"
                // accept="video/*"
                required
            />
            </div>
            <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700"
            >
            {loadingFile? <FaSpinner className='m-auto animate-spin' /> : 'Upload' }
            </button>
        </form>
        </div>
    </div>
  )
}
