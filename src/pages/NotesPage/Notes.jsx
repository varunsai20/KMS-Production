import React, { useState, useEffect } from "react";
import NotesList from "../../components/Notes/NotesList";
import Createnotes from "../../components/Notes/CreateNotes";
import Editnotes from "../../components/Notes/EditNotes";

const NotesManager = ({ selectedText }) => {
  const [notes, setNotes] = useState(
    JSON.parse(localStorage.getItem("notes")) || []
  );
  const [currentView, setCurrentView] = useState("list"); // 'list', 'create', 'edit'
  const [selectedNote, setSelectedNote] = useState(null);
  const [textToSave, setTextToSave] = useState(selectedText); // Store the passed selected text

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  //Automatically switch to the 'create' view when text is passed
  useEffect(() => {
    if (selectedText && currentView === "list") {
      setCurrentView("create");
    }
  }, [selectedText]);
  // Automatically switch to the 'create' view when text is passed and append new text
  // useEffect(() => {
  //   if (selectedText) {
  //     if (currentView !== "create") {
  //       setCurrentView("create");
  //     }
  //     // Append selected text
  //     setTextToSave((prevText) =>
  //       prevText ? `${prevText} ${selectedText}` : selectedText
  //     );
  //   }
  // }, [selectedText]);
  console.log(selectedText);

  const handleAddNewNote = () => {
    setCurrentView("create");
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setCurrentView("edit");
  };

  const handleCloseCreate = () => {
    setCurrentView("list");
    setTextToSave(""); // Clear the selected text after creating the note
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
        <Createnotes
          selectedText={textToSave}
          setNotes={setNotes}
          onClose={handleCloseCreate}
        />
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