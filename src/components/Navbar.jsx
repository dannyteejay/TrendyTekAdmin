import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const CURRENCIES = [
  { symbol: "₦", code: "NGN", name: "Nigerian Naira (₦)" },
  { symbol: "$", code: "USD", name: "US Dollar ($)" },
  { symbol: "€", code: "EUR", name: "Euro (€)" },
  { symbol: "£", code: "GBP", name: "British Pound (£)" },
  { symbol: "₹", code: "INR", name: "Indian Rupee (₹)" },
  { symbol: "C$", code: "CAD", name: "Canadian Dollar (C$)" },
  { symbol: "A$", code: "AUD", name: "Australian Dollar (A$)" },
  { symbol: "GH₵", code: "GHS", name: "Ghanaian Cedi (GH₵)" },
  { symbol: "KSh", code: "KES", name: "Kenyan Shilling (KSh)" },
  { symbol: "R", code: "ZAR", name: "South African Rand (R)" },
];

const Navbar = ({ setToken, token, currency, setCurrency }) => {
  const [logo, setLogo] = useState(
    localStorage.getItem("adminStoreLogo") ||
      "https://res.cloudinary.com/mnlkie5f/image/upload/v1789507436/bpcelqaydv0js1qopikv.png"
  );
  const [storeName, setStoreName] = useState(
    localStorage.getItem("storeName") || "TRENDYTEK ENTERPRISES LIMITED"
  );
  const [selectedCurrency, setSelectedCurrency] = useState(currency || "₦");

  const adminToken =
    token ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token") ||
    "";

  // Fetch active store logo & currency on load
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await axios.get(backendUrl + "/api/settings/get");
        if (response.data && response.data.success && response.data.settings) {
          if (response.data.settings.logo) {
            setLogo(response.data.settings.logo);
            localStorage.setItem("adminStoreLogo", response.data.settings.logo);
          }
          if (response.data.settings.storeName) {
            setStoreName(response.data.settings.storeName);
            localStorage.setItem("storeName", response.data.settings.storeName);
          }
          if (response.data.settings.currency) {
            setSelectedCurrency(response.data.settings.currency);
            if (setCurrency && typeof setCurrency === "function") {
              setCurrency(response.data.settings.currency);
            }
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
    setSelectedCurrency(newCurrency);
    if (setCurrency && typeof setCurrency === "function") {
      setCurrency(newCurrency);
    }
    localStorage.setItem("adminCurrency", newCurrency);

    try {
      const response = await axios.post(
        backendUrl + "/api/settings/currency",
        { currency: newCurrency },
        {
          headers: {
            token: adminToken,
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      if (response.data?.success) {
        toast.success(`Store currency switched to ${newCurrency}`);
      } else {
        toast.error(response.data?.message || "Failed to update currency");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to update currency in database"
      );
    }
  };

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    localStorage.removeItem("adminStoreLogo");
    toast.info("Logged out from Admin Dashboard");
  };

  return (
    <div className="flex items-center py-2.5 px-[4%] justify-between bg-white border-b border-gray-200">
      {/* Dynamic Brand Logo */}
      <div className="flex items-center gap-2.5">
        {logo ? (
          <img
            className="object-contain h-10 sm:h-12 md:h-14 w-auto max-w-[200px] sm:max-w-[260px] md:max-w-[320px]"
            src={logo}
            alt={storeName || "TrendyTek Logo"}
          />
        ) : (
          <div className="flex items-center gap-1 select-none py-1">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 uppercase font-sans">
              TRENDY<span className="text-blue-600">TEK</span>
            </span>
          </div>
        )}
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-black text-white rounded">
          Admin
        </span>
      </div>

      {/* Right Controls: Currency & Logout */}
      <div className="flex items-center gap-3">
        {/* Currency Selector */}
        <div className="flex items-center gap-1.5 bg-gray-100 border border-gray-300 rounded-lg px-2.5 py-1.5">
          <span className="text-xs font-semibold text-gray-500">
            Store Currency:
          </span>
          <select
            value={selectedCurrency || currency || "₦"}
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

        {/* Logout Button */}
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