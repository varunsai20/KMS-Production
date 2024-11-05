import React, { useEffect, useState } from "react";
import NoteItem from "./NoteItem";
import SearchIcon from "../../assets/images/Search.svg";
import { LuPlus } from "react-icons/lu";
import { IoCloseOutline } from "react-icons/io5";

import "./NotesList.css";

const NotesList = ({
  notes,
  filterText,
  setFilterText,
  onAddNewNote,
  onEditNote,
  onDeleteNote,
  isOpenNotes,

  fetchNotes,

  height,
  oncloseNotes,
}) => {
  const [filteredNotes, setFilteredNotes] = useState(notes);

  useEffect(() => {
    fetchNotes()
    if (filterText.trim() === "") {
      setFilteredNotes(notes);
    } else {
      setFilteredNotes(
        notes.filter((note) =>
          note.title.toLowerCase().includes(filterText.toLowerCase())
        )
      );
    }
  }, [filterText, notes]);

  const handleSearch = (e) => {
    setFilterText(e.target.value);
  };

  return (
    <section className={isOpenNotes ? "Lander-Notes-List" : "Notes-List"}>
      <header
        className={
          isOpenNotes ? "Lander-Notes-List-header" : "Notes-List-header"
        }
      >
        <div className={isOpenNotes ? "lander-plus-dots" : "plus-dots"}>
          <button
            title="New Note"
            className={isOpenNotes ? "lander-button-plus" : "button-plus"}
            onClick={onAddNewNote}
          >
            <LuPlus />
          </button>
          <button className="close-notes-in" onClick={oncloseNotes}>
            <IoCloseOutline size={30} color="white" />
          </button>
          <div className={isOpenNotes ? "lander-p" : "note-p"}>
            <p id="p">Notes</p>
          </div>
        </div>
        <div
          className={isOpenNotes ? "lander-Search-wrapper" : "Search-wrapper"}
        >
          <img src={SearchIcon} alt="search" className="Search-icon" />
          <input
            type="text"
            value={filterText}
            onChange={handleSearch}
            autoFocus
            placeholder="Search..."
            className={isOpenNotes ? "lander-Search-input" : "Search-input"}
          />
        </div>
      </header>

      <div
        className={isOpenNotes ? "lander-notes__container" : "notes__container"}
        style={
          isOpenNotes ? { height: `${height - 85}px`, overflowY: "auto" } : {}
        }
      >
        {filteredNotes.length === 0 && (
          <p className="empty__notes">No Notes Found.</p>
        )}
        {filteredNotes.map((note) => (
          <NoteItem
            key={note.note_id} // Use note_id instead of id
            note={note} // Ensure `note` contains `note_id`, `content`, etc.
            onEdit={onEditNote}
            onDelete={onDeleteNote}
            isOpenNotes={isOpenNotes}
            //onCloseNotes={onCloseNotes}
          />
        ))}
      </div>
    </section>
  );
};

export default NotesList;
