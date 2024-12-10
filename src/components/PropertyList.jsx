import React, { memo, useState, useMemo } from 'react';

const PropertyList = ({n}) => {
    const [isLoadingPic, setIsLoading] = useState(true);
  
    const user = JSON.parse(localStorage.getItem('userData'))
    console.log(user)
    // Placeholder image (use a local or remote placeholder URL)
    let placeholder = `${process.env.REACT_APP_BASE_URL}/sip/propertyPlaceholder/${user.username}/${n}`//`./images/${user.email}-small.png`//'./placeholder.png'//`${process.env.REACT_APP_BASE_URL}/stream/picture`; // Replace this with a valid image path
  
    // Memoize the picture URL to avoid unnecessary re-renders
    let pictureUrl = useMemo(() => {
      return `${process.env.REACT_APP_BASE_URL}/sip/propertyPicture/${user.username}/${n}`;
    }, [`${process.env.REACT_APP_BASE_URL}/sip/propertyPicture/${user.username}/${n}`]); // Empty dependency array since it doesn't depend on props or state
  
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
                    key={n} // Unique key for each element
                    className="rounded-md w-full h-full blur-md animate-pulse"
                    src={placeholder}//{`${process.env.REACT_APP_BASE_URL}/sip/propertyPlaceholder/${user.username}/${n}`} // Add index to the src if needed
                    alt={`Loading placeholder ${n}`}
                    width={560}
                    height="auto"
                />
    
        )}
  
        {/* Actual image from the backend */}
        
            <img
            className={`rounded-md w-full h-full transition-opacity duration-500 ${
                isLoadingPic ? 'opacity-0' : 'opacity-100'
            }`} // Smooth fade-in effect
            src={pictureUrl}//{`${process.env.REACT_APP_BASE_URL}/sip/propertyPicture/${user.username}/${n}`} // Backend image URL
            alt="User profile"
            width={560}
            height={'auto'}
            onLoad={handleImageLoad} // Triggered when the image loads
            />
      
        
      </div>
    );
  };
  
  export default memo(PropertyList);