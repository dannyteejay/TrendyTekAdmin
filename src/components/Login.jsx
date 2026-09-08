import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [logo, setLogo] = useState(localStorage.getItem("adminStoreLogo") || "");
  const [storeName, setStoreName] = useState(
    localStorage.getItem("storeName") || "TrendyTek"
  );
  const [loading, setLoading] = useState(false);

  // Fetch active store logo on load from backend
  useEffect(() => {
    const fetchSettings = async () => {
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
        }
      } catch (error) {
        console.error("Failed to fetch store settings for admin login:", error);
      }
    };
    fetchSettings();
  }, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(backendUrl + "/api/user/admin", {
        email: email.trim(),
        password: password.trim(),
      });

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("adminToken", response.data.token);
        toast.success("Welcome to Admin Dashboard!");
      } else {
        toast.error(response.data.message || "Invalid email or password");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || error.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gray-50 px-4">
      <div className="bg-white shadow-xl rounded-2xl px-8 py-10 max-w-md w-full border border-gray-200 animate-fade-in">
        {/* Dynamic Brand Logo (Shows Custom Logo or TrendyTek Brand) */}
        <div className="flex flex-col items-center justify-center mb-6 text-center">
          {logo ? (
            <img
              className="object-contain h-14 sm:h-16 w-auto max-w-[260px] mb-3 transition-all"
              src={logo}
              alt={storeName || "TrendyTek"}
            />
          ) : (
            <div className="flex items-center gap-1 select-none mb-3 py-1">
              <span className="text-3xl font-black tracking-tight text-gray-900 uppercase font-sans">
                TRENDY<span className="text-blue-600">TEK</span>
              </span>
            </div>
          )}
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Sign in to manage products, orders, logo & settings
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={onSubmitHandler} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-black transition-all"
              type="email"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-black transition-all"
              type="password"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            disabled={loading}
            className={`w-full py-3 mt-2 text-xs sm:text-sm font-bold text-white uppercase tracking-wider bg-black rounded-lg hover:bg-gray-800 active:scale-95 shadow-md transition-all cursor-pointer ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
            type="submit"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;