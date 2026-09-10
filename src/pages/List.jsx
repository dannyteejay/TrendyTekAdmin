import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl, currency } from "../App";
import {
  DataTable,
  SearchBar,
  ConfirmDialog,
  StatCard,
} from "../components/common";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteProductInfo, setDeleteProductInfo] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Fetch Product Catalog
  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setList(response.data.products.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to load product list.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Remove Product with Server-Side RBAC Enforcement
  const handleDeleteProduct = async () => {
    if (!deleteProductInfo) return;
    try {
      setIsDeleting(true);
      const response = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id: deleteProductInfo._id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(`"${deleteProductInfo.name}" removed successfully.`);
        setDeleteProductInfo(null);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete product.";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // Filter products by search query
  const filteredProducts = list.filter((item) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.subCategory && item.subCategory.toLowerCase().includes(q))
    );
  });

  // Calculate Catalog KPI Metrics
  const totalItemsCount = list.length;
  const uniqueCategories = new Set(list.map((p) => p.category).filter(Boolean))
    .size;
  const averagePrice =
    totalItemsCount > 0
      ? (
          list.reduce((acc, p) => acc + (Number(p.price) || 0), 0) /
          totalItemsCount
        ).toFixed(2)
      : "0.00";

  // Define Table Columns
  const columns = [
    {
      header: "Image",
      render: (row) => (
        <img
          className="w-12 h-12 object-cover rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800"
          src={Array.isArray(row.image) && row.image.length > 0 ? row.image[0] : row.image}
          alt={row.name}
        />
      ),
    },
    {
      header: "Product Name",
      accessor: "name",
      render: (row) => (
        <div>
          <p className="font-bold text-gray-900 dark:text-gray-100">{row.name}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">ID: #{row._id.slice(-6)}</p>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: "category",
      render: (row) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          {row.category || "Uncategorized"}
        </span>
      ),
    },
    {
      header: "Price",
      render: (row) => (
        <span className="font-extrabold text-gray-900 dark:text-white">
          {currency}{row.price}
        </span>
      ),
    },
    {
      header: "Sizes / Stock",
      render: (row) => (
        <div className="flex gap-1 flex-wrap">
          {Array.isArray(row.sizes) && row.sizes.length > 0
            ? row.sizes.map((s) => (
                <span
                  key={s}
                  className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                >
                  {s}
                </span>
              ))
            : "—"}
        </div>
      ),
    },
    {
      header: "Action",
      className: "text-right",
      render: (row) => (
        <div className="text-right">
          <button
            onClick={() => setDeleteProductInfo(row)}
            className="px-3 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header & Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Product Catalog
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage, search, and monitor active store inventory.
        </p>
      </div>

      {/* 2. Top Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Products"
          value={totalItemsCount.toString()}
          subtitle="Active items in store"
          color="blue"
          icon="🛍️"
        />
        <StatCard
          title="Categories"
          value={uniqueCategories.toString()}
          subtitle="Taxonomy groups"
          color="purple"
          icon="📂"
        />
        <StatCard
          title="Average Item Price"
          value={`${currency}${averagePrice}`}
          subtitle="Catalog-wide pricing"
          color="green"
          icon="🏷️"
        />
      </div>

      {/* 3. Search Bar Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by name, category, or type..."
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium self-end sm:self-center">
          Showing <span className="font-bold text-gray-900 dark:text-white">{filteredProducts.length}</span> of {totalItemsCount} products
        </p>
      </div>

      {/* 4. Modular Data Table */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        isLoading={loading}
        emptyTitle="No products match your search"
        emptyDescription="Try clearing your search query or add a new product from the sidebar."
        emptyIcon="🔍"
      />

      {/* 5. Destructive Action Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteProductInfo)}
        onClose={() => setDeleteProductInfo(null)}
        onConfirm={handleDeleteProduct}
        isLoading={isDeleting}
        title="Are you sure?"
        message="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  );
};

export default List;