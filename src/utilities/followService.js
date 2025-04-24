//follow/unfollow API calls
import { fetchWithAuth } from './apiService';

//follow or unfollow a user
function toggleFollow(fromUser, toUser) {
  return fetchWithAuth('/followUser', {
    method: "POST",
    body: JSON.stringify({ 
      fromUser: fromUser, 
      toUser: toUser
    }),
  });
}

export { toggleFollow };