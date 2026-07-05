"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { AIOrb } from "@/components/ui/AIOrb";
import { formatDate, cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="page-enter mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AIOrb size="md" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Profile</h1>
              <p className="mt-0.5 text-sm text-slate-400">Your account information</p>
            </div>
          </div>
          <Link
            href="/chat"
            className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
          >
            ← Back to chat
          </Link>
        </div>

        <Card title="Account Details">
          <dl className="grid gap-4 sm:grid-cols-2">
            <ProfileField label="Name" value={`${user.first_name} ${user.last_name}`} />
            <ProfileField label="Email" value={user.email} />
            <ProfileField label="Organization" value={user.organization} />
            <ProfileField label="Role" value={user.role} capitalize />
            <ProfileField
              label="Email verified"
              value={user.is_verified ? "Yes" : "No — check your inbox"}
            />
            <ProfileField label="Member since" value={formatDate(user.created_at)} />
          </dl>

          {!user.is_verified && (
            <p className="mt-6 text-sm text-amber-400/90">
              Please verify your email to access all features.{" "}
              <Link href="/verify-email" className="font-medium text-cyan-400 underline">
                Verify now
              </Link>
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

function ProfileField({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className={cn("mt-1 text-sm text-slate-200", capitalize && "capitalize")}>
        {value}
      </dd>
    </div>
  );
}
