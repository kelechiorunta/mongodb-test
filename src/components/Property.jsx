import React, { useState } from 'react';
import { Camera, UploadCloud, Trash2 } from 'lucide-react';
import axios from 'axios';
import PropertyList from './PropertyList';
import { Link } from 'react-router-dom';
// import ProfilePic from './ProfilePic.jsx';

const Property = () => {
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
  
      const myproperty = new FormData();
      myproperty.append("property", file);
  
      try {
        const user = JSON.parse(localStorage.getItem('userData'));
        const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/sip/createProperty/${user.username}`, myproperty, {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("Success")
        setMessage(response.data.message);
      } catch (error) {
        console.error("Error uploading the file:", error);
        setMessage(error.response.data.error || "Failed to upload the image. Please try again.");
      }
    }
  };

  const handleDelete = async(id) => {
    try {
        const user = JSON.parse(localStorage.getItem('userData'));
        const response = await axios.delete(`${process.env.REACT_APP_BASE_URL}/sip/deleteProperty/${user.username}/${id}`, {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("Delete successful")
        setMessage(response.data.message);
      } catch (error) {
        console.error("Error deleting the file:", error);
        setMessage(error.response.data.error || "Failed to upload the image. Please try again.");
      }
  }

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100">
      <div className="bg-white shadow-md py-4 rounded-lg overflow-hidden min-w-sm max-w-full w-full">
        <h1 className='m-auto text-3xl mb-2 uppercase'>Projects</h1>
        <h1>{message}</h1>
        <div className="relative flex justify-evenly w-full">
        {Array.from({ length: 3 }, (_, n) => (
            <div className='flex flex-col gap-2'>
            <div key={n} n={n} 
            className='relative w-[200px] h-[200px] gap-4 flex mt-4 mx-auto shadow-md overflow-hidden rounded-md'>
                <Link to={`/project/${user.username}/${n}`}><PropertyList key={n} n={n}/></Link>                
            </div>
            <button
            onClick={()=>handleDelete(n)} 
            className='w-full flex items-center justify-center
             bg-blue-500 text-white py-2 px-4 rounded
             hover:bg-blue-600'>
                <Trash2 className="w-5 h-5 mr-2" />
                Remove
            </button>
            </div>
            ))}
            
          <label
            htmlFor="upload-property"
            className="absolute bottom-4 right-4 bg-gray-900 text-white p-2 rounded-full cursor-pointer hover:bg-gray-700"
          >
            <Camera className="w-6 h-6" />
            <input
              type="file"
              id="upload-property"
              className="hidden"
            //   accept="image/*"
              onChange={handleImageUpload}
            />
          </label>
        </div>
        <div className="p-4">
          {/* <h2 className="text-xl font-bold text-gray-800">{user.username}</h2>
          <p className="text-gray-600 mt-1">{user.address}</p>
          <p className="text-gray-600 mt-1">Gender: {user.gender}</p>
          <p className="text-gray-600 mt-1">Email: {user.email}</p>
          <p className="text-gray-600 mt-3">{user.content}</p> */}
        </div>
        <div className="p-4 bg-gray-50">
          <button className="w-auto m-auto flex items-center justify-center bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            <UploadCloud className="w-5 h-5 mr-2" />
            Upload Picture
          </button>
        </div>
      </div>
    </div>
  );
};

export default Property;