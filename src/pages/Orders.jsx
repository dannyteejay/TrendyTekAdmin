import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { Pagination, SearchBar, ConfirmDialog } from "../components/common";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedNoteId, setCopiedNoteId] = useState(null);
  const [reportedCount, setReportedCount] = useState(0);

  // Destructive Action Modal State (Cancel Order)
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  // 1. Fetch Orders from Backend with Server-Side Search, Filter, Sort & Pagination
  const fetchAllOrders = async (page = 1) => {
    if (!token) return;
    setLoading(true);

    try {
      const response = await axios.post(
        backendUrl + "/api/order/list",
        {
          page,
          limit,
          filter,
          search: searchTerm,
          sort,
        },
        { headers: { token } }
      );

      if (response.data.success) {
        setOrders(response.data.orders || []);
        if (response.data.reportedCount !== undefined) {
          setReportedCount(response.data.reportedCount);
        }
        if (response.data.pagination) {
          setCurrentPage(response.data.pagination.currentPage);
          setTotalPages(response.data.pagination.totalPages);
          setTotalItems(response.data.pagination.totalItems);
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update Delivery Status (Intercept "Cancelled" for Confirmation Dialog)
  const statusHandler = async (event, order) => {
    const newStatus = event.target.value;

    if (newStatus === "Cancelled") {
      setOrderToCancel(order);
      return;
    }

    try {
      const response = await axios.post(
        backendUrl + "/api/order/status",
        { orderId: order._id, status: newStatus },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(`Order delivery status updated to "${newStatus}"`);
        fetchAllOrders(currentPage);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  };

  // Perform Cancel Order Action after Confirmation Dialog
  const handleConfirmCancelOrder = async () => {
    if (!orderToCancel) return;

    try {
      setIsCancellingOrder(true);
      const response = await axios.post(
        backendUrl + "/api/order/status",
        { orderId: orderToCancel._id, status: "Cancelled" },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.info(`Order #${orderToCancel._id.slice(-6)} has been cancelled.`);
        setOrderToCancel(null);
        await fetchAllOrders(currentPage);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Cancel order error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to cancel order");
    } finally {
      setIsCancellingOrder(false);
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
        fetchAllOrders(currentPage);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
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

  // Refetch from server whenever page, filter, or sort changes
  useEffect(() => {
    fetchAllOrders(currentPage);
  }, [token, currentPage, filter, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAllOrders(1);
  };

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>📦</span> Orders & Bank Transfer Verification
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Server-side filtered, searched, and sorted order management.
          </p>
        </div>

        {/* Server Filters, Sort & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Dropdown */}
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 outline-none cursor-pointer"
          >
            <option value="all">All Orders</option>
            <option value="reported" className="font-bold text-amber-600">
              🚨 Reported Paid ({reportedCount})
            </option>
            <option value="paid">Paid & Transferred (🟢)</option>
            <option value="pending">Pending Payment (🟡)</option>
            <option value="bank">Bank Transfers (🏛️)</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 outline-none cursor-pointer"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="amount-high">Amount: High to Low</option>
            <option value="amount-low">Amount: Low to High</option>
          </select>

          <button
            onClick={() => fetchAllOrders(currentPage)}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Server-Side Search Bar */}
      <form onSubmit={handleSearchSubmit} className="max-w-md">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search customer, phone, sender, note, ID..."
          onClear={() => {
            setSearchTerm("");
            setCurrentPage(1);
            fetchAllOrders(1);
          }}
        />
      </form>

      {/* Orders List / Loading / Empty Display */}
      {loading ? (
        <div className="py-20 text-center text-gray-500 animate-pulse bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800">
          <div className="w-8 h-8 border-3 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading orders from server...
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-gray-400">
          <p className="text-4xl mb-2">📭</p>
          <p className="font-semibold text-gray-600 dark:text-gray-300">No orders match this database query.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const isReportedPaid = order.customerClaimedPaid && !order.payment;
            const hasBankProof = Boolean(order.senderName || order.transferNote);
            const isCancelled = order.status === "Cancelled";

            return (
              <div
                key={order._id}
                className={`p-5 md:p-6 bg-white dark:bg-gray-900 border rounded-2xl shadow-xs flex flex-col gap-4 transition-all ${
                  isCancelled
                    ? "border-red-200 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/20 opacity-80"
                    : isReportedPaid
                    ? "border-amber-400 dark:border-amber-500/80 bg-amber-50/20 dark:bg-amber-950/20 ring-2 ring-amber-400/20"
                    : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                }`}
              >
                {/* Main Order Row */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Col 1: Parcel Icon + Customer & Items List */}
                  <div className="flex items-start gap-4 lg:w-[35%]">
                    <img
                      className="w-12 h-12 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shrink-0"
                      src={assets.parcel_icon}
                      alt="Parcel Icon"
                    />
                    <div className="flex flex-col gap-1">
                      <div className="space-y-1">
                        {order.items.map((item, itemIndex) => (
                          <p
                            className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100"
                            key={itemIndex}
                          >
                            {item.name}{" "}
                            <span className="text-gray-500 dark:text-gray-400">x {item.quantity}</span>{" "}
                            <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-gray-700 dark:text-gray-300 font-bold ml-1">
                              {item.size}
                            </span>
                          </p>
                        ))}
                      </div>

                      <p className="text-xs font-bold text-gray-900 dark:text-gray-100 mt-2">
                        👤 {order.address.firstName} {order.address.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        📍 {order.address.street}, {order.address.city},{" "}
                        {order.address.state}, {order.address.country}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        📞 {order.address.phone}
                      </p>
                    </div>
                  </div>

                  {/* Col 2: Method, Date & Total Amount */}
                  <div className="flex flex-col gap-2 text-xs sm:text-sm lg:w-[25%] border-t lg:border-t-0 lg:border-l lg:pl-6 border-gray-100 dark:border-gray-800 pt-3 lg:pt-0">
                    <p className="text-gray-500 dark:text-gray-400">
                      Total Items:{" "}
                      <b className="text-gray-900 dark:text-white">{order.items.length}</b>
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      Method: <b className="text-gray-900 dark:text-white">{order.paymentMethod}</b>
                    </p>
                    <p className="text-xs text-gray-400">
                      📅 {new Date(order.date).toLocaleDateString()} at{" "}
                      {new Date(order.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-base sm:text-lg font-black text-gray-900 dark:text-white mt-1">
                      {currency}
                      {Number(order.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  {/* Col 3: Payment Status & 1-Click Toggle */}
                  <div className="flex flex-col gap-2 lg:w-[20%] border-t lg:border-t-0 lg:border-l lg:pl-6 border-gray-100 dark:border-gray-800 pt-3 lg:pt-0">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                      Payment Status:
                    </span>

                    {order.payment ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 font-extrabold text-xs rounded-full w-fit">
                        <span className="w-2 h-2 rounded-full bg-green-600"></span>
                        PAID / CONFIRMED ✅
                      </span>
                    ) : isReportedPaid ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 font-black text-xs rounded-full w-fit animate-pulse">
                        <span>🚨</span> Customer Clicked "I Have Paid"
                      </span>
                    ) : order.paymentMethod === "COD" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 font-bold text-xs rounded-full w-fit">
                        💵 CASH ON DELIVERY
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-bold text-xs rounded-full w-fit">
                        ⚪ Unpaid / Pending Transfer
                      </span>
                    )}

                    {/* 1-Click Action Button */}
                    <button
                      onClick={() => togglePaymentHandler(order._id, order.payment)}
                      className={`mt-1 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-xs active:scale-95 ${
                        order.payment
                          ? "bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                          : "bg-green-600 border-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {order.payment ? "↩️ Mark as Unpaid" : "✅ Confirm & Mark Paid"}
                    </button>
                  </div>

                  {/* Col 4: Delivery Progress Selector */}
                  <div className="flex flex-col gap-2 lg:w-[20%] border-t lg:border-t-0 lg:border-l lg:pl-6 border-gray-100 dark:border-gray-800 pt-3 lg:pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        Delivery Progress:
                      </span>
                      {!isCancelled && (
                        <button
                          type="button"
                          onClick={() => setOrderToCancel(order)}
                          className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                    <select
                      onChange={(event) => statusHandler(event, order)}
                      value={order.status}
                      className={`w-full p-2.5 font-bold text-xs sm:text-sm bg-white dark:bg-gray-800 border rounded-xl outline-none focus:border-black dark:focus:border-white cursor-pointer shadow-2xs ${
                        isCancelled
                          ? "text-red-600 border-red-300 dark:border-red-800"
                          : "text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
                      }`}
                    >
                      <option value="Order Placed">📦 Order Placed</option>
                      <option value="Packing">🎁 Packing</option>
                      <option value="Shipped">🚚 Shipped</option>
                      <option value="Out for delivery">🛵 Out for delivery</option>
                      <option value="Delivered">🎉 Delivered</option>
                      <option value="Cancelled">❌ Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Bank Transfer Details Box */}
                {(order.paymentMethod === "Bank Transfer" || hasBankProof) && (
                  <div
                    className={`mt-2 p-3.5 sm:p-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isReportedPaid
                        ? "bg-amber-100/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200"
                        : order.payment
                        ? "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800 text-green-950 dark:text-green-200"
                        : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <span>🏛️</span>
                        <span>Bank Transfer Details:</span>
                      </div>

                      {/* Sender Name */}
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-600 dark:text-gray-400">
                          Sender Name:
                        </span>
                        <span className="font-extrabold bg-white dark:bg-gray-900 px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-700 shadow-2xs">
                          {order.senderName || "Not specified by customer"}
                        </span>
                      </div>

                      {/* Narration / Reference */}
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-600 dark:text-gray-400">
                          Narration / Ref:
                        </span>
                        <span className="font-mono font-bold bg-white dark:bg-gray-900 px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-700 shadow-2xs">
                          {order.transferNote || "No note provided"}
                        </span>
                      </div>
                    </div>

                    {/* Copy Reference Button */}
                    {order.transferNote && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(order.transferNote, order._id)}
                        className="px-3 py-1.5 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold text-gray-800 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-gray-700 shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 w-fit shrink-0"
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

      {/* Pagination Bar Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={limit}
        onPageChange={(newPage) => {
          setCurrentPage(newPage);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* 🛡️ Destructive Action Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(orderToCancel)}
        onClose={() => setOrderToCancel(null)}
        onConfirm={handleConfirmCancelOrder}
        isLoading={isCancellingOrder}
        title="Are you sure?"
        message="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  );
};

export default Orders;