import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import ConfirmDialog from "../components/ConfirmDialog";

const Categories = ({ token }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Destructive Action Modal State
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [subCategoryInput, setSubCategoryInput] = useState("");
  const [subCategoriesList, setSubCategoriesList] = useState([]);
  const [hasSizes, setHasSizes] = useState(false);
  const [editId, setEditId] = useState(null);

  const adminToken = token || localStorage.getItem("token") || "";

  // 1. Fetch all categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/category/list");
      if (response.data.success) {
        setCategories(response.data.categories);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. Add single sub-category tag to draft list
  const addSubCategoryTag = () => {
    if (!subCategoryInput.trim()) return;
    const newItems = subCategoryInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setSubCategoriesList((prev) => Array.from(new Set([...prev, ...newItems])));
    setSubCategoryInput("");
  };

  const removeSubCategoryTag = (indexToRemove) => {
    setSubCategoriesList((prev) =>
      prev.filter((_, idx) => idx !== indexToRemove)
    );
  };

  const resetForm = () => {
    setName("");
    setSubCategoryInput("");
    setSubCategoriesList([]);
    setHasSizes(false);
    setEditId(null);
  };

  // 3. Load category into form for Editing
  const startEdit = (cat) => {
    setEditId(cat._id);
    setName(cat.name);
    setSubCategoriesList(cat.subCategories || []);
    setHasSizes(Boolean(cat.hasSizes));
    setSubCategoryInput("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 4. Handle Submit (Add or Update)
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    let finalSubs = [...subCategoriesList];
    if (subCategoryInput.trim()) {
      const extra = subCategoryInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      finalSubs = Array.from(new Set([...finalSubs, ...extra]));
    }

    setLoading(true);
    try {
      if (editId) {
        const response = await axios.post(
          backendUrl + "/api/category/update",
          {
            id: editId,
            name: name.trim(),
            subCategories: finalSubs,
            hasSizes: hasSizes,
          },
          { headers: { token: adminToken } }
        );

        if (response.data.success) {
          toast.success(response.data.message);
          resetForm();
          await fetchCategories();
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(
          backendUrl + "/api/category/add",
          {
            name: name.trim(),
            subCategories: finalSubs,
            hasSizes: hasSizes,
          },
          { headers: { token: adminToken } }
        );

        if (response.data.success) {
          toast.success(response.data.message);
          resetForm();
          await fetchCategories();
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. Perform Category Deletion after Confirmation Dialog
  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setIsDeletingCategory(true);
      const response = await axios.post(
        backendUrl + "/api/category/remove",
        { id: categoryToDelete._id },
        { headers: { token: adminToken } }
      );

      if (response.data.success) {
        toast.info(response.data.message || `Category "${categoryToDelete.name}" deleted.`);
        if (editId === categoryToDelete._id) resetForm();
        setCategoryToDelete(null);
        await fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsDeletingCategory(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Add / Edit Form */}
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col items-start w-full gap-4 p-6 bg-white border border-gray-200 shadow-sm rounded-2xl"
      >
        <div className="flex items-center justify-between w-full pb-3 border-b">
          <h3 className="text-xl font-bold text-gray-800">
            {editId ? "✏️ Edit Category" : "➕ Add New Category"}
          </h3>
          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {/* Category Name */}
        <div className="w-full max-w-[550px]">
          <p className="mb-1.5 text-sm font-semibold text-gray-700">
            Category Name
          </p>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-black font-medium"
            type="text"
            placeholder="e.g. Electronics, Footwear, Jewelry, Books"
            required
          />
        </div>

        {/* Sub-Categories Input */}
        <div className="w-full max-w-[550px]">
          <p className="mb-1.5 text-sm font-semibold text-gray-700">
            Sub-Categories / Types (Comma-separated)
          </p>
          <div className="flex gap-2">
            <input
              onChange={(e) => setSubCategoryInput(e.target.value)}
              value={subCategoryInput}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSubCategoryTag();
                }
              }}
              className="flex-1 px-3.5 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-black"
              type="text"
              placeholder="Type and press Enter or 'Add' (e.g. Phones, Laptops)"
            />
            <button
              type="button"
              onClick={addSubCategoryTag}
              className="px-4 py-2 text-xs font-bold text-white bg-gray-800 rounded-lg hover:bg-black cursor-pointer"
            >
              Add
            </button>
          </div>

          {subCategoriesList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 p-3 bg-gray-50 border rounded-lg">
              {subCategoriesList.map((sub, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-full shadow-2xs"
                >
                  {sub}
                  <button
                    type="button"
                    onClick={() => removeSubCategoryTag(idx)}
                    className="w-3.5 h-3.5 text-gray-400 hover:text-red-600 font-bold leading-3 text-center cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Enable Sizes */}
        <div className="flex items-center gap-2.5 pt-1">
          <input
            type="checkbox"
            id="hasSizes"
            checked={hasSizes}
            onChange={(e) => setHasSizes(e.target.checked)}
            className="w-4 h-4 rounded cursor-pointer accent-black"
          />
          <label
            htmlFor="hasSizes"
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            Enable Clothing Sizes (S, M, L, XL, XXL) for this category
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-8 py-2.5 mt-2 text-sm font-bold text-white bg-black rounded-lg hover:bg-gray-800 active:scale-95 transition-all shadow-md cursor-pointer"
        >
          {loading
            ? "Saving..."
            : editId
            ? "Update Category"
            : "Save Category"}
        </button>
      </form>

      {/* Category List */}
      <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-2xl">
        <h3 className="mb-4 text-xl font-bold text-gray-800">
          Store Categories ({categories.length})
        </h3>

        {categories.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            No categories found. Add your first category above!
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="flex flex-col justify-between gap-3 p-4 transition-all bg-gray-50 border border-gray-200 rounded-xl hover:bg-white hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="text-base font-bold text-gray-900">
                      {cat.name}
                    </h4>
                    <span
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                        cat.hasSizes
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {cat.hasSizes ? "👕 Sizes Active" : "📦 No Sizes"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {cat.subCategories && cat.subCategories.length > 0 ? (
                      cat.subCategories.map((sub, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 text-xs text-gray-700 bg-white border border-gray-300 rounded-md"
                        >
                          {sub}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs italic text-gray-400">
                        No sub-categories
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => startEdit(cat)}
                    className="px-3 py-1 text-xs font-semibold text-gray-700 transition-colors bg-white border border-gray-300 rounded hover:bg-gray-100 cursor-pointer"
                  >
                    ✏️ Edit
                  </button>
                  {/* Triggers confirmation dialog */}
                  <button
                    onClick={() => setCategoryToDelete(cat)}
                    className="px-3 py-1 text-xs font-semibold text-white transition-colors bg-red-500 rounded hover:bg-red-600 cursor-pointer active:scale-95"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🛡️ Destructive Action Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleConfirmDeleteCategory}
        isLoading={isDeletingCategory}
        title="Are you sure?"
        message="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  );
};

export default Categories;