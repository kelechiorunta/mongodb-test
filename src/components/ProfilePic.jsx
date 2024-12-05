import React, { memo, useState, useMemo } from 'react';

const ProfilePic = () => {
    const [isLoadingPic, setIsLoading] = useState(true);
  
    const user = JSON.parse(localStorage.getItem('userData'))
    // Placeholder image (use a local or remote placeholder URL)
    let placeholder = `${process.env.REACT_APP_BASE_URL}/sip/profilePlaceholderPic/${user.username}`//`./images/${user.email}-small.png`//'./placeholder.png'//`${process.env.REACT_APP_BASE_URL}/stream/picture`; // Replace this with a valid image path
  
    // Memoize the picture URL to avoid unnecessary re-renders
    let pictureUrl = useMemo(() => {
      return `${process.env.REACT_APP_BASE_URL}/sip/profilePic/${user.username}`;
    }, [`${process.env.REACT_APP_BASE_URL}/sip/profilePic/${user.username}`]); // Empty dependency array since it doesn't depend on props or state
  
    // Handle the image load event
    const handleImageLoad = () => {
      setIsLoading(false); // Remove placeholder once the main image has loaded
    };
  
    return (
      <div className="absolute top-0 left-0 w-full h-full ">
        {console.log("PICTURE", pictureUrl)}
        {/* Display the placeholder image until the actual image is loaded */}
        {isLoadingPic && (
          <img
            className="rounded-md w-full h-full blur-md animate-pulse"
            src={placeholder} // Path to the placeholder image
            alt="Loading placeholder"
            width={160} // Adjust dimensions as needed
            height={'auto'}
          />
        )}
  
        {/* Actual image from the backend */}
        <img
          className={`rounded-md w-full h-full transition-opacity duration-500 ${
            isLoadingPic ? 'opacity-0' : 'opacity-100'
          }`} // Smooth fade-in effect
          src={pictureUrl} // Backend image URL
          alt="User profile"
          width={160}
          height={'auto'}
          onLoad={handleImageLoad} // Triggered when the image loads
        />
      </div>
    );
  };
  
  export default memo(ProfilePic);