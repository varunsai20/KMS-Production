import React, { useState, useEffect } from "react";
import NoteItem from "./NoteItem";
import SearchIcon from "../../assets/images/Search.svg";
import { LuPlus } from "react-icons/lu";
//import { RxDotsHorizontal } from "react-icons/rx";
//import { IoShareSocial } from "react-icons/io5";
//import { RiDeleteBin6Line } from "react-icons/ri";
import "./NotesList.css"; // Import CSS for styling

const NotesList = ({
  notes,
  onAddNewNote,
  onEditNote,
  onDeleteNote,
  isOpenNotes,
  //onDeleteAllNotes,
}) => {
  const [text, setText] = useState("");
  const [filteredNotes, setFilteredNotes] = useState(notes);
  //const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (text.trim() === "") {
      setFilteredNotes(notes);
    } else {
      setFilteredNotes(
        notes.filter((note) =>
          note.title.toLowerCase().includes(text.toLowerCase())
        )
      );
    }
  }, [text, notes]);

  const handleSearch = (e) => {
    setText(e.target.value);
  };

  // const handleToggleDropdown = () => {
  //   setShowDropdown(!showDropdown);
  // };

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
          <div className={isOpenNotes ? "lander-p" : "p"}>
            <p id="p">Notes</p>
          </div>
        </div>
        <div
          className={isOpenNotes ? "lander-Search-wrapper" : "Search-wrapper"}
        >
          <img src={SearchIcon} alt="search" className="Search-icon" />
          <input
            type="text"
            value={text}
            onChange={handleSearch}
            autoFocus
            placeholder="Search..."
            className={isOpenNotes ? "lander-Search-input" : "Search-input"}
          />
        </div>
      </header>
      <div className="notes__container">
        {filteredNotes.length === 0 && (
          <p className="empty__notes">No Notes Found.</p>
        )}
        {filteredNotes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            onEdit={onEditNote}
            onDelete={onDeleteNote}
          />
        ))}
      </div>
    </section>
  );
};

export default NotesList;
