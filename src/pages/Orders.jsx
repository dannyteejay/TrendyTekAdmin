import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [copiedNoteId, setCopiedNoteId] = useState(null);

  const fetchAllOrders = async () => {
    if (!token) return;
    setLoading(true);

    try {
      const response = await axios.post(
        backendUrl + "/api/order/list",
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update Delivery Status (Packing, Shipped, Delivered)
  const statusHandler = async (event, orderId) => {
    try {
      const newStatus = event.target.value;
      const response = await axios.post(
        backendUrl + "/api/order/status",
        { orderId, status: newStatus },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(`Order delivery status updated to "${newStatus}"`);
        fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to update status");
    }
  };

  // Toggle Payment Status (Paid / Pending)
  const togglePaymentHandler = async (orderId, currentPayment) => {
    try {
      const nextPayment = !currentPayment;
      const response = await axios.post(
        backendUrl + "/api/order/payment-status",
        { orderId, payment: nextPayment },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(
          nextPayment
            ? "✅ Payment Confirmed and marked as PAID!"
            : "⏳ Payment marked as PENDING"
        );
        fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Failed to update payment status");
    }
  };

  const copyToClipboard = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedNoteId(id);
    toast.info("Transfer reference copied to clipboard!");
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  const filteredOrders = orders.filter((order) => {
    if (filter === "reported") return order.customerClaimedPaid && !order.payment;
    if (filter === "paid") return order.payment === true;
    if (filter === "pending") return order.payment === false;
    if (filter === "bank") return order.paymentMethod === "Bank Transfer";
    return true;
  });

  const reportedCount = orders.filter(
    (o) => o.customerClaimedPaid && !o.payment
  ).length;

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-gray-200 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>📦</span> Orders & Bank Transfer Verification
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Track customer orders, verify customer transfer references/narrations, and manage payments.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-semibold text-gray-800 outline-none cursor-pointer"
          >
            <option value="all">All Orders ({orders.length})</option>
            {reportedCount > 0 && (
              <option value="reported" className="font-bold text-amber-600">
                🚨 Reported "I Have Paid" ({reportedCount})
              </option>
            )}
            <option value="paid">Paid & Transferred (🟢)</option>
            <option value="pending">Pending Payment (🟡)</option>
            <option value="bank">Bank Transfers (🏛️)</option>
          </select>

          <button
            onClick={fetchAllOrders}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition-colors cursor-pointer"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-500 animate-pulse bg-white rounded-2xl border">
          <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl text-gray-400">
          <p className="text-4xl mb-2">📭</p>
          <p className="font-semibold text-gray-600">No orders match this filter.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredOrders.map((order, index) => {
            const isReportedPaid = order.customerClaimedPaid && !order.payment;
            const hasBankProof = Boolean(order.senderName || order.transferNote);

            return (
              <div
                key={index}
                className={`p-5 md:p-6 bg-white border rounded-2xl shadow-xs flex flex-col gap-4 transition-all ${
                  isReportedPaid
                    ? "border-amber-400 bg-amber-50/20 ring-2 ring-amber-400/20"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Main Order Row */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Col 1: Parcel Icon + Customer & Items List */}
                  <div className="flex items-start gap-4 lg:w-[35%]">
                    <img
                      className="w-12 h-12 p-2 bg-gray-50 border border-gray-200 rounded-xl shrink-0"
                      src={assets.parcel_icon}
                      alt="Parcel Icon"
                    />
                    <div className="flex flex-col gap-1">
                      <div className="space-y-1">
                        {order.items.map((item, itemIndex) => (
                          <p
                            className="text-xs sm:text-sm font-semibold text-gray-900"
                            key={itemIndex}
                          >
                            {item.name}{" "}
                            <span className="text-gray-500">x {item.quantity}</span>{" "}
                            <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 border border-gray-200 rounded text-gray-700 font-bold ml-1">
                              {item.size}
                            </span>
                          </p>
                        ))}
                      </div>

                      <p className="text-xs font-bold text-gray-900 mt-2">
                        👤 {order.address.firstName} {order.address.lastName}
                      </p>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        📍 {order.address.street}, {order.address.city},{" "}
                        {order.address.state}, {order.address.country}
                      </p>
                      <p className="text-xs text-blue-600 font-medium">
                        📞 {order.address.phone}
                      </p>
                    </div>
                  </div>

                  {/* Col 2: Method, Date & Total Amount */}
                  <div className="flex flex-col gap-2 text-xs sm:text-sm lg:w-[25%] border-t lg:border-t-0 lg:border-l lg:pl-6 border-gray-100 pt-3 lg:pt-0">
                    <p className="text-gray-500">
                      Total Items:{" "}
                      <b className="text-gray-900">{order.items.length}</b>
                    </p>
                    <p className="text-gray-500 flex items-center gap-1.5">
                      Method: <b className="text-gray-900">{order.paymentMethod}</b>
                    </p>
                    <p className="text-xs text-gray-400">
                      📅 {new Date(order.date).toLocaleDateString()} at{" "}
                      {new Date(order.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-base sm:text-lg font-black text-gray-900 mt-1">
                      {currency}
                      {Number(order.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  {/* Col 3: Payment Status & 1-Click Toggle */}
                  <div className="flex flex-col gap-2 lg:w-[20%] border-t lg:border-t-0 lg:border-l lg:pl-6 border-gray-100 pt-3 lg:pt-0">
                    <span className="text-xs font-bold text-gray-500">
                      Payment Status:
                    </span>

                    {order.payment ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 font-extrabold text-xs rounded-full w-fit">
                        <span className="w-2 h-2 rounded-full bg-green-600"></span>
                        PAID / CONFIRMED ✅
                      </span>
                    ) : isReportedPaid ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-200 text-amber-900 font-black text-xs rounded-full w-fit animate-pulse">
                        <span>🚨</span> Customer Clicked "I Have Paid"
                      </span>
                    ) : order.paymentMethod === "COD" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 font-bold text-xs rounded-full w-fit">
                        💵 CASH ON DELIVERY
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 font-bold text-xs rounded-full w-fit">
                        ⚪ Unpaid / Pending Transfer
                      </span>
                    )}

                    {/* 1-Click Action Button */}
                    <button
                      onClick={() => togglePaymentHandler(order._id, order.payment)}
                      className={`mt-1 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-xs active:scale-95 ${
                        order.payment
                          ? "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                          : "bg-green-600 border-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {order.payment ? "↩️ Mark as Unpaid" : "✅ Confirm & Mark Paid"}
                    </button>
                  </div>

                  {/* Col 4: Delivery Progress Selector */}
                  <div className="flex flex-col gap-2 lg:w-[20%] border-t lg:border-t-0 lg:border-l lg:pl-6 border-gray-100 pt-3 lg:pt-0">
                    <span className="text-xs font-bold text-gray-500">
                      Delivery Progress:
                    </span>
                    <select
                      onChange={(event) => statusHandler(event, order._id)}
                      value={order.status}
                      className="w-full p-2.5 font-bold text-xs sm:text-sm text-gray-900 bg-white border border-gray-300 rounded-xl outline-none focus:border-black cursor-pointer shadow-2xs"
                    >
                      <option value="Order Placed">📦 Order Placed</option>
                      <option value="Packing">🎁 Packing</option>
                      <option value="Shipped">🚚 Shipped</option>
                      <option value="Out for delivery">🛵 Out for delivery</option>
                      <option value="Delivered">🎉 Delivered</option>
                    </select>
                  </div>
                </div>

                {/* Prominent Bank Transfer Details / Customer Payment Narration Box */}
                {(order.paymentMethod === "Bank Transfer" || hasBankProof) && (
                  <div
                    className={`mt-2 p-3.5 sm:p-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isReportedPaid
                        ? "bg-amber-100/70 border-amber-300 text-amber-950"
                        : order.payment
                        ? "bg-green-50 border-green-200 text-green-950"
                        : "bg-gray-50 border-gray-200 text-gray-800"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <span>🏛️</span>
                        <span>Bank Transfer Details:</span>
                      </div>

                      {/* Sender Account Name */}
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-600">
                          Sender Name:
                        </span>
                        <span className="font-extrabold bg-white px-2.5 py-1 rounded-md border border-gray-200 shadow-2xs">
                          {order.senderName || "Not specified by customer"}
                        </span>
                      </div>

                      {/* Narration / Reference */}
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-600">
                          Narration / Ref:
                        </span>
                        <span className="font-mono font-bold bg-white px-2.5 py-1 rounded-md border border-gray-200 shadow-2xs">
                          {order.transferNote || "No note provided"}
                        </span>
                      </div>
                    </div>

                    {/* Copy Reference Button */}
                    {order.transferNote && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(order.transferNote, order._id)}
                        className="px-3 py-1.5 bg-white hover:bg-gray-100 font-bold text-gray-800 rounded-lg border border-gray-300 shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 w-fit shrink-0"
                      >
                        {copiedNoteId === order._id ? "✓ Copied" : "📋 Copy Ref"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;