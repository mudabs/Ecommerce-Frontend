const rawApiBaseUrl = String(import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/$/, "");
const apiPrefix = String(import.meta.env.VITE_BACK_END_API_PREFIX || "/api").trim().replace(/\/$/, "");
const isDev = Boolean(import.meta.env.DEV);

if (!rawApiBaseUrl) {
  throw new Error("Missing VITE_API_BASE_URL. Define it in your Vite environment file before starting the app.");
}

export const API_BASE_URL = rawApiBaseUrl;
export const BACKEND_BASE_URL = rawApiBaseUrl;
export const BACKEND_API_BASE_URL = `${rawApiBaseUrl}${apiPrefix}`;
export const API_AUTH_BASE_URL = `${BACKEND_API_BASE_URL}/auth`;
export const API_PUBLIC_BASE_URL = `${BACKEND_API_BASE_URL}/public`;
export const IMAGE_FALLBACK_URL = "/image-placeholder.svg";
export const SKIP_BACKEND_IMAGES = String(import.meta.env.VITE_SKIP_BACKEND_IMAGES || "false").toLowerCase() === "true";

export const getBackendImageUrl = (imagePath = "") => {
  if (SKIP_BACKEND_IMAGES) {
    return IMAGE_FALLBACK_URL;
  }

  const source = String(imagePath || "").trim();

  if (!source) {
    return IMAGE_FALLBACK_URL;
  }

  if (/default\.png$/i.test(source)) {
    return IMAGE_FALLBACK_URL;
  }

  if (/^https?:\/\//i.test(source)) {
    if (isDev) {
      try {
        const parsed = new URL(source);

        // During local development, route backend image URLs through Vite proxy.
        if (parsed.pathname.startsWith("/images/")) {
          return `${parsed.pathname}${parsed.search}${parsed.hash}`;
        }
      } catch (error) {
        // If parsing fails, fall through and return the source as-is.
      }

      if (rawApiBaseUrl && source.startsWith(`${rawApiBaseUrl}/`)) {
        return source.replace(rawApiBaseUrl, "");
      }
    }

    return source;
  }

  if (source.startsWith("/images/")) {
    return `${BACKEND_BASE_URL}${source}`;
  }

  if (source.startsWith("images/")) {
    return `${BACKEND_BASE_URL}/${source}`;
  }

  return `${BACKEND_BASE_URL}/images/${source.replace(/^\//, "")}`;
};

export const handleImageLoadError = (event) => {
  const target = event?.currentTarget;
  if (!target || target.dataset.fallbackApplied === "true") {
    return;
  }

  target.dataset.fallbackApplied = "true";
  target.src = IMAGE_FALLBACK_URL;
};
