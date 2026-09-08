import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const CURRENCIES = [
  { symbol: "$", code: "USD", name: "US Dollar ($)" },
  { symbol: "€", code: "EUR", name: "Euro (€)" },
  { symbol: "£", code: "GBP", name: "British Pound (£)" },
  { symbol: "₦", code: "NGN", name: "Nigerian Naira (₦)" },
  { symbol: "₹", code: "INR", name: "Indian Rupee (₹)" },
  { symbol: "C$", code: "CAD", name: "Canadian Dollar (C$)" },
  { symbol: "A$", code: "AUD", name: "Australian Dollar (A$)" },
  { symbol: "GH₵", code: "GHS", name: "Ghanaian Cedi (GH₵)" },
  { symbol: "KSh", code: "KES", name: "Kenyan Shilling (KSh)" },
  { symbol: "R", code: "ZAR", name: "South African Rand (R)" },
];

const Navbar = ({ setToken, token, currency, setCurrency }) => {
  const [logo, setLogo] = useState("");
  const adminToken =
    token ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token") ||
    "";

  // Fetch store logo & currency on load
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await axios.get(backendUrl + "/api/settings/get");
        if (response.data && response.data.success && response.data.settings) {
          if (response.data.settings.logo) {
            setLogo(response.data.settings.logo);
          }
          if (
            response.data.settings.currency &&
            setCurrency &&
            typeof setCurrency === "function"
          ) {
            setCurrency(response.data.settings.currency);
          }
        }
      } catch (error) {
        console.error("Failed to load settings from backend:", error);
      }
    };
    loadSettings();
  }, [backendUrl, setCurrency]);

  const handleCurrencyChange = async (e) => {
    const newCurrency = e.target.value;
    if (setCurrency) setCurrency(newCurrency);

    try {
      const response = await axios.post(
        backendUrl + "/api/settings/currency",
        { currency: newCurrency },
        { headers: { token: adminToken } }
      );

      if (response.data.success) {
        toast.success(`Store currency switched to ${newCurrency}`);
      } else {
        toast.error(response.data.message || "Failed to update currency");
      }
    } catch (error) {
      console.error(error);
      if (error.response?.status === 404) {
        toast.error(
          "Backend not restarted! Please restart your backend terminal."
        );
      } else {
        toast.error(
          error.response?.data?.message || "Failed to update currency in database"
        );
      }
    }
  };

  // ✅ 1. Proper Clean Logout handler (clears both adminToken and token)
  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    toast.info("Logged out from Admin Dashboard");
  };

  return (
    <div className="flex items-center py-2.5 px-[4%] justify-between bg-white border-b border-gray-200">
      {/* Brand Logo */}
      <div className="flex items-center gap-2.5">
        <img
          className="object-contain h-9 sm:h-11 md:h-12 w-auto max-w-[180px] sm:max-w-[240px] md:max-w-[280px]"
          src={logo || assets.logo}
          alt="Admin Logo"
        />
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-black text-white rounded">
          Admin
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Currency Selector */}
        <div className="flex items-center gap-1.5 bg-gray-100 border border-gray-300 rounded-lg px-2.5 py-1.5">
          <span className="text-xs font-semibold text-gray-500">
            Store Currency:
          </span>
          <select
            value={currency || "$"}
            onChange={handleCurrencyChange}
            className="text-xs font-bold text-gray-800 bg-transparent outline-none cursor-pointer"
          >
            {CURRENCIES.map((c) => (
              <option key={c.symbol} value={c.symbol}>
                {c.symbol} - {c.code}
              </option>
            ))}
          </select>
        </div>

        {/* ✅ 2. Clean Logout Button */}
        <button
          onClick={handleLogout}
          className="px-5 py-2 text-xs font-medium text-white transition-all bg-gray-700 rounded-full sm:px-7 sm:py-2 sm:text-sm hover:bg-black cursor-pointer shadow-xs"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;