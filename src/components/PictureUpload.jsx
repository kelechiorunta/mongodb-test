import React, { memo, useMemo } from 'react';

const PictureUpload = ({ etag }) => {
    localStorage.setItem('pictureUrl', `${process.env.REACT_APP_BASE_URL}/stream/picture`)
  const pictureUrl = useMemo(() => {
    return localStorage.getItem('pictureUrl');//`${process.env.REACT_APP_BASE_URL}/stream/videos`;
  }, [localStorage.getItem('pictureUrl')]); // URL changes only when `etag` changes

  return (
    <img className='rounded-md absolute top-[0%] left-[0%] w-full max-h-[100%] z-0'
        src={pictureUrl || './public/logo512.png'} alt="" width={60} height={30} />
  );
};

export default memo(PictureUpload);