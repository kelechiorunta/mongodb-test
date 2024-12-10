import React, { useState } from 'react';
import { Camera, UploadCloud } from 'lucide-react';
import axios from 'axios';
import ProfilePic from './ProfilePic.jsx';

const Profile = () => {
  const activeUser = JSON.parse(localStorage.getItem('userData'));
  const [message, setMessage] = useState('');
  const [user, setUser] = useState({
    username: activeUser.username || 'John Doe',
    address: activeUser.address || '123 Main Street, Springfield',
    gender: activeUser.gender || 'Male',
    email: activeUser.email || 'johndoe@example.com',
    content: activeUser.content || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    image: 'https://via.placeholder.com/150',
  });

  const handleImageUpload = async(event) => {
    const file = event.target.files[0];
    if (file) {
    //   const reader = new FileReader();
    //   reader.onload = (e) => {
        setUser((prevUser) => ({
          ...prevUser,
          image: file,//e.target.result,
        }));
    //   };
    //   reader.readAsDataURL(file);
    if (!file) {
        setMessage("Please select a file to upload.");
        return;
      }
  
      const formData = new FormData();
      formData.append("picture", file);
  
      try {
        const user = JSON.parse(localStorage.getItem('userData'));
        const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/sip/profile/${user.email}`, formData, {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("Success")
        setMessage(response.data.message);
      } catch (error) {
        console.error("Error uploading the file:", error);
        setMessage("Failed to upload the image. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100">
      <div className="bg-white shadow-md rounded-lg overflow-hidden max-w-sm w-full">
        <h1>{message}</h1>
        <div className="relative">
            <div className='relative mt-4 mx-auto shadow-md overflow-hidden rounded-full w-[100px] h-[100px]'>
                <ProfilePic />
            </div>
          {/* <img
            src={ `${process.env.REACT_APP_BASE_URL}/sip/getProfilePic/${user.email}`|| user.image}
            alt="User Profile"
            className="w-full h-48 object-cover"
          /> */}
          <label
            htmlFor="upload-image"
            className="absolute bottom-4 right-4 bg-gray-900 text-white p-2 rounded-full cursor-pointer hover:bg-gray-700"
          >
            <Camera className="w-6 h-6" />
            <input
              type="file"
              id="upload-image"
              className="hidden"
            //   accept="image/*"
              onChange={handleImageUpload}
            />
          </label>
        </div>
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800">{user.username}</h2>
          <p className="text-gray-600 mt-1">{user.address}</p>
          <p className="text-gray-600 mt-1">Gender: {user.gender}</p>
          <p className="text-gray-600 mt-1">Email: {user.email}</p>
          <p className="text-gray-600 mt-3">{user.content}</p>
        </div>
        <div className="p-4 bg-gray-50">
          <button className="w-full flex items-center justify-center bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            <UploadCloud className="w-5 h-5 mr-2" />
            Upload Picture
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
