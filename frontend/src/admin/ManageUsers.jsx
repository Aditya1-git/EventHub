import React, { useState, useEffect } from 'react';
import {
  Search,
  Users,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  Trash2,
  Mail,
  Phone,
  Ticket,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from '../components/ConfirmationModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const { user: currentAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('All');
  const [page, setPage] = useState(1);

  // Modal states
  const [targetUser, setTargetUser] = useState(null);
  const [modalAction, setModalAction] = useState(null); // 'role' | 'delete'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (role !== 'All') params.append('role', role);
      params.append('page', page);
      params.append('limit', 10);

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.users);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleOpenRoleModal = (u) => {
    setTargetUser(u);
    setModalAction('role');
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (u) => {
    setTargetUser(u);
    setModalAction('delete');
    setIsModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!targetUser) return;
    try {
      setProcessing(true);

      if (modalAction === 'role') {
        const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
        const res = await api.put(`/admin/users/${targetUser._id}/role`, { role: newRole });
        if (res.data.success) {
          toast.success(`User role changed to ${newRole}`);
          setUsers((prev) =>
            prev.map((u) => (u._id === targetUser._id ? { ...u, role: newRole } : u))
          );
          setIsModalOpen(false);
        }
      } else if (modalAction === 'delete') {
        const res = await api.delete(`/admin/users/${targetUser._id}`);
        if (res.data.success) {
          toast.success('User and user registrations removed');
          setUsers((prev) => prev.filter((u) => u._id !== targetUser._id));
          setTotal((prev) => prev - 1);
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Manage Users
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          View registered accounts and manage roles.
        </p>
      </div>

      {/* Filter Row */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full md:max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Roles</option>
            <option value="user">Regular Users</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="md" text="Loading users..." />
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Member Since</th>
                  <th className="py-3.5 px-4">Registrations</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {users.map((u) => {
                  const isAdminUser = u.role === 'admin';
                  const isCurrent = u._id === currentAdmin?._id;
                  const memberDate = u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : '2026';

                  return (
                    <tr
                      key={u._id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs border border-slate-700">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <p className="font-bold text-white">{u.name}</p>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-900 text-indigo-300">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400">ID: {u._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4">
                        <p className="text-white flex items-center space-x-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{u.email}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{u.phone}</span>
                        </p>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        {isAdminUser ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center space-x-1 w-fit">
                            <Shield className="w-3 h-3" />
                            <span>Administrator</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center space-x-1 w-fit">
                            <span>User</span>
                          </span>
                        )}
                      </td>

                      {/* Member Since */}
                      <td className="py-3 px-4 text-slate-400 font-medium">
                        {memberDate}
                      </td>

                      {/* Registrations */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-white font-bold font-mono">
                          {u.totalRegistrations || 0}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Toggle Role Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenRoleModal(u)}
                            title={isAdminUser ? 'Demote to Regular User' : 'Promote to Administrator'}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px] font-semibold cursor-pointer"
                          >
                            {isAdminUser ? 'Demote to User' : 'Make Admin'}
                          </button>

                          {/* Delete User Button */}
                          <button
                            type="button"
                            disabled={isCurrent}
                            onClick={() => handleOpenDeleteModal(u)}
                            title={isCurrent ? 'Cannot delete your own account' : 'Delete user'}
                            className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 disabled:opacity-30 text-rose-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-400">
            <p>No users found matching your search.</p>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-800/40 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing Page {page} of {totalPages} ({total} users)
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-medium"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={modalAction === 'role' ? 'Update User Role?' : 'Delete User Account?'}
        message={
          modalAction === 'role'
            ? `Are you sure you want to change ${targetUser?.name}'s role to ${
                targetUser?.role === 'admin' ? 'Regular User' : 'Administrator'
              }?`
            : `Are you sure you want to permanently delete user account "${targetUser?.name}" (${targetUser?.email})? All their event registrations will also be removed.`
        }
        confirmText={modalAction === 'role' ? 'Change Role' : 'Yes, Delete User'}
        cancelText="Cancel"
        isDestructive={modalAction === 'delete'}
        isLoading={processing}
      />
    </div>
  );
};

export default ManageUsers;
