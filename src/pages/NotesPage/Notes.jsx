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
  const [textToSave, setTextToSave] = useState([]); // Store the passed selected text

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);


  // Automatically switch to the 'create' view and accumulate unique text
  useEffect(() => {
    if (selectedText) {
      // Check if the new text is already present to avoid duplication
      if (!textToSave.includes(selectedText.trim())) {
        setTextToSave((prevText) => [...prevText, selectedText.trim()]);
      }

      setCurrentView("create"); // Switch to 'create' view
    }
  }, [selectedText]);


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
          selectedText={selectedText}
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
// import React, { useState, useEffect } from "react";
// import NotesList from "../../components/Notes/NotesList";
// import Createnotes from "../../components/Notes/CreateNotes";
// import Editnotes from "../../components/Notes/EditNotes";

// const NotesManager = ({ selectedText }) => {
//   const [notes, setNotes] = useState(
//     JSON.parse(localStorage.getItem("notes")) || []
//   );
//   const [currentView, setCurrentView] = useState("list"); // 'list', 'create', 'edit'
//   const [selectedNote, setSelectedNote] = useState(null);
//   const [textHistory, setTextHistory] = useState([]); // Track all unique text history

//   // Ensure that new selected text is only added if it’s unique
//   useEffect(() => {
//     const trimmedText = selectedText?.trim(); // Trim whitespace
//     if (trimmedText && !textHistory.includes(trimmedText)) {
//       setTextHistory((prev) => [...prev, trimmedText]);
//       setCurrentView("create"); // Switch to 'create' view when new text comes in
//     }
//   }, [selectedText]);

//   // Save notes to localStorage only when `notes` array changes
//   useEffect(() => {
//     const uniqueNotes = Array.from(new Set(notes)); // Ensure only unique notes are saved
//     localStorage.setItem("notes", JSON.stringify(uniqueNotes));
//   }, [notes]);

//   const handleAddNewNote = () => {
//     setCurrentView("create");
//   };

//   const handleEditNote = (note) => {
//     setSelectedNote(note);
//     setCurrentView("edit");
//   };

//   const handleCloseCreate = () => {
//     setCurrentView("list");
//   };

//   const handleCloseEdit = () => {
//     setSelectedNote(null);
//     setCurrentView("list");
//   };

//   const handleDeleteAllNotes = () => {
//     const confirmDelete = window.confirm(
//       "Are you sure you want to delete all notes?"
//     );
//     if (confirmDelete) {
//       setNotes([]);
//       setTextHistory([]); // Clear text history as well
//       setCurrentView("list");
//     }
//   };

//   console.log(textHistory); // Check the unique text history

//   return (
//     <div className="notes-manager">
//       {currentView === "list" && (
//         <NotesList
//           notes={notes}
//           onAddNewNote={handleAddNewNote}
//           onEditNote={handleEditNote}
//           onDeleteAllNotes={handleDeleteAllNotes}
//         />
//       )}
//       {currentView === "create" && (
//         <Createnotes
//           selectedText={textHistory.join(" ")} // Send all collected unique text to CreateNotes
//           setNotes={setNotes}
//           onClose={handleCloseCreate}
//         />
//       )}
//       {currentView === "edit" && selectedNote && (
//         <Editnotes
//           note={selectedNote}
//           setNotes={setNotes}
//           onClose={handleCloseEdit}
//         />
//       )}
//     </div>
//   );
// };

// export default NotesManager;
