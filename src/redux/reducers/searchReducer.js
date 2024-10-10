import { SET_SEARCH_RESULTS, CLEAR_SEARCH_RESULTS } from '../actions/actions';

// Initial state for the search results
const initialState = {
  searchResults: null,  // This will store the API response data
};

// Reducer to handle search result actions
const searchReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: action.payload, // Set search results in state
      };
    case CLEAR_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: null, // Clear search results
      };
    default:
      return state;
  }
};

export default searchReducer;
