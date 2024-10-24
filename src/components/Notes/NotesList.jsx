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
  //onDeleteAllNotes,
}) => {
  const [text, setText] = useState("");
  const [filteredNotes, setFilteredNotes] = useState(notes);
  const [showDropdown, setShowDropdown] = useState(false);

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
    <section className="Notes-List">
      <header className="Notes-List-header">
        <div className="plus-dots">
          <button
            title="New Note"
            className="button-plus"
            onClick={onAddNewNote}
          >
            <LuPlus />
          </button>
          <div className="p">
            <p>Notes</p>
          </div>
          {/* <div className="dropdown-container">
            <button className="dots" onClick={handleToggleDropdown}>
              <RxDotsHorizontal color="#1a82ff" />
            </button>
            {showDropdown && (
              <div className="dropdown-delete">
                <button
                  onClick={onDeleteAllNotes}
                  className="dropdown-button"
                  style={{ display: "flex", gap: "3px" }}
                >
                  <div className="delete-icon">
                    <RiDeleteBin6Line
                      size={13}
                      style={{ marginLeft: "0", padding: "0" }}
                    />
                  </div>
                  Delete All
                </button>
              </div>
            )}
          </div> */}
        </div>
        <div className="Search-wrapper">
          <img src={SearchIcon} alt="search" className="Search-icon" />
          <input
            type="text"
            value={text}
            onChange={handleSearch}
            autoFocus
            placeholder="Search..."
            className="Search-input"
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
