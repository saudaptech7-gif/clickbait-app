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
    throw new Error("Unable to connect to the server.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status}).`);
  }

  return data;
}

// =====================================
// AUTHENTICATION
// =====================================

// Signup
export function signupUser(values) {
  return request("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
}

// Login
export function loginUser(values) {
  return request("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
}

// Get current logged-in user
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

// Get ads
export async function getAds(token) {
  const endpoint = token ? "/api/ads/admin/all" : "/api/ads";

  const data = await request(endpoint, {
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
    throw new Error("Ad ID is missing.");
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
    throw new Error("Ad ID is missing.");
  }

  return request(`/api/ads/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

// =====================================
// BULK UPLOAD
// =====================================

// Upload CSV or JSON file - Admin only
export function uploadAdsFile(file, token) {
  if (!file) {
    throw new Error("Please select a CSV or JSON file.");
  }

  const formData = new FormData();

  formData.append("file", file);

  return request("/api/ads/bulk", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
}

// =====================================
// AD TRACKING
// =====================================

// Record impression
export function trackImpression(id) {
  if (!id) {
    throw new Error("Ad ID is missing.");
  }

  return request(`/api/ads/${encodeURIComponent(id)}/impression`, {
    method: "POST",
  });
}

// Record click
export function trackClick(id) {
  if (!id) {
    throw new Error("Ad ID is missing.");
  }

  return request(`/api/ads/${encodeURIComponent(id)}/click`, {
    method: "POST",
  });
}


// Get admin-only simulated click balance (not real Stripe funds).
export function getDemoBalance(token) {
  return request("/api/ads/admin/demo-balance", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
