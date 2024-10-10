import React from "react";
import "./NoteItem.css";

const NoteItem = ({ note, onEdit }) => {
  return (
    <div
      className="NoteItem"
      onClick={() => onEdit(note)}
      style={{
        cursor: "pointer",
        //borderTop: "5px solid black",
        borderRadius: "10px",
      }}
    >
      <div
        className="title-header"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <p id="title">
          {note.title.length > 15
            ? note.title.substr(0, 20) + "..."
            : note.title}
        </p>
        <p id="date">{note.date}</p>
      </div>
      <div className="detail-box" style={{ overflow: "hidden" }}>
        <p
          id="details"
          dangerouslySetInnerHTML={{
            __html:
              note.details.length > 40
                ? note.details.substr(0, 100) + "..."
                : note.details,
          }}
        />
      </div>
    </div>
  );
};

export default NoteItem;