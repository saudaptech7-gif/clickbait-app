
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new Error(
      "Backend se connection nahi ho raha. Check karo ke server running hai."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed (${response.status})`
    );
  }

  return data;
}

export async function getAds() {
  const data = await request("/api/ads");

  if (Array.isArray(data)) {
    return data;
  }

  return Array.isArray(data.ads) ? data.ads : [];
}

export function createAd(ad) {
  return request("/api/ads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ad),
  });
}

export function updateAd(id, changes) {
  if (!id) {
    throw new Error("Ad ID missing hai.");
  }

  return request(`/api/ads/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(changes),
  });
}

export function deleteAd(id) {
  if (!id) {
    throw new Error("Ad ID missing hai.");
  }

  return request(`/api/ads/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function uploadAdsFile(file) {
  if (!file) {
    throw new Error("Pehle JSON ya CSV file select karo.");
  }

  const formData = new FormData();
  formData.append("file", file);

  return request("/api/ads/bulk", {
    method: "POST",
    body: formData,
  });
}
