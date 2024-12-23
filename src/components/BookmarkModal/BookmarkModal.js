import React, { useState } from "react";
import { IoCloseOutline } from "react-icons/io5";

const BookmarkModal = ({
  isOpen,
  onClose,
  collections,
  onSave,
  onCreate,
  currentBookmark,
}) => {
  const [collectionName, setCollectionName] = useState("favorites");
  const [newCollectionName, setNewCollectionName] = useState("");
  const [action, setAction] = useState("existing");

  const handleSave = () => {
    if (action === "existing") {
      onSave(collectionName, currentBookmark);
    } else if (action === "new") {
      onCreate(newCollectionName, currentBookmark);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bookmark-modal-overlay">
      <div className="bookmark-modal">
        <button onClick={onClose} className="close-modal">
          <IoCloseOutline size={20} />
        </button>
        <h3>Add to Collection</h3>
        <div className="radio-buttons">
          <label>
            <input
              type="radio"
              checked={action === "existing"}
              onChange={() => setAction("existing")}
            />
            Add to Existing Collection
          </label>
          <label>
            <input
              type="radio"
              checked={action === "new"}
              onChange={() => setAction("new")}
            />
            Create New Collection
          </label>
        </div>
        {action === "existing" ? (
          <select
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
          >
            {Object.keys(collections).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            placeholder="New Collection Name"
          />
        )}
        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};

export default BookmarkModal;
