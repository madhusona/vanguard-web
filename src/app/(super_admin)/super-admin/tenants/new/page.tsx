"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";

type FormData = {
  tenant_name: string;
  email: string;
  password: string;
};

export default function NewTenantPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting } } =
    useForm<FormData>();

  async function onSubmit(data: FormData) {
    try {
      await api.post("/api/super_admin/create_tenant", data);
      router.push("/super-admin/tenants");
    } catch (err: any) {
      alert(err?.response?.data?.description || "Failed to create tenant");
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold">Create Tenant (School)</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm">School Name</label>
          <input
            {...register("tenant_name", { required: true })}
            className="w-full border rounded p-2"
            placeholder="Green Valley School"
          />
        </div>

        <div>
          <label className="text-sm">School Admin Email</label>
          <input
            type="email"
            {...register("email", { required: true })}
            className="w-full border rounded p-2"
            placeholder="admin@school.edu"
          />
        </div>

        <div>
          <label className="text-sm">Initial Password</label>
          <input
            type="password"
            {...register("password", { required: true })}
            className="w-full border rounded p-2"
          />
        </div>

        <div className="flex gap-3">
          <button
            disabled={isSubmitting}
            className="rounded bg-black text-white px-4 py-2"
          >
            {isSubmitting ? "Creating..." : "Create Tenant"}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="rounded border px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
