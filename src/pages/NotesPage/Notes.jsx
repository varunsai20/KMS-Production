// src/components/NotesManager.js
import React, { useState, useEffect } from "react";
import NotesList from "../../components/Notes/NotesList";
import Createnotes from "../../components/Notes/CreateNotes";
import Editnotes from "../../components/Notes/EditNotes";
// import Createnotes from "../pages/Notes/Createnotes";
// import Editnotes from "../pages/Notes/Editnotes";
//import "./NotesManager.css"; // Import CSS for styling

const NotesManager = () => {
  const [notes, setNotes] = useState(
    JSON.parse(localStorage.getItem("notes")) || []
  );

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);
  const [currentView, setCurrentView] = useState("list"); // 'list', 'create', 'edit'
  const [selectedNote, setSelectedNote] = useState(null);

  const handleAddNewNote = () => {
    setCurrentView("create");
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setCurrentView("edit");
  };

  const handleCloseCreate = () => {
    setCurrentView("list");
  };

  const handleCloseEdit = () => {
    setSelectedNote(null);
    setCurrentView("list");
  };

  const handleDeleteAllNotes = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete all notes?"
    );
    if (confirmDelete) {
      setNotes([]); // Clear all notes
      setCurrentView("list");
    }
  };

  return (
    <div className="notes-manager">
      {currentView === "list" && (
        <NotesList
          notes={notes}
          onAddNewNote={handleAddNewNote}
          onEditNote={handleEditNote}
          onDeleteAllNotes={handleDeleteAllNotes}
        />
      )}
      {currentView === "create" && (
        <Createnotes setNotes={setNotes} onClose={handleCloseCreate} />
      )}
      {currentView === "edit" && selectedNote && (
        <Editnotes
          note={selectedNote}
          setNotes={setNotes}
          onClose={handleCloseEdit}
        />
      )}
    </div>
  );
};

export default NotesManager;