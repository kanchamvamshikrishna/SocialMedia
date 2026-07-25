import api from "./api";

export const notificationService = {
  getAll: (page = 0, size = 20) =>
    api.get("/notifications", { params: { page, size } }).then((r) => r.data),
  getUnreadCount: () => api.get("/notifications/unread-count").then((r) => r.data.count),
  markRead: (id) => api.post(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.post("/notifications/read-all").then((r) => r.data),
};
