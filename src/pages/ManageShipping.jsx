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
  const [deliveryFee, setDeliveryFee] = useState(2500);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(0);
  const [shippingStatus, setShippingStatus] = useState(true);
  const [estimatedDelivery, setEstimatedDelivery] = useState("2 - 4 Business Days");
  const [shippingZones, setShippingZones] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal State for Adding/Editing a Zone
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [zoneForm, setZoneForm] = useState({
    name: "",
    regions: "",
    fee: "",
    estimatedDelivery: "1 - 3 Business Days",
    freeShippingThreshold: 0,
  });

  // Simulator State
  const [simState, setSimState] = useState("Lagos");

  // Fetch current store shipping settings
  const fetchShippingSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(backendUrl + "/api/settings/get");
      if (response.data && response.data.success && response.data.settings) {
        const s = response.data.settings;
        if (s.currency) setCurrency(s.currency);
        setDeliveryFee(s.deliveryFee !== undefined ? s.deliveryFee : 2500);
        setFreeShippingThreshold(
          s.freeShippingThreshold !== undefined ? s.freeShippingThreshold : 0
        );
        setShippingStatus(s.shippingStatus !== undefined ? s.shippingStatus : true);
        if (s.estimatedDelivery) setEstimatedDelivery(s.estimatedDelivery);
        if (Array.isArray(s.shippingZones)) {
          setShippingZones(s.shippingZones);
        }
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

  // Save General Fallback Settings
  const handleSaveGeneral = async (e) => {
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
          shippingZones,
        },
        { headers: { token: adminToken } }
      );

      if (response.data && response.data.success) {
        toast.success("🚚 Shipping settings saved successfully!");
      } else {
        toast.error(response.data.message || "Failed to update shipping settings");
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

  // Open modal to Add a new Zone
  const handleOpenAddZone = () => {
    setEditingIndex(null);
    setZoneForm({
      name: "",
      regions: "",
      fee: "",
      estimatedDelivery: "2 - 4 Business Days",
      freeShippingThreshold: 0,
    });
    setShowZoneModal(true);
  };

  // Open modal to Edit an existing Zone
  const handleOpenEditZone = (index) => {
    const zone = shippingZones[index];
    setEditingIndex(index);
    setZoneForm({
      name: zone.name,
      regions: Array.isArray(zone.regions) ? zone.regions.join(", ") : zone.regions || "",
      fee: zone.fee,
      estimatedDelivery: zone.estimatedDelivery || "2 - 4 Business Days",
      freeShippingThreshold: zone.freeShippingThreshold || 0,
    });
    setShowZoneModal(true);
  };

  // Save Zone Form (Add or Edit)
  const handleSaveZoneForm = async (e) => {
    e.preventDefault();
    if (!zoneForm.name.trim() || zoneForm.fee === "") {
      toast.error("Please enter a zone name and delivery fee");
      return;
    }

    const parsedRegions = zoneForm.regions
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);

    const newZoneData = {
      name: zoneForm.name.trim(),
      regions: parsedRegions,
      fee: Number(zoneForm.fee) >= 0 ? Number(zoneForm.fee) : 0,
      estimatedDelivery: zoneForm.estimatedDelivery.trim() || "2 - 4 Business Days",
      freeShippingThreshold:
        Number(zoneForm.freeShippingThreshold) >= 0
          ? Number(zoneForm.freeShippingThreshold)
          : 0,
    };

    let updatedZones = [...shippingZones];
    if (editingIndex !== null) {
      updatedZones[editingIndex] = newZoneData;
    } else {
      updatedZones.push(newZoneData);
    }

    setShippingZones(updatedZones);
    setShowZoneModal(false);

    // Save to database
    try {
      setSaving(true);
      const res = await axios.post(
        backendUrl + "/api/settings/shipping/zones",
        { shippingZones: updatedZones },
        { headers: { token: adminToken } }
      );
      if (res.data.success) {
        toast.success(
          editingIndex !== null
            ? `Zone "${newZoneData.name}" updated!`
            : `New Zone "${newZoneData.name}" added!`
        );
      } else {
        toast.error(res.data.message || "Failed to save zone");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to sync zone to server");
    } finally {
      setSaving(false);
    }
  };

  // Delete a Zone
  const handleDeleteZone = async (index) => {
    const zoneName = shippingZones[index]?.name;
    if (!window.confirm(`Are you sure you want to delete "${zoneName}"?`)) return;

    const updatedZones = shippingZones.filter((_, i) => i !== index);
    setShippingZones(updatedZones);

    try {
      setSaving(true);
      const res = await axios.post(
        backendUrl + "/api/settings/shipping/zones",
        { shippingZones: updatedZones },
        { headers: { token: adminToken } }
      );
      if (res.data.success) {
        toast.info(`Deleted "${zoneName}"`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete zone");
    } finally {
      setSaving(false);
    }
  };

  // Simulator helper: calculates fee based on chosen state
  const getSimulatedFee = () => {
    if (!shippingStatus) return { fee: 0, name: "Free (Shipping Disabled)", time: estimatedDelivery };
    const cleanState = simState.trim().toLowerCase();

    // Check if matching custom zone
    const matched = shippingZones.find((z) =>
      z.regions?.some((r) => r.toLowerCase().includes(cleanState) || cleanState.includes(r.toLowerCase()))
    );

    if (matched) {
      return {
        fee: matched.fee,
        name: matched.name,
        time: matched.estimatedDelivery,
      };
    }

    return {
      fee: Number(deliveryFee),
      name: "Standard Fallback Rate",
      time: estimatedDelivery,
    };
  };

  const simResult = getSimulatedFee();

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-gray-200 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <span>🚚</span> Distance & Location-Based Shipping Zones
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Set custom delivery prices by City, State, or Country (e.g. Same City = ₦1,500, Other States = ₦3,500, International = ₦15,000).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleOpenAddZone}
            className="px-4 py-2 text-xs sm:text-sm font-bold bg-black text-white hover:bg-gray-800 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>➕</span> Add New Zone
          </button>
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
          Loading shipping zones...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Left Column (2 Cols): Active Zones List */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-xs flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Active Delivery Zones ({shippingZones.length})
                  </h3>
                  <p className="text-xs text-gray-500">
                    Customers selecting a matching location will automatically get these exact shipping rates.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddZone}
                  className="px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                >
                  + Add Zone
                </button>
              </div>

              {shippingZones.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                  No custom shipping zones created yet. Click "+ Add New Zone" above!
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {shippingZones.map((zone, idx) => (
                    <div
                      key={idx}
                      className="p-5 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white hover:border-gray-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-gray-900">
                            {zone.name}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-teal-100 text-teal-800 rounded">
                            {currency}{Number(zone.fee).toLocaleString()}
                          </span>
                        </div>

                        {/* Covered Regions */}
                        <div className="flex flex-wrap gap-1.5 items-center mt-1">
                          <span className="text-[11px] font-semibold text-gray-400">
                            Covers:
                          </span>
                          {zone.regions && zone.regions.length > 0 ? (
                            zone.regions.map((reg, rIdx) => (
                              <span
                                key={rIdx}
                                className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[11px] font-medium text-gray-700 shadow-2xs"
                              >
                                {reg}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs italic text-gray-400">
                              All locations
                            </span>
                          )}
                        </div>

                        {/* Delivery Timeframe & Threshold */}
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span>⏱️ {zone.estimatedDelivery || "2 - 4 Business Days"}</span>
                          {Number(zone.freeShippingThreshold) > 0 && (
                            <span className="text-green-600 font-semibold">
                              • Free on orders over {currency}{Number(zone.freeShippingThreshold).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Edit / Delete Buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => handleOpenEditZone(idx)}
                          className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteZone(idx)}
                          className="px-3 py-1.5 text-xs font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Standard Fallback Shipping Settings Form */}
            <form
              onSubmit={handleSaveGeneral}
              className="p-6 bg-white border border-gray-200 rounded-2xl shadow-xs flex flex-col gap-5"
            >
              <h3 className="text-lg font-bold text-gray-900">
                Default / Fallback Shipping Rate
              </h3>
              <p className="text-xs text-gray-500 -mt-3">
                Applied whenever a customer enters an address or state that does not match any of your custom zones above.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Standard Fallback Fee ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-black"
                    placeholder="2500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Fallback Estimated Days
                  </label>
                  <input
                    type="text"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 outline-none focus:border-black"
                    placeholder="2 - 4 Business Days"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  Global Shipping: <b>{shippingStatus ? "🟢 Enabled" : "⚪ Disabled (Free across store)"}</b>
                </span>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
                >
                  {saving ? "Saving..." : "💾 Save Fallback Settings"}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Interactive Customer Checkout Simulator */}
          <div className="flex flex-col gap-6">
            <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-md border border-slate-800 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  🎯 Distance Rate Simulator
                </span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-gray-300">
                  Live Test
                </span>
              </div>

              <p className="text-xs text-gray-300">
                Test how your shipping fees respond when a customer enters different delivery locations:
              </p>

              {/* State Input Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400">
                  Customer State / City:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={simState}
                    onChange={(e) => setSimState(e.target.value)}
                    placeholder="Type e.g. Lagos, Abuja, London..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-teal-400 font-semibold"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {["Lagos", "Abuja", "Rivers", "Borno", "London", "USA"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSimState(s)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer transition-all ${
                      simState.toLowerCase() === s.toLowerCase()
                        ? "bg-teal-500 text-slate-950 font-extrabold"
                        : "bg-slate-800 hover:bg-slate-700 text-gray-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Result Preview Box */}
              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 flex flex-col gap-2 mt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Matched Rule:</span>
                  <span className="font-bold text-teal-300">{simResult.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Estimated Delivery:</span>
                  <span className="font-semibold text-gray-200">{simResult.time}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-700 text-sm font-bold">
                  <span className="text-gray-200">Customer Shipping Fee:</span>
                  <span className="text-base text-teal-400 font-black">
                    {currency}{Number(simResult.fee).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col gap-2 text-xs text-blue-900 leading-relaxed">
              <span className="font-bold text-sm">💡 How Distance Zones Work:</span>
              <ul className="list-disc pl-4 space-y-1.5 text-blue-800">
                <li>
                  When a customer enters their <b>State</b> (or selects from the checkout destination dropdown), the store automatically matches it against your zones.
                </li>
                <li>
                  You can add multiple cities or states in one zone separated by commas (e.g. <code>Lagos, Ikeja, Lekki</code>).
                </li>
                <li>
                  If an address isn't listed in any custom zone, the <b>Standard Fallback Rate</b> is automatically applied!
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Zone Modal */}
      {showZoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in backdrop-blur-xs">
          <form
            onSubmit={handleSaveZoneForm}
            className="bg-white p-6 sm:p-8 rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingIndex !== null ? "✏️ Edit Shipping Zone" : "➕ Add New Shipping Zone"}
              </h3>
              <button
                type="button"
                onClick={() => setShowZoneModal(false)}
                className="text-gray-400 hover:text-black font-bold text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Zone Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">
                Zone Title *
              </label>
              <input
                type="text"
                required
                value={zoneForm.name}
                onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                placeholder="e.g. Within Lagos (Same City) or South-West Region"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 outline-none focus:border-black font-semibold"
              />
            </div>

            {/* Regions / States Covered */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">
                Covered States / Cities (comma-separated) *
              </label>
              <textarea
                rows={2}
                required
                value={zoneForm.regions}
                onChange={(e) => setZoneForm({ ...zoneForm, regions: e.target.value })}
                placeholder="e.g. Lagos, Ikeja, Lekki, Victoria Island"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs text-gray-900 outline-none focus:border-black"
              />
              <span className="text-[11px] text-gray-400">
                Separate multiple states with commas. Customers typing or selecting these states will get this rate.
              </span>
            </div>

            {/* Delivery Fee & Timeframe */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">
                  Shipping Fee ({currency}) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={zoneForm.fee}
                  onChange={(e) => setZoneForm({ ...zoneForm, fee: e.target.value })}
                  placeholder="1500"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-black"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">
                  Estimated Delivery Time
                </label>
                <input
                  type="text"
                  value={zoneForm.estimatedDelivery}
                  onChange={(e) =>
                    setZoneForm({ ...zoneForm, estimatedDelivery: e.target.value })
                  }
                  placeholder="1 - 2 Business Days"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Optional Free Shipping Threshold */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">
                Free Shipping on Orders Over ({currency})
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={zoneForm.freeShippingThreshold}
                onChange={(e) =>
                  setZoneForm({ ...zoneForm, freeShippingThreshold: e.target.value })
                }
                placeholder="0 (leave 0 to disable)"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 outline-none focus:border-black"
              />
              <span className="text-[11px] text-gray-400">
                Optional: If cart subtotal reaches this amount, shipping becomes Free for this zone.
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 pt-3 border-t border-gray-100 mt-2">
              <button
                type="button"
                onClick={() => setShowZoneModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 font-bold text-gray-800 text-xs sm:text-sm rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 bg-black hover:bg-gray-800 font-bold text-white text-xs sm:text-sm rounded-xl cursor-pointer shadow-md"
              >
                {saving ? "Saving..." : editingIndex !== null ? "Update Zone" : "Add Zone"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageShipping;