
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import pen from "../assets/images/16px.svg";
const RecentIntercaions = (displayIfLoggedIn) => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const profilePictureUrl = user?.profile_picture_url;
    const token = useSelector((state) => state.auth.access_token);
    const dispatch = useDispatch();
    const user_id = user?.user_id;
    const [sessions, setSessions] = useState([]);
    const [editingSessionId, setEditingSessionId] = useState(null);
    const [editedTitle, setEditedTitle] = useState("");
    useEffect(() => {
        const fetchSessions = async () => {
          try {
            const response = await axios.get(
              `http://13.127.207.184:80/history/conversations/history/${user_id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (response.data?.sessions) {
              const sessionsData = response.data.sessions.reverse(); // Reverse the array order
              setSessions(sessionsData); // Set the reversed sessions array to state
            }
          } catch (error) {
            console.error("Error fetching chat history:", error);
          }
        };
    
        if (user_id && token) {
          fetchSessions();
        }
      }, [user_id, token]);

    const handleSessionClick = async (article_id, source, session_id) => {
        // try {
        //   const conversationResponse = await axios.get(
        //     `http://13.127.207.184:80/history/conversations/history/${user_id}/${session_id}`,
        //     {
        //       headers: {
        //         Authorization: `Bearer ${token}`,
        //       },
        //     }
        //   );
    
        //   const formattedChatHistory = [];
        //   let currentEntry = {};
    
        //   conversationResponse.data.conversation.forEach((entry) => {
        //     if (entry.role === "user") {
        //       if (currentEntry.query) {
        //         formattedChatHistory.push(currentEntry);
        //         currentEntry = {};
        //       }
        //       currentEntry.query = entry.parts.join(" ");
        //     } else if (entry.role === "model") {
        //       currentEntry.response = entry.parts.join(" ");
        //       formattedChatHistory.push(currentEntry);
        //       currentEntry = {};
        //     }
        //   });
    
        //   if (currentEntry.query) {
        //     formattedChatHistory.push(currentEntry);
        //   }
    
        //   console.log(formattedChatHistory);
    
        //   sessionStorage.setItem(
        //     "chatHistory",
        //     JSON.stringify(formattedChatHistory)
        //   );
    
        //   // Update `source` based on its value
        //   const sourceType =
        //     source === "biorxiv"
        //       ? "bioRxiv_id"
        //       : source === "plos"
        //       ? "plos_id"
        //       : "pmid";
    
        //   navigate(`/article/${sourceType}:${article_id}`, {
        //     state: {
        //       id: article_id,
        //       source: sourceType,
        //       token: token,
        //       user: { access_token: token, user_id: user_id },
        //       annotateData: location.state.annotateData,
        //       data: location.state.data,
        //     },
        //   });
        //   console.log(conversationResponse);
        // } catch (error) {
        //   console.error("Error fetching article or conversation data:", error);
        // }
      };
      const handleEditClick = (sessionId, title) => {
        setEditingSessionId(sessionId);
        setEditedTitle(title);
      };
    
      const handleTitleChange = (e) => {
        setEditedTitle(e.target.value); // Update the state as the user types
      };
    
      const handleSaveEdit = async (sessionId) => {
        try {
          await axios.put(
            "http://13.127.207.184:80/history/conversations/edit",
            {
              user_id,
              session_id: sessionId,
              new_title: editedTitle,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log(sessionId);
          console.log(editedTitle);
          // Update the local sessions state after a successful edit
          setSessions((prevSessions) =>
            prevSessions.map((session) =>
              session.session_id === sessionId
                ? { ...session, session_title: editedTitle }
                : session
            )
          );
    
          // Reset editing state
          setEditingSessionId(null);
          setEditedTitle("");
        } catch (error) {
          console.error("Error updating session title:", error);
        }
      };
  return (
<div
            className="history-pagination"
            style={{ display: displayIfLoggedIn }}
          >
            <p>Recent Interactions</p>
            <ul>
              {sessions.length > 0 ? (
                sessions.map((session) => {
                  // Mapping keywords to custom titles
                  const mappedTitle = session.session_title.includes(
                    "what are the key highlights from this article"
                  )
                    ? "Key Highlights"
                    : session.session_title.includes(
                        "what can we conclude form this article"
                      )
                    ? "Conclusion"
                    : session.session_title.includes("Summarize this article")
                    ? "Summarize"
                    : session.session_title; // Default title if no keyword match

                  return (
                    <li key={session.session_id}>
                      {editingSessionId === session.session_id ? (
                        <input
                          type="text"
                          style={{
                            padding: "0",
                            height: "20px",
                            width: "100%",
                            fontSize: "16px",
                            outline: "none",
                            borderColor: editedTitle ? "#1a82ff" : "#1a82ff",
                          }}
                          value={editedTitle}
                          onChange={handleTitleChange}
                          onBlur={() => handleSaveEdit(session.session_id)} // Save on blur
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveEdit(session.session_id);
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <a
                          onClick={() => {
                            console.log("Session ID:", session.session_id);
                            console.log("Source:", session.source);
                            handleSessionClick(
                              session.article_id,
                              session.source,
                              session.session_id,
                              user_id
                            );
                          }}
                        >
                          {mappedTitle.slice(0, 20)}
                          {mappedTitle.length > 20 ? "..." : ""}
                        </a>
                      )}
                      <img
                        src={pen}
                        alt="pen-icon"
                        title="Rename the title"
                        //icon={faPen}
                        onClick={() =>
                          handleEditClick(session.session_id, mappedTitle)
                        }
                        style={{ cursor: "pointer", marginLeft: "10px" }}
                      />
                    </li>
                  );
                })
              ) : (
                <li>No sessions available</li>
              )}
            </ul>
          </div>  )
}

export default RecentIntercaions