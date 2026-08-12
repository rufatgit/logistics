import apiClient from "./client";

export function submitOffer(shipmentId, payload) {
  return apiClient
    .post(`/shipments/${shipmentId}/offers`, payload)
    .then((res) => res.data);
}

export function listOffersForShipment(shipmentId) {
  return apiClient
    .get(`/shipments/${shipmentId}/offers`)
    .then((res) => res.data);
}

export function acceptOffer(offerId) {
  return apiClient.post(`/offers/${offerId}/accept`).then((res) => res.data);
}
