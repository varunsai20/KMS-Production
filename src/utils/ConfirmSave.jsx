import React from "react";
import "./ConfirmOverlay.css"; // Import CSS for styling the overlay

const ConfirmSave = ({ message, onSave, onDiscard, onCancel }) => {
  return (
    <div className="confirm-overlay">
      <div className="confirm-dialog">
        <p className="confirm-message">
          {message ||
            "You have unsaved changes. Would you like to save before leaving?"}
        </p>
        <div className="confirm-buttons">
          <button onClick={onSave} className="confirm-save-button">
            Save
          </button>
          <button onClick={onDiscard} className="confirm-discard-button">
            Discard
          </button>
          <button onClick={onCancel} className="confirm-cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSave;
