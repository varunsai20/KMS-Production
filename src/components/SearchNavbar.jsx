import React,{useState} from 'react'
import Header from './Header-New'
import SearchBar from './SearchBar'
import SearchTermMissing from './SearchTermMissing'
import { Link } from 'react-router-dom'
import Logo from "../assets/images/InfersolD17aR04aP01ZL-Polk4a 1.svg"
const SearchNavbar = ({containerRef}) => {
    const [termMissing, setTermMissing] = useState(false);
  return (
    <div className="search-container-content" ref={containerRef}>
    <Header />
    <div className="SearchHeader-Logo">
      <div style={{display:"flex"}}>
        <Link to="/">
        <img src={Logo} alt="inferAI-logo" className="inferai-logo" />
      </Link>
      <SearchBar
        className="searchResults-Bar"
        searchWidth="90%"
        setTermMissing={setTermMissing}
        ></SearchBar>
        </div>
      <SearchTermMissing termMissing={termMissing} setTermMissing={setTermMissing}/>

    </div>
  </div>
  )
}

export default SearchNavbar