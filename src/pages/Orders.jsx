import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency as defaultCurrency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const Orders = ({ token, currency: propCurrency }) => {
  const [orders, setOrders] = useState([]);

  // Use dynamic currency from Admin Navbar, fallback to default '$'
  const activeCurrency = propCurrency || defaultCurrency || "$";

  const fetchAllOrders = async () => {
    if (!token) {
      return null;
    }

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
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/status",
        { orderId, status: event.target.value },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Status updated");
        await fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div>
      <h3 className="mb-4 text-xl font-semibold">Order Management</h3>
      <div>
        {orders.length === 0 ? (
          <p className="py-8 text-center text-gray-500">No orders found.</p>
        ) : (
          orders.map((order, index) => (
            <div
              className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700 bg-white rounded-lg shadow-sm"
              key={index}
            >
              <img
                className="w-12 mx-auto sm:mx-0"
                src={assets.parcel_icon}
                alt="Parcel Icon"
              />

              {/* Order Items & Customer Details */}
              <div>
                <div className="font-medium text-gray-900">
                  {order.items.map((item, itemIdx) => {
                    const isLast = itemIdx === order.items.length - 1;
                    const showSize =
                      item.size &&
                      item.size !== "Default" &&
                      item.size !== "";

                    return (
                      <p className="py-0.5" key={itemIdx}>
                        {item.name} × {item.quantity}
                        {showSize && (
                          <span className="px-1.5 py-0.5 ml-1 text-xs bg-gray-100 border rounded font-semibold text-gray-700">
                            {item.size}
                          </span>
                        )}
                        {!isLast && ","}
                      </p>
                    );
                  })}
                </div>

                <p className="mt-3 mb-1 font-semibold text-gray-800">
                  {order.address?.firstName || ""} {order.address?.lastName || ""}
                </p>

                <div className="text-gray-500">
                  <p>{order.address?.street ? order.address.street + "," : ""}</p>
                  <p>
                    {[
                      order.address?.city,
                      order.address?.state,
                      order.address?.country,
                      order.address?.zipcode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
                <p className="mt-1 text-gray-600 font-medium">
                  📞 {order.address?.phone || "N/A"}
                </p>
              </div>

              {/* Order Metadata */}
              <div>
                <p className="text-sm sm:text-[15px] font-medium">
                  Total Items: {order.items.length}
                </p>
                <p className="mt-2">
                  <span className="font-medium">Method:</span>{" "}
                  {order.paymentMethod}
                </p>
                <p>
                  <span className="font-medium">Payment:</span>{" "}
                  <span
                    className={`font-semibold ${
                      order.payment ? "text-green-600" : "text-amber-600"
                    }`}
                  >
                    {order.payment ? "Done" : "Pending"}
                  </span>
                </p>
                <p className="mt-1 text-gray-500">
                  Date: {new Date(order.date).toLocaleDateString()}
                </p>
              </div>

              {/* Accurate Formatted Price */}
              <p className="text-base sm:text-lg font-bold text-gray-900">
                {activeCurrency}
                {Number(order.amount).toLocaleString()}
              </p>

              {/* Status Selector */}
              <select
                onChange={(event) => statusHandler(event, order._id)}
                value={order.status}
                className="p-2 text-xs sm:text-sm font-semibold border border-gray-300 rounded bg-gray-50 cursor-pointer focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="Order Placed">Order Placed</option>
                <option value="Packing">Packing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;