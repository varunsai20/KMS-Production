import React, { useState, useEffect, useRef } from "react";
import NotesList from "../../components/Notes/NotesList";
import Createnotes from "../../components/Notes/CreateNotes";
import Editnotes from "../../components/Notes/EditNotes";
import { apiService } from "../../assets/api/apiService";
import { showSuccessToast } from "../../utils/toastHelper";
import "./Notes.css";
import { useSelector } from "react-redux";
const NotesManager = ({
  selectedText: propSelectedText,
  notesHeight,
  isOpenNotes,
  height,
  oncloseNotes,
}) => {
  const { user } = useSelector((state) => state.auth);
  const user_id = user?.user_id;
  const token = useSelector((state) => state.auth.access_token);
  const [notes, setNotes] = useState([]);
  const [currentView, setCurrentView] = useState("list");
  const [textToSave, setTextToSave] = useState([]);
  const [editTextToSave, setEditTextToSave] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [lastOpenView, setLastOpenView] = useState("list");
  const hasFetchedNotes = useRef(false);

  useEffect(() => {
    if (propSelectedText) {
      setTextToSave((prevText) => {
        if (prevText[0] === propSelectedText.trim()) {
          return prevText;
        }
        if (currentView !== "edit") {
          setCurrentView("create");
        } else {
          setEditTextToSave((prevEditText) => [
            ...prevEditText,
            propSelectedText.trim(),
          ]);
        }
        return [propSelectedText.trim(), ...prevText];
      });
    }
  }, [propSelectedText]);


  const fetchNotes = async () => {
    try {
      const response = await apiService.fetchNotes(user_id, token);
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
    if (user_id && token && !hasFetchedNotes.current) {
      fetchNotes();
      hasFetchedNotes.current = true;
    }
  }, [user_id, token]);

  useEffect(() => {
    if (!isOpenNotes) {
      setLastOpenView(currentView);
    }
  }, [isOpenNotes, currentView]);

  useEffect(() => {
    if (isOpenNotes) {
      setCurrentView(lastOpenView);
    }
  }, [isOpenNotes, lastOpenView]);

  useEffect(() => {
    if (currentView === "list") {
      setFilterText("");
    }
  }, [currentView]);

  const handleAddNewNote = () => {
    setCurrentView("create");
    setTextToSave([]);
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setEditTextToSave([]);
    setCurrentView("edit");
  };

  const handleCloseCreate = () => {
    setCurrentView("list");
    setTextToSave([]);
  };

  const handleCloseEdit = () => {
    setSelectedNote(null);
    setEditTextToSave([]);
    setCurrentView("list");
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await apiService.deleteNote(user_id, noteId, token);
      setNotes((prevNotes) =>
        prevNotes.filter((note) => note.note_id !== noteId)
      );
      showSuccessToast("Deleted Successfully");
    } catch (error) {
      console.error("Error deleting note:", error);
      //showErrorToast("Failed to delete note. Please try again.");
    }
  };

  return (
    <div className={isOpenNotes ? "Lander-manager" : "notes-manager-content"}>
      {currentView === "list" && (
        <NotesList
          notes={notes}
          filterText={filterText}
          setFilterText={setFilterText}
          onAddNewNote={handleAddNewNote}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
          isOpenNotes={isOpenNotes}
          height={height}
          notesHeight={notesHeight}
          oncloseNotes={oncloseNotes}
          fetchNotes={fetchNotes}
        />
      )}
      {currentView === "create" && (
        <Createnotes
          notes={notes}
          textToSave={textToSave}
          setNotes={setNotes}
          onClose={handleCloseCreate}
          onDelete={handleDeleteNote}
          notesHeight={notesHeight}
          isOpenNotes={isOpenNotes}
          height={height}
          fetchNotes={fetchNotes}
        />
      )}
      {currentView === "edit" && selectedNote && (
        <Editnotes
          note={selectedNote}
          textToSave={editTextToSave}
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
