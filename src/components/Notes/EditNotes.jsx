// src/pages/Notes/Editnotes.js
import React, { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import useCreateDate from "./UseCreateDate"
import { RiDeleteBin6Line } from "react-icons/ri";
import "./EditNotes.css"; // Import CSS for styling

const Editnotes = ({ note, setNotes, onClose }) => {
  const [title, setTitle] = useState(note.title);
  const [details, setDetails] = useState(note.details);
  const date = useCreateDate();

  const handleForm = (e) => {
    e.preventDefault();
    if (title && details) {
      const updatedNote = { ...note, title, details, date };
      setNotes((prevNotes) =>
        prevNotes.map((item) => (item.id === note.id ? updatedNote : item))
      );
      onClose(); // Return to Notes list
    }
  };
  const handleDelete = () => {
    // Filter out the note that matches the current note's id
    const newNotesList = (prevNotes) =>
      prevNotes.filter((item) => item.id !== note.id);

    // Update the notes state
    setNotes(newNotesList);

    // Close the edit view
    onClose();
  };

  return (
    <section className="edit-note">
      <header className="edit-note__header">
        <button className="edit-back-button" onClick={onClose}>
          <IoIosArrowBack />
        </button>

        <button className="edit-save-button" onClick={handleForm}>
          save
        </button>
        <button className="edit-delete-button" onClick={handleDelete}>
          <RiDeleteBin6Line />
        </button>
      </header>
      <form className="edit-note__form" onSubmit={handleForm}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          className="edit-note__title"
        />
        <textarea
          rows="10"
          placeholder="Note details..."
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="edit-note__details"
        ></textarea>
      </form>
    </section>
  );
};

export default Editnotes;