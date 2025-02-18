import axios from "axios";
import { showErrorToast } from "../../utils/toastHelper";
import { hideNetworkErrorToast } from "../../utils/toastHelper";
import { showNetworkErrorToast } from "../../utils/toastHelper";
import { redirectToLogin } from "../../helpers/navigationHelper";

let isNetworkErrorDisplayed = false;

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const apiClient = axios.create({
  baseURL: "https://inferai.ai/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    hideNetworkErrorToast();
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, config } = error.response;
      if (status === 401 && config.url.includes("auth/login")) {
        error.reason = "invalid_credentials";
      } else if (status === 401) {
        error.reason = "session_expired";
        redirectToLogin();
      } else if (status === 404 && status === 500) {
        showErrorToast("Resource not found.");
      }
      if (status === 403) {
        error.reason = "access_denied";
      }
      // else {
      //   showErrorToast(data?.message || "An error occurred.");
      // }
    } else if (error.request) {
      if (!isNetworkErrorDisplayed) {
        isNetworkErrorDisplayed = true;
        debounce(() => {
          showNetworkErrorToast("Network error. Please check your connection.");

          isNetworkErrorDisplayed = false;
        }, 2000)();
      }
    } else {
      showErrorToast(error.message);
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  login: (email, password) =>
    apiClient.post(`auth/login`, {
      email,
      password,
    }),
  logout: (user_id) => apiClient.post(`auth/logout?user_id=${user_id}`),
  loginProfile: (user_id, token) =>
    apiClient.get(`user/profile/${user_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  fetchNotes: (userId, token) =>
    apiClient.get(`/notes/getnotes/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  deleteNote: (userId, noteId, token) =>
    apiClient.delete(`/notes/deletenote/${userId}/${noteId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  saveNote: (userId, title, content, token) =>
    apiClient.post(
      `/notes/createnote`,
      {
        user_id: userId,
        title: title,
        content: content,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ),
  updateNote: (user_id, title, content, note_id, token) =>
    apiClient.put(
      `notes/updatenote`,
      {
        user_id,
        title,
        content,
        note_id,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ),
  sendEmail: (requestData, token) =>
    apiClient.post(`notes/sharenotes`, requestData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  searchTerm: (searchQuery, page) =>
    apiClient.get(
      `https://q8c5emukzh.execute-api.ap-south-1.amazonaws.com/source`,
      {
        params: {
          query: searchQuery,
          page: page,
        },
        headers: {
          "Content-Type": "application/json",
          //Authorization: `Bearer ${token}`,
        },
      }
    ),
  fetchUserDetails: (user_id, token) =>
    apiClient.get(`user/profile/${user_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  imageUpdate: (user_id, token, formData) =>
    apiClient.post(
      `user/upload_profile_picture/?user_id=${user_id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    ),
  saveDetails: (token, requestBody) =>
    apiClient.put(`admin/edit_user`, requestBody, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  annotateFile: (formData, token) => {
    return apiClient.post("/core_search/annotate_file", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
  },
  generateCitations: (formData, token) => {
    return apiClient.post("/core_search/citations", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data", // Ensure content type is set for file upload
      },
    });
  },
  fetchCollections: (user_id, token) =>
    apiClient.get(`/bookmarks/${user_id}/collections`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  fetchRatedArticles: (token) =>
    apiClient.get(`rating/rated-articles`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  // Article page apis
  fetchArticleData: (id, source, token) =>
    apiClient.get(`view_article/get_article/${id}?source=${source}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  ratingChange: (user_id, article_source, rating, article_id, token) =>
    apiClient.post(
      `/rating/rate`,
      {
        user_id,
        rating_data: { article_id, rating, article_source },
      },
      { headers: { Authorization: `Bearer ${token}` } }
    ),
  bookmarkClick: (user_id, collectionName, idType, token) =>
    apiClient.delete(
      `bookmarks/users/${user_id}/collections/${collectionName}/${idType}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ),
  saveToExisting: (token, bookmarkData) =>
    apiClient.post(`bookmarks/users/collections`, bookmarkData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  fetchChatSessions: (user_id, token) =>
    apiClient.get(`/history/conversations/history/${user_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  fetchChatConversation: (user_id, session_id, token) =>
    apiClient.get(`/history/conversations/history/${user_id}/${session_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  editChatSessionTitle: (user_id, session_id, new_title, token) =>
    apiClient.put(
      `/history/conversations/edit`,
      { user_id, session_id, new_title },
      { headers: { Authorization: `Bearer ${token}` } }
    ),

  annotateArticle: (requestBody, token) =>
    apiClient.post(`/core_search/annotate`, requestBody, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  askChat: (bodyData, token) =>
    apiClient.post(`/view_article/generateanswer`, bodyData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }),

  deriveInsights: (formData, token, storedSessionId) => {
    const url = storedSessionId ? `/insights/ask` : `/insights/upload`;
    return apiClient.post(url, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  createNewCollection: (token, newCollection) =>
    apiClient.post(`bookmarks/users/collections`, newCollection, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  annotateClick: (token) =>
    apiClient.post(`core_search/annotate`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  fetchSessions: (user_id, token) =>
    apiClient.get(`history/conversations/history/${user_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  deleteSession: (token, user_id, session_id) =>
    apiClient.delete(`history/conversations/delete/${user_id}/${session_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  saveEdit: (token, { user_id, session_id, new_title }) =>
    apiClient.put(
      `history/conversations/edit`,
      {
        user_id,
        session_id,
        new_title,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ),

  sessionClick: (user_id, session_id, token) =>
    apiClient.get(`history/conversations/history/${user_id}/${session_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  // Search Results page

  // landing page

  //Article Layout
  annotateFileFromURL: (token, { url }) =>
    apiClient.post(
      `core_search/annotate_from_url`,
      {
        url,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ),

  shareArticle: (token, emailData) =>
    apiClient.post(`core_search/sharearticle`, emailData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};
