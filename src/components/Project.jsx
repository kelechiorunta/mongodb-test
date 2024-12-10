import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import PropertyList from './PropertyList';
import axios from 'axios';

export default function Project() {
  const { name, n } = useParams(); // Destructure `useParams` for route parameters

  const [content, setContent] = useState(''); // State to hold the textarea content
  const [message, setMessage] = useState(''); // State to display success/error messages

  // Handler for textarea content change
  const handleTextChange = (event) => {
    setContent(event.target.value);
  };

  // Handler for form submission
  const handlePost = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      const user = JSON.parse(localStorage.getItem('userData')); // Retrieve user data from localStorage
      if (!user || !user.username) {
        setMessage('User data not found. Please log in.');
        return;
      }

      // Send the post request to the server
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/sip/createPost/${user.username}`,
        { content }, // Send `content` as part of the request body
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json', // Use JSON content type
          },
        }
      );

      setMessage(response.data.message || 'Post submitted successfully!');
      setContent(''); // Clear the textarea
    } catch (error) {
      console.error('Error uploading the post:', error);
      setMessage(error?.response?.data?.error || 'Failed to submit the post. Please try again.');
    }
  };

  return (
    <div className="max-w-full container py-8 m-auto">
      <h2 className="text-5xl mt-8">{`Project ${n}`}</h2>
      <h1 className="text-2xl mt-8 uppercase">{`${name || 'Unnamed User'} ${n || ''}`}</h1>

      <div className="relative w-[400px] h-[400px] gap-4 flex mt-4 mx-auto shadow-md shadow-black rounded-md">
        <PropertyList key={n} n={n} />
      </div>
      <p className="p-4 m-auto mt-4">{`This is Mr. ${name || 'Unnamed User'}'s photo of id ${n || 'unknown'}.`}</p>

      <form className="flex flex-col w-1/2 m-auto gap-2" id="textForm" onSubmit={handlePost}>
        {message && <h1 className="text-red-500">{message}</h1>}
        <label htmlFor="post">Enter Post:</label>
        <textarea
          className="w-full shadow-2xl border p-4"
          id="post"
          name="post"
          rows="4"
          cols="50"
          placeholder="Type your message here..."
          value={content}
          onChange={handleTextChange}
        ></textarea>
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
          Submit
        </button>
      </form>
    </div>
  );
}

