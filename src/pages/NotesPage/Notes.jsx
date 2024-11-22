import React, { useState, useEffect } from "react";
import NotesList from "../../components/Notes/NotesList";
import Createnotes from "../../components/Notes/CreateNotes";
import Editnotes from "../../components/Notes/EditNotes";
import "./Notes.css";

import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
const NotesManager = ({
  selectedText: propSelectedText,
  notesHeight,
  isOpenNotes,
  height,
  oncloseNotes,
}) => {
  console.log(propSelectedText);
  console.log(notesHeight)
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

  // useEffect(() => {
  //   if (propSelectedText) {
  //     setTextToSave((prevText) => [...prevText, propSelectedText.trim()]);
  //     if (currentView !== "edit") {
  //       setCurrentView("create");
  //     } else if (currentView === "edit") {
  //       setEditTextToSave((prev) => [...prev, propSelectedText.trim()]);
  //     }
  //   }
  // }, [propSelectedText]);

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

  console.log(textToSave);

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
      const response = await axios.delete(
        `http://13.127.207.184:80/notes/deletenote/${user_id}/${noteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setNotes((prevNotes) =>
          prevNotes.filter((note) => note.note_id !== noteId)
        );
        toast.success("Deleted Successfully", {
          position: "top-center",
          autoClose: 3000,
    
          style: {
            backgroundColor: "rgba(237, 254, 235, 1)",
            borderLeft: "5px solid rgba(15, 145, 4, 1)",
            color: "rgba(15, 145, 4, 1)",
          },
          progressStyle: {
            backgroundColor: "rgba(15, 145, 4, 1)",
          },
        });

        console.log("Note deleted successfully");
      } else {
        toast.error("Failed to delete note:", {
          position: "top-center",
          autoClose: 2000,
          style: {
            backgroundColor: "rgba(254, 235, 235, 1)",
            borderLeft: "5px solid rgba(145, 4, 4, 1)",
            color: "background: rgba(145, 4, 4, 1)",
          },
          progressStyle: {
            backgroundColor: "rgba(145, 4, 4, 1)",
          },
        });
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
