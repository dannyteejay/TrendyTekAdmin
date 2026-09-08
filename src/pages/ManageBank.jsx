import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const ManageBank = ({ token }) => {
  const [bankName, setBankName] = useState("Guaranty Trust Bank (GTBank)");
  const [accountName, setAccountName] = useState("TRENDYTEK ENTERPRISES LTD");
  const [accountNumber, setAccountNumber] = useState("0123456789");
  const [bankInstructions, setBankInstructions] = useState(
    "Please use your Order Name or Phone Number as payment narration."
  );
  const [loading, setLoading] = useState(false);
  const adminToken = token || localStorage.getItem("token") || "";

  // Fetch current store bank details
  const fetchBankDetails = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/settings/get");
      if (response.data && response.data.success && response.data.settings) {
        const s = response.data.settings;
        if (s.bankName) setBankName(s.bankName);
        if (s.accountName) setAccountName(s.accountName);
        if (s.accountNumber) setAccountNumber(s.accountNumber);
        if (s.bankInstructions) setBankInstructions(s.bankInstructions);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load bank details");
    }
  };

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        backendUrl + "/api/settings/bank-details",
        {
          bankName,
          accountName,
          accountNumber,
          bankInstructions,
        },
        { headers: { token: adminToken } }
      );

      if (response.data.success) {
        toast.success("Bank transfer details saved successfully!");
      } else {
        toast.error(response.data.message || "Failed to update bank details");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-14 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          🏛️ Bank Transfer Gateway Settings
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure the bank account details customers see during checkout when they select "Direct Bank Transfer".
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Form Card */}
        <form
          onSubmit={onSubmitHandler}
          className="flex flex-col gap-4 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm"
        >
          <h3 className="text-lg font-bold text-gray-800 border-b pb-3">
            Bank Account Information
          </h3>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Bank Name
            </label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. Guaranty Trust Bank (GTBank), Zenith, Access"
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-black transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Account Name / Beneficiary Name
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. TRENDYTEK ENTERPRISES LIMITED"
              className="w-full px-3.5 py-2.5 text-sm font-bold border border-gray-300 rounded-lg outline-none focus:border-black transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Account Number / IBAN
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="e.g. 0123456789"
              className="w-full px-3.5 py-2.5 text-sm font-mono font-bold border border-gray-300 rounded-lg outline-none focus:border-black transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Transfer Instructions / Narration Note
            </label>
            <textarea
              rows={3}
              value={bankInstructions}
              onChange={(e) => setBankInstructions(e.target.value)}
              placeholder="e.g. Please use your Order Name or Phone Number as payment narration."
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-black transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 mt-2 text-sm font-bold text-white bg-black rounded-lg hover:bg-gray-800 active:scale-95 shadow transition-all cursor-pointer ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Saving..." : "Save Bank Details"}
          </button>
        </form>

        {/* Live Customer Checkout Preview Card */}
        <div className="flex flex-col gap-3 p-6 bg-gray-50 border border-gray-200 rounded-2xl">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
              📱 Customer Checkout Preview
            </h3>
            <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">
              Live Preview
            </span>
          </div>

          <p className="text-xs text-gray-500">
            This is exactly how your Bank Transfer gateway card appears to buyers during checkout:
          </p>

          {/* Rendered Preview */}
          <div className="p-4 bg-white rounded-xl border-2 border-blue-600 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-full border border-blue-600 bg-blue-600 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                </span>
                <span className="text-sm font-bold text-gray-900">
                  🏛️ Direct Bank Transfer
                </span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded">
                Instant Details
              </span>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-xs flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Bank Name:</span>
                <span className="font-bold text-gray-900">{bankName || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Account Name:</span>
                <span className="font-bold text-gray-900">{accountName || "—"}</span>
              </div>
              <div className="flex justify-between items-center bg-white p-2 rounded border border-blue-200">
                <div>
                  <span className="block text-[10px] text-gray-400">Account Number:</span>
                  <span className="font-mono text-sm font-extrabold text-blue-600">
                    {accountNumber || "—"}
                  </span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded">
                  📋 Copy
                </span>
              </div>
              <p className="text-[11px] text-gray-500 italic mt-0.5">
                💡 {bankInstructions || "Please use your Order Name as payment reference."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBank;