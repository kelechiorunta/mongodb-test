import React, { memo, useMemo } from 'react';

const VideoPlayer = ({ etag }) => {
    localStorage.setItem('cachedUrl', `${process.env.REACT_APP_BASE_URL}/stream/videos`)
  const videoUrl = useMemo(() => {
    return localStorage.getItem('cachedUrl');//`${process.env.REACT_APP_BASE_URL}/stream/videos`;
  }, [localStorage.getItem('cachedUrl')]); // URL changes only when `etag` changes

  return (
    <video className='rounded-md shadow-md z-20' controls width="640">
      <source src={videoUrl} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoPlayer;
