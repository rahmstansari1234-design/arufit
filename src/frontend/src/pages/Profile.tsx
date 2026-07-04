import { Navigate } from "@tanstack/react-router";

/**
 * Legacy /profile route — redirects to the new /profile tab.
 * Kept for backwards-compat with any saved links.
 */
export default function Profile() {
  return <Navigate to="/profile" replace />;
}
