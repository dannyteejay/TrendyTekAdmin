import React from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";

const Sidebar = () => {
  return (
    <div className="w-[18%] min-h-screen border-r-2 border-gray-200 bg-white">
      <div className="flex flex-col gap-4 pt-6 pl-[20%] text-[15px]">
        {/* Add Product */}
        <NavLink
          className="flex items-center gap-3 px-3 py-2 border border-r-0 border-gray-300 rounded-l hover:bg-gray-100"
          to="/add"
        >
          <img className="w-5 h-5" src={assets.add_icon} alt="Add Icon" />
          <p className="hidden md:block">Add Items</p>
        </NavLink>

        {/* List Products */}
        <NavLink
          className="flex items-center gap-3 px-3 py-2 border border-r-0 border-gray-300 rounded-l hover:bg-gray-100"
          to="/list"
        >
          <img className="w-5 h-5" src={assets.order_icon} alt="List Icon" />
          <p className="hidden md:block">List Items</p>
        </NavLink>

        {/* Orders */}
        <NavLink
          className="flex items-center gap-3 px-3 py-2 border border-r-0 border-gray-300 rounded-l hover:bg-gray-100"
          to="/orders"
        >
          <img className="w-5 h-5" src={assets.order_icon} alt="Orders Icon" />
          <p className="hidden md:block">Orders</p>
        </NavLink>

        {/* Categories */}
        <NavLink
          className="flex items-center gap-3 px-3 py-2 border border-r-0 border-gray-300 rounded-l hover:bg-gray-100"
          to="/categories"
        >
          <img className="w-5 h-5" src={assets.add_icon} alt="Category Icon" />
          <p className="hidden font-medium md:block">Categories</p>
        </NavLink>

        {/* Home Slides */}
        <NavLink
          className="flex items-center gap-3 px-3 py-2 border border-r-0 border-gray-300 rounded-l hover:bg-gray-100"
          to="/slides"
        >
          <img className="w-5 h-5" src={assets.add_icon} alt="Slide Icon" />
          <p className="hidden font-medium md:block">Home Slides</p>
        </NavLink>

        {/* Website Logo */}
        <NavLink
          className="flex items-center gap-3 px-3 py-2 border border-r-0 border-gray-300 rounded-l hover:bg-gray-100"
          to="/logo"
        >
          <img className="w-5 h-5" src={assets.add_icon} alt="Logo Icon" />
          <p className="hidden font-medium md:block">Store Logo</p>
        </NavLink>

        {/* 🏛️ Bank Transfer Gateway Link */}
        <NavLink
          className="flex items-center gap-3 px-3 py-2 border border-r-0 border-gray-300 rounded-l hover:bg-gray-100"
          to="/bank-details"
        >
          <img className="w-5 h-5" src={assets.order_icon} alt="Bank Icon" />
          <p className="hidden font-medium md:block">Bank Transfer</p>
        </NavLink>

        {/* Footer Settings */}
        <NavLink
          className="flex items-center gap-3 px-3 py-2 border border-r-0 border-gray-300 rounded-l hover:bg-gray-100"
          to="/footer"
        >
          <img className="w-5 h-5" src={assets.order_icon} alt="Footer Icon" />
          <p className="hidden font-medium md:block">Footer / Home Info</p>
        </NavLink>

        {/* About Page */}
        <NavLink
          className="flex items-center gap-3 px-3 py-2 border border-r-0 border-gray-300 rounded-l hover:bg-gray-100"
          to="/about-page"
        >
          <img className="w-5 h-5" src={assets.order_icon} alt="About Icon" />
          <p className="hidden font-medium md:block">About Page</p>
        </NavLink>

        {/* Contact Page */}
        <NavLink
          className="flex items-center gap-3 px-3 py-2 border border-r-0 border-gray-300 rounded-l hover:bg-gray-100"
          to="/contact-page"
        >
          <img className="w-5 h-5" src={assets.order_icon} alt="Contact Icon" />
          <p className="hidden font-medium md:block">Contact Page</p>
        </NavLink>
        <NavLink
          className="flex items-center gap-3 px-3 py-2 border border-r-0 border-gray-300 rounded-l hover:bg-gray-100"
          to="/blog"
>
          <img className="w-5 h-5" src={assets.order_icon} alt="Blog Icon" />
          <p className="hidden font-medium md:block">Store Blog</p>
        </NavLink>
        <NavLink
          className="flex items-center gap-3 px-3 py-2 border border-r-0 border-gray-300 rounded-l hover:bg-gray-100"
          to="/faq"
>
          <img className="w-5 h-5" src={assets.order_icon} alt="FAQ Icon" />
          <p className="hidden font-medium md:block">Store FAQs</p>
        </NavLink>
        <NavLink
          className="flex items-center gap-3 px-3 py-2 border border-r-0 border-gray-300 rounded-l hover:bg-gray-100"
          to="/users"
>
         <img className="w-5 h-5" src={assets.order_icon} alt="Users Icon" />
         <p className="hidden font-medium md:block">Manage Users</p>
       </NavLink>
      {/* Sales Analytics Dashboard */}
      <NavLink
        className="flex items-center gap-3 px-3 py-2 border border-r-0 border-gray-300 rounded-l hover:bg-gray-100"
        to="/dashboard"
>
        <img className="w-5 h-5" src={assets.order_icon} alt="Analytics Icon" />
        <p className="hidden font-medium md:block">Sales Analytics</p>
      </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;