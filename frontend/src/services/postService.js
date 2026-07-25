import api from "./api";

export const postService = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api
      .post("/posts/upload-image", formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },
  create: (payload) => api.post("/posts", payload).then((r) => r.data),
  getExplore: (page = 0, size = 12) =>
    api.get("/posts/explore", { params: { page, size } }).then((r) => r.data),
  getFeed: (page = 0, size = 12) =>
    api.get("/posts/feed", { params: { page, size } }).then((r) => r.data),
  getUserPosts: (username, page = 0, size = 12) =>
    api.get(`/posts/user/${username}`, { params: { page, size } }).then((r) => r.data),
  getById: (id) => api.get(`/posts/${id}`).then((r) => r.data),
  remove: (id) => api.delete(`/posts/${id}`).then((r) => r.data),
  toggleLike: (id) => api.post(`/posts/${id}/like`).then((r) => r.data),
};
