import React from "react";
import "./NoteItem.css";
//import { RxDotsHorizontal } from "react-icons/rx";
//import Editnotes from "../pages/Notes/Editnotes";
//import { Link } from "react-router-dom";

const NoteItem = ({ note, onEdit }) => {
  //const [showDropdown, setShowDropdown] = useState(false);

  // const handleToggleDropdown = () => {
  //   setShowDropdown(!showDropdown);
  // };

  // const handleDeleteNotes = () => {
  //   const newNote = note.filter((item) => item.id !== note);

  //   setNotes;
  // };
  return (
    <div
      className="NoteItem"
      onClick={() => onEdit(note)}
      style={{
        cursor: "pointer",
        borderTop: "5px solid black",
        borderRadius: "10px",
      }}
    >
      <p id="title">
        {note.title.length > 40 ? note.title.substr(0, 35) + "..." : note.title}
      </p>
      <p id="details">
        {note.details.length > 40
          ? note.details.substr(0, 50) + "..."
          : note.details}
      </p>
      <p id="date">{note.date}</p>
    </div>
  );
};

export default NoteItem;