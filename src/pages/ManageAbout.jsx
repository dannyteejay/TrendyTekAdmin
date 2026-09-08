import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const ManageAbout = ({ token }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Form State
  const [title, setTitle] = useState("ABOUT US");
  const [subtitle, setSubtitle] = useState("Find What Moves You");
  const [story1, setStory1] = useState("");
  const [story2, setStory2] = useState("");
  const [mission, setMission] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [features, setFeatures] = useState([]);

  // New Feature Box
  const [newFeatureTitle, setNewFeatureTitle] = useState("");
  const [newFeatureDesc, setNewFeatureDesc] = useState("");

  const adminToken = token || localStorage.getItem("token") || "";

  const fetchAboutData = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/about/get");
      if (response.data.success && response.data.about) {
        const a = response.data.about;
        setTitle(a.title || "ABOUT US");
        setSubtitle(a.subtitle || "Find What Moves You");
        setStory1(a.storyParagraph1 || "");
        setStory2(a.storyParagraph2 || "");
        setMission(a.mission || "");
        setPreviewImage(a.image || "");
        setFeatures(a.features || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchAboutData();
  }, []);

  const addFeature = () => {
    if (!newFeatureTitle.trim() || !newFeatureDesc.trim()) {
      toast.error("Please enter both title and description for the feature");
      return;
    }

    setFeatures((prev) => [
      ...prev,
      {
        title: newFeatureTitle.trim(),
        description: newFeatureDesc.trim(),
      },
    ]);
    setNewFeatureTitle("");
    setNewFeatureDesc("");
  };

  const removeFeature = (indexToRemove) => {
    setFeatures((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const updateFeatureItem = (index, field, value) => {
    setFeatures((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append("image", imageFile);
      }
      formData.append("title", title.trim());
      formData.append("subtitle", subtitle.trim());
      formData.append("storyParagraph1", story1.trim());
      formData.append("storyParagraph2", story2.trim());
      formData.append("mission", mission.trim());
      formData.append("features", JSON.stringify(features));

      const response = await axios.post(
        backendUrl + "/api/about/update",
        formData,
        { headers: { token: adminToken } }
      );

      if (response.data.success) {
        toast.success(response.data.message || "About Us updated successfully!");
        if (response.data.about?.image) {
          setPreviewImage(response.data.about.image);
          setImageFile(null);
        }
      } else {
        toast.error(response.data.message || "Failed to update About Us");
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
    <div className="flex flex-col gap-8 pb-16">
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col gap-6 p-6 bg-white border border-gray-200 shadow-sm sm:p-8 rounded-2xl"
      >
        <div className="flex items-center justify-between pb-4 border-b">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              📖 Manage "About Us" Page
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Edit company story, banner photo, mission statement, and benefit cards.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-black rounded-lg hover:bg-gray-800 active:scale-95 transition-all shadow-md"
          >
            {loading ? "Saving Changes..." : "Save All Changes"}
          </button>
        </div>

        {/* 1. Banner Image */}
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">
            About Us Banner Image
          </p>
          <label htmlFor="aboutImg" className="inline-block cursor-pointer">
            <div className="flex items-center justify-center overflow-hidden transition-all border-2 border-gray-300 border-dashed w-60 h-40 rounded-xl bg-gray-50 hover:border-black">
              {imageFile ? (
                <img
                  className="object-cover w-full h-full"
                  src={URL.createObjectURL(imageFile)}
                  alt="Preview"
                />
              ) : previewImage ? (
                <img
                  className="object-cover w-full h-full"
                  src={previewImage}
                  alt="About Us Banner"
                />
              ) : (
                <div className="p-4 text-center">
                  <img
                    className="w-10 h-10 mx-auto mb-1 opacity-50"
                    src={assets.upload_area}
                    alt="Upload"
                  />
                  <span className="text-xs font-medium text-gray-500">
                    Click to Upload Banner
                  </span>
                </div>
              )}
            </div>
            <input
              onChange={(e) => setImageFile(e.target.files[0])}
              type="file"
              id="aboutImg"
              hidden
              accept="image/*"
            />
          </label>
        </div>

        {/* 2. Titles */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block mb-1 text-xs font-semibold text-gray-700">
              Page Main Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. ABOUT US"
              className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-black font-medium"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-semibold text-gray-700">
              Tagline / Subtitle
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Find What Moves You"
              className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
            />
          </div>
        </div>

        {/* 3. Story Paragraphs */}
        <div>
          <label className="block mb-1 text-xs font-semibold text-gray-700">
            Company Story (Paragraph 1)
          </label>
          <textarea
            rows={3}
            value={story1}
            onChange={(e) => setStory1(e.target.value)}
            placeholder="Describe how your brand started..."
            className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-semibold text-gray-700">
            Company Story (Paragraph 2)
          </label>
          <textarea
            rows={3}
            value={story2}
            onChange={(e) => setStory2(e.target.value)}
            placeholder="Describe your product curation and suppliers..."
            className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
            required
          />
        </div>

        {/* 4. Our Mission */}
        <div>
          <label className="block mb-1 text-xs font-semibold text-gray-700">
            Our Mission Statement
          </label>
          <textarea
            rows={3}
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            placeholder="Explain your mission and dedication to customers..."
            className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
            required
          />
        </div>

        {/* 5. Features Cards */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-bold text-gray-900">
              🌟 "Why Choose Us" Benefit Cards ({features.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between p-4 border border-gray-200 bg-gray-50 rounded-xl shadow-2xs gap-2"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      Card #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFeature(idx)}
                      className="text-xs font-bold text-red-500 hover:text-red-700"
                      title="Delete card"
                    >
                      Delete ×
                    </button>
                  </div>
                  <input
                    type="text"
                    value={feat.title}
                    onChange={(e) =>
                      updateFeatureItem(idx, "title", e.target.value)
                    }
                    placeholder="Card Title"
                    className="w-full px-2.5 py-1.5 mb-1.5 text-xs font-bold border rounded bg-white"
                  />
                  <textarea
                    rows={2}
                    value={feat.description}
                    onChange={(e) =>
                      updateFeatureItem(idx, "description", e.target.value)
                    }
                    placeholder="Card Description"
                    className="w-full px-2.5 py-1.5 text-xs border rounded bg-white"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Add New Feature Card */}
          <div className="flex flex-col gap-2.5 p-4 border-2 border-gray-300 border-dashed rounded-xl bg-gray-50">
            <p className="text-xs font-bold text-gray-700 uppercase">
              ➕ Add Another Benefit Card
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <input
                type="text"
                value={newFeatureTitle}
                onChange={(e) => setNewFeatureTitle(e.target.value)}
                placeholder="Title (e.g. Fast 24/7 Delivery)"
                className="px-3 py-2 text-xs bg-white border rounded outline-none"
              />
              <input
                type="text"
                value={newFeatureDesc}
                onChange={(e) => setNewFeatureDesc(e.target.value)}
                placeholder="Description of this benefit..."
                className="px-3 py-2 text-xs bg-white border rounded outline-none sm:col-span-2"
              />
            </div>
            <button
              type="button"
              onClick={addFeature}
              className="self-start px-4 py-1.5 text-xs font-bold text-white bg-gray-800 rounded hover:bg-black"
            >
              Add Card
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-3 text-sm font-bold text-white transition-all bg-black rounded-lg shadow-md hover:bg-gray-800 active:scale-95"
          >
            {loading ? "Saving Changes..." : "Save All Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManageAbout;