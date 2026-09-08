import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl as AppBackendUrl } from "../App";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const GATEWAY_INFO = [
  {
    key: "paystack",
    name: "Paystack Payment Gateway",
    badge: "Popular (Africa)",
    icon: "💳",
    accentColor: "teal",
    description:
      "Accept Nigerian & African debit cards (Mastercard, Visa, Verve), Bank Transfers, USSD, and Apple Pay.",
    envKey: "PAYSTACK_SECRET_KEY",
  },
  {
    key: "stripe",
    name: "Stripe Payment Gateway",
    badge: "Global (USD/EUR/GBP)",
    icon: "🌐",
    accentColor: "indigo",
    description:
      "Accept international Credit and Debit cards worldwide with automatic 3D Secure fraud protection.",
    envKey: "STRIPE_SECRET_KEY",
  },
  {
    key: "bank_transfer",
    name: "Direct Bank Transfer",
    badge: "0% Transaction Fee",
    icon: "🏛️",
    accentColor: "blue",
    description:
      "Customers transfer directly into your store bank account and use their Order Name as payment reference.",
    envKey: "Configured in Store Settings",
    hasSettingsLink: "/bank-details",
  },
  {
    key: "crypto",
    name: "Cryptocurrency (NOWPayments)",
    badge: "USDT / BTC / ETH",
    icon: "🪙",
    accentColor: "amber",
    description:
      "Accept instant crypto payments across 300+ coins (USDT TRC20/ERC20, Bitcoin, Ethereum).",
    envKey: "NOWPAYMENTS_API_KEY",
  },
  {
    key: "cod",
    name: "Cash on Delivery (COD)",
    badge: "Local Orders",
    icon: "💵",
    accentColor: "emerald",
    description:
      "Customers pay in cash when the delivery rider delivers the package to their doorstep.",
    envKey: "No API key required",
  },
];

const ManagePayments = ({ token }) => {
  const adminToken =
    token ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token") ||
    "";
  const backendUrl =
    AppBackendUrl ||
    import.meta.env.VITE_BACKEND_URL ||
    "http://localhost:4000";

  const [gateways, setGateways] = useState({
    paystack: true,
    stripe: true,
    bank_transfer: true,
    crypto: true,
    cod: true,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch current payment gateways status
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(backendUrl + "/api/settings/get");
      if (response.data && response.data.success && response.data.settings) {
        if (response.data.settings.paymentGateways) {
          setGateways({
            paystack:
              response.data.settings.paymentGateways.paystack !== undefined
                ? response.data.settings.paymentGateways.paystack
                : true,
            stripe:
              response.data.settings.paymentGateways.stripe !== undefined
                ? response.data.settings.paymentGateways.stripe
                : true,
            bank_transfer:
              response.data.settings.paymentGateways.bank_transfer !== undefined
                ? response.data.settings.paymentGateways.bank_transfer
                : true,
            crypto:
              response.data.settings.paymentGateways.crypto !== undefined
                ? response.data.settings.paymentGateways.crypto
                : true,
            cod:
              response.data.settings.paymentGateways.cod !== undefined
                ? response.data.settings.paymentGateways.cod
                : true,
          });
        }
      }
    } catch (error) {
      console.error("Failed to load payment gateways:", error);
      toast.error("Failed to load payment gateway settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Toggle single gateway on/off & save immediately
  const handleToggle = async (key) => {
    const nextState = {
      ...gateways,
      [key]: !gateways[key],
    };

    // Prevent disabling ALL payment methods
    const activeCount = Object.values(nextState).filter(Boolean).length;
    if (activeCount === 0) {
      toast.warning("At least one payment method must remain active!");
      return;
    }

    setGateways(nextState);
    setSaving(true);

    try {
      const response = await axios.post(
        backendUrl + "/api/settings/payment-gateways",
        { paymentGateways: nextState },
        { headers: { token: adminToken } }
      );

      if (response.data && response.data.success) {
        const isEnabled = nextState[key];
        const gatewayObj = GATEWAY_INFO.find((g) => g.key === key);
        toast.success(
          `${gatewayObj?.name || key} is now ${
            isEnabled ? "ENABLED 🟢" : "DISABLED ⚪"
          }`
        );
      } else {
        toast.error(response.data.message || "Failed to update gateway");
        fetchSettings(); // revert
      }
    } catch (error) {
      console.error("Payment toggle error:", error);
      toast.error(
        error.response?.data?.message || "Failed to save gateway status"
      );
      fetchSettings(); // revert
    } finally {
      setSaving(false);
    }
  };

  const activeCount = Object.values(gateways).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-gray-200 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            💳 Payment Gateways Manager
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Enable or disable payment methods in real-time. Disabled gateways will be hidden from the customer checkout page.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 bg-gray-100 rounded-xl text-xs font-bold text-gray-800">
            Active: <span className="text-blue-600">{activeCount}</span> / 5
          </div>
          <button
            onClick={fetchSettings}
            className="px-4 py-2 text-xs sm:text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition-colors cursor-pointer"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Gateway Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-500 animate-pulse bg-white rounded-2xl border">
          <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading payment gateway settings...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GATEWAY_INFO.map((item) => {
            const isEnabled = Boolean(gateways[item.key]);

            return (
              <div
                key={item.key}
                className={`flex flex-col justify-between p-6 rounded-2xl border transition-all duration-200 ${
                  isEnabled
                    ? "bg-white border-gray-200 shadow-xs hover:shadow-md"
                    : "bg-gray-50/70 border-gray-200/80 opacity-80"
                }`}
              >
                <div>
                  {/* Top Bar: Icon + Badge + Toggle Button */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2.5 bg-gray-100 rounded-xl">
                        {item.icon}
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-gray-900">
                          {item.name}
                        </h3>
                        <span className="text-[11px] font-semibold text-gray-500">
                          {item.badge}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Toggle Switch */}
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleToggle(item.key)}
                      className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isEnabled ? "bg-green-600" : "bg-gray-300"
                      }`}
                      aria-label={`Toggle ${item.name}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? "translate-x-7" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                {/* Footer Bar: Status Pill & Link/Key Note */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      isEnabled
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isEnabled ? "bg-green-600 animate-pulse" : "bg-gray-400"
                      }`}
                    />
                    {isEnabled ? "Active at Checkout" : "Disabled & Hidden"}
                  </span>

                  {item.hasSettingsLink ? (
                    <Link
                      to={item.hasSettingsLink}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      ⚙️ Edit Bank Details &rarr;
                    </Link>
                  ) : (
                    <span className="text-[11px] font-mono text-gray-400 truncate max-w-[170px]">
                      {item.envKey}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Notice Card */}
      <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs sm:text-sm text-blue-900 leading-relaxed">
        <span className="text-xl">💡</span>
        <div>
          <b className="font-bold">Real-Time Instant Sync:</b> When you toggle any payment gateway on or off here, customer checkout pages will immediately hide or show the payment option without requiring any server restarts!
        </div>
      </div>
    </div>
  );
};

export default ManagePayments;