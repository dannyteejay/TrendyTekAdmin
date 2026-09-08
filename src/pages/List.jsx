import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency as defaultCurrency } from "../App";
import { toast } from "react-toastify";

const List = ({ token, currency: propCurrency }) => {
  const [listProducts, setListProducts] = useState([]);

  // Use the dynamic currency from Admin Navbar, fallback to exported currency or '$'
  const activeCurrency = propCurrency || defaultCurrency || "$";

  const fetchListProducts = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");

      if (response.data.success) {
        setListProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/product/remove",
        { id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.info(response.data.message);
        await fetchListProducts();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchListProducts();
  }, []);

  return (
    <>
      <div className="flex flex-col gap-2">
        <p className="mb-2 text-lg font-semibold">All Products List</p>

        {/* List Table Title */}
        <div className="hidden md:grid grid-cols-[0.5fr_1fr_1.5fr_0.5fr_0.5fr_0.5fr_0.2fr] items-center py-1 px-2 border bg-gray-200 text-sm font-semibold text-center">
          <b>Image</b>
          <b className="text-left">Name</b>
          <b className="text-left">Description</b>
          <b>Category</b>
          <b>Sub Category</b>
          <b>Price</b>
          <b className="text-center">Action</b>
        </div>

        {/* Display Products */}
        {listProducts.map((item, index) => (
          <div
            className="grid grid-cols-[0.5fr_1fr_1.5fr_0.5fr_0.5fr_0.5fr_0.2fr] md:grid-cols-[0.5fr_1fr_1.5fr_0.5fr_0.5fr_0.5fr_0.2fr] items-center gap-2 py-1 px-2 border text-sm text-center"
            key={index}
          >
            <img
              className="object-cover w-12 h-12 mx-auto rounded"
              src={item.image && item.image[0] ? item.image[0] : ""}
              alt={item.name}
            />
            <p className="font-medium text-left line-clamp-1">{item.name}</p>
            <p className="text-xs text-left text-gray-500 line-clamp-2">
              {item.description}
            </p>
            <p>{item.category}</p>
            <p>{item.subCategory}</p>
            <p className="font-semibold">
              {activeCurrency}
              {item.price}
            </p>
            <p
              onClick={() => removeProduct(item._id)}
              className="w-6 h-6 mx-auto font-bold leading-6 text-center text-white bg-red-500 rounded-full cursor-pointer hover:bg-red-600 active:scale-95"
              title="Delete product"
            >
              X
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

export default List;