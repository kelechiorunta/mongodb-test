import axios from "axios";
import React, { useEffect, useState, memo } from "react";
import PictureUpload from "./PictureUpload.jsx";

const UserProfile = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(null);

//   useEffect(() => {
//     const fetchImageUrl = async () => {
//         setLoading(true)
//       try {
//         const response = await axios(`${process.env.REACT_APP_BASE_URL}/stream/picture`, {withCredentials: true});
//         const data = response.data;
//         setImageUrl(data.imageUrl);
//         console.log("Image retrieved", data.imageUrl)
//       } catch (error) {
//         console.error("Error fetching image URL:", error);
//       }
//       finally{
//         setLoading(false)
//       }
//     };

//     fetchImageUrl();
//   }, [imageUrl]);

  return (
    <div className=''>
      {/* {!loading ? ( */}
        <PictureUpload />
       {/* ) : (  */}
        {/* <p>Loading image...</p> */}
       {/* )}   */}
    </div>
  );
};

export default memo(UserProfile);
