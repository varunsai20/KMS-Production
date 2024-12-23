import { useState } from "react";
import { apiService } from "../../assets/api/apiService";
import { showSuccessToast, showErrorToast } from "../../utils/toastHelper";

export const useBookmarks = (user_id, token) => {
  const [collections, setCollections] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBookmark, setCurrentBookmark] = useState(null);

  const fetchCollections = async () => {
    try {
      const response = await apiService.fetchCollections(user_id, token);
      setCollections(response.data.collections || []);
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };

  const isBookmarked = (idType) => {
    for (const collection of Object.values(collections)) {
      if (collection.some((article) => article.article_id === idType)) {
        return true;
      }
    }
    return false;
  };

  const handleBookmarkClick = (idType, title, source) => {
    if (isBookmarked(idType)) {
      // Remove bookmark
      handleRemoveBookmark(idType);
    } else {
      // Open modal to add a bookmark
      setCurrentBookmark({ idType, title, source });
      setIsModalOpen(true);
    }
  };

  const handleRemoveBookmark = async (idType) => {
    try {
      const response = await apiService.removeBookmark(user_id, idType, token);
      if (response.status === 200) {
        await fetchCollections();
        showSuccessToast("Bookmark removed successfully");
      }
    } catch (error) {
      console.error("Error removing bookmark:", error);
      showErrorToast("Failed to remove bookmark");
    }
  };

  const handleAddBookmark = async (collectionName, idType, title, source) => {
    try {
      const response = await apiService.saveToExisting(token, {
        user_id,
        collection_name: collectionName,
        bookmark: {
          article_id: idType,
          article_title: title,
          article_source: source,
        },
      });
      if (response.status === 201) {
        await fetchCollections();
        showSuccessToast("Bookmark added successfully");
      }
    } catch (error) {
      console.error("Error adding bookmark:", error);
      showErrorToast("Failed to add bookmark");
    }
  };

  return {
    collections,
    isModalOpen,
    currentBookmark,
    fetchCollections,
    isBookmarked,
    handleBookmarkClick,
    handleAddBookmark,
    handleRemoveBookmark,
    setIsModalOpen,
  };
};
