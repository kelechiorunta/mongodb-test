// import axios from "axios";
// import React, { useEffect, useState, memo } from "react";
// import PictureUpload from "./PictureUpload.jsx";

// const UserProfile = () => {
//   const [imageUrl, setImageUrl] = useState("");
//   const [loading, setLoading] = useState(null);

// //   useEffect(() => {
// //     const fetchImageUrl = async () => {
// //         setLoading(true)
// //       try {
// //         const response = await axios(`${process.env.REACT_APP_BASE_URL}/stream/picture`, {withCredentials: true});
// //         const data = response.data;
// //         setImageUrl(data.imageUrl);
// //         console.log("Image retrieved", data.imageUrl)
// //       } catch (error) {
// //         console.error("Error fetching image URL:", error);
// //       }
// //       finally{
// //         setLoading(false)
// //       }
// //     };

// //     fetchImageUrl();
// //   }, [imageUrl]);

//   return (
//     <div className=''>
//       {/* {!loading ? ( */}
//         <PictureUpload />
//        {/* ) : (  */}
//         {/* <p>Loading image...</p> */}
//        {/* )}   */}
//     </div>
//   );
// };

// export default memo(UserProfile);

import axios from "axios";
import React, { useEffect, useState, memo } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css"; // Import skeleton styles
import PictureUpload from "./PictureUpload.jsx";

const UserProfile = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true); // Loading state starts as true

  useEffect(() => {
    const fetchImageUrl = async () => {
      setLoading(true); // Set loading to true before fetching
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/stream/picture`,
          { withCredentials: true }
        );
        const data = response.data;
        setImageUrl(data.imageUrl);
        console.log("Image retrieved", data.imageUrl);
      } catch (error) {
        console.error("Error fetching image URL:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchImageUrl();
  }, []); // Empty dependency array to fetch data only once on mount

  return (
    <div className="user-profile">
      {loading ? (
        // Skeleton loader while loading
        <div className="skeleton-container absolute w-full top-[5%] left-[0%] z-20">
          <Skeleton
            className='animate-pulse m-auto'
            height={600} // Skeleton height
            width={2000} // Skeleton width
            // circle={true} // Make it circular for profile pictures
          />
          <p>Loading image...</p>
        </div>
      ) : (
        // Show image once loaded
        <div className="image-container">
          {/* <img
            src={imageUrl}
            alt="User Profile"
            className="rounded-md shadow-md"
            style={{ width: 300, height: 300 }}
          /> */}
          <PictureUpload />
        </div>
      )}
    </div>
  );
};

export default memo(UserProfile);

