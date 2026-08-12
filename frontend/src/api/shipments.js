import apiClient from "./client";

export function listShipments(params = {}) {
  return apiClient.get("/shipments", { params }).then((res) => res.data);
}

export function getShipment(id) {
  return apiClient.get(`/shipments/${id}`).then((res) => res.data);
}

export function createShipment(payload) {
  return apiClient.post("/shipments", payload).then((res) => res.data);
}

export function getShipmentTracking(id) {
  return apiClient.get(`/shipments/${id}/tracking`).then((res) => res.data);
}

export function updateShipmentStatus(id, payload) {
  return apiClient
    .patch(`/shipments/${id}/status`, payload)
    .then((res) => res.data);
}
