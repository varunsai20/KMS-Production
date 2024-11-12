import React from "react";
import { IoCloseOutline } from "react-icons/io5";
import "./ConfirmOverlay.css";

const ConfirmSave = ({ message, onSave, onDiscard, onCancel }) => {
  return (
    <div className="confirm-overlay">
      <div className="confirm-dialog">
        <div className="confirm-header">
          <p className="Saving-note"> Saving Note</p>
          <button onClick={onCancel} className="confirm-cancel-butto">
            <IoCloseOutline size={20} />
          </button>
        </div>
        <p id="confirming">
          {message ||
            "You have unsaved changes. Would you like to save before leaving?"}
        </p>
        <div className="save-confirm-buttons">
          <button onClick={onSave} className="confirm-save-button">
            Save
          </button>
          <button onClick={onDiscard} className="confirm-discard-button">
            Discard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSave;
