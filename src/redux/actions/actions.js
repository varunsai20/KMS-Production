// Define your action types
export const SET_SEARCH_RESULTS = "SET_SEARCH_RESULTS";
export const CLEAR_SEARCH_RESULTS = "CLEAR_SEARCH_RESULTS";

// Action creator for setting search results
export const setSearchResults = (data) => ({
  type: SET_SEARCH_RESULTS,
  payload: data,
});

// Action creator for clearing search results
export const clearSearchResults = () => ({
  type: CLEAR_SEARCH_RESULTS,
});
