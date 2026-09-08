import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const ManageFooter = ({ token }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [logo, setLogo] = useState("");
  const [storeName, setStoreName] = useState("FOREVER");
  const [footerDescription, setFooterDescription] = useState("");
  const [companyTitle, setCompanyTitle] = useState("COMPANY");
  const [companyLinks, setCompanyLinks] = useState([]);
  const [contactTitle, setContactTitle] = useState("GET IN TOUCH");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [copyrightText, setCopyrightText] = useState("");

  const adminToken = token || localStorage.getItem("token") || "";

  const fetchFooterData = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/settings/get");
      if (response.data.success && response.data.settings) {
        const s = response.data.settings;
        setLogo(s.logo || "");
        setStoreName(s.storeName || "FOREVER");
        setFooterDescription(
          s.footerDescription ||
            "Discover the best trends and everyday essentials. Premium quality, fast delivery, and dedicated customer care tailored for your lifestyle."
        );
        setCompanyTitle(s.companyTitle || "COMPANY");
        setCompanyLinks(
          s.companyLinks && s.companyLinks.length > 0
            ? s.companyLinks
            : [
                { title: "Home", url: "/" },
                { title: "About us", url: "/about" },
                { title: "Contact", url: "/contact" },
                { title: "Collection", url: "/collection" },
              ]
        );
        setContactTitle(s.contactTitle || "GET IN TOUCH");
        setContactPhone(s.contactPhone || "+1-212-456-7890");
        setContactEmail(s.contactEmail || "contact@trendify.com");
        setContactAddress(s.contactAddress || "");
        setCopyrightText(s.copyrightText || "");
      }
    } catch (error) {
      console.error("Failed to load footer settings:", error);
      toast.error("Failed to load footer settings");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchFooterData();
  }, []);

  const handleAddLink = () => {
    setCompanyLinks([...companyLinks, { title: "New Link", url: "/" }]);
  };

  const handleUpdateLink = (index, field, value) => {
    const updated = [...companyLinks];
    updated[index][field] = value;
    setCompanyLinks(updated);
  };

  const handleDeleteLink = (index) => {
    if (companyLinks.length <= 1) {
      toast.warning("You must have at least one link.");
      return;
    }
    const updated = companyLinks.filter((_, i) => i !== index);
    setCompanyLinks(updated);
  };

  const handleAddPreset = (title, url) => {
    const exists = companyLinks.some((item) => item.title.toLowerCase() === title.toLowerCase());
    if (exists) {
      toast.info(`"${title}" is already in your links list.`);
      return;
    }
    setCompanyLinks([...companyLinks, { title, url }]);
  };

  const handleSaveFooter = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        backendUrl + "/api/settings/footer",
        {
          footerDescription,
          companyTitle,
          companyLinks,
          contactTitle,
          contactPhone,
          contactEmail,
          contactAddress,
          copyrightText,
        },
        {
          headers: { token: adminToken },
        }
      );

      if (response.data.success) {
        toast.success("Footer content updated successfully!");
      } else {
        toast.error(response.data.message || "Failed to update footer");
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
    <div className="flex flex-col max-w-4xl gap-8 pb-20">
      <div>
        <h3 className="text-xl font-bold text-gray-900">
          📝 Manage Website Footer
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          Add, edit, or remove your store description, company navigation links, contact info, and copyright notice.
        </p>
      </div>

      {/* Live Preview */}
      <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <h4 className="pb-3 mb-4 text-sm font-bold border-b text-gray-900">
          👀 Live Footer Preview (What customers see)
        </h4>

        <div className="p-6 border border-gray-200 rounded-xl bg-gray-50 mb-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">
            Light Mode Preview
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 text-xs">
            <div>
              <img
                src={logo || assets.logo}
                alt="Logo"
                className="object-contain h-8 mb-3 max-w-[160px]"
              />
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {footerDescription}
              </p>
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-2 uppercase">
                {companyTitle}
              </p>
              <ul className="space-y-1 text-gray-600">
                {companyLinks.map((item, i) => (
                  <li key={i}>• {item.title}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-2 uppercase">
                {contactTitle}
              </p>
              <p className="text-gray-600">{contactPhone}</p>
              <p className="text-gray-600">{contactEmail}</p>
              {contactAddress && (
                <p className="text-gray-400 mt-1">{contactAddress}</p>
              )}
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-gray-200 text-center text-[11px] text-gray-400">
            {copyrightText || `Copyright ${new Date().getFullYear()} @ ${storeName || "trendify.com"} - All Rights Reserved.`}
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-white">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">
            Dark Mode Preview
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 text-xs">
            <div>
              <img
                src={logo || assets.logo}
                alt="Logo"
                className="object-contain h-8 mb-3 max-w-[160px] brightness-0 invert"
              />
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {footerDescription}
              </p>
            </div>
            <div>
              <p className="font-bold text-white mb-2 uppercase">
                {companyTitle}
              </p>
              <ul className="space-y-1 text-gray-300">
                {companyLinks.map((item, i) => (
                  <li key={i}>• {item.title}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-bold text-white mb-2 uppercase">
                {contactTitle}
              </p>
              <p className="text-gray-300">{contactPhone}</p>
              <p className="text-gray-300">{contactEmail}</p>
              {contactAddress && (
                <p className="text-gray-400 mt-1">{contactAddress}</p>
              )}
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-800 text-center text-[11px] text-gray-400">
            {copyrightText || `Copyright ${new Date().getFullYear()} @ ${storeName || "trendify.com"} - All Rights Reserved.`}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSaveFooter} className="flex flex-col gap-6">
        <div className="p-6 bg-white border border-gray-200 shadow-sm sm:p-8 rounded-2xl flex flex-col gap-4">
          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <span>ℹ️</span> 1. Store Description (Left Column)
          </h4>
          <div>
            <label className="block mb-1 text-xs font-semibold text-gray-700">
              Footer Description Paragraph
            </label>
            <textarea
              rows={3}
              value={footerDescription}
              onChange={(e) => setFooterDescription(e.target.value)}
              placeholder="e.g. Discover the best trends and everyday essentials..."
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
              required
            />
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 shadow-sm sm:p-8 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span>🔗</span> 2. Company Navigation Links (Middle Column)
            </h4>
            <button
              type="button"
              onClick={handleAddLink}
              className="px-3 py-1.5 text-xs font-bold text-white bg-black rounded-lg hover:bg-gray-800 active:scale-95 transition-all shadow-xs"
            >
              ➕ Add New Link
            </button>
          </div>

          <div>
            <label className="block mb-1 text-xs font-semibold text-gray-700">
              Column Header Title
            </label>
            <input
              type="text"
              value={companyTitle}
              onChange={(e) => setCompanyTitle(e.target.value)}
              placeholder="e.g. COMPANY or QUICK LINKS"
              className="w-full max-w-sm px-3.5 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
              required
            />
          </div>

          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
              Quick Add Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleAddPreset("About us", "/about")}
                className="px-2.5 py-1 text-xs bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
              >
                + About us
              </button>
              <button
                type="button"
                onClick={() => handleAddPreset("Contact", "/contact")}
                className="px-2.5 py-1 text-xs bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
              >
                + Contact
              </button>
              <button
                type="button"
                onClick={() => handleAddPreset("Collection", "/collection")}
                className="px-2.5 py-1 text-xs bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
              >
                + Collection
              </button>
              <button
                type="button"
                onClick={() => handleAddPreset("My Profile", "/profile")}
                className="px-2.5 py-1 text-xs bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
              >
                + My Profile
              </button>
              <button
                type="button"
                onClick={() => handleAddPreset("Orders", "/orders")}
                className="px-2.5 py-1 text-xs bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
              >
                + Orders
              </button>
            </div>
          </div>

          <div className="space-y-3 mt-2">
            {companyLinks.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl"
              >
                <div className="w-8 font-bold text-xs text-gray-400 text-center">
                  #{index + 1}
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) =>
                      handleUpdateLink(index, "title", e.target.value)
                    }
                    placeholder="Link Title (e.g. Home)"
                    className="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white outline-none focus:border-black"
                    required
                  />
                  <input
                    type="text"
                    value={item.url}
                    onChange={(e) =>
                      handleUpdateLink(index, "url", e.target.value)
                    }
                    placeholder="Link URL (e.g. / or /about)"
                    className="px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white outline-none focus:border-black"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteLink(index)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                  title="Delete this link"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 shadow-sm sm:p-8 rounded-2xl flex flex-col gap-4">
          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <span>📞</span> 3. Get In Touch (Right Column)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-xs font-semibold text-gray-700">
                Column Header Title
              </label>
              <input
                type="text"
                value={contactTitle}
                onChange={(e) => setContactTitle(e.target.value)}
                placeholder="e.g. GET IN TOUCH"
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-semibold text-gray-700">
                Contact Phone Number
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="e.g. +1-212-456-7890"
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-semibold text-gray-700">
                Contact Email Address
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g. contact@trendify.com"
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-xs font-semibold text-gray-700">
                Physical Office Address (Optional)
              </label>
              <input
                type="text"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                placeholder="e.g. 54709 Willms Station, New York"
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 shadow-sm sm:p-8 rounded-2xl flex flex-col gap-4">
          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <span>©️</span> 4. Bottom Copyright Text
          </h4>
          <div>
            <label className="block mb-1 text-xs font-semibold text-gray-700">
              Custom Copyright Text (Leave blank to use automatic year & store name)
            </label>
            <input
              type="text"
              value={copyrightText}
              onChange={(e) => setCopyrightText(e.target.value)}
              placeholder={`Copyright ${new Date().getFullYear()} @ ${storeName || "trendify.com"} - All Rights Reserved.`}
              className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
            />
          </div>
        </div>

        <div className="flex justify-start">
          <button
            type="submit"
            disabled={loading}
            className={`px-10 py-3.5 text-xs sm:text-sm font-bold text-white bg-black rounded-xl hover:bg-gray-800 active:scale-95 shadow-md transition-all cursor-pointer ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Saving Changes..." : "💾 Save & Apply Footer"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManageFooter;