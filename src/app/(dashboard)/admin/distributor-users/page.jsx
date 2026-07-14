"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DistributorSelect from "@/components/distributor/DistributorSelect";

const roleOptions = ["Owner", "Sales operator", "Accounts viewer", "Read only"];

function Message({ text }) {
  if (!text) return null;
  return <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">{text}</div>;
}

export default function DistributorUsersAdminPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [users, setUsers] = useState([]);
  const [savingUserId, setSavingUserId] = useState("");
  const [form, setForm] = useState({
    distributorAccountId: "",
    fullName: "",
    designation: "",
    mobileNumber: "",
    emailAddress: "",
    role: "Read only",
    financeAccess: false,
    loginEnabled: true,
    isActive: true,
  });

  async function loadData() {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/distributor-users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to load distributor users");
      setAccounts(data.distributorAccounts || []);
      setUsers(data.users || []);
    } catch (error) {
      setMessage(error.message || "Failed to load distributor users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function createUser(e) {
    e.preventDefault();
    try {
      setMessage("");
      if (!form.distributorAccountId) {
        throw new Error("Select a distributor account first");
      }
      if (String(form.mobileNumber || "").replace(/\D/g, "").length !== 10) {
        throw new Error("Enter a valid 10-digit mobile number");
      }
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/distributor-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to create distributor user");
      setMessage(data.message || "Distributor user created");
      setForm({
        distributorAccountId: "",
        fullName: "",
        designation: "",
        mobileNumber: "",
        emailAddress: "",
        role: "Read only",
        financeAccess: false,
        loginEnabled: true,
        isActive: true,
      });
      await loadData();
    } catch (error) {
      setMessage(error.message || "Failed to create distributor user");
    }
  }

  async function saveUser(user) {
    try {
      setSavingUserId(user.id);
      setMessage("");
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/distributor-users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          role: user.role,
          designation: user.designation,
          emailAddress: user.emailAddress,
          financeAccess: user.financeAccess,
          loginEnabled: user.loginEnabled,
          isActive: user.isActive,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to update distributor user");
      setMessage(data.message || "Distributor user updated");
    } catch (error) {
      setMessage(error.message || "Failed to update distributor user");
    } finally {
      setSavingUserId("");
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-amber-700 p-6 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">Distributor Users</p>
        <h1 className="mt-2 text-3xl font-semibold">OTP user management</h1>
        <p className="mt-2 max-w-3xl text-sm text-blue-50">Create and control distributor app login users by mobile number, role, and finance access.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/distributor-accounts" className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700">Distributor accounts</Link>
        <Link href="/admin/distributor-setup" className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700">Connection setup</Link>
        <Link href="/admin/distributor-otp" className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700">OTP readiness</Link>
      </div>

      <Message text={message} />

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Create distributor user</h2>
        <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={createUser}>
          <DistributorSelect value={form.distributorAccountId} onChange={(value) => setForm((s) => ({ ...s, distributorAccountId: value }))} placeholder="Select distributor account" options={accounts.map((account) => ({ value: account.id, label: account.label }))} />
          <input value={form.fullName} onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))} placeholder="Full name" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
          <input value={form.designation} onChange={(e) => setForm((s) => ({ ...s, designation: e.target.value }))} placeholder="Designation" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
          <input value={form.mobileNumber} onChange={(e) => setForm((s) => ({ ...s, mobileNumber: e.target.value }))} placeholder="10-digit mobile number" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
          <input value={form.emailAddress} onChange={(e) => setForm((s) => ({ ...s, emailAddress: e.target.value }))} placeholder="Email address" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
          <DistributorSelect value={form.role} onChange={(value) => setForm((s) => ({ ...s, role: value }))} options={roleOptions} aria-label="User role" />
          <div className="flex items-center gap-6 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.loginEnabled} onChange={(e) => setForm((s) => ({ ...s, loginEnabled: e.target.checked }))} /> Login enabled</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.financeAccess} onChange={(e) => setForm((s) => ({ ...s, financeAccess: e.target.checked }))} /> Finance access</label>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Create user</button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Distributor app users</h2>
        </div>
        {loading ? <div className="px-5 py-6 text-sm text-gray-500">Loading users...</div> : null}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Distributor</th>
                <th className="px-4 py-3 font-medium">Mobile</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Flags</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{user.fullName}</div>
                    <div className="text-xs text-gray-500">{user.designation || "-"}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{user.distributorLabel}</td>
                  <td className="px-4 py-3 text-gray-700">{user.mobileNumber}</td>
                  <td className="px-4 py-3">
                    <input value={user.emailAddress || ""} onChange={(e) => setUsers((current) => current.map((row) => row.id === user.id ? { ...row, emailAddress: e.target.value } : row))} placeholder="Email" className="rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                  </td>
                  <td className="px-4 py-3">
                    <DistributorSelect value={user.role} onChange={(value) => setUsers((current) => current.map((row) => row.id === user.id ? { ...row, role: value } : row))} options={roleOptions} aria-label={`Role for ${user.fullName}`} />
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2"><input type="checkbox" checked={user.loginEnabled} onChange={(e) => setUsers((current) => current.map((row) => row.id === user.id ? { ...row, loginEnabled: e.target.checked } : row))} /> Login</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={user.financeAccess} onChange={(e) => setUsers((current) => current.map((row) => row.id === user.id ? { ...row, financeAccess: e.target.checked } : row))} /> Finance</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={user.isActive} onChange={(e) => setUsers((current) => current.map((row) => row.id === user.id ? { ...row, isActive: e.target.checked } : row))} /> Active</label>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => saveUser(user)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700">
                      {savingUserId === user.id ? "Saving..." : "Save"}
                    </button>
                  </td>
                </tr>
              ))}
              {!users.length && !loading ? <tr><td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500">No distributor users found.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
