import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { backendUrl as AppBackendUrl } from "../App";
import { toast } from "react-toastify";

const ManageUsers = ({ token }) => {
  const adminToken = token || localStorage.getItem("adminToken") || localStorage.getItem("token") || "";
  const backendUrl =
    AppBackendUrl ||
    import.meta.env.VITE_BACKEND_URL ||
    "http://localhost:4000";

  const [activeTab, setActiveTab] = useState("list");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("customer");
  const [status, setStatus] = useState("active");
  const [creating, setCreating] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState("customer");
  const [editStatus, setEditStatus] = useState("active");
  const [editPassword, setEditPassword] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(backendUrl + "/api/user/admin/list", {
        headers: { token: adminToken },
      });
      if (response.data && response.data.success) {
        setUsers(response.data.users || []);
      } else {
        toast.error(response.data.message || "Failed to load users");
      }
    } catch (error) {
      console.error("Fetch users error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const stats = useMemo(() => {
    const total = users.length;
    const customers = users.filter((u) => (u.role || "customer") === "customer").length;
    const subadmins = users.filter((u) => u.role === "subadmin" || u.role === "admin").length;
    const blocked = users.filter((u) => u.status === "blocked").length;
    return { total, customers, subadmins, blocked };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const userRole = u.role || "customer";
      const userStatus = u.status || "active";

      const matchesRole = roleFilter === "All" || userRole === roleFilter;
      const matchesStatus = statusFilter === "All" || userStatus === statusFilter;

      const q = searchQuery.toLowerCase();
      const matchesQuery =
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q);

      return matchesRole && matchesStatus && matchesQuery;
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setCreating(true);
    try {
      const response = await axios.post(
        backendUrl + "/api/user/admin/create",
        {
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          role,
          status,
        },
        { headers: { token: adminToken } }
      );

      if (response.data.success) {
        toast.success(response.data.message || "User created successfully!");
        setName("");
        setEmail("");
        setPassword("");
        setPhone("");
        setRole("customer");
        setStatus("active");
        setActiveTab("list");
        await fetchUsers();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditPhone(user.phone || "");
    setEditRole(user.role || "customer");
    setEditStatus(user.status || "active");
    setEditPassword("");
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setSavingEdit(true);
    try {
      const response = await axios.post(
        backendUrl + "/api/user/admin/update",
        {
          id: editingUser._id,
          name: editName.trim(),
          email: editEmail.trim(),
          phone: editPhone.trim(),
          role: editRole,
          status: editStatus,
          password: editPassword.trim() || undefined,
        },
        { headers: { token: adminToken } }
      );

      if (response.data.success) {
        toast.success(response.data.message || "User updated successfully!");
        setEditingUser(null);
        await fetchUsers();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const isCurrentlyBlocked = user.status === "blocked";
    const confirmMsg = isCurrentlyBlocked
      ? `Unblock "${user.name}"? They will regain access to log in.`
      : `Block/Suspend "${user.name}"? They will be prevented from logging in.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const response = await axios.post(
        backendUrl + "/api/user/admin/toggle-status",
        { id: user._id },
        { headers: { token: adminToken } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchUsers();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleDeleteUser = async (user) => {
    if (
      !window.confirm(
        `⚠️ Permanently delete user "${user.name}" (${user.email})?\nThis action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await axios.post(
        backendUrl + "/api/user/admin/delete",
        { id: user._id },
        { headers: { token: adminToken } }
      );

      if (response.data.success) {
        toast.info(response.data.message || "User removed");
        await fetchUsers();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-gray-200 rounded-xl shadow-xs">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            User & Sub-Admin Management
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Register new customers or staff, manage permissions, and block or remove users.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg shrink-0">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "list"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            👥 All Users ({stats.total})
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === "create"
                ? "bg-black text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            ➕ Register User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Total Accounts
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Customers
          </p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.customers}</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Sub-Admins & Staff
          </p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{stats.subadmins}</p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Blocked / Suspended
          </p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.blocked}</p>
        </div>
      </div>

      {activeTab === "list" && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3.5 py-2 pl-9 text-xs sm:text-sm border border-gray-300 rounded-lg focus:border-black outline-none"
              />
              <span className="absolute left-3 top-2.5 text-gray-400 text-xs">
                🔍
              </span>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs sm:text-sm font-medium border border-gray-300 rounded-lg bg-white outline-none cursor-pointer"
              >
                <option value="All">All Roles</option>
                <option value="customer">🛍️ Customers Only</option>
                <option value="subadmin">🛡️ Sub-Admins Only</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs sm:text-sm font-medium border border-gray-300 rounded-lg bg-white outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="active">🟢 Active</option>
                <option value="blocked">🔴 Blocked</option>
              </select>

              <button
                onClick={fetchUsers}
                className="px-3.5 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-500 animate-pulse">
              Loading user accounts...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center bg-gray-50/60 border border-dashed border-gray-300 rounded-2xl p-6">
              <p className="text-3xl mb-2">👤</p>
              <p className="text-lg font-bold text-gray-800">No users found</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredUsers.map((u) => {
                const isBlocked = u.status === "blocked";
                const isSubAdmin = u.role === "subadmin" || u.role === "admin";

                return (
                  <div
                    key={u._id}
                    className={`p-4 border rounded-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isBlocked
                        ? "bg-red-50/40 border-red-200"
                        : "bg-gray-50/40 border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {u.image ? (
                        <img
                          src={u.image}
                          alt={u.name}
                          className="w-11 h-11 rounded-full object-cover border-2 border-gray-300 shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gray-800 text-white font-bold flex items-center justify-center shrink-0 uppercase text-sm shadow-xs">
                          {u.name?.slice(0, 2) || "US"}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm sm:text-base font-bold text-gray-900">
                            {u.name}
                          </h4>

                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                              isSubAdmin
                                ? "bg-purple-100 text-purple-700 border border-purple-300"
                                : "bg-blue-100 text-blue-700 border border-blue-300"
                            }`}
                          >
                            {isSubAdmin ? "🛡️ Sub-Admin" : "🛍️ Customer"}
                          </span>

                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                              isBlocked
                                ? "bg-red-100 text-red-700 border border-red-300"
                                : "bg-green-100 text-green-700 border border-green-300"
                            }`}
                          >
                            {isBlocked ? "⛔ Blocked" : "🟢 Active"}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 mt-0.5">
                          {u.email} {u.phone && `• 📞 ${u.phone}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-xs ${
                          isBlocked
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-amber-500 hover:bg-amber-600 text-white"
                        }`}
                      >
                        {isBlocked ? "🔓 Unblock" : "🔒 Block"}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u)}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer shadow-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "create" && (
        <form
          onSubmit={handleCreateUser}
          className="flex flex-col gap-6 p-6 sm:p-8 bg-white border border-gray-200 rounded-xl shadow-xs"
        >
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">
              ➕ Register New User or Staff
            </h3>
            <button
              type="button"
              onClick={() => setActiveTab("list")}
              className="text-xs font-semibold text-gray-600 hover:text-black underline cursor-pointer"
            >
              Cancel & View Directory
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-xs sm:text-sm font-semibold text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Connor"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-black outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 text-xs sm:text-sm font-semibold text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-black outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-xs sm:text-sm font-semibold text-gray-700">
                Password (min 8 characters) *
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-black outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 text-xs sm:text-sm font-semibold text-gray-700">
                Phone Number (Optional)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1-234-567-8900"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-black outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-xs sm:text-sm font-semibold text-gray-700">
                Account Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:border-black outline-none font-medium"
              >
                <option value="customer">🛍️ Customer (Store Shopper)</option>
                <option value="subadmin">🛡️ Sub-Admin (Admin Access)</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-xs sm:text-sm font-semibold text-gray-700">
                Initial Account Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:border-black outline-none font-medium"
              >
                <option value="active">🟢 Active (Allowed to log in)</option>
                <option value="blocked">🔴 Blocked (Suspended)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("list")}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-8 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider bg-black text-white rounded-lg hover:bg-gray-800 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              {creating ? "Creating Account..." : "Register User"}
            </button>
          </div>
        </form>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                ✏️ Edit Account: {editingUser.name}
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-gray-700 text-2xl font-bold leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-xs font-semibold text-gray-700">
                    Account Role
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="customer">🛍️ Customer</option>
                    <option value="subadmin">🛡️ Sub-Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-xs font-semibold text-gray-700">
                    Account Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white font-semibold"
                  >
                    <option value="active">🟢 Active</option>
                    <option value="blocked">🔴 Blocked</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-xs font-semibold text-gray-700">
                  Reset Password (Optional - leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Enter new password (min 8 chars)"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  disabled={savingEdit}
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-6 py-2 text-xs sm:text-sm font-bold text-white bg-black rounded-lg hover:bg-gray-800 active:scale-95 transition-all shadow-xs"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;