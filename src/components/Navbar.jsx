import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

// List of popular currencies for one-click selection
export const CURRENCY_OPTIONS = [
  { code: "NGN", symbol: "₦", label: "🇳🇬 Naira (₦)" },
  { code: "USD", symbol: "$", label: "🇺🇸 Dollar ($)" },
  { code: "EUR", symbol: "€", label: "🇪🇺 Euro (€)" },
  { code: "GBP", symbol: "£", label: "🇬🇧 Pound (£)" },
  { code: "INR", symbol: "₹", label: "🇮🇳 Rupee (₹)" },
  { code: "GHS", symbol: "GH₵", label: "🇬🇭 Cedi (GH₵)" },
  { code: "KES", symbol: "KSh", label: "🇰🇪 Shilling (KSh)" },
  { code: "ZAR", symbol: "R", label: "🇿🇦 Rand (R)" },
  { code: "CAD", symbol: "CA$", label: "🇨🇦 CAD (CA$)" },
  { code: "AUD", symbol: "AU$", label: "🇦🇺 AUD (AU$)" },
];

const Navbar = ({ setToken, token, currency, setCurrency }) => {
  const [selectedCurrency, setSelectedCurrency] = useState(
    currency || localStorage.getItem("adminCurrency") || "$"
  );
  const [isCustom, setIsCustom] = useState(false);
  const [customSymbol, setCustomSymbol] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch active store currency from backend on load
  const fetchCurrency = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/settings/get");
      if (response.data && response.data.success) {
        const activeCurr =
          response.data.settings?.currency || response.data.currency || "$";
        setSelectedCurrency(activeCurr);
        localStorage.setItem("adminCurrency", activeCurr);
        if (setCurrency && typeof setCurrency === "function") {
          setCurrency(activeCurr);
        }

        const exists = CURRENCY_OPTIONS.some((c) => c.symbol === activeCurr);
        if (!exists) {
          setIsCustom(true);
          setCustomSymbol(activeCurr);
        }
      }
    } catch (error) {
      console.error("Failed to load currency setting:", error);
    }
  };

  useEffect(() => {
    fetchCurrency();
  }, []);

  // Update currency on the backend
  const updateStoreCurrency = async (newSymbol, newCode = "") => {
    if (!newSymbol) return;

    const adminToken =
      token ||
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token") ||
      "";

    if (!adminToken) {
      toast.error("Admin not logged in. Please log out and log in again.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        backendUrl + "/api/settings/currency",
        { currency: newSymbol, currencyName: newCode },
        { headers: { token: adminToken } }
      );

      if (response.data && response.data.success) {
        setSelectedCurrency(newSymbol);
        localStorage.setItem("adminCurrency", newSymbol);
        if (setCurrency && typeof setCurrency === "function") {
          setCurrency(newSymbol);
        }
        toast.success(`Currency changed to ${newSymbol}`);
      } else {
        toast.error(response.data?.message || "Failed to update currency");
      }
    } catch (error) {
      console.error("Currency update error:", error);
      if (error.response?.status === 404) {
        toast.error(
          "Backend not restarted! Please restart your backend server in terminal."
        );
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || "Error updating currency");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDropdownChange = (e) => {
    const val = e.target.value;
    if (val === "CUSTOM") {
      setIsCustom(true);
    } else {
      setIsCustom(false);
      const option = CURRENCY_OPTIONS.find((c) => c.symbol === val);
      updateStoreCurrency(val, option ? option.code : "");
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customSymbol.trim()) {
      updateStoreCurrency(customSymbol.trim(), "CUSTOM");
    }
  };

  return (
    <div className="flex items-center justify-between px-[4%] py-2 border-b bg-white">
      {/* Brand Logo */}
      <img className="w-[max(10%,80px)]" src={assets.logo} alt="Trendify Logo" />

      {/* Right side: Currency Selector + Logout */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Currency Dropdown */}
        <div className="flex items-center gap-1.5 bg-gray-100 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm">
          <span className="hidden font-medium text-gray-600 sm:inline">
            Store Currency:
          </span>
          <select
            value={
              CURRENCY_OPTIONS.some((c) => c.symbol === selectedCurrency)
                ? selectedCurrency
                : "CUSTOM"
            }
            onChange={handleDropdownChange}
            disabled={loading}
            className="font-semibold text-gray-800 bg-transparent outline-none cursor-pointer"
          >
            {CURRENCY_OPTIONS.map((c) => (
              <option key={c.code} value={c.symbol}>
                {c.label}
              </option>
            ))}
            <option value="CUSTOM">✏️ Custom Symbol...</option>
          </select>
        </div>

        {/* Custom Symbol Input Popup (only if Custom is chosen) */}
        {isCustom && (
          <form onSubmit={handleCustomSubmit} className="flex items-center gap-1">
            <input
              type="text"
              value={customSymbol}
              onChange={(e) => setCustomSymbol(e.target.value)}
              placeholder="e.g. ₦ or AED"
              maxLength={6}
              className="w-16 px-2 py-1 text-xs border border-gray-400 rounded outline-none sm:w-20"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-2.5 py-1 text-xs text-white bg-black rounded hover:bg-gray-800"
            >
              Set
            </button>
          </form>
        )}

        {/* Logout Button */}
        <button
          onClick={() => setToken("")}
          className="px-4 py-2 text-xs text-white bg-gray-600 rounded-full sm:px-6 sm:text-sm active:bg-gray-700 hover:bg-gray-700 cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;