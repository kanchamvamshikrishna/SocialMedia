import api from "./api";

export const commentService = {
  list: (postId) => api.get(`/posts/${postId}/comments`).then((r) => r.data),
  add: (postId, text) => api.post(`/posts/${postId}/comments`, { text }).then((r) => r.data),
  remove: (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}`).then((r) => r.data),
};
