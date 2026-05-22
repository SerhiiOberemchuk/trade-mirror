import type { Route } from "next";

type UserRole = string | string[] | null | undefined;

export function hasAdminRole(role: UserRole) {
  return Array.isArray(role) ? role.includes("admin") : role === "admin";
}

export function getPostLoginRoute(role: UserRole): Route {
  return hasAdminRole(role) ? "/admin" : "/dashboard";
}
