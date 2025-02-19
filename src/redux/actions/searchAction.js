import axios from "axios";

export const FETCH_SEARCH_RESULTS_REQUEST = "FETCH_SEARCH_RESULTS_REQUEST";
export const FETCH_SEARCH_RESULTS_SUCCESS = "FETCH_SEARCH_RESULTS_SUCCESS";
export const FETCH_SEARCH_RESULTS_FAILURE = "FETCH_SEARCH_RESULTS_FAILURE";

// Action to request search results
export const fetchSearchResultsRequest = () => ({
  type: FETCH_SEARCH_RESULTS_REQUEST,
});

// Action to handle success
export const fetchSearchResultsSuccess = (data) => ({
  type: FETCH_SEARCH_RESULTS_SUCCESS,
  payload: data,
});

// Action to handle failure
export const fetchSearchResultsFailure = (error) => ({
  type: FETCH_SEARCH_RESULTS_FAILURE,
  payload: error,
});

// Thunk function to fetch data asynchronously
export const fetchSearchResults = (searchTerm) => {
  return async (dispatch) => {
    dispatch(fetchSearchResultsRequest());
    try {
      const response = await axios.post("https://inferai.ai/api/query", {
        query: searchTerm,
      });
      dispatch(fetchSearchResultsSuccess(response.data));
    } catch (error) {
      dispatch(fetchSearchResultsFailure(error.message));
    }
  };
};
