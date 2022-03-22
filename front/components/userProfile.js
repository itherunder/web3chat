
const UserProfile = ( { user } ) => {
  return (
    <div>
      <h3>Address: {user?.address.substr(0, 4) + '...' + user?.address.substr(-2,2)}</h3>
      <h3>Username: {user?.username}</h3>
    </div>
  )
}

export default UserProfile;
