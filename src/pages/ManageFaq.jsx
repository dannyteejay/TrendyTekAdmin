import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { backendUrl as AppBackendUrl } from "../App";
import { toast } from "react-toastify";

const PRESET_CATEGORIES = [
  { name: "Payments & Gateways", icon: "💳" },
  { name: "Orders & Shipping", icon: "📦" },
  { name: "Returns & Refunds", icon: "🔄" },
  { name: "Account & Security", icon: "👤" },
  { name: "Products & Quality", icon: "🛍️" },
  { name: "General & Support", icon: "❓" },
];

const EMOJI_PICKER = ["💳", "📦", "🔄", "👤", "🛍️", "⚡", "❓", "🛡️", "💡", "🏷️", "🚚", "💰"];

const ManageFaq = ({ token }) => {
  const adminToken = token || localStorage.getItem("token") || "";
  const backendUrl =
    AppBackendUrl ||
    import.meta.env.VITE_BACKEND_URL ||
    "http://localhost:4000";

  const [activeTab, setActiveTab] = useState("list");
  const [faqList, setFaqList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const [category, setCategory] = useState("Payments & Gateways");
  const [customCategory, setCustomCategory] = useState("");
  const [icon, setIcon] = useState("💳");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [order, setOrder] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [editingFaq, setEditingFaq] = useState(null);
  const [editCategory, setEditCategory] = useState("");
  const [editIcon, setEditIcon] = useState("💳");
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [editOrder, setEditOrder] = useState(0);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(backendUrl + "/api/faq/list");
      if (response.data && response.data.success) {
        setFaqList(response.data.faqs || []);
      }
    } catch (error) {
      console.error("Fetch FAQs error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleSeedStarterFaqs = async () => {
    setSeeding(true);
    try {
      const response = await axios.post(
        backendUrl + "/api/faq/seed",
        {},
        { headers: { token: adminToken } }
      );
      if (response.data.success) {
        toast.success(response.data.message || "Starter FAQs loaded!");
        await fetchFaqs();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Seed error:", error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSeeding(false);
    }
  };

  const categoriesList = useMemo(() => {
    const cats = new Set(faqList.map((f) => f.category).filter(Boolean));
    return ["All", ...Array.from(cats)];
  }, [faqList]);

  const filteredFaqs = useMemo(() => {
    return faqList.filter((f) => {
      const matchesCategory =
        filterCategory === "All" || f.category === filterCategory;
      const q = searchQuery.toLowerCase();
      return (
        f.question?.toLowerCase().includes(q) ||
        f.answer?.toLowerCase().includes(q) ||
        f.category?.toLowerCase().includes(q)
      );
    });
  }, [faqList, filterCategory, searchQuery]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      toast.error("Please enter both question and answer");
      return;
    }

    setSubmitting(true);
    try {
      const finalCategory =
        category === "CUSTOM" ? customCategory.trim() : category;

      const response = await axios.post(
        backendUrl + "/api/faq/add",
        {
          category: finalCategory || "General Questions",
          icon: icon || "❓",
          question: question.trim(),
          answer: answer.trim(),
          order: Number(order) || 0,
        },
        { headers: { token: adminToken } }
      );

      if (response.data.success) {
        toast.success(response.data.message || "FAQ added successfully!");
        setQuestion("");
        setAnswer("");
        setCustomCategory("");
        setOrder(0);
        setActiveTab("list");
        await fetchFaqs();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (faq) => {
    setEditingFaq(faq);
    setEditCategory(faq.category || "General Questions");
    setEditIcon(faq.icon || "❓");
    setEditQuestion(faq.question || "");
    setEditAnswer(faq.answer || "");
    setEditOrder(faq.order || 0);
  };

  const onEditSubmitHandler = async (e) => {
    e.preventDefault();
    if (!editingFaq) return;

    setEditSubmitting(true);
    try {
      const response = await axios.post(
        backendUrl + "/api/faq/update",
        {
          id: editingFaq._id,
          category: editCategory.trim(),
          icon: editIcon.trim(),
          question: editQuestion.trim(),
          answer: editAnswer.trim(),
          order: Number(editOrder) || 0,
        },
        { headers: { token: adminToken } }
      );

      if (response.data.success) {
        toast.success(response.data.message || "FAQ updated successfully!");
        setEditingFaq(null);
        await fetchFaqs();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteFaq = async (id, qText) => {
    if (!window.confirm(`Are you sure you want to delete this FAQ?\n"${qText}"`)) {
      return;
    }

    try {
      const response = await axios.post(
        backendUrl + "/api/faq/remove",
        { id },
        { headers: { token: adminToken } }
      );

      if (response.data.success) {
        toast.info(response.data.message || "FAQ deleted");
        await fetchFaqs();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-gray-200 rounded-xl shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Store FAQs</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Create, update, and manage frequently asked questions for your TrendyTek customer support page.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {faqList.length === 0 && (
            <button
              onClick={handleSeedStarterFaqs}
              disabled={seeding}
              className="px-4 py-2 text-xs sm:text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 rounded-md transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>⚡</span> {seeding ? "Loading..." : "Load Starter FAQs"}
            </button>
          )}

          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("list")}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === "list"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              📋 All FAQs ({faqList.length})
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === "create"
                  ? "bg-black text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              ➕ Add New FAQ
            </button>
          </div>
        </div>
      </div>

      {activeTab === "list" && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search questions or answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3.5 py-2 pl-9 text-xs sm:text-sm border border-gray-300 rounded-lg focus:border-black outline-none"
              />
              <span className="absolute left-3 top-2.5 text-gray-400 text-xs">
                🔍
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={fetchFaqs}
                className="px-3.5 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => setActiveTab("create")}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold uppercase tracking-wider bg-black text-white rounded-lg hover:bg-gray-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>+</span> Add FAQ
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {categoriesList.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border ${
                  filterCategory === cat
                    ? "bg-black text-white border-black"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-500 animate-pulse">
              Loading FAQs...
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="py-16 text-center bg-gray-50/60 border border-dashed border-gray-300 rounded-2xl p-6">
              <p className="text-3xl mb-2">❓</p>
              <p className="text-lg font-bold text-gray-800">No FAQs found</p>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mt-1 mb-6">
                Your FAQ database is currently empty. Add your first question or load starter FAQs below.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleSeedStarterFaqs}
                  disabled={seeding}
                  className="px-6 py-2.5 text-xs sm:text-sm font-bold bg-amber-500 text-white rounded-lg hover:bg-amber-600 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  {seeding ? "Loading..." : "⚡ Load Starter FAQs"}
                </button>
                <button
                  onClick={() => setActiveTab("create")}
                  className="px-6 py-2.5 text-xs sm:text-sm font-bold bg-black text-white rounded-lg hover:bg-gray-800 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  ➕ Add New FAQ
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredFaqs.map((item) => (
                <div
                  key={item._id}
                  className="p-5 border border-gray-200 rounded-xl bg-gray-50/40 hover:bg-white hover:border-gray-300 hover:shadow-xs transition-all flex flex-col gap-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg">{item.icon || "❓"}</span>
                      <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-black text-white rounded-full">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="px-3 py-1 text-xs font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteFaq(item._id, item.question)}
                        className="px-3 py-1 text-xs font-bold text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors cursor-pointer shadow-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-gray-900">
                      {item.question}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 whitespace-pre-line leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "create" && (
        <form
          onSubmit={onSubmitHandler}
          className="flex flex-col gap-6 p-6 sm:p-8 bg-white border border-gray-200 rounded-xl shadow-xs"
        >
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">➕ Add New FAQ</h3>
            <button
              type="button"
              onClick={() => setActiveTab("list")}
              className="text-xs font-semibold text-gray-600 hover:text-black underline cursor-pointer"
            >
              Cancel & View All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-xs sm:text-sm font-semibold text-gray-700">
                FAQ Category *
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  const found = PRESET_CATEGORIES.find((c) => c.name === e.target.value);
                  if (found) setIcon(found.icon);
                }}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-black outline-none bg-white"
              >
                {PRESET_CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.icon} {c.name}
                  </option>
                ))}
                <option value="CUSTOM">✏️ Custom Category...</option>
              </select>

              {category === "CUSTOM" && (
                <input
                  type="text"
                  required
                  placeholder="Enter custom category name"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-xs"
                />
              )}
            </div>

            <div>
              <label className="block mb-1 text-xs sm:text-sm font-semibold text-gray-700">
                Category Icon / Emoji
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-14 text-center px-2 py-2 border border-gray-300 rounded-lg text-lg focus:border-black outline-none"
                />
                <div className="flex flex-wrap gap-1">
                  {EMOJI_PICKER.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      className="w-7 h-7 flex items-center justify-center text-sm border rounded hover:bg-gray-100"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-xs sm:text-sm font-semibold text-gray-700">
              Question Text *
            </label>
            <input
              type="text"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How do I track my order?"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium focus:border-black outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 text-xs sm:text-sm font-semibold text-gray-700">
              Answer Text * (Multi-line supported)
            </label>
            <textarea
              required
              rows={5}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Provide a detailed, helpful answer for your customers..."
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm leading-relaxed focus:border-black outline-none"
            />
          </div>

          <div className="w-full max-w-xs">
            <label className="block mb-1 text-xs sm:text-sm font-semibold text-gray-700">
              Display Sort Order
            </label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:border-black outline-none"
              placeholder="0"
            />
          </div>

          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("list")}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider bg-black text-white rounded-lg hover:bg-gray-800 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              {submitting ? "Saving..." : "Save FAQ"}
            </button>
          </div>
        </form>
      )}

      {editingFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">✏️ Edit FAQ</h3>
              <button
                onClick={() => setEditingFaq(null)}
                className="text-gray-400 hover:text-gray-700 text-2xl font-bold leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={onEditSubmitHandler} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-xs font-semibold text-gray-700">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-semibold text-gray-700">
                    Icon / Emoji
                  </label>
                  <input
                    type="text"
                    value={editIcon}
                    onChange={(e) => setEditIcon(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">
                  Question
                </label>
                <input
                  type="text"
                  required
                  value={editQuestion}
                  onChange={(e) => setEditQuestion(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-medium"
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">
                  Answer
                </label>
                <textarea
                  rows={5}
                  required
                  value={editAnswer}
                  onChange={(e) => setEditAnswer(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm leading-relaxed"
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={editOrder}
                  onChange={(e) => setEditOrder(e.target.value)}
                  className="w-full max-w-[120px] px-3.5 py-1.5 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingFaq(null)}
                  disabled={editSubmitting}
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-6 py-2 text-xs sm:text-sm font-bold text-white bg-black rounded-lg hover:bg-gray-800 active:scale-95 transition-all shadow-xs"
                >
                  {editSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFaq;