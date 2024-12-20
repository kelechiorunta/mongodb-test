import './App.css';
import ProtectedRoute from './components/ProtectedRotue.jsx';
import { Route, Routes } from 'react-router-dom';
import UploadForm from './components/UploadForm.jsx';
import ViewForm from './components/ViewForm.jsx';
import Login from './components/Login.jsx';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';
import Project from './components/Project.jsx';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route element={<ProtectedRoute />} >
          <Route path='/' element={<ViewForm/>} />
          <Route path='/about' element={<About />} />
          <Route path="/upload" element={<UploadForm/>} /> 
          <Route path="/contact" element={<Contact/>} /> 
          <Route path="/project/:name/:n" element={<Project/>} /> 
        </Route>
      </Routes> 
    </div>
  );
}

export default App;
