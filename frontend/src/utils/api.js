const stripSlashes = (value = "") => value.replace(/^\/+|\/+$/g, "");
const stripTrailingSlash = (value = "") => value.replace(/\/+$/, "");

const buildFromLocation = () => {
  if (typeof window === "undefined") return "";

  const { origin, pathname } = window.location;
  const normalizedPath = pathname.replace(/\/+/g, "/");

  const rootMatch = normalizedPath.match(/^(.*?)(?=\/frontend(?:\/(?:dist|public))?(?:\/|$))/);
  const basePath = rootMatch ? rootMatch[1] : "";

  const segments = [stripSlashes(basePath), "backend"].filter(Boolean);
  const joinedPath = segments.length ? `/${segments.join("/")}` : "/backend";

  return stripTrailingSlash(new URL(joinedPath, origin).toString());
};

export const getApiBase = () => {
  const envValue = typeof import.meta !== "undefined" ? import.meta.env?.VITE_API_URL : "";
  if (envValue && typeof envValue === "string" && envValue.trim().length > 0) {
    return stripTrailingSlash(envValue.trim());
  }

  const derived = buildFromLocation();
  if (derived) {
    if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
      console.warn(
        "VITE_API_URL is not set. Falling back to",
        derived,
        "which assumes the backend is hosted next to the built frontend."
      );
    }
    return derived;
  }

  return "/backend";
};

export const apiUrl = (path = "") => {
  const base = getApiBase();
  if (!path) return base;

  return `${base}/${String(path).replace(/^\/+/, "")}`;
};

