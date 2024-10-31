import React, { useState, useEffect } from "react";
import NotesList from "../../components/Notes/NotesList";
import Createnotes from "../../components/Notes/CreateNotes";
import Editnotes from "../../components/Notes/EditNotes";

import "./Notes.css";

import { useSelector } from "react-redux";
import axios from "axios";
const NotesManager = ({
  selectedText: propSelectedText,
  notesHeight,
  isOpenNotes,
  height,
}) => {
  const [currentSelectedText, setSelectedText] = useState("");
  useEffect(() => {
    if (propSelectedText) {
      setSelectedText(propSelectedText.trim());
      setCurrentView("create"); // Switch to 'create' view
    } else {
      setCurrentView("list"); // Show notes list if no selected text
    }
  }, [propSelectedText]);

  const { user } = useSelector((state) => state.auth);
  const user_id = user?.user_id;
  const token = useSelector((state) => state.auth.access_token);


  const [notes, setNotes] = useState([]);
  const [currentView, setCurrentView] = useState("list"); // 'list', 'create', 'edit'
  const [selectedNote, setSelectedNote] = useState(null);
  
  const [textToSave, setTextToSave] = useState([]); // Store the passed selected text
  const [filterText, setFilterText] = useState("");


  const fetchNotes = async () => {
    try {
      const response = await axios.get(
        `http://13.127.207.184:80/notes/getnotes/${user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const notesArray = Array.isArray(response.data.data)
        ? response.data.data
        : Object.values(response.data.data);
      
      setNotes(notesArray);
      localStorage.setItem("notes", JSON.stringify(notesArray));
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  useEffect(() => {

    if (user_id && token) {
      fetchNotes();
    }
  }, [user_id, token]);


  console.log(notes);




  // Update filterText when returning to "list" view
  useEffect(() => {
    if (currentView === "list") {
      setFilterText("");
    }
  }, [currentView]);


  // useEffect(() => {
  //   if (selectedText) {
  //     if (!textToSave.includes(selectedText.trim())) {
  //       setTextToSave((prevText) => [...prevText, selectedText.trim()]);
  //     }
  //     setCurrentView("create"); // Switch to 'create' view
  //   }
  // }, [selectedText]);


  const handleAddNewNote = () => {
    setCurrentView("create");
    setSelectedText("");
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setCurrentView("edit");
  };

  const handleCloseCreate = () => {
    setCurrentView("list");
    setSelectedText("");
  };

  const handleCloseEdit = () => {
    setSelectedNote(null);
    setCurrentView("list");
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const response = await axios.delete(
        `http://13.127.207.184:80/notes/deletenote/${user_id}/${noteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {

        setNotes((prevNotes) => prevNotes.filter((note) => note.note_id !== noteId));

        console.log("Note deleted successfully");
      } else {
        console.error("Failed to delete note:", response);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return (
    <div className={isOpenNotes ? "Lander-manager" : "notes-manager-content"}>
      {currentView === "list" && (
        <NotesList
          notes={notes}
          filterText={filterText} // Pass filter text
          setFilterText={setFilterText} // Update filter text
          onAddNewNote={handleAddNewNote}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
          isOpenNotes={isOpenNotes}
          height={height}
        />
      )}
      {currentView === "create" && (
        <Createnotes
          notes={notes}
          selectedText={currentSelectedText} // Pass the currentSelectedText
          setNotes={setNotes}
          onClose={handleCloseCreate}
          onDelete={handleDeleteNote}
          notesHeight={notesHeight}
          isOpenNotes={isOpenNotes}
          height={height}
        />
      )}
      {currentView === "edit" && selectedNote && (
        <Editnotes
          note={selectedNote}
          setNotes={setNotes}
          onClose={handleCloseEdit}
          notesHeight={notesHeight}
          isOpenNotes={isOpenNotes}
          height={height}
        />
      )}
    </div>
  );
};

export default NotesManager;
