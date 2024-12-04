import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async() => {
    try{
        const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/auth/logout`, {withCredentials: true});
        console.log(res.data.message);
        localStorage.removeItem('userData');
        localStorage.removeItem('cachedUrl');
        localStorage.removeItem('pictureUrl');
        localStorage.clear();
        window.location.href = '/login'
        navigate('/login')
    }
    catch(err){
        console.error(err?.message);
    }
}

  return (
    <header className="bg-gray-800 text-white container max-w-full fixed z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="text-xl font-bold">StreamLine</div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-8 items-center">
          <Link to="/" className="hover:text-gray-300">Home</Link>
          <Link to="/about" className="hover:text-gray-300">About Us</Link>
          <Link to="/contact" className="hover:text-gray-300">Contact</Link>
            {/* <a href="/" className="hover:text-gray-300">Home</a>
            <a href="/about" className="hover:text-gray-300">About Us</a>
            <a href="/contact" className="hover:text-gray-300">Contact</a> */}
            <button onClick={handleLogout}
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700">
              Logout
            </button>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-700">
          <nav className="flex flex-col space-y-4 p-4">
            <a href="#" className="hover:text-gray-300">Home</a>
            <a href="#" className="hover:text-gray-300">About Us</a>
            <a href="#" className="hover:text-gray-300">Contact</a>
            <button className="bg-red-600 px-4 py-2 rounded hover:bg-red-700">
              Logout
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
