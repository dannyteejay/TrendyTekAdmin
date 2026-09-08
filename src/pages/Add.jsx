import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [price, setPrice] = useState("");
  const [sizes, setSizes] = useState([]);
  const [bestSeller, setBestSeller] = useState(false);

  // Dynamic Categories from Backend Database
  const [categoriesList, setCategoriesList] = useState([]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/category/list");
      if (response.data.success) {
        setCategoriesList(response.data.categories);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const currentCategoryObj = categoriesList.find((c) => c.name === category);
  const showSizes = currentCategoryObj ? Boolean(currentCategoryObj.hasSizes) : false;
  const availableSubCategories = currentCategoryObj
    ? currentCategoryObj.subCategories || []
    : [];

  const onCategoryChange = (e) => {
    const value = e.target.value;
    setCategory(value);
    setSubCategory("");
    const selectedObj = categoriesList.find((c) => c.name === value);
    if (!selectedObj || !selectedObj.hasSizes) {
      setSizes([]);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("price", price);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("bestSeller", bestSeller);

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        resetForm();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const resetForm = () => {
    setImage1(null);
    setImage2(null);
    setImage3(null);
    setImage4(null);
    setName("");
    setDescription("");
    setCategory("");
    setSubCategory("");
    setPrice("");
    setSizes([]);
    setBestSeller(false);
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-start w-full gap-4 pb-12"
    >
      {/* Upload Images */}
      <div>
        <p className="mb-2 text-sm font-semibold text-gray-700">Upload Product Image(s)</p>
        <div className="flex gap-2">
          <label htmlFor="image1">
            <img
              className="object-cover w-20 h-20 border-2 border-gray-400 border-dashed rounded-lg cursor-pointer hover:border-black"
              src={!image1 ? assets.upload_area : URL.createObjectURL(image1)}
              alt="Upload"
            />
            <input
              onChange={(e) => setImage1(e.target.files[0])}
              type="file"
              id="image1"
              hidden
              accept="image/*"
            />
          </label>
          <label htmlFor="image2">
            <img
              className="object-cover w-20 h-20 border-2 border-gray-400 border-dashed rounded-lg cursor-pointer hover:border-black"
              src={!image2 ? assets.upload_area : URL.createObjectURL(image2)}
              alt="Upload"
            />
            <input
              onChange={(e) => setImage2(e.target.files[0])}
              type="file"
              id="image2"
              hidden
              accept="image/*"
            />
          </label>
          <label htmlFor="image3">
            <img
              className="object-cover w-20 h-20 border-2 border-gray-400 border-dashed rounded-lg cursor-pointer hover:border-black"
              src={!image3 ? assets.upload_area : URL.createObjectURL(image3)}
              alt="Upload"
            />
            <input
              onChange={(e) => setImage3(e.target.files[0])}
              type="file"
              id="image3"
              hidden
              accept="image/*"
            />
          </label>
          <label htmlFor="image4">
            <img
              className="object-cover w-20 h-20 border-2 border-gray-400 border-dashed rounded-lg cursor-pointer hover:border-black"
              src={!image4 ? assets.upload_area : URL.createObjectURL(image4)}
              alt="Upload"
            />
            <input
              onChange={(e) => setImage4(e.target.files[0])}
              type="file"
              id="image4"
              hidden
              accept="image/*"
            />
          </label>
        </div>
      </div>

      {/* Product Name */}
      <div className="w-full max-w-[500px]">
        <p className="mb-1 text-sm font-semibold text-gray-700">Product Name</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-black"
          type="text"
          placeholder="Enter product title"
          required
        />
      </div>

      {/* Description */}
      <div className="w-full max-w-[500px]">
        <p className="mb-1 text-sm font-semibold text-gray-700">Product Description</p>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-black"
          placeholder="Write product specifications and details"
          rows={3}
          required
        />
      </div>

      {/* Category, SubCategory & Price */}
      <div className="flex flex-col w-full gap-3 sm:flex-row sm:gap-4 max-w-[500px]">
        {/* Dynamic Category Dropdown */}
        <div className="flex-1">
          <p className="mb-1 text-sm font-semibold text-gray-700">Category</p>
          <select
            onChange={onCategoryChange}
            value={category}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded outline-none focus:border-black"
            required
          >
            <option value="">Select Category</option>
            {categoriesList.map((cat) => (
              <option key={cat._id || cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Sub-Category Dropdown */}
        <div className="flex-1">
          <p className="mb-1 text-sm font-semibold text-gray-700">Sub-Category</p>
          <select
            onChange={(e) => setSubCategory(e.target.value)}
            value={subCategory}
            disabled={!category}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded outline-none focus:border-black disabled:opacity-50"
            required
          >
            <option value="">
              {category ? "Select Sub Category" : "Select Category first"}
            </option>
            {availableSubCategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div className="flex-1">
          <p className="mb-1 text-sm font-semibold text-gray-700">Price</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:border-black"
            type="number"
            placeholder="e.g. 5000"
            required
          />
        </div>
      </div>

      {/* Sizes Block */}
      {showSizes ? (
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">Product Sizes</p>
          <div className="flex gap-2">
            {["S", "M", "L", "XL", "XXL"].map((size) => (
              <div
                key={size}
                onClick={() =>
                  setSizes((prev) =>
                    prev.includes(size)
                      ? prev.filter((item) => item !== size)
                      : [...prev, size]
                  )
                }
              >
                <p
                  className={`${
                    sizes.includes(size)
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-800"
                  } px-3.5 py-1.5 cursor-pointer rounded-md font-medium text-xs sm:text-sm border transition-all`}
                >
                  {size}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        category && (
          <p className="text-xs text-gray-400">
            ℹ️ Clothing sizes are disabled for the "{category}" category.
          </p>
        )
      )}

      {/* Best Seller Checkbox */}
      <div className="flex items-center gap-2 mt-1">
        <input
          type="checkbox"
          id="bestSeller"
          checked={bestSeller}
          onChange={() => setBestSeller((prev) => !prev)}
          className="w-4 h-4 rounded cursor-pointer accent-black"
        />
        <label htmlFor="bestSeller" className="text-sm font-medium text-gray-700 cursor-pointer">
          Add to Best Seller
        </label>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 mt-3">
        <button
          type="submit"
          className="px-8 py-2.5 text-sm font-bold text-white bg-black rounded-lg hover:bg-gray-800 active:scale-95 transition-all shadow-md"
        >
          Add Product
        </button>
        <button
          type="button"
          onClick={resetForm}
          className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all"
        >
          Reset
        </button>
      </div>
    </form>
  );
};

export default Add;