import React, { memo, useMemo } from 'react';

const VideoPlayer = ({ user}) => {
    localStorage.setItem('cachedUrl', `${process.env.REACT_APP_BASE_URL}/stream/videos/${user?.email}`)
    const videoUrl = useMemo(() => {
        return `${process.env.REACT_APP_BASE_URL}/stream/videos/${user?.email}`;
      }, [user?.email]);
  return (
    <video className='rounded-md shadow-md z-20' controls width="640" preload="metadata">
      <source src={videoUrl} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoPlayer;
