//routing utilities
import slugify from 'slugify';

//create profile route for a user
function createProfileRoute(user) {
  //slugify the username, e.g:"john-doe"
  const slug = slugify(user.name, { lower: true });
  return `/profile/${slug}-${user.shortId}`;
}

//create followers route for a user
function createFollowersRoute(user, type = 'followers') {
  const slug = slugify(user.name, { lower: true });
  //combine slug with usershortID to create the unique profile path for the selected user to route to
  return `/profile/${slug}-${user.shortId}/${type}`;
}

export { createProfileRoute, createFollowersRoute };