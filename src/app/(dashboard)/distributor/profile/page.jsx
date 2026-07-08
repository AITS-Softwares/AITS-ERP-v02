"use client";

import Link from "next/link";
import { useDistributorAppData } from "@/components/distributor/DistributorDataProvider";
import { FormCard, MockInput, PageIntro, SectionHeading, Surface } from "@/components/distributor/DistributorUI";

export default function DistributorProfilePage() {
  const { data } = useDistributorAppData();
  const distributorUser = data.profile || {};
  const savedAddresses = data.savedAddresses || [];
  const teamMembers = data.teamMembers || [];

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Profile"
        title="Distributor profile and account controls"
        description="Manage ERPNext-linked customer details, team access, and saved delivery addresses from one account view."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Surface className="p-6">
          <div className="rounded-[2rem] bg-gradient-to-br from-[#105B92] to-[#0B2034] p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">Mapped distributor</p>
            <h2 className="mt-3 text-2xl font-semibold">{distributorUser.name || "Distributor account"}</h2>
            <p className="mt-2 text-sm text-blue-100">
              {distributorUser.code || "No distributor code"}
              {distributorUser.city ? ` | ${distributorUser.city}` : ""}
            </p>
          </div>
          <div className="mt-5 grid gap-3 text-sm">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-slate-500">Available credit</p>
              <p className="mt-1 font-semibold text-slate-900">{distributorUser.availableCredit || "Not available"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-slate-500">Credit limit</p>
              <p className="mt-1 font-semibold text-slate-900">{distributorUser.creditLimit || "Not available"}</p>
            </div>
          </div>
        </Surface>

        <FormCard title="Business details" description="Profile fields will populate from mapped distributor and ERPNext customer records.">
          <div className="grid gap-4 sm:grid-cols-2">
            <MockInput label="Customer name" value={distributorUser.name || "Pending configuration"} />
            <MockInput label="Customer / distributor code" value={distributorUser.code || "Pending configuration"} />
            <MockInput label="Contact mobile" value={distributorUser.phone || "Pending configuration"} />
            <MockInput label="Territory" value={distributorUser.route || "Pending configuration"} />
            <MockInput label="Default warehouse" value={distributorUser.preferredWarehouse || "Pending configuration"} />
            <MockInput label="Login mode" value="Mobile OTP" />
          </div>
          <MockInput label="Billing / shipping address" value={savedAddresses[0]?.address || "Address will appear after distributor mapping is completed."} />
        </FormCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Surface className="p-5 sm:p-6">
          <SectionHeading
            title="Team access"
            caption="Manage multiple users under one distributor account."
            action={
              <Link href="/distributor/access" className="text-sm font-semibold text-[#105B92] hover:underline">
                Open access setup
              </Link>
            }
          />
          <div className="space-y-3">
            {teamMembers.length ? teamMembers.map((member) => (
              <div key={member.name} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{member.name}</p>
                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">{member.role}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{member.access}</p>
                <p className="mt-1 text-xs text-slate-400">Last active: {member.lastActive}</p>
              </div>
            )) : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">No distributor app users configured yet.</div>}
          </div>
        </Surface>

        <Surface className="p-5 sm:p-6">
          <SectionHeading title="Saved delivery addresses" caption="Saved addresses support repeat ordering and dispatch planning." />
          <div className="space-y-3">
            {savedAddresses.length ? savedAddresses.map((address) => (
              <div key={address.label} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{address.label}</p>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{address.type}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{address.address}</p>
              </div>
            )) : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">No delivery addresses configured yet.</div>}
          </div>
        </Surface>
      </div>
    </div>
  );
}
