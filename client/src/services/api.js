const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

// =====================================
// COMMON API REQUEST
// =====================================

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new Error("Can't connect with server.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

// =====================================
// AUTHENTICATION
// =====================================

export function signupUser(values) {
  return request("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
}

export function loginUser(values) {
  return request("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
}

export function getCurrentUser(token) {
  return request("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// =====================================
// ADS
// =====================================

// Get all ads
export async function getAds(token) {
  const data = await request("/api/ads", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (Array.isArray(data)) {
    return data;
  }

  return Array.isArray(data.ads) ? data.ads : [];
}

// Create ad - Admin only
export function createAd(ad, token) {
  return request("/api/ads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(ad),
  });
}

// Update ad - Admin only
export function updateAd(id, changes, token) {
  if (!id) {
    throw new Error("Ad ID missing hai.");
  }

  return request(`/api/ads/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(changes),
  });
}

// Delete ad - Admin only
export function deleteAd(id, token) {
  if (!id) {
    throw new Error("Ad ID missing hai.");
  }

  return request(`/api/ads/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

// Bulk upload - Admin only
export function uploadAdsFile(file, token) {
  if (!file) {
    throw new Error("Pehle CSV ya JSON file select karo.");
  }

  const formData = new FormData();
  formData.append("file", file);

  return request("/api/ads/bulk", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
}
