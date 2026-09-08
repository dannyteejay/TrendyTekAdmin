import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { backendUrl as AppBackendUrl } from "../App";
import { toast } from "react-toastify";

// Palette for pie chart segments
const CHART_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#EF4444", // Red
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#6366F1", // Indigo
  "#14B8A6", // Teal
];

// Interactive SVG Pie/Donut Chart Component
const PieChart = ({ data = [], title, currency = "$", isAmount = false }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const total = useMemo(() => {
    return data.reduce((acc, curr) => acc + (curr.value || 0), 0);
  }, [data]);

  // Compute slice angles & SVG path coordinates
  const slices = useMemo(() => {
    if (!data || data.length === 0 || total === 0) return [];

    let accumulatedAngle = 0;
    const cx = 100;
    const cy = 100;
    const radius = 80;

    return data.map((item, idx) => {
      const val = Number(item.value) || 0;
      const percentage = (val / total) * 100;
      const angle = (val / total) * 2 * Math.PI;
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + angle;
      accumulatedAngle = endAngle;

      // When a single slice is 100% (or very close)
      if (percentage >= 99.9) {
        return {
          ...item,
          value: val,
          color: item.color || CHART_COLORS[idx % CHART_COLORS.length],
          percentage: 100,
          path: `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.001} ${cy - radius} Z`,
          centerAngle: startAngle + angle / 2,
        };
      }

      const x1 = cx + radius * Math.cos(startAngle - Math.PI / 2);
      const y1 = cy + radius * Math.sin(startAngle - Math.PI / 2);
      const x2 = cx + radius * Math.cos(endAngle - Math.PI / 2);
      const y2 = cy + radius * Math.sin(endAngle - Math.PI / 2);
      const largeArc = angle > Math.PI ? 1 : 0;

      const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      return {
        ...item,
        value: val,
        color: item.color || CHART_COLORS[idx % CHART_COLORS.length],
        percentage: Number(percentage.toFixed(1)),
        path,
        centerAngle: startAngle + angle / 2,
      };
    });
  }, [data, total]);

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-2xl shadow-xs transition-all hover:shadow-md overflow-hidden">
      {/* Card Header with Title and Total */}
      <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between gap-2 bg-gray-50/50">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
          {title}
        </h3>
        <div className="text-right shrink-0">
          <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider leading-none">
            Total
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-gray-900 mt-0.5 block">
            {isAmount
              ? `${currency}${total.toLocaleString()}`
              : total.toLocaleString()}
          </span>
        </div>
      </div>

      {total === 0 || slices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <p className="text-3xl mb-1">📊</p>
          <p className="text-xs font-semibold">No sales data recorded yet</p>
        </div>
      ) : (
        <div className="p-4 sm:p-5 flex flex-col flex-1">
          {/* Centered Donut Chart on Top */}
          <div className="relative w-44 h-44 sm:w-48 sm:h-48 mx-auto my-2 shrink-0">
            <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
              {slices.map((slice, idx) => {
                const isHovered = hoveredIdx === idx;
                return (
                  <path
                    key={idx}
                    d={slice.path}
                    fill={slice.color}
                    className="transition-all duration-200 cursor-pointer"
                    style={{
                      opacity: hoveredIdx === null || isHovered ? 1 : 0.45,
                      transform: isHovered ? "scale(1.04)" : "scale(1)",
                      transformOrigin: "100px 100px",
                    }}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                );
              })}
              {/* Inner Donut cutout */}
              <circle cx="100" cy="100" r="50" fill="#ffffff" />
            </svg>

            {/* Centered Donut Stat Preview */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
              {hoveredIdx !== null && slices[hoveredIdx] ? (
                <>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 truncate max-w-[90px]">
                    {slices[hoveredIdx].label}
                  </span>
                  <span className="text-lg font-extrabold text-gray-900">
                    {slices[hoveredIdx].percentage}%
                  </span>
                  <span className="text-[10px] font-semibold text-gray-500 truncate max-w-[100px]">
                    {isAmount
                      ? `${currency}${Number(slices[hoveredIdx].value).toLocaleString()}`
                      : `${slices[hoveredIdx].value} orders`}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {isAmount ? "Total Sales" : "Total Orders"}
                  </span>
                  <span className="text-base sm:text-lg font-extrabold text-gray-900 truncate max-w-[100px]">
                    {isAmount
                      ? `${currency}${total.toLocaleString()}`
                      : total.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {slices.length} {slices.length === 1 ? "category" : "segments"}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Full-Width Legend & Amount List Below Chart */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-1.5 flex-1">
            {slices.map((slice, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                    isHovered
                      ? "bg-gray-100 shadow-2xs font-semibold"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {/* Left: Color dot & Name */}
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span
                      className="text-xs font-medium text-gray-800 truncate"
                      title={slice.label}
                    >
                      {slice.label}
                    </span>
                  </div>

                  {/* Right: Value & Percentage Pill */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-gray-900">
                      {isAmount
                        ? `${currency}${slice.value.toLocaleString()}`
                        : slice.value.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 min-w-[42px] text-center">
                      {slice.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard = ({ token, currency = "$" }) => {
  const adminToken =
    token ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token") ||
    "";
  const backendUrl =
    AppBackendUrl ||
    import.meta.env.VITE_BACKEND_URL ||
    "http://localhost:4000";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState("all"); // 'all' | '30days' | '7days' | 'today'

  // Fetch all orders from backend
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        backendUrl + "/api/order/list",
        {},
        { headers: { token: adminToken } }
      );
      if (response.data && response.data.success) {
        setOrders(response.data.orders || []);
      } else {
        toast.error(response.data.message || "Failed to load sales data");
      }
    } catch (error) {
      console.error("Sales data error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders by selected timeframe
  const filteredOrders = useMemo(() => {
    if (timeframe === "all") return orders;

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    return orders.filter((order) => {
      const orderDate = new Date(order.date).getTime();
      if (timeframe === "today") {
        return now - orderDate <= dayMs;
      }
      if (timeframe === "7days") {
        return now - orderDate <= 7 * dayMs;
      }
      if (timeframe === "30days") {
        return now - orderDate <= 30 * dayMs;
      }
      return true;
    });
  }, [orders, timeframe]);

  // 1. KPI Statistics
  const kpis = useMemo(() => {
    let totalRevenue = 0;
    let completedOrders = 0;

    filteredOrders.forEach((o) => {
      totalRevenue += Number(o.amount) || 0;
      if (o.status === "Delivered" || o.payment === true) {
        completedOrders += 1;
      }
    });

    const totalOrders = filteredOrders.length;
    const avgOrderValue =
      totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    return {
      totalRevenue,
      totalOrders,
      completedOrders,
      avgOrderValue,
    };
  }, [filteredOrders]);

  // 2. Data for: Sales by Payment Gateway (Revenue in $)
  const paymentMethodData = useMemo(() => {
    const map = {};
    filteredOrders.forEach((o) => {
      const method = o.paymentMethod || "Other";
      const amt = Number(o.amount) || 0;
      map[method] = (map[method] || 0) + amt;
    });

    return Object.entries(map).map(([label, value]) => ({
      label,
      value,
    }));
  }, [filteredOrders]);

  // 3. Data for: Sales by Product Category ($ Revenue)
  const categorySalesData = useMemo(() => {
    const map = {};
    filteredOrders.forEach((o) => {
      if (Array.isArray(o.items)) {
        o.items.forEach((item) => {
          const cat = item.category || "General";
          const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
          map[cat] = (map[cat] || 0) + itemTotal;
        });
      }
    });

    return Object.entries(map).map(([label, value]) => ({
      label,
      value,
    }));
  }, [filteredOrders]);

  // 4. Data for: Orders by Status (Count)
  const orderStatusData = useMemo(() => {
    const map = {};
    filteredOrders.forEach((o) => {
      const status = o.status || "Order Placed";
      map[status] = (map[status] || 0) + 1;
    });

    return Object.entries(map).map(([label, value]) => ({
      label,
      value,
    }));
  }, [filteredOrders]);

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-gray-200 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            📊 Sales & Revenue Analytics
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time visual breakdown of revenue, payment gateways, product categories, and order fulfillment.
          </p>
        </div>

        {/* Timeframe selector & Refresh */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold border border-gray-300 rounded-xl bg-white outline-none cursor-pointer shadow-2xs"
          >
            <option value="all">📅 All Time Sales</option>
            <option value="30days">🗓️ Past 30 Days</option>
            <option value="7days">⚡ Past 7 Days</option>
            <option value="today">☀️ Today's Orders</option>
          </select>

          <button
            onClick={fetchOrders}
            className="px-4 py-2 text-xs sm:text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Revenue
            </p>
            <span className="p-2 rounded-xl bg-green-50 text-green-600 text-base">
              💰
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
            {currency}
            {kpis.totalRevenue.toLocaleString()}
          </p>
          <span className="text-[11px] font-semibold text-green-600 mt-1 block">
            ● Live Calculated Gross Sales
          </span>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Orders
            </p>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 text-base">
              📦
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
            {kpis.totalOrders}
          </p>
          <span className="text-[11px] font-semibold text-blue-600 mt-1 block">
            ● Across All Customers
          </span>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Avg Order Value
            </p>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600 text-base">
              📈
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
            {currency}
            {kpis.avgOrderValue.toLocaleString()}
          </p>
          <span className="text-[11px] font-semibold text-purple-600 mt-1 block">
            ● Average per customer checkout
          </span>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Delivered / Paid
            </p>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 text-base">
              ✅
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
            {kpis.completedOrders}
          </p>
          <span className="text-[11px] font-semibold text-amber-600 mt-1 block">
            ● Successfully processed
          </span>
        </div>
      </div>

      {/* Pie Charts Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-500 animate-pulse bg-white rounded-2xl border">
          <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Generating pie-charts and analytics...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Pie Chart 1: Payment Method Revenue */}
          <PieChart
            data={paymentMethodData}
            title="💳 Sales by Payment Gateway"
            currency={currency}
            isAmount={true}
          />

          {/* Pie Chart 2: Category Revenue */}
          <PieChart
            data={categorySalesData}
            title="🛍️ Sales by Product Category"
            currency={currency}
            isAmount={true}
          />

          {/* Pie Chart 3: Order Status Distribution */}
          <PieChart
            data={orderStatusData}
            title="🚚 Orders by Status"
            currency={currency}
            isAmount={false}
          />
        </div>
      )}

      {/* Recent Orders Overview Table */}
      <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Recent Customer Transactions
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Latest order events contributing to your sales charts
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-400">
            Showing {Math.min(filteredOrders.length, 6)} latest
          </span>
        </div>

        {filteredOrders.length === 0 ? (
          <p className="py-12 text-center text-gray-400 text-xs sm:text-sm">
            No order transactions found for this timeframe.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-2">Order Date</th>
                  <th className="py-3 px-2">Customer</th>
                  <th className="py-3 px-2">Items</th>
                  <th className="py-3 px-2">Payment Method</th>
                  <th className="py-3 px-2">Total Amount</th>
                  <th className="py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.slice(0, 6).map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2 text-gray-500 whitespace-nowrap">
                      {new Date(order.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-2 font-semibold text-gray-900 whitespace-nowrap">
                      {order.address?.firstName || "Customer"}{" "}
                      {order.address?.lastName || ""}
                    </td>
                    <td className="py-3 px-2 text-gray-600 truncate max-w-[160px]">
                      {order.items?.map((i) => i.name).join(", ") || "Products"}
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap">
                      <span className="px-2.5 py-1 text-[11px] font-bold bg-gray-100 text-gray-800 rounded-md">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-bold text-gray-900 whitespace-nowrap">
                      {currency}
                      {Number(order.amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "Shipped"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {order.status || "Order Placed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;