import React, { createContext, useState } from "react";

export const TextContext = createContext();
const TextProvider = ({ children }) => {
  const [selectedText, setSelectedText] = useState("");

  return (
    <div>
      <TextContext.Provider value={{ selectedText, setSelectedText }}>
        {children}
      </TextContext.Provider>
    </div>
  );
};

export default TextProvider;