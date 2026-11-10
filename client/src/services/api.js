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

export async function getAds(token) {
  const endpoint = token ? "/api/ads/admin/all" : "/api/ads";

  const data = await request(endpoint, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (Array.isArray(data)) return data;

  return Array.isArray(data.ads) ? data.ads : [];
}

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

export function trackImpression(id) {
  if (!id) {
    throw new Error("Ad ID is missing.");
  }

  return request(`/api/ads/${encodeURIComponent(id)}/impression`, {
    method: "POST",
  });
}

export function trackClick(id) {
  if (!id) {
    throw new Error("Ad ID is missing.");
  }

  return request(`/api/ads/${encodeURIComponent(id)}/click`, {
    method: "POST",
  });
}

// =====================================
// ADMIN DEMO BALANCE
// =====================================

export function getDemoBalance(token) {
  return request("/api/ads/admin/demo-balance", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// =====================================
// STRIPE TEST PAYMENT
// =====================================

export function createStripeTestPayment(amount, token) {
  if (![1, 2].includes(Number(amount))) {
    throw new Error("Amount must be either $1 or $2.");
  }

  return request("/api/payments/test-payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      amount: Number(amount),
    }),
  });
}
