import api from "./api";

export const messageService = {
  getConversations: () => api.get("/messages/conversations").then((r) => r.data),
  getThread: (username) => api.get(`/messages/${username}`).then((r) => r.data),
  send: (username, payload) => api.post(`/messages/${username}`, payload).then((r) => r.data),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api
      .post("/messages/upload-image", formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },
};
