import React,{useState,useEffect} from 'react'

const SearchTermMissing = ({termMissing,setTermMissing}) => {
    
    useEffect(() => {
        if (termMissing) {
          // Set a timeout to hide the error message after 5 seconds
          const timer = setTimeout(() => {
            setTermMissing(false); // Set termMissing to false after 5 seconds
          }, 3000);
    
          // Cleanup the timeout on component unmount or if termMissing changes
          return () => clearTimeout(timer);
        }
      }, [termMissing]);
  return (
    <>
    {termMissing && (
              <div className="search-term-missing-container">
                <div className="search-term-missing-error">
                  <div className="error-arrow"></div>
                  <span>Search Term is Missing</span>
                </div>
              </div>
            )}
    </>
  )
}

export default SearchTermMissing