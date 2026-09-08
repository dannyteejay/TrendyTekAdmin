import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const ManageContact = ({ token }) => {
  const [activeTab, setActiveTab] = useState("content");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Form State
  const [title, setTitle] = useState("CONTACT US");
  const [subtitle, setSubtitle] = useState("Get in Touch with Our Team");
  const [storeAddress, setStoreAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [hours, setHours] = useState("");

  // Careers Section
  const [careersTitle, setCareersTitle] = useState("");
  const [careersText, setCareersText] = useState("");
  const [careersButtonText, setCareersButtonText] = useState("");
  const [careersLink, setCareersLink] = useState("");

  // Image
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  // Branches
  const [branches, setBranches] = useState([]);
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchAddress, setNewBranchAddress] = useState("");
  const [newBranchPhone, setNewBranchPhone] = useState("");
  const [newBranchEmail, setNewBranchEmail] = useState("");

  // Messages Inbox
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const adminToken = token || localStorage.getItem("token") || "";

  const fetchContactData = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/contact/get");
      if (response.data.success && response.data.contact) {
        const c = response.data.contact;
        setTitle(c.title || "CONTACT US");
        setSubtitle(c.subtitle || "Get in Touch with Our Team");
        setStoreAddress(c.storeAddress || "");
        setPhone(c.phone || "");
        setEmail(c.email || "");
        setWhatsapp(c.whatsapp || "");
        setHours(c.hours || "");
        setCareersTitle(c.careersTitle || "");
        setCareersText(c.careersText || "");
        setCareersButtonText(c.careersButtonText || "");
        setCareersLink(c.careersLink || "");
        setPreviewImage(c.image || "");
        setBranches(c.branches || []);
      }
    } catch (error) {
      console.error("Failed to load contact data:", error);
    } finally {
      setFetching(false);
    }
  };

  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const response = await axios.get(backendUrl + "/api/contact/messages", {
        headers: { token: adminToken },
      });
      if (response.data.success) {
        setMessages(response.data.messages || []);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchContactData();
    fetchMessages();
  }, []);

  const addBranch = () => {
    if (!newBranchName.trim() || !newBranchAddress.trim()) {
      toast.error("Please provide at least a branch name and address");
      return;
    }

    setBranches((prev) => [
      ...prev,
      {
        name: newBranchName.trim(),
        address: newBranchAddress.trim(),
        phone: newBranchPhone.trim(),
        email: newBranchEmail.trim(),
      },
    ]);

    setNewBranchName("");
    setNewBranchAddress("");
    setNewBranchPhone("");
    setNewBranchEmail("");
  };

  const removeBranch = (index) => {
    setBranches((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateBranchItem = (index, field, value) => {
    setBranches((prev) => {
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
      formData.append("storeAddress", storeAddress.trim());
      formData.append("phone", phone.trim());
      formData.append("email", email.trim());
      formData.append("whatsapp", whatsapp.trim());
      formData.append("hours", hours.trim());
      formData.append("careersTitle", careersTitle.trim());
      formData.append("careersText", careersText.trim());
      formData.append("careersButtonText", careersButtonText.trim());
      formData.append("careersLink", careersLink.trim());
      formData.append("branches", JSON.stringify(branches));

      const response = await axios.post(
        backendUrl + "/api/contact/update",
        formData,
        { headers: { token: adminToken } }
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Contact details updated successfully!"
        );
        if (response.data.contact?.image) {
          setPreviewImage(response.data.contact.image);
          setImageFile(null);
        }
      } else {
        toast.error(response.data.message || "Failed to update contact page");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleReadStatus = async (id) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/contact/message-status",
        { id },
        { headers: { token: adminToken } }
      );
      if (response.data.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === id ? { ...m, isRead: response.data.isRead } : m
          )
        );
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const deleteMessageItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer inquiry?"))
      return;

    try {
      const response = await axios.post(
        backendUrl + "/api/contact/delete-message",
        { id },
        { headers: { token: adminToken } }
      );
      if (response.data.success) {
        toast.success("Message deleted");
        setMessages((prev) => prev.filter((m) => m._id !== id));
      }
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-10 h-10 border-black rounded-full border-3 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            📞 Manage "Contact Us" Page
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Customize your store contacts, branches, careers link, and customer inquiries.
          </p>
        </div>

        <div className="flex items-center p-1 bg-gray-200 rounded-xl">
          <button
            onClick={() => setActiveTab("content")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "content"
                ? "bg-white text-black shadow-sm"
                : "text-gray-600 hover:text-black"
            }`}
          >
            ⚙️ Page Content & Info
          </button>
          <button
            onClick={() => {
              setActiveTab("messages");
              fetchMessages();
            }}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "messages"
                ? "bg-white text-black shadow-sm"
                : "text-gray-600 hover:text-black"
            }`}
          >
            📥 Customer Inbox
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-extrabold text-white bg-red-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === "content" && (
        <form
          onSubmit={onSubmitHandler}
          className="flex flex-col gap-6 p-6 bg-white border border-gray-200 shadow-sm sm:p-8 rounded-2xl"
        >
          {/* Banner Photo */}
          <div>
            <p className="mb-2 text-sm font-semibold text-gray-700">
              Contact Banner Image
            </p>
            <label htmlFor="contactImg" className="inline-block cursor-pointer">
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
                    alt="Contact Banner"
                  />
                ) : (
                  <div className="p-4 text-center">
                    <img
                      className="w-10 h-10 mx-auto mb-1 opacity-50"
                      src={assets.upload_area}
                      alt="Upload"
                    />
                    <span className="text-xs font-medium text-gray-500">
                      Click to Upload Image
                    </span>
                  </div>
                )}
              </div>
              <input
                onChange={(e) => setImageFile(e.target.files[0])}
                type="file"
                id="contactImg"
                hidden
                accept="image/*"
              />
            </label>
          </div>

          {/* Titles */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-1 text-xs font-semibold text-gray-700">
                Page Main Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. CONTACT US"
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
                placeholder="e.g. We'd Love to Hear From You"
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Office Contact Info */}
          <div className="pt-2 border-t">
            <h4 className="mb-3 text-sm font-bold text-gray-900">
              🏢 Main Office / Store Information
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block mb-1 text-xs font-semibold text-gray-700">
                  Store Physical Address
                </label>
                <input
                  type="text"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  placeholder="54709 Willms Station, Suite 350, Washington, USA"
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">
                  Support Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (415) 555-0132"
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">
                  Support Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="support@trendify.com"
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">
                  WhatsApp Support (Optional)
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+1 (415) 555-0199"
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">
                  Operating / Support Hours
                </label>
                <input
                  type="text"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="Mon - Sat: 9:00 AM - 7:00 PM (EST)"
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* Careers Section */}
          <div className="pt-2 border-t">
            <h4 className="mb-3 text-sm font-bold text-gray-900">
              💼 Careers & Opportunities Box
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">
                  Careers Title
                </label>
                <input
                  type="text"
                  value={careersTitle}
                  onChange={(e) => setCareersTitle(e.target.value)}
                  placeholder="Careers at Trendify"
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-black font-medium"
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">
                  Button Text & Link
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={careersButtonText}
                    onChange={(e) => setCareersButtonText(e.target.value)}
                    placeholder="Explore Jobs"
                    className="px-3.5 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
                  />
                  <input
                    type="text"
                    value={careersLink}
                    onChange={(e) => setCareersLink(e.target.value)}
                    placeholder="mailto:careers@store.com or URL"
                    className="px-3.5 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block mb-1 text-xs font-semibold text-gray-700">
                  Careers Description Text
                </label>
                <textarea
                  rows={2}
                  value={careersText}
                  onChange={(e) => setCareersText(e.target.value)}
                  placeholder="Learn more about our teams and job openings."
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* Branches Section */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-gray-900">
                📍 Additional Branches & Departments ({branches.length})
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2">
              {branches.map((b, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-2 p-4 border border-gray-200 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      Location #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeBranch(idx)}
                      className="text-xs font-bold text-red-500 hover:text-red-700"
                    >
                      Delete ×
                    </button>
                  </div>
                  <input
                    type="text"
                    value={b.name}
                    onChange={(e) =>
                      updateBranchItem(idx, "name", e.target.value)
                    }
                    placeholder="Branch / Department Name"
                    className="w-full px-2.5 py-1.5 text-xs font-bold border rounded bg-white"
                  />
                  <input
                    type="text"
                    value={b.address}
                    onChange={(e) =>
                      updateBranchItem(idx, "address", e.target.value)
                    }
                    placeholder="Branch Address"
                    className="w-full px-2.5 py-1.5 text-xs border rounded bg-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={b.phone}
                      onChange={(e) =>
                        updateBranchItem(idx, "phone", e.target.value)
                      }
                      placeholder="Phone"
                      className="px-2.5 py-1.5 text-xs border rounded bg-white"
                    />
                    <input
                      type="text"
                      value={b.email}
                      onChange={(e) =>
                        updateBranchItem(idx, "email", e.target.value)
                      }
                      placeholder="Email"
                      className="px-2.5 py-1.5 text-xs border rounded bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add Branch */}
            <div className="flex flex-col gap-2.5 p-4 border-2 border-gray-300 border-dashed rounded-xl bg-gray-50">
              <p className="text-xs font-bold text-gray-700 uppercase">
                ➕ Add Another Branch / Department
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="Name (e.g. London Office, Returns Dept)"
                  className="px-3 py-2 text-xs bg-white border rounded outline-none"
                />
                <input
                  type="text"
                  value={newBranchAddress}
                  onChange={(e) => setNewBranchAddress(e.target.value)}
                  placeholder="Physical Address"
                  className="px-3 py-2 text-xs bg-white border rounded outline-none"
                />
                <input
                  type="text"
                  value={newBranchPhone}
                  onChange={(e) => setNewBranchPhone(e.target.value)}
                  placeholder="Phone (optional)"
                  className="px-3 py-2 text-xs bg-white border rounded outline-none"
                />
                <input
                  type="text"
                  value={newBranchEmail}
                  onChange={(e) => setNewBranchEmail(e.target.value)}
                  placeholder="Email (optional)"
                  className="px-3 py-2 text-xs bg-white border rounded outline-none"
                />
              </div>
              <button
                type="button"
                onClick={addBranch}
                className="self-start px-4 py-1.5 text-xs font-bold text-white bg-gray-800 rounded hover:bg-black"
              >
                Add Branch
              </button>
            </div>
          </div>

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
      )}

      {activeTab === "messages" && (
        <div className="flex flex-col gap-4 p-6 bg-white border border-gray-200 shadow-sm sm:p-8 rounded-2xl">
          <div className="flex items-center justify-between pb-3 border-b">
            <div>
              <h4 className="text-base font-bold text-gray-900">
                📥 Customer Inquiries & Messages ({messages.length})
              </h4>
              <p className="text-xs text-gray-500">
                Messages submitted directly through your storefront contact form.
              </p>
            </div>
            <button
              onClick={fetchMessages}
              className="px-3 py-1.5 text-xs font-semibold border rounded-lg hover:bg-gray-100"
            >
              🔄 Refresh
            </button>
          </div>

          {loadingMessages ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-black rounded-full border-3 border-t-transparent animate-spin"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p className="mb-2 text-3xl">📭</p>
              <p className="text-sm font-medium">No messages received yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.map((m) => (
                <div
                  key={m._id}
                  className={`p-4 sm:p-5 rounded-xl border transition-all flex flex-col gap-3 ${
                    m.isRead
                      ? "bg-gray-50 border-gray-200"
                      : "bg-amber-50/50 border-amber-200"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          m.isRead ? "bg-gray-300" : "bg-green-500"
                        }`}
                      />
                      <h5 className="text-sm font-bold text-gray-900">
                        {m.name}
                      </h5>
                      <span className="text-xs text-gray-500">
                        &lt;{m.email}&gt;
                      </span>
                      {m.phone && (
                        <span className="text-xs text-gray-500">
                          • 📞 {m.phone}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-400">
                        {new Date(m.date).toLocaleString()}
                      </span>
                      <button
                        onClick={() => toggleReadStatus(m._id)}
                        className={`px-2 py-0.5 text-[11px] font-semibold rounded border ${
                          m.isRead
                            ? "bg-white text-gray-600 hover:bg-gray-100"
                            : "bg-black text-white hover:bg-gray-800"
                        }`}
                      >
                        {m.isRead ? "Mark Unread" : "Mark Read"}
                      </button>
                      <button
                        onClick={() => deleteMessageItem(m._id)}
                        className="px-2 py-0.5 text-[11px] font-semibold text-red-600 border border-red-200 rounded bg-red-50 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-bold text-gray-700">
                      Subject: {m.subject}
                    </p>
                    <p className="p-3 text-xs leading-relaxed text-gray-600 whitespace-pre-line border border-gray-100 rounded-lg sm:text-sm bg-white/70">
                      {m.message}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <a
                      href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(
                        m.subject
                      )}`}
                      className="flex items-center gap-1 text-xs font-bold text-black hover:underline"
                    >
                      ✉️ Reply via Email &rarr;
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageContact;