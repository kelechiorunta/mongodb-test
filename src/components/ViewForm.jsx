import React, {useState, useEffect, useMemo} from 'react';
import axios from 'axios';
import UploadForm from './UploadForm.jsx';
import UserProfile from './UserProfile.jsx';
import VideoPlayer from './VideoPlayer.jsx';
import { memo } from 'react';

function ViewForm() {
 
  const [api, setApi] = useState(null);
  const [details, setDetails] = useState('');
  //const apidomain = 'http://localhost:3500'//process.env.NODE_ENV=='production'? 'https://node-test-bice.vercel.app' : 'http://localhost:3500'

//   useEffect(() => {
//     const getData = async() => {
//       try{
//         const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/getApi`, { withCredentials: true });
//         console.log(res.data?.streamedData);
//         setApi(res.data?.streamedData)
//       }
//       catch(err){
//         console.error(err.message)
//       }
//     }
//     getData();
   
//   },[]);


  const handleChange = (e) => {
    setDetails(e.target.value)
  }

  const handleSave = async(e) => {
    e.preventDefault();
    try{
      const data = {details: details}
      const res = await axios.post(`$${process.env.REACT_APP_BASE_URL}/saveApi`, data,
         {withCredentials: true,
          headers:{
            'Content-Type' : 'application/json'
          }
         });
        console.log(res.data?.message)
    }
    catch (err) {
      console.error(err?.data?.error)
    }
  }

//   const VideoPlayer = () => {
    // const videoUrl = useMemo(() => {
    //   return `${process.env.REACT_APP_BASE_URL}/stream/videos`;
    // }, []); // URL remains constant unless dependencies (none here) change
  

  return (
    <>
    <header className="App-header">

    {/* <video className='rounded-md shadow-md z-20' controls width="640">
      <source src={videoUrl} type="video/mp4" />
      Your browser does not support the video tag.
    </video> */}

    <VideoPlayer/>

    <UserProfile/>
    {/* <img src={`${apidomain}/stream/image`} alt='' width={100} height={100} /> */}

    {/* <form onSubmit={handleSave}>
        <input type='text' name="details" value={details} onChange={handleChange} />
        <button type='submit'>Save</button> 
    </form> */}
  </header>

  <UploadForm/>
  </>
  )
}


{/* <img src={logo} className="App-logo" alt="logo" />
    <p>
      Edit <code>src/App.js</code> and save to reload.
    </p>
    <a
      className="App-link"
      href="https://reactjs.org"
      target="_blank"
      rel="noopener noreferrer"
    >
     {api}
    </a> */}

    export default memo(ViewForm)