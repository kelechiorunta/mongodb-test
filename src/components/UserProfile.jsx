import axios from "axios";
import React, { useEffect, useState } from "react";

const UserProfile = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    const fetchImageUrl = async () => {
        setLoading(true)
      try {
        const response = await axios(`${process.env.REACT_APP_BASE_URL}/stream/picture`, {withCredentials: true});
        const data = response.data;
        setImageUrl(data.imageUrl);
        console.log("Image retrieved", data.imageUrl)
      } catch (error) {
        console.error("Error fetching image URL:", error);
      }
      finally{
        setLoading(false)
      }
    };

    fetchImageUrl();
  }, [imageUrl]);

  return (
    <div className=''>
      {!loading ? (
        <img className='rounded-md absolute top-[0%] left-[0%] w-full max-h-[100%] z-0'
        src={`${process.env.REACT_APP_BASE_URL}/stream/picture`} alt="" width={60} height={30} />
       ) : ( 
        <p>Loading image...</p>
       )}  
    </div>
  );
};

export default UserProfile;
