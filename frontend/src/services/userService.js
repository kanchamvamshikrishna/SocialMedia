import api from "./api";

export const userService = {
  me: () => api.get("/users/me").then((r) => r.data),
  getProfile: (username) => api.get(`/users/${username}`).then((r) => r.data),
  search: (query) => api.get(`/users/search/${encodeURIComponent(query)}`).then((r) => r.data),
  updateProfile: (payload) => api.put("/users/me", payload).then((r) => r.data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api
      .post("/users/me/avatar", formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },
  toggleFollow: (username) => api.post(`/users/${username}/follow`).then((r) => r.data),
};
