import {
  NO_EXPANDED_ROUTES,
  REQUEST_ROUTES,
  RECEIVE_EXPANDED_ROUTES
} from '../actions/types';

// Setting state to this default feels ghetto... probably a better way
export default function(state={price:null,time:null}, action) {
  switch (action.type) {
    case NO_EXPANDED_ROUTES:
      console.log('No better deals found.')
      return state;
    case REQUEST_ROUTES:
      return {
        price: null,
        time: null
      }
    case RECEIVE_EXPANDED_ROUTES:
      console.log('Received better deals!', action.routes)
      return action.routes;
  }
  return state;
}
