import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route } from "react-router-dom";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import Slides from "./pages/Slides";
import Categories from "./pages/Categories";
import ManageLogo from "./pages/ManageLogo";
import ManageFooter from "./pages/ManageFooter";
import ManageBank from "./pages/ManageBank";
import ManagePayments from "./pages/ManagePayments";
import ManageShipping from "./pages/ManageShipping";
import ManageAbout from "./pages/ManageAbout";
import ManageContact from "./pages/ManageContact";
import ManageBlog from "./pages/ManageBlog";
import ManageFaq from "./pages/ManageFaq";
import Login from "./components/Login";
import ManageUsers from "./pages/ManageUsers";
import AuditLogs from "./pages/AuditLogs";
import Dashboard from "./pages/Dashboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const backendUrl =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
export const currency = "$";

const App = () => {
  const [token, setToken] = useState(
    localStorage.getItem("adminToken") || ""
  );
  const [currency, setCurrency] = useState("$");

  // Keep adminToken synced cleanly: remove when logged out, save when logged in
  useEffect(() => {
    if (token) {
      localStorage.setItem("adminToken", token);
    } else {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("token");
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      {!token ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar
            setToken={setToken}
            token={token}
            currency={currency}
            setCurrency={setCurrency}
          />
          <hr />
          <div className="flex w-full">
            <Sidebar />
            <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
              <Routes>
                <Route path="/add" element={<Add token={token} />} />
                <Route
                  path="/list"
                  element={<List token={token} currency={currency} />}
                />
                <Route
                  path="/orders"
                  element={<Orders token={token} currency={currency} />}
                />
                <Route path="/categories" element={<Categories token={token} />} />
                <Route path="/slides" element={<Slides token={token} />} />
                <Route path="/logo" element={<ManageLogo token={token} />} />
                <Route path="/bank-details" element={<ManageBank token={token} />} />
                <Route path="/payments" element={<ManagePayments token={token} />} />
                <Route path="/shipping" element={<ManageShipping token={token} currency={currency} />} />
                <Route path="/blog" element={<ManageBlog token={token} />} />
                <Route path="/faq" element={<ManageFaq token={token} />} />
                <Route path="/footer" element={<ManageFooter token={token} />} />
                <Route path="/users" element={<ManageUsers token={token} />} />
                <Route path="/audit-logs" element={<AuditLogs token={token} />} />
                <Route path="/about-page" element={<ManageAbout token={token} />} />
                <Route path="/" element={<Dashboard token={token} currency={currency} />} />
                <Route path="/dashboard" element={<Dashboard token={token} currency={currency} />} />
                <Route
                  path="/contact-page"
                  element={<ManageContact token={token} />}
                />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;