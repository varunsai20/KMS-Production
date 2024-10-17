import { createStore, combineReducers } from 'redux';
import searchReducer from './reducers/searchReducer';  // Existing reducer
import authReducer from './reducers/LoginAuth';  // Import your authReducer

// Combine the reducers (search and auth reducers)
const rootReducer = combineReducers({
  search: searchReducer,  // Your existing search reducer
  auth: authReducer,      // Add the auth reducer here
});

// Create the Redux store
const store = createStore(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()  // Optional for Redux DevTools
);

export default store;
