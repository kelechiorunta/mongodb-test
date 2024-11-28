import React, { useState } from 'react';
import axios from 'axios';

const UploadForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      return setMessage('Please select a video file to upload.');
    }

    const form = new FormData();
    form.append('username', formData.username);
    form.append('email', formData.email);
    form.append('video', file);

    try {
        const data = {username: formData.username, email: formData.email}
        console.log(file)
      const res = await axios.post('http://localhost:3500/stream/upload', form, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        //   'Content-Type': 'application/json',
        },
      });
      setMessage(res.data.message || 'Video uploaded successfully!');
    } catch (err) {
      setMessage('Error uploading video. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">Upload Video</h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
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
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Video File</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border rounded"
            accept="video/*"
            required
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700"
        >
          Upload
        </button>
      </form>
    </div>
  );
};

export default UploadForm;
