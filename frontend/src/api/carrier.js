import apiClient from "./client";

export function getMyCarrierProfile() {
  return apiClient.get("/carriers/me").then((res) => res.data);
}

export function createCarrierProfile(payload) {
  return apiClient.post("/carriers", payload).then((res) => res.data);
}

export function updateMyCarrierProfile(payload) {
  return apiClient.patch("/carriers/me", payload).then((res) => res.data);
}

export function listCarriers() {
  return apiClient.get("/carriers").then((res) => res.data);
}

export function verifyCarrier(carrierId) {
  return apiClient
    .patch(`/carriers/${carrierId}/verify`)
    .then((res) => res.data);
}
