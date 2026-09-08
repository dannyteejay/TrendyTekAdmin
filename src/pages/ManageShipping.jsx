import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl as AppBackendUrl } from "../App";
import { toast } from "react-toastify";

const ManageShipping = ({ token, currency: propCurrency }) => {
  const adminToken =
    token ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token") ||
    "";
  const backendUrl =
    AppBackendUrl ||
    import.meta.env.VITE_BACKEND_URL ||
    "http://localhost:4000";

  const [currency, setCurrency] = useState(propCurrency || "$");
  const [deliveryFee, setDeliveryFee] = useState(10);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(0);
  const [shippingStatus, setShippingStatus] = useState(true);
  const [estimatedDelivery, setEstimatedDelivery] = useState("2 - 4 Business Days");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch current store shipping settings
  const fetchShippingSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(backendUrl + "/api/settings/get");
      if (response.data && response.data.success && response.data.settings) {
        const s = response.data.settings;
        if (s.currency) setCurrency(s.currency);
        setDeliveryFee(s.deliveryFee !== undefined ? s.deliveryFee : 10);
        setFreeShippingThreshold(
          s.freeShippingThreshold !== undefined ? s.freeShippingThreshold : 0
        );
        setShippingStatus(s.shippingStatus !== undefined ? s.shippingStatus : true);
        if (s.estimatedDelivery) setEstimatedDelivery(s.estimatedDelivery);
      }
    } catch (error) {
      console.error("Failed to load shipping settings:", error);
      toast.error("Failed to load shipping settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShippingSettings();
  }, []);

  // Save / Update Shipping Fee
  const handleSaveShipping = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const response = await axios.post(
        backendUrl + "/api/settings/shipping",
        {
          deliveryFee: Number(deliveryFee) || 0,
          freeShippingThreshold: Number(freeShippingThreshold) || 0,
          shippingStatus,
          estimatedDelivery,
        },
        { headers: { token: adminToken } }
      );

      if (response.data && response.data.success) {
        toast.success("🚚 Shipping fee updated successfully!");
      } else {
        toast.error(response.data.message || "Failed to update shipping fee");
      }
    } catch (error) {
      console.error("Shipping update error:", error);
      toast.error(
        error.response?.data?.message || "Failed to save shipping settings"
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete / Reset Shipping Fee to 0 (Free Shipping)
  const handleDeleteShipping = async () => {
    setSaving(true);
    setShowDeleteModal(false);
    try {
      const response = await axios.post(
        backendUrl + "/api/settings/shipping/delete",
        {},
        { headers: { token: adminToken } }
      );

      if (response.data && response.data.success) {
        setDeliveryFee(0);
        setFreeShippingThreshold(0);
        toast.info("🗑️ Shipping fee removed! Store now offers Free Shipping ($0.00).");
      } else {
        toast.error(response.data.message || "Failed to delete shipping fee");
      }
    } catch (error) {
      console.error("Shipping delete error:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete shipping fee"
      );
    } finally {
      setSaving(false);
    }
  };

  // Quick preset button handler
  const setQuickFee = (amount) => {
    setDeliveryFee(amount);
    if (amount === 0) {
      toast.info("Shipping fee set to Free (0.00)");
    }
  };

  // Calculate live preview
  const sampleSubtotal = 75;
  const isFree =
    !shippingStatus ||
    Number(deliveryFee) === 0 ||
    (Number(freeShippingThreshold) > 0 && sampleSubtotal >= Number(freeShippingThreshold));
  const effectiveFee = isFree ? 0 : Number(deliveryFee) || 0;
  const sampleTotal = sampleSubtotal + effectiveFee;

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-gray-200 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <span>🚚</span> Shipping & Delivery Fee Manager
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Configure, edit, or remove shipping fees applied to customer carts and checkout pages.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchShippingSettings}
            className="px-4 py-2 text-xs sm:text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition-colors cursor-pointer"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-500 animate-pulse bg-white rounded-2xl border">
          <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading shipping settings...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form (Left 2 cols) */}
          <form
            onSubmit={handleSaveShipping}
            className="lg:col-span-2 flex flex-col gap-6 p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl shadow-xs"
          >
            {/* Status Switch */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="font-bold text-sm text-gray-900">
                  Enable Shipping Fee
                </p>
                <p className="text-xs text-gray-500">
                  When disabled, all orders automatically get 100% Free Shipping.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShippingStatus(!shippingStatus)}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  shippingStatus ? "bg-green-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    shippingStatus ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Standard Shipping Fee Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-900 flex items-center justify-between">
                <span>Standard Shipping Fee ({currency})</span>
                <span className="text-xs font-normal text-gray-500">
                  Applied to each order in cart
                </span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-bold text-gray-500 text-base">
                  {currency}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  disabled={!shippingStatus}
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  placeholder="10.00"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl font-semibold text-gray-900 text-lg outline-none focus:border-black disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-xs text-gray-400 font-medium">Presets:</span>
                {[0, 5, 10, 15, 20, 25].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setQuickFee(val)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      Number(deliveryFee) === val
                        ? "bg-black text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {val === 0 ? "Free ($0)" : `${currency}${val}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Free Shipping Threshold */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-900 flex items-center justify-between">
                <span>Free Shipping Threshold ({currency})</span>
                <span className="text-xs font-normal text-gray-500">
                  Optional (0 to disable)
                </span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-bold text-gray-500 text-base">
                  {currency}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(e.target.value)}
                  placeholder="e.g. 100 for orders over $100"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl font-semibold text-gray-900 text-base outline-none focus:border-black"
                />
              </div>
              <p className="text-xs text-gray-500">
                💡 Customers whose cart subtotal is equal to or above this amount will automatically get Free Shipping at checkout!
              </p>
            </div>

            {/* Estimated Delivery Time text */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-900">
                Estimated Delivery Time Text
              </label>
              <input
                type="text"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
                placeholder="e.g. 2 - 4 Business Days"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 text-sm outline-none focus:border-black"
              />
              <p className="text-xs text-gray-500">
                Displayed in the policy and checkout section to manage customer expectations.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="w-full sm:w-auto px-5 py-3 text-xs sm:text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all cursor-pointer"
              >
                🗑️ Delete / Reset Fee
              </button>

              <button
                type="submit"
                disabled={saving}
                className={`w-full sm:w-auto px-8 py-3 text-xs sm:text-sm font-bold text-white bg-black hover:bg-gray-800 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer ${
                  saving ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {saving ? "Saving Changes..." : "💾 Save Shipping Settings"}
              </button>
            </div>
          </form>

          {/* Right Column: Live Customer Cart Preview */}
          <div className="flex flex-col gap-6">
            <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-md border border-slate-800">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  📱 Live Customer Preview
                </span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-gray-300">
                  Cart Total Component
                </span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Sub Total (Sample)</span>
                  <span className="font-semibold text-white">
                    {currency}
                    {sampleSubtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-t border-b border-slate-800">
                  <div>
                    <span className="text-gray-300">Shipping Fee</span>
                    {estimatedDelivery && (
                      <span className="block text-[10px] text-gray-400">
                        {estimatedDelivery}
                      </span>
                    )}
                  </div>
                  <span
                    className={`font-bold ${
                      isFree ? "text-green-400 text-sm" : "text-white"
                    }`}
                  >
                    {isFree ? "FREE" : `${currency}${effectiveFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1 text-base font-extrabold text-white">
                  <span>Total Amount</span>
                  <span className="text-lg text-teal-300">
                    {currency}
                    {sampleTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {Number(freeShippingThreshold) > 0 && (
                <div className="mt-4 p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-gray-300">
                  <div className="flex justify-between mb-1 text-[11px]">
                    <span>Free Shipping on {currency}{Number(freeShippingThreshold)}</span>
                    <span className="text-teal-400 font-bold">
                      {sampleSubtotal >= Number(freeShippingThreshold)
                        ? "Unlocked! 🎉"
                        : `${currency}${(
                            Number(freeShippingThreshold) - sampleSubtotal
                          ).toFixed(2)} away`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-400 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          (sampleSubtotal / Number(freeShippingThreshold)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Guide Box */}
            <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col gap-2 text-xs text-blue-900 leading-relaxed">
              <div className="flex items-center gap-2 font-bold text-sm">
                <span>💡</span> How Shipping Fee Works:
              </div>
              <ul className="list-disc pl-4 space-y-1 text-blue-800">
                <li>
                  <b>Edit Fee:</b> Type any amount in the box above and click Save.
                </li>
                <li>
                  <b>Free Shipping ($0):</b> Click the "Free ($0)" preset or use "Delete / Reset Fee".
                </li>
                <li>
                  <b>Real-Time Sync:</b> All customer cart and checkout pages update instantly without needing any manual code changes or redeployments!
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl mx-auto">
              🗑️
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900">
              Reset Shipping Fee?
            </h3>
            <p className="text-xs sm:text-sm text-center text-gray-600 leading-relaxed">
              This will reset your store delivery fee to <b>{currency}0.00 (Free Shipping)</b> and clear any thresholds. You can edit it back to another amount anytime.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 font-bold text-gray-800 text-xs sm:text-sm rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteShipping}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 font-bold text-white text-xs sm:text-sm rounded-xl cursor-pointer shadow-md"
              >
                Yes, Reset to $0
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageShipping;