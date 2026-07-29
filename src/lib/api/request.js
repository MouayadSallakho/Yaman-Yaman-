import { API_CONFIG } from "./config";

function buildUrl(path, query) {
  const url = new URL(API_CONFIG.BASE_URL + path);

  if (query && typeof query === "object") {
    Object.keys(query).forEach((k) => {
      const v = query[k];
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    });
  }

  return url.toString();
}

export function apiRequest({ path, method = "GET", body, query, token }) {
  const url = buildUrl(path, query);

  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  return fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  }).then((res) =>
    res.json().then((data) => {
      if (!res.ok || data?.success === false) {
        const msg =
          typeof data?.message === "string"
            ? data.message
            : "Request failed. Please try again.";
        throw new Error(msg);
      }
      return data;
    })
  );
}