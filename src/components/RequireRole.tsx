"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRole, isLoggedIn, Role } from "@/lib/auth";

export default function RequireRole({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    const r = getRole();
    if (r !== role) {
      // redirect to their home
      if (r === "super_admin") router.replace("/super-admin");
      else if (r === "school") router.replace("/school");
      else if (r === "parent") router.replace("/parent");
      else router.replace("/login");
    }
  }, [router, role]);

  return <>{children}</>;
}
