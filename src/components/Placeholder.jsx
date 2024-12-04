import React, { useState } from "react";
import axios from "axios";

const Placeholder = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    // if (selectedFile) {
      setFile(selectedFile);

    //   // Set a local preview of the image
    //   const reader = new FileReader();
    //   reader.onload = () => setPreviewUrl(reader.result);
    //   reader.readAsDataURL(selectedFile);
    // }
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("picture", file);

    try {
      const user = JSON.parse(localStorage.getItem('userData'));
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/sip/createPlaceholder/${user.email}`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(response.data.message);
    } catch (error) {
      console.error("Error uploading the file:", error);
      setMessage("Failed to upload the image. Please try again.");
    }
  };

  return (
    <div className="container mt-20 shadow-md rounded-md">
      <h1>Upload Picture</h1>

      {/* Display image preview */}
      {previewUrl && (
        <div className="preview">
          <img
            src={previewUrl}
            alt="Preview"
            className="rounded-md border border-gray-300 mb-3"
            style={{ maxWidth: "300px", maxHeight: "200px" }}
          />
        </div>
      )}

      {/* Upload form */}
      <form onSubmit={handleSubmit} className="upload-form">
        <input
          type="file"
        //   accept="image/*"
          onChange={handleFileChange}
          className="block mb-3"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create Placeholder Image
        </button>
      </form>

      {/* Message */}
      {message && <p className="mt-3 text-green-600">{message}</p>}
    </div>
  );
};

export default Placeholder;
