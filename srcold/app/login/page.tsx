"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api";
import { saveSession } from "@/lib/auth";

const schema = z.object({
  usr: z.string().min(2),
  pwd: z.string().min(2),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormData) {
    const res = await api.post(
      "/api/method/auroapp.vehicle_service.van_tracker.api.login_and_keys",
      values
    );

    // Expected: { access_token, user: {id, username, role, tenant_id} }
    const { access_token, user } = res.data;

    saveSession(access_token, user);

    if (user.role === "super_admin") router.push("/super-admin");
    else if (user.role === "school") router.push("/school");
    else router.push("/parent");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-4 border rounded-lg p-6"
      >
        <h1 className="text-xl font-semibold">Login</h1>

        <div>
          <label className="text-sm">Username</label>
          <input
            className="w-full border rounded p-2"
            {...register("usr")}
          />
          {errors.usr && <p className="text-sm text-red-600">{errors.usr.message}</p>}
        </div>

        <div>
          <label className="text-sm">Password</label>
          <input
            type="password"
            className="w-full border rounded p-2"
            {...register("pwd")}
          />
          {errors.pwd && <p className="text-sm text-red-600">{errors.pwd.message}</p>}
        </div>

        <button
          disabled={isSubmitting}
          className="w-full rounded bg-black text-white p-2 disabled:opacity-60"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
