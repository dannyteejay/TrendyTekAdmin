import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { backendUrl as AppBackendUrl } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const BLOG_CATEGORIES = [
  "Tech & Gadgets",
  "Fashion & Lifestyle",
  "Buying Guides",
  "Security & Crypto",
  "E-Commerce Tips",
  "Company News",
];

const ManageBlog = ({ token }) => {
  const adminToken = token || localStorage.getItem("token") || "";
  const backendUrl =
    AppBackendUrl ||
    import.meta.env.VITE_BACKEND_URL ||
    "http://localhost:4000";

  // View state: 'list' or 'create'
  const [activeTab, setActiveTab] = useState("list");
  const [blogList, setBlogList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Create Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Tech & Gadgets");
  const [customCategory, setCustomCategory] = useState("");
  const [author, setAuthor] = useState("TrendyTek Editorial");
  const [authorRole, setAuthorRole] = useState("Product Specialist");
  const [authorAvatar, setAuthorAvatar] = useState(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  );
  const [readTime, setReadTime] = useState("4 min read");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [featured, setFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal State
  const [editingBlog, setEditingBlog] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editAuthorRole, setEditAuthorRole] = useState("");
  const [editAuthorAvatar, setEditAuthorAvatar] = useState("");
  const [editReadTime, setEditReadTime] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editFeatured, setEditFeatured] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Fetch all blogs
  const fetchBlogs = async () => {
    setLoadingList(true);
    try {
      const response = await axios.get(backendUrl + "/api/blog/list");
      if (response.data && response.data.success) {
        setBlogList(response.data.blogs || []);
      }
    } catch (error) {
      console.error("Fetch blogs error:", error);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // One-Click Seed Starter Articles
  const handleSeedStarterBlogs = async () => {
    setSeeding(true);
    try {
      const response = await axios.post(
        backendUrl + "/api/blog/seed",
        {},
        { headers: { token: adminToken } }
      );
      if (response.data.success) {
        toast.success(response.data.message || "Starter articles loaded!");
        await fetchBlogs();
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

  // Filtered blogs for Admin list
  const filteredBlogs = useMemo(() => {
    return blogList.filter((b) => {
      const q = searchQuery.toLowerCase();
      return (
        b.title?.toLowerCase().includes(q) ||
        b.category?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q)
      );
    });
  }, [blogList, searchQuery]);

  // Insert helper markdown tag into content textarea
  const insertContentTag = (tag, isEdit = false) => {
    if (isEdit) {
      setEditContent((prev) => prev + "\n\n" + tag);
    } else {
      setContent((prev) => prev + "\n\n" + tag);
    }
  };

  // 1. Submit Add Blog Form
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!imageFile && !imageUrl.trim()) {
      toast.error("Please provide a banner image (upload file or paste URL)");
      return;
    }

    if (!title.trim() || !summary.trim() || !content.trim()) {
      toast.error("Please fill in the title, summary, and article content");
      return;
    }

    setSubmitting(true);
    try {
      const finalCategory =
        category === "CUSTOM" ? customCategory.trim() : category;

      const formData = new FormData();
      if (imageFile) {
        formData.append("image", imageFile);
      }
      formData.append("imageUrl", imageUrl.trim());
      formData.append("title", title);
      formData.append("category", finalCategory || "Tech & Gadgets");
      formData.append("author", author);
      formData.append("authorRole", authorRole);
      formData.append("authorAvatar", authorAvatar);
      formData.append("readTime", readTime);
      formData.append("summary", summary);
      formData.append("content", content);
      formData.append("featured", featured);

      const response = await axios.post(
        backendUrl + "/api/blog/add",
        formData,
        { headers: { token: adminToken } }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Blog published!");
        // Reset form
        setTitle("");
        setCategory("Tech & Gadgets");
        setCustomCategory("");
        setSummary("");
        setContent("");
        setImageFile(null);
        setImageUrl("");
        setFeatured(false);
        setActiveTab("list");
        await fetchBlogs();
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

  // 2. Open Edit Modal
  const handleOpenEdit = (blog) => {
    setEditingBlog(blog);
    setEditTitle(blog.title || "");
    setEditCategory(blog.category || "Tech & Gadgets");
    setEditAuthor(blog.author || "TrendyTek Editorial");
    setEditAuthorRole(blog.authorRole || "Product Specialist");
    setEditAuthorAvatar(blog.authorAvatar || "");
    setEditReadTime(blog.readTime || "4 min read");
    setEditSummary(blog.summary || "");
    setEditContent(blog.content || "");
    setEditFeatured(!!blog.featured);
    setEditImageFile(null);
    setEditImageUrl(blog.image || "");
  };

  // 3. Submit Edit Modal
  const onEditSubmitHandler = async (e) => {
    e.preventDefault();
    if (!editingBlog) return;

    setEditSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("id", editingBlog._id);
      formData.append("title", editTitle);
      formData.append("category", editCategory);
      formData.append("author", editAuthor);
      formData.append("authorRole", editAuthorRole);
      formData.append("authorAvatar", editAuthorAvatar);
      formData.append("readTime", editReadTime);
      formData.append("summary", editSummary);
      formData.append("content", editContent);
      formData.append("featured", editFeatured);

      if (editImageFile) {
        formData.append("image", editImageFile);
      } else if (editImageUrl) {
        formData.append("imageUrl", editImageUrl);
      }

      const response = await axios.post(
        backendUrl + "/api/blog/update",
        formData,
        { headers: { token: adminToken } }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Blog updated successfully!");
        setEditingBlog(null);
        setEditImageFile(null);
        await fetchBlogs();
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

  // 4. Delete Blog
  const handleDeleteBlog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) {
      return;
    }

    try {
      const response = await axios.post(
        backendUrl + "/api/blog/remove",
        { id },
        { headers: { token: adminToken } }
      );

      if (response.data.success) {
        toast.info(response.data.message || "Blog post deleted");
        await fetchBlogs();
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
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-gray-200 rounded-xl shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Store Blog</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Publish guides, tech reviews, and announcements directly to your TrendyTek storefront.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {blogList.length === 0 && (
            <button
              onClick={handleSeedStarterBlogs}
              disabled={seeding}
              className="px-4 py-2 text-xs sm:text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 rounded-md transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              title="Load 4 pre-written high quality starter articles"
            >
              <span>⚡</span> {seeding ? "Loading..." : "Load 4 Starter Articles"}
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
              📋 All Articles ({blogList.length})
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === "create"
                  ? "bg-black text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              ✍️ Write New Article
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ALL ARTICLES LIST                                                  */}
      {/* ========================================================================= */}
      {activeTab === "list" && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
          {/* Search bar & Quick Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search articles by title, author, category..."
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
                onClick={fetchBlogs}
                className="px-3.5 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
                title="Refresh list from database"
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => setActiveTab("create")}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold uppercase tracking-wider bg-black text-white rounded-lg hover:bg-gray-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>+</span> Add Article
              </button>
            </div>
          </div>

          {/* Table / Cards */}
          {loadingList ? (
            <div className="py-16 text-center text-gray-500 animate-pulse">
              <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading articles from database...
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="py-16 text-center bg-gray-50/60 border border-dashed border-gray-300 rounded-2xl p-6">
              <p className="text-3xl mb-2">📰</p>
              <p className="text-lg font-bold text-gray-800">No blog articles yet</p>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mt-1 mb-6">
                Your blog database is currently empty. You can write your first article or click the button below to load 4 starter articles with one click!
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleSeedStarterBlogs}
                  disabled={seeding}
                  className="px-6 py-2.5 text-xs sm:text-sm font-bold bg-amber-500 text-white rounded-lg hover:bg-amber-600 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  {seeding ? "Loading..." : "⚡ Load 4 Starter Articles"}
                </button>
                <button
                  onClick={() => setActiveTab("create")}
                  className="px-6 py-2.5 text-xs sm:text-sm font-bold bg-black text-white rounded-lg hover:bg-gray-800 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  ✍️ Write New Article
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredBlogs.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-xl gap-4 hover:border-gray-300 hover:shadow-xs transition-all bg-gray-50/50"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-24 h-16 sm:w-28 sm:h-20 object-cover rounded-lg border border-gray-200 shrink-0 bg-white"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-black text-white rounded-full">
                          {item.category}
                        </span>
                        {item.featured && (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white rounded-full">
                            ⭐ Featured
                          </span>
                        )}
                        <span className="text-[11px] text-gray-400">
                          {item.date} • {item.readTime}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                        By <b className="text-gray-700">{item.author}</b> — {item.summary}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <span className="text-xs text-gray-500 font-semibold mr-2 flex items-center gap-1">
                      ❤️ {item.likes || 0}
                    </span>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition-all cursor-pointer shadow-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBlog(item._id)}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 active:scale-95 transition-all cursor-pointer shadow-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: WRITE NEW ARTICLE FORM                                             */}
      {/* ========================================================================= */}
      {activeTab === "create" && (
        <form
          onSubmit={onSubmitHandler}
          className="flex flex-col gap-6 p-6 sm:p-8 bg-white border border-gray-200 rounded-xl shadow-xs"
        >
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">✍️ Publish New Blog Post</h3>
            <button
              type="button"
              onClick={() => setActiveTab("list")}
              className="text-xs font-semibold text-gray-600 hover:text-black underline cursor-pointer"
            >
              Cancel & View All
            </button>
          </div>

          {/* Banner Image Upload & URL */}
          <div className="flex flex-col sm:flex-row gap-6">
            <div>
              <p className="mb-2 text-xs sm:text-sm font-semibold text-gray-700">
                Banner Image File (Upload)
              </p>
              <label htmlFor="blogBanner" className="cursor-pointer inline-block">
                <img
                  className="object-cover w-44 h-28 border-2 border-dashed border-gray-400 rounded-xl hover:border-black transition-all bg-gray-50"
                  src={imageFile ? URL.createObjectURL(imageFile) : assets.upload_area}
                  alt="Upload Banner"
                />
                <input
                  type="file"
                  id="blogBanner"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    setImageFile(e.target.files[0]);
                    setImageUrl("");
                  }}
                />
              </label>
            </div>

            <div className="flex-1">
              <p className="mb-2 text-xs sm:text-sm font-semibold text-gray-700">
                Or Paste Image Direct URL
              </p>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  if (e.target.value) setImageFile(null);
                }}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm focus:border-black outline-none"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Tip: High resolution horizontal photos (e.g. from Unsplash) look best.
              </p>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block mb-1 text-xs sm:text-sm font-semibold text-gray-700">
              Article Title / Headline *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 10 Must-Have Gadgets & Trends in 2026"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium focus:border-black outline-none"
            />
          </div>

          {/* Category & Read Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-xs sm:text-sm font-semibold text-gray-700">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-black outline-none bg-white"
              >
                {BLOG_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
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
                Estimated Reading Time
              </label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="e.g. 4 min read"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-black outline-none"
              />
            </div>
          </div>

          {/* Author Name, Role, and Avatar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 text-xs sm:text-sm font-semibold text-gray-700">
                Author Name
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-black outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 text-xs sm:text-sm font-semibold text-gray-700">
                Author Role / Title
              </label>
              <input
                type="text"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-black outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 text-xs sm:text-sm font-semibold text-gray-700">
                Author Avatar Image URL
              </label>
              <input
                type="text"
                value={authorAvatar}
                onChange={(e) => setAuthorAvatar(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-black outline-none"
              />
            </div>
          </div>

          {/* Short Excerpt / Summary */}
          <div>
            <label className="block mb-1 text-xs sm:text-sm font-semibold text-gray-700">
              Short Summary / Excerpt *
            </label>
            <textarea
              required
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief 1-2 sentence hook displayed on cards and search previews..."
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-black outline-none"
            />
          </div>

          {/* Full Content Textarea with Helper Tags */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">
                Full Article Content *
              </label>
              <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                <span className="text-gray-400">Quick Insert:</span>
                <button
                  type="button"
                  onClick={() => insertContentTag("### New Section Title")}
                  className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded font-mono text-gray-700"
                >
                  ### Heading
                </button>
                <button
                  type="button"
                  onClick={() => insertContentTag("> “Memorable quote or highlight”")}
                  className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded font-mono text-gray-700"
                >
                  &gt; Quote
                </button>
                <button
                  type="button"
                  onClick={() => insertContentTag("1. Point one\n2. Point two")}
                  className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded font-mono text-gray-700"
                >
                  1. List
                </button>
              </div>
            </div>
            <textarea
              required
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your full article body here. Separate paragraphs with an empty line..."
              className="w-full px-3.5 py-3 border border-gray-300 rounded-lg text-sm leading-relaxed focus:border-black outline-none font-sans"
            />
          </div>

          {/* Featured Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featuredCheck"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 cursor-pointer accent-black"
            />
            <label
              htmlFor="featuredCheck"
              className="text-xs sm:text-sm font-semibold text-gray-800 cursor-pointer"
            >
              ⭐ Feature this story at the top of the blog page
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("list")}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider bg-black text-white rounded-lg hover:bg-gray-800 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              {submitting ? "Publishing..." : "Publish Article"}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 3. EDIT BLOG MODAL POPUP                                                  */}
      {/* ========================================================================= */}
      {editingBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                ✏️ Edit Article: {editingBlog.title}
              </h3>
              <button
                onClick={() => setEditingBlog(null)}
                className="text-gray-400 hover:text-gray-700 text-2xl font-bold leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={onEditSubmitHandler} className="flex flex-col gap-5">
              {/* Image Preview & Edit */}
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div>
                  <p className="mb-1 text-xs font-semibold text-gray-700">
                    Click to replace image file:
                  </p>
                  <label htmlFor="editBlogBanner" className="cursor-pointer inline-block">
                    <img
                      className="object-cover w-40 h-24 border-2 border-dashed border-blue-400 rounded-lg hover:opacity-80 transition-all bg-gray-50"
                      src={
                        editImageFile
                          ? URL.createObjectURL(editImageFile)
                          : editImageUrl || assets.upload_area
                      }
                      alt="Preview"
                    />
                    <input
                      type="file"
                      id="editBlogBanner"
                      hidden
                      accept="image/*"
                      onChange={(e) => setEditImageFile(e.target.files[0])}
                    />
                  </label>
                </div>

                <div className="flex-1 w-full">
                  <p className="mb-1 text-xs font-semibold text-gray-700">
                    Or update direct image URL:
                  </p>
                  <input
                    type="text"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">
                  Article Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              {/* Category & Read Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-xs font-semibold text-gray-700">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-semibold text-gray-700">
                    Read Time
                  </label>
                  <input
                    type="text"
                    value={editReadTime}
                    onChange={(e) => setEditReadTime(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Author & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-xs font-semibold text-gray-700">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-semibold text-gray-700">
                    Author Role
                  </label>
                  <input
                    type="text"
                    value={editAuthorRole}
                    onChange={(e) => setEditAuthorRole(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">
                  Summary / Excerpt
                </label>
                <textarea
                  rows={2}
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Full Content
                  </label>
                  <div className="flex gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => insertContentTag("### New Heading", true)}
                      className="px-1.5 py-0.5 bg-gray-100 rounded"
                    >
                      + Heading
                    </button>
                    <button
                      type="button"
                      onClick={() => insertContentTag("> “Quote”", true)}
                      className="px-1.5 py-0.5 bg-gray-100 rounded"
                    >
                      + Quote
                    </button>
                  </div>
                </div>
                <textarea
                  rows={8}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              {/* Featured checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editFeaturedCheck"
                  checked={editFeatured}
                  onChange={(e) => setEditFeatured(e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-black"
                />
                <label
                  htmlFor="editFeaturedCheck"
                  className="text-xs sm:text-sm font-semibold text-gray-800 cursor-pointer"
                >
                  ⭐ Featured Story
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingBlog(null)}
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
                  {editSubmitting ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBlog;