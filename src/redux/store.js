import { createStore, combineReducers } from 'redux';
import searchReducer from './reducers/searchReducer';  // Import the reducer

// Combine the reducers (if you have more)
const rootReducer = combineReducers({
  search: searchReducer,  // Add the search reducer
});

// Create the Redux store
const store = createStore(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()  // Optional for Redux DevTools
);

export default store;
