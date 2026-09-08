import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

export const SLIDE_CURRENCIES = [
  { code: "", symbol: "", label: "Store Default Currency" },
  { code: "NGN", symbol: "₦", label: "🇳🇬 Naira (₦)" },
  { code: "USD", symbol: "$", label: "🇺🇸 Dollar ($)" },
  { code: "EUR", symbol: "€", label: "🇪🇺 Euro (€)" },
  { code: "GBP", symbol: "£", label: "🇬🇧 Pound (£)" },
  { code: "INR", symbol: "₹", label: "🇮🇳 Rupee (₹)" },
  { code: "GHS", symbol: "GH₵", label: "🇬🇭 Cedi (GH₵)" },
  { code: "KES", symbol: "KSh", label: "🇰🇪 Shilling (KSh)" },
  { code: "ZAR", symbol: "R", label: "🇿🇦 Rand (R)" },
  { code: "CAD", symbol: "CA$", label: "🇨🇦 CAD (CA$)" },
];

const Slides = ({ token }) => {
  // Add Slide Form State
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("🔥 Special Offer");
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [customCurrency, setCustomCurrency] = useState("");
  const [price, setPrice] = useState("");
  const [link, setLink] = useState("/collection");
  const [buttonText, setButtonText] = useState("SHOP NOW");
  const [loading, setLoading] = useState(false);
  const [slideList, setSlideList] = useState([]);

  // Edit Slide Modal State
  const [editingSlide, setEditingSlide] = useState(null);
  const [editImage, setEditImage] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editBadge, setEditBadge] = useState("");
  const [editSelectedCurrency, setEditSelectedCurrency] = useState("");
  const [editCustomCurrency, setEditCustomCurrency] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editLink, setEditLink] = useState("");
  const [editButtonText, setEditButtonText] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const adminToken = token || localStorage.getItem("token") || "";

  // Fetch all existing slides
  const fetchSlides = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/slide/list");
      if (response.data.success) {
        setSlideList(response.data.slides);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  // Handle Add Slide Submit
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!image) {
      toast.error("Please select a slide image");
      return;
    }

    setLoading(true);
    try {
      const finalCurrency =
        selectedCurrency === "CUSTOM"
          ? customCurrency.trim()
          : selectedCurrency;

      const formData = new FormData();
      formData.append("image", image);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("badge", badge);
      formData.append("currency", finalCurrency);
      formData.append("price", price);
      formData.append("link", link);
      formData.append("buttonText", buttonText);

      const response = await axios.post(
        backendUrl + "/api/slide/add",
        formData,
        { headers: { token: adminToken } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Reset form
        setImage(null);
        setTitle("");
        setDescription("");
        setBadge("🔥 Special Offer");
        setSelectedCurrency("");
        setCustomCurrency("");
        setPrice("");
        setLink("/collection");
        setButtonText("SHOP NOW");
        await fetchSlides();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Open Edit Modal
  const handleStartEdit = (slide) => {
    setEditingSlide(slide);
    setEditImage(null);
    setEditTitle(slide.title || "");
    setEditDescription(slide.description || "");
    setEditBadge(slide.badge || "🔥 Special Offer");

    // Check if currency is in standard list
    const foundCurrency = SLIDE_CURRENCIES.find((c) => c.symbol === slide.currency);
    if (foundCurrency) {
      setEditSelectedCurrency(slide.currency || "");
      setEditCustomCurrency("");
    } else if (slide.currency) {
      setEditSelectedCurrency("CUSTOM");
      setEditCustomCurrency(slide.currency);
    } else {
      setEditSelectedCurrency("");
      setEditCustomCurrency("");
    }

    setEditPrice(slide.price || "");
    setEditLink(slide.link || "/collection");
    setEditButtonText(slide.buttonText || "SHOP NOW");
  };

  // Close Edit Modal
  const handleCancelEdit = () => {
    setEditingSlide(null);
    setEditImage(null);
  };

  // Submit Edit Slide
  const onEditSubmitHandler = async (e) => {
    e.preventDefault();
    if (!editingSlide) return;

    setEditLoading(true);
    try {
      const finalCurrency =
        editSelectedCurrency === "CUSTOM"
          ? editCustomCurrency.trim()
          : editSelectedCurrency;

      const formData = new FormData();
      formData.append("id", editingSlide._id);
      formData.append("title", editTitle);
      formData.append("description", editDescription);
      formData.append("badge", editBadge);
      formData.append("currency", finalCurrency);
      formData.append("price", editPrice);
      formData.append("link", editLink);
      formData.append("buttonText", editButtonText);

      // Only attach image if user picked a new file
      if (editImage) {
        formData.append("image", editImage);
      }

      const response = await axios.post(
        backendUrl + "/api/slide/update",
        formData,
        { headers: { token: adminToken } }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Slide updated successfully!");
        setEditingSlide(null);
        setEditImage(null);
        await fetchSlides();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setEditLoading(false);
    }
  };

  // Handle Delete Slide
  const removeSlide = async (id) => {
    if (!window.confirm("Are you sure you want to delete this slide?")) {
      return;
    }

    try {
      const response = await axios.post(
        backendUrl + "/api/slide/remove",
        { id },
        { headers: { token: adminToken } }
      );

      if (response.data.success) {
        toast.info(response.data.message);
        await fetchSlides();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* 1. Add Slide Form */}
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col items-start w-full gap-4 p-6 bg-white border border-gray-200 rounded-xl shadow-sm"
      >
        <h3 className="text-xl font-bold text-gray-800">Add New Home Slide</h3>

        {/* Upload Slide Image */}
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">
            Upload Slide Banner / Product Image
          </p>
          <label htmlFor="slideImage" className="cursor-pointer inline-block">
            <img
              className="object-cover w-36 h-28 border-2 border-dashed border-gray-400 rounded-lg hover:border-black transition-all"
              src={image ? URL.createObjectURL(image) : assets.upload_area}
              alt="Upload area"
            />
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="slideImage"
              hidden
              accept="image/*"
            />
          </label>
        </div>

        {/* Slide Title */}
        <div className="w-full max-w-[550px]">
          <p className="mb-1 text-sm font-semibold text-gray-700">Slide Title / Headline</p>
          <input
            onChange={(e) => setTitle(e.target.value)}
            value={title}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black outline-none text-sm"
            type="text"
            placeholder="e.g. DELL Laptop or Summer Mega Sale"
            required
          />
        </div>

        {/* Slide Description */}
        <div className="w-full max-w-[550px]">
          <p className="mb-1 text-sm font-semibold text-gray-700">Subtitle / Description</p>
          <textarea
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black outline-none text-sm"
            placeholder="e.g. Get 50% discount on all new arrivals this week"
            rows={2}
          />
        </div>

        {/* Row: Badge Text */}
        <div className="w-full max-w-[550px]">
          <p className="mb-1 text-sm font-semibold text-gray-700">Badge Text</p>
          <input
            onChange={(e) => setBadge(e.target.value)}
            value={badge}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black outline-none text-sm"
            type="text"
            placeholder="e.g. 🔥 SPECIAL OFFER, 50% OFF, NEW ARRIVAL"
          />
        </div>

        {/* Row: Choose Currency & Price for this Slide */}
        <div className="flex flex-col w-full max-w-[550px] gap-3 sm:flex-row">
          <div className="flex-1">
            <p className="mb-1 text-sm font-semibold text-gray-700">Slide Currency</p>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black outline-none bg-white text-sm font-medium"
            >
              {SLIDE_CURRENCIES.map((c) => (
                <option key={c.code || "default"} value={c.symbol}>
                  {c.label}
                </option>
              ))}
              <option value="CUSTOM">✏️ Custom Symbol...</option>
            </select>

            {selectedCurrency === "CUSTOM" && (
              <input
                type="text"
                value={customCurrency}
                onChange={(e) => setCustomCurrency(e.target.value)}
                placeholder="Enter symbol (e.g. AED, ₦)"
                className="w-full mt-2 px-3 py-1.5 text-xs border border-gray-300 rounded focus:border-black outline-none"
                required
              />
            )}
          </div>

          <div className="flex-1">
            <p className="mb-1 text-sm font-semibold text-gray-700">Price / Offer Amount</p>
            <input
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black outline-none text-sm"
              type="text"
              placeholder="e.g. 150 or 75000"
            />
          </div>
        </div>

        {/* Row: Button Link & Button Text */}
        <div className="flex flex-col w-full max-w-[550px] gap-4 sm:flex-row">
          <div className="flex-1">
            <p className="mb-1 text-sm font-semibold text-gray-700">Button Link</p>
            <input
              onChange={(e) => setLink(e.target.value)}
              value={link}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black outline-none text-sm"
              type="text"
              placeholder="e.g. /collection or /product/123"
            />
          </div>
          <div className="flex-1">
            <p className="mb-1 text-sm font-semibold text-gray-700">Button Text</p>
            <input
              onChange={(e) => setButtonText(e.target.value)}
              value={buttonText}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-black outline-none text-sm"
              type="text"
              placeholder="e.g. SHOP NOW or EXPLORE"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-2.5 mt-2 text-sm font-bold text-white bg-black rounded-lg hover:bg-gray-800 active:scale-95 transition-all shadow cursor-pointer"
        >
          {loading ? "Adding Slide..." : "Add Slide"}
        </button>
      </form>

      {/* 2. Existing Slides List */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <h3 className="mb-4 text-xl font-bold text-gray-800">
          Current Slides ({slideList.length})
        </h3>

        {slideList.length === 0 ? (
          <p className="py-6 text-center text-gray-500">
            No custom slides yet. Add one above to display it on your homepage!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {slideList.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-3.5 border border-gray-200 rounded-xl gap-3 bg-gray-50 hover:bg-white hover:border-gray-300 transition-all shadow-xs"
              >
                <img
                  className="object-cover w-20 h-16 rounded-lg bg-white border border-gray-200 shrink-0"
                  src={item.image}
                  alt={item.title}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                      {item.badge}
                    </span>
                    {item.price && (
                      <span className="text-xs font-bold text-gray-900 bg-gray-200 px-1.5 py-0.5 rounded">
                        {item.currency || "$"}
                        {isNaN(Number(item.price))
                          ? item.price
                          : Number(item.price).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {item.description || item.link}
                  </p>
                </div>
                
                {/* Action Buttons: Edit & Delete */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleStartEdit(item)}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 active:scale-95 transition-all shadow-xs cursor-pointer"
                    title="Edit Slide"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeSlide(item._id)}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded-md hover:bg-red-600 active:scale-95 transition-all shadow-xs cursor-pointer"
                    title="Delete Slide"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Edit Slide Modal / Popup */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                ✏️ Edit Home Slide
              </h3>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-700 text-2xl font-bold leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={onEditSubmitHandler} className="flex flex-col gap-4">
              {/* Image Preview & Change */}
              <div>
                <p className="mb-2 text-sm font-semibold text-gray-700">
                  Slide Image (Click below to change image, or leave to keep current)
                </p>
                <label htmlFor="editSlideImage" className="cursor-pointer inline-block">
                  <div className="relative group">
                    <img
                      className="object-cover w-44 h-28 border-2 border-dashed border-blue-400 rounded-lg group-hover:opacity-80 transition-all bg-gray-50"
                      src={
                        editImage
                          ? URL.createObjectURL(editImage)
                          : editingSlide.image
                      }
                      alt="Slide Preview"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to Change
                    </div>
                  </div>
                  <input
                    onChange={(e) => setEditImage(e.target.files[0])}
                    type="file"
                    id="editSlideImage"
                    hidden
                    accept="image/*"
                  />
                </label>
              </div>

              {/* Title */}
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">
                  Slide Title / Headline
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:border-black outline-none text-sm"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">
                  Subtitle / Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:border-black outline-none text-sm"
                />
              </div>

              {/* Badge Text */}
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={editBadge}
                  onChange={(e) => setEditBadge(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:border-black outline-none text-sm"
                  placeholder="e.g. 🔥 Special Offer"
                />
              </div>

              {/* Currency & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">
                    Slide Currency
                  </label>
                  <select
                    value={editSelectedCurrency}
                    onChange={(e) => setEditSelectedCurrency(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:border-black outline-none bg-white text-sm"
                  >
                    {SLIDE_CURRENCIES.map((c) => (
                      <option key={c.code || "default"} value={c.symbol}>
                        {c.label}
                      </option>
                    ))}
                    <option value="CUSTOM">✏️ Custom Symbol...</option>
                  </select>
                  {editSelectedCurrency === "CUSTOM" && (
                    <input
                      type="text"
                      value={editCustomCurrency}
                      onChange={(e) => setEditCustomCurrency(e.target.value)}
                      placeholder="Enter symbol (e.g. AED, ₦)"
                      className="w-full mt-2 px-3 py-1.5 text-xs border border-gray-300 rounded focus:border-black outline-none"
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">
                    Price / Offer Amount
                  </label>
                  <input
                    type="text"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:border-black outline-none text-sm"
                    placeholder="e.g. 150"
                  />
                </div>
              </div>

              {/* Link & Button Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={editLink}
                    onChange={(e) => setEditLink(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:border-black outline-none text-sm"
                    placeholder="e.g. /collection"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={editButtonText}
                    onChange={(e) => setEditButtonText(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:border-black outline-none text-sm"
                    placeholder="e.g. SHOP NOW"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={editLoading}
                  className="px-5 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2 text-sm font-bold text-white bg-black rounded-lg hover:bg-gray-800 active:scale-95 transition-all shadow cursor-pointer"
                >
                  {editLoading ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Slides;