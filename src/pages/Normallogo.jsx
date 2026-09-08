import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const ManageLogo = ({ token }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [currentLogo, setCurrentLogo] = useState("");
  const [storeName, setStoreName] = useState("FOREVER");
  const [selectedFile, setSelectedFile] = useState(null);

  const adminToken = token || localStorage.getItem("token") || "";

  // 1. Fetch current logo & settings
  const fetchSettings = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/settings/get");
      if (response.data.success && response.data.settings) {
        setCurrentLogo(response.data.settings.logo || "");
        if (response.data.settings.storeName) {
          setStoreName(response.data.settings.storeName);
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // 2. Upload / Edit Logo
  const handleUploadLogo = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please choose an image file first");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("storeName", storeName);

      const response = await axios.post(
        backendUrl + "/api/settings/logo",
        formData,
        {
          headers: { token: adminToken },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Logo updated successfully!");
        setCurrentLogo(response.data.logo || "");
        setSelectedFile(null);
      } else {
        toast.error(response.data.message || "Failed to update logo");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Delete / Reset Logo to Default
  const handleDeleteLogo = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your custom logo and restore the default logo?"
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        backendUrl + "/api/settings/delete-logo",
        {},
        {
          headers: { token: adminToken },
        }
      );

      if (response.data.success) {
        toast.success("Custom logo deleted! Default logo restored.");
        setCurrentLogo("");
        setSelectedFile(null);
      } else {
        toast.error(response.data.message || "Failed to delete logo");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-10 h-10 border-black rounded-full border-3 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-4xl gap-8 pb-16">
      {/* Page Title */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">
          🎨 Website Logo & Branding
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          Upload, edit, or remove the brand logo displayed on your website navbar, footer, and admin dashboard.
        </p>
      </div>

      {/* 1. Live Preview Section */}
      <div className="p-6 bg-white border border-gray-200 shadow-sm sm:p-8 rounded-2xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b">
          <h4 className="text-sm font-bold text-gray-900">
            Current Website Logo
          </h4>
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full ${
              currentLogo
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {currentLogo ? "✅ Custom Logo Active" : "⚙️ Default Template Logo"}
          </span>
        </div>

        {/* Dual Light & Dark preview */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Light Background Preview */}
          <div className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl bg-gray-50 min-h-[140px]">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Light Background (Navbar Preview)
            </span>
            <img
              className="object-contain max-h-16 max-w-[220px]"
              src={
                selectedFile
                  ? URL.createObjectURL(selectedFile)
                  : currentLogo || assets.logo
              }
              alt="Logo Light Preview"
            />
          </div>

          {/* Dark Background Preview */}
          <div className="flex flex-col items-center justify-center p-6 bg-gray-900 border border-gray-800 rounded-xl min-h-[140px]">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Dark Background (Footer Preview)
            </span>
            <img
              className="object-contain max-h-16 max-w-[220px]"
              src={
                selectedFile
                  ? URL.createObjectURL(selectedFile)
                  : currentLogo || assets.logo
              }
              alt="Logo Dark Preview"
            />
          </div>
        </div>

        {/* Delete Logo button */}
        {currentLogo && (
          <div className="flex justify-end pt-4 mt-4 border-t">
            <button
              type="button"
              onClick={handleDeleteLogo}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-red-600 transition-all border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 active:scale-95"
            >
              🗑️ Delete Custom Logo & Restore Default
            </button>
          </div>
        )}
      </div>

      {/* 2. Upload / Replace Logo Form */}
      <form
        onSubmit={handleUploadLogo}
        className="flex flex-col gap-6 p-6 bg-white border border-gray-200 shadow-sm sm:p-8 rounded-2xl"
      >
        <h4 className="text-sm font-bold text-gray-900">
          📤 Upload / Change Logo
        </h4>

        {/* File Picker */}
        <div>
          <label className="block mb-2 text-xs font-semibold text-gray-700">
            Select Logo File (PNG, SVG, JPG, WEBP — transparent PNG recommended)
          </label>
          <label htmlFor="logoUpload" className="inline-block cursor-pointer">
            <div className="flex items-center justify-center overflow-hidden transition-all border-2 border-gray-300 border-dashed w-72 h-36 rounded-xl bg-gray-50 hover:border-black">
              {selectedFile ? (
                <img
                  className="object-contain w-full h-full p-4"
                  src={URL.createObjectURL(selectedFile)}
                  alt="New Logo Preview"
                />
              ) : (
                <div className="p-4 text-center">
                  <img
                    className="w-10 h-10 mx-auto mb-1 opacity-50"
                    src={assets.upload_area}
                    alt="Upload"
                  />
                  <span className="text-xs font-medium text-gray-500">
                    Click to Choose New Logo
                  </span>
                </div>
              )}
            </div>
            <input
              onChange={(e) => setSelectedFile(e.target.files[0])}
              type="file"
              id="logoUpload"
              hidden
              accept="image/*"
            />
          </label>
        </div>

        {/* Brand Name Input */}
        <div>
          <label className="block mb-1 text-xs font-semibold text-gray-700">
            Store Brand Name (Alt Text)
          </label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="e.g. TRENDIFY or FOREVER"
            className="w-full max-w-md px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-start pt-2">
          <button
            type="submit"
            disabled={loading || !selectedFile}
            className={`px-8 py-3 text-xs sm:text-sm font-bold text-white rounded-lg transition-all shadow-md ${
              selectedFile && !loading
                ? "bg-black hover:bg-gray-800 active:scale-95 cursor-pointer"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Uploading to Cloudinary..." : "💾 Save & Apply Logo"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManageLogo;