import keyMirror from 'keymirror';

export default keyMirror({
  AUTH_START:          null, //Each time login starts
  AUTH_END:            null, //Each time login ends
  AUTH_SUCCESS:        null, //If successfully got an OAuth token
  AUTH_ERROR:          null, //If credentials are invalid
  AUTH_FAILURE:        null,  //All non user-related reasons of failure
  AUTH_TOKEN_OBSOLETE: null,
  AUTH_LOGOUT:         null
});
