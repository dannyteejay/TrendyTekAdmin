import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const ManageLogo = ({ token }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [currentLogo, setCurrentLogo] = useState("");
  const [storeName, setStoreName] = useState("FOREVER");

  // Cropper & Image States
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [croppedFile, setCroppedFile] = useState(null);
  const [croppedPreview, setCroppedPreview] = useState("");
  const [showCropper, setShowCropper] = useState(false);

  // Zoom, Pan, Rotation & Box Sizing
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Crop Box Presets & Dynamic Width/Height
  const [cropPreset, setCropPreset] = useState("standard"); // 'tight-banner', 'standard', 'fit-logo', 'square', 'custom'
  const [cropBoxWidth, setCropBoxWidth] = useState(100); // in percentage (30% - 150%)
  const [cropBoxRatio, setCropBoxRatio] = useState(3.5); // width / height (1.0 to 6.0)
  const [imageNaturalRatio, setImageNaturalRatio] = useState(3.5);

  const imageRef = useRef(null);
  const cropAreaRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // 2. Handle File Selection
  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const natRatio = img.naturalWidth / img.naturalHeight;
          setImageNaturalRatio(natRatio);

          // Default configuration: Large prominent crop box
          setCropPreset("standard");
          setCropBoxRatio(3.5);
          setCropBoxWidth(100);
          setZoom(1.0);
          setRotation(0);
          setOffset({ x: 0, y: 0 });
          setRawImageSrc(reader.result);
          setShowCropper(true);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. Preset Switcher
  const handlePresetChange = (preset) => {
    setCropPreset(preset);
    if (preset === "tight-banner") {
      setCropBoxRatio(4.5);
      setCropBoxWidth(110);
      setZoom(1.2);
    } else if (preset === "standard") {
      setCropBoxRatio(3.5);
      setCropBoxWidth(100);
      setZoom(1.0);
    } else if (preset === "compact") {
      setCropBoxRatio(2.5);
      setCropBoxWidth(90);
      setZoom(1.0);
    } else if (preset === "square") {
      setCropBoxRatio(1.0);
      setCropBoxWidth(75);
      setZoom(1.0);
    } else if (preset === "fit-logo") {
      setCropBoxRatio(imageNaturalRatio);
      setCropBoxWidth(110);
      setZoom(1.0);
      setOffset({ x: 0, y: 0 });
    }
  };

  // 4. One-Click Auto-Fill (Tight Zoom without whitespace)
  const handleAutoFill = () => {
    setZoom(1.35);
    setCropBoxWidth(120);
    setCropBoxRatio(3.5);
    setOffset({ x: 0, y: 0 });
    toast.info("Box size increased to 120% and zoom set to 135%!");
  };

  // 5. Mouse / Touch Dragging for Panning
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  // 6. Canvas Cropping
  const applyCrop = () => {
    if (!imageRef.current || !cropAreaRef.current) return;

    const img = imageRef.current;
    const cropBox = cropAreaRef.current.getBoundingClientRect();
    const imgBox = img.getBoundingClientRect();

    const canvas = document.createElement("canvas");
    const targetWidth = 800; // High-resolution crisp export
    const targetHeight = Math.max(100, Math.round(targetWidth / cropBoxRatio));

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = img.naturalWidth / imgBox.width;
    const scaleY = img.naturalHeight / imgBox.height;

    const cropXInImg = (cropBox.left - imgBox.left) * scaleX;
    const cropYInImg = (cropBox.top - imgBox.top) * scaleY;
    const cropWInImg = cropBox.width * scaleX;
    const cropHInImg = cropBox.height * scaleY;

    if (rotation !== 0) {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(
        img,
        cropXInImg,
        cropYInImg,
        cropWInImg,
        cropHInImg,
        -targetWidth / 2,
        -targetHeight / 2,
        targetWidth,
        targetHeight
      );
      ctx.restore();
    } else {
      ctx.drawImage(
        img,
        cropXInImg,
        cropYInImg,
        cropWInImg,
        cropHInImg,
        0,
        0,
        targetWidth,
        targetHeight
      );
    }

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("Failed to crop image");
          return;
        }
        const file = new File([blob], "custom_logo.png", {
          type: "image/png",
        });
        setCroppedFile(file);
        setCroppedPreview(URL.createObjectURL(blob));
        setShowCropper(false);
        toast.success("Logo cropped! Click 'Save & Apply Logo' below to save.");
      },
      "image/png",
      1.0
    );
  };

  // 7. Upload Cropped Logo to Cloudinary
  const handleSaveLogo = async (e) => {
    e.preventDefault();
    if (!croppedFile) {
      toast.error("Please choose and crop a logo image first");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", croppedFile);
      formData.append("storeName", storeName);

      const response = await axios.post(
        backendUrl + "/api/settings/logo",
        formData,
        {
          headers: { token: adminToken },
        }
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Website logo updated successfully!"
        );
        setCurrentLogo(response.data.logo || "");
        setCroppedFile(null);
        setCroppedPreview("");
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

  // 8. Delete / Reset Logo to Default
  const handleDeleteLogo = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your custom logo and restore the default template logo?"
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
        toast.success("Custom logo deleted! Default template logo restored.");
        setCurrentLogo("");
        setCroppedFile(null);
        setCroppedPreview("");
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

  const activeDisplayLogo = croppedPreview || currentLogo || assets.logo;

  return (
    <div className="flex flex-col max-w-4xl gap-8 pb-16">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-900">
          🎨 Website Logo & Smart Cropper
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          Crop shape automatically fits your logo. Zoom in and adjust the Box Size up to 150% so your text fills the box edge-to-edge for a big, bold look.
        </p>
      </div>

      {/* 1. Live Dual-Background Preview */}
      <div className="p-6 bg-white border border-gray-200 shadow-sm sm:p-8 rounded-2xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b">
          <h4 className="text-sm font-bold text-gray-900">
            Current Website Logo Preview
          </h4>
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full ${
              croppedPreview
                ? "bg-amber-100 text-amber-800"
                : currentLogo
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {croppedPreview
              ? "✨ Cropped & Ready (Unsaved)"
              : currentLogo
              ? "✅ Custom Logo Active"
              : "⚙️ Default Template Logo"}
          </span>
        </div>

        {/* Dual Light & Dark Box */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Light Background Preview */}
          <div className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl bg-gray-50 min-h-[170px]">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Light Navbar Preview
            </span>
            <img
              className="object-contain max-h-20 max-w-[320px] transition-all"
              src={activeDisplayLogo}
              alt="Logo Light Preview"
            />
          </div>

          {/* Dark Background Preview */}
          <div className="flex flex-col items-center justify-center p-6 bg-gray-900 border border-gray-800 rounded-xl min-h-[170px]">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Dark Footer Preview
            </span>
            <img
              className="object-contain max-h-20 max-w-[320px] transition-all"
              src={activeDisplayLogo}
              alt="Logo Dark Preview"
            />
          </div>
        </div>

        {/* Delete Logo Button */}
        {currentLogo && !croppedPreview && (
          <div className="flex justify-end pt-4 mt-4 border-t">
            <button
              type="button"
              onClick={handleDeleteLogo}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-red-600 transition-all border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 active:scale-95 cursor-pointer"
            >
              🗑️ Delete Custom Logo & Restore Default
            </button>
          </div>
        )}
      </div>

      {/* 2. Upload / Crop Action Form */}
      <form
        onSubmit={handleSaveLogo}
        className="flex flex-col gap-6 p-6 bg-white border border-gray-200 shadow-sm sm:p-8 rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-gray-900">
            📤 Select & Crop Logo Image
          </h4>
          {croppedPreview && (
            <button
              type="button"
              onClick={() => setShowCropper(true)}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              ✂️ Re-adjust Crop / Zoom
            </button>
          )}
        </div>

        {/* File Picker */}
        <div>
          <label className="block mb-2 text-xs font-semibold text-gray-700">
            Choose Logo File (PNG, SVG, JPG, WEBP)
          </label>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-gray-800 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <span>📁</span> Choose Logo File...
            </button>

            <input
              ref={fileInputRef}
              onChange={onSelectFile}
              type="file"
              hidden
              accept="image/*"
            />

            {croppedFile && (
              <span className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 border border-green-200 rounded-lg bg-green-50">
                ✅ Cropped & Ready: <b>{croppedFile.name}</b>
              </span>
            )}
          </div>
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

        {/* Submit Button */}
        <div className="flex justify-start pt-2 border-t">
          <button
            type="submit"
            disabled={loading || !croppedFile}
            className={`px-8 py-3 text-xs sm:text-sm font-bold text-white rounded-lg transition-all shadow-md ${
              croppedFile && !loading
                ? "bg-black hover:bg-gray-800 active:scale-95 cursor-pointer"
                : "bg-gray-400 cursor-not-allowed opacity-60"
            }`}
          >
            {loading ? "Uploading to Cloudinary..." : "💾 Save & Apply Logo"}
          </button>
        </div>
      </form>

      {/* 3. INTERACTIVE ZOOM & CROP MODAL */}
      {showCropper && rawImageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm">
          <div className="flex flex-col w-full max-w-4xl max-h-[96vh] overflow-hidden bg-white border border-gray-200 shadow-2xl rounded-2xl animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b bg-gray-50">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  ✂️ Position & Adjust Your Logo
                </h3>
                <p className="text-xs text-gray-500">
                  Box size now supports up to 150%. Drag the image inside the box or zoom to fill edge-to-edge.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCropper(false)}
                className="p-1.5 text-xl font-bold text-gray-400 hover:text-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Presets Bar */}
            <div className="flex flex-wrap items-center gap-2 px-6 py-2.5 bg-gray-100 border-b text-xs">
              <span className="font-bold text-gray-600 text-[11px] uppercase tracking-wider mr-1">
                Preset:
              </span>
              <button
                type="button"
                onClick={() => handlePresetChange("standard")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  cropPreset === "standard"
                    ? "bg-black text-white shadow-xs"
                    : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-300"
                }`}
              >
                🌟 Standard Navbar (3.5 : 1)
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange("tight-banner")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  cropPreset === "tight-banner"
                    ? "bg-black text-white shadow-xs"
                    : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-300"
                }`}
              >
                🚀 Wide Banner (4.5 : 1)
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange("square")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  cropPreset === "square"
                    ? "bg-black text-white shadow-xs"
                    : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-300"
                }`}
              >
                📦 Square (1 : 1)
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange("fit-logo")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  cropPreset === "fit-logo"
                    ? "bg-black text-white shadow-xs"
                    : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-300"
                }`}
              >
                🎯 Full Card (Auto-Fit)
              </button>
              
              <button
                type="button"
                onClick={handleAutoFill}
                className="ml-auto px-3 py-1.5 rounded-lg font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all cursor-pointer"
              >
                ⚡ 1-Click Zoom Fill (Big Look)
              </button>
            </div>

            {/* Quick Banner Tip */}
            <div className="px-6 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2 text-xs text-blue-900">
              <span className="font-bold">💡 Tip:</span>
              <span>Slide <b>Box Size up to 150%</b> and increase <b>Zoom</b> so your logo fills the box with no empty white borders!</span>
            </div>

            {/* Interactive Drag & Pan Viewport */}
            <div
              className="relative flex items-center justify-center w-full overflow-hidden select-none cursor-move h-[360px] sm:h-[430px] bg-neutral-900"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
            >
              {/* Image */}
              <img
                ref={imageRef}
                src={rawImageSrc}
                alt="Logo Source"
                draggable={false}
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: "center center",
                  transition: isDragging ? "none" : "transform 0.1s ease-out",
                  maxWidth: "none",
                  maxHeight: "none",
                }}
                className="pointer-events-none"
              />

              {/* Crop Box Overlay with Rule-of-Thirds Grid */}
              <div
                ref={cropAreaRef}
                style={{
                  aspectRatio: cropBoxRatio,
                  width: `${cropBoxWidth}%`,
                  maxWidth: "980px",
                }}
                className="absolute border-2 border-dashed border-white rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] pointer-events-none flex items-center justify-center"
              >
                {/* 3x3 alignment lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20 pointer-events-none">
                  <div className="border-r border-b border-white"></div>
                  <div className="border-r border-b border-white"></div>
                  <div className="border-b border-white"></div>
                  <div className="border-r border-b border-white"></div>
                  <div className="border-r border-b border-white"></div>
                  <div className="border-b border-white"></div>
                  <div className="border-r border-white"></div>
                  <div className="border-r border-white"></div>
                  <div></div>
                </div>
              </div>
            </div>

            {/* Fine Tuning Controls: Zoom, Width (Up to 150%), Ratio, Rotate */}
            <div className="flex flex-col gap-3 px-6 py-4 border-t bg-gray-50 overflow-y-auto">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* 1. Zoom Slider */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-700 whitespace-nowrap">
                    🔍 Zoom:
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoom((prev) => Math.max(0.3, prev - 0.1))}
                    className="flex items-center justify-center font-bold bg-white border border-gray-300 rounded w-6 h-6 hover:bg-gray-100 text-xs cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="0.3"
                    max="4.0"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full cursor-pointer accent-black"
                  />
                  <button
                    type="button"
                    onClick={() => setZoom((prev) => Math.min(4.0, prev + 0.1))}
                    className="flex items-center justify-center font-bold bg-white border border-gray-300 rounded w-6 h-6 hover:bg-gray-100 text-xs cursor-pointer"
                  >
                    +
                  </button>
                  <span className="text-[11px] font-semibold text-gray-500 w-10 text-right">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>

                {/* 2. Crop Box Size Slider (Supports up to 150%) */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-700 whitespace-nowrap">
                    📐 Box Size:
                  </span>
                  <button
                    type="button"
                    onClick={() => setCropBoxWidth((prev) => Math.max(30, prev - 5))}
                    className="flex items-center justify-center font-bold bg-white border border-gray-300 rounded w-6 h-6 hover:bg-gray-100 text-xs cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="30"
                    max="150"
                    step="2"
                    value={cropBoxWidth}
                    onChange={(e) => setCropBoxWidth(parseInt(e.target.value))}
                    className="w-full cursor-pointer accent-black"
                  />
                  <button
                    type="button"
                    onClick={() => setCropBoxWidth((prev) => Math.min(150, prev + 5))}
                    className="flex items-center justify-center font-bold bg-white border border-gray-300 rounded w-6 h-6 hover:bg-gray-100 text-xs cursor-pointer"
                  >
                    +
                  </button>
                  <span className="text-[11px] font-semibold text-gray-500 w-10 text-right">
                    {cropBoxWidth}%
                  </span>
                </div>

                {/* 3. Shape Ratio Slider */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-700 whitespace-nowrap">
                    📏 Box Shape:
                  </span>
                  <input
                    type="range"
                    min="1.0"
                    max="5.5"
                    step="0.25"
                    value={cropBoxRatio}
                    onChange={(e) => setCropBoxRatio(parseFloat(e.target.value))}
                    className="w-full cursor-pointer accent-black"
                  />
                  <span className="text-[11px] font-semibold text-gray-500 w-12 text-right">
                    {cropBoxRatio.toFixed(1)} : 1
                  </span>
                </div>
              </div>

              {/* Rotate & Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    className="px-2.5 py-1 text-xs font-semibold bg-white border border-gray-300 rounded hover:bg-gray-100 cursor-pointer"
                  >
                    🔄 Rotate 90°
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setZoom(1.0);
                      setOffset({ x: 0, y: 0 });
                      setRotation(0);
                      setCropBoxWidth(100);
                      setCropBoxRatio(3.5);
                    }}
                    className="px-2.5 py-1 text-xs font-semibold text-gray-600 hover:text-black cursor-pointer"
                  >
                    Reset
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCropper(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={applyCrop}
                    className="px-6 py-2 text-xs sm:text-sm font-bold text-white bg-black rounded-lg hover:bg-gray-800 active:scale-95 shadow-md transition-all cursor-pointer"
                  >
                    ✂️ Apply Crop
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageLogo;