import React from 'react';
import { useBlockstack } from 'react-blockstack'

import css from './Auth.css'

const profileManagerUrl = "https://browser.blockstack.org/profiles"

function AuthButton ({signIn, signOut}) {
  return (
    signOut ?
      <button
          className="btn btn-outline-secondary"
          onClick={ signOut }>
          Sign Out
      </button>
      : signIn ?
      <button
        className="btn btn-outline-primary"
        onClick={ signIn }>
        <i className="fas fa-sign-in-alt mr-1" style={{fontSize: "1rem"}}></i>
        Sign In
      </button>
      : <span>...</span>
  )
}

function MoreMenu (props) {
  const { signOut } = useBlockstack()
  return(
  <div className="dropdown-menu">
    <a className="dropdown-item" onClick={ signOut }>
      <i className="fas fa-sign-out-alt"></i>
      <span className="ml-2">Sign out</span>
    </a>
    <a className="dropdown-item" href={profileManagerUrl} target="_blank">
      <i className="fas fa-user-cog"></i>
      <span className="ml-2">Edit Profile</span>
    </a>
  </div>)
}

export default function Auth (props) {
    const {userSession, userData, signIn, signOut, person} = useBlockstack()
    const {name, avatarUrl} = person || {} // access functions
    const avatar = avatarUrl && person && person.avatarUrl()
    const {username, email} = userData || {}
    if ( userSession && userSession.isUserSignedIn() && userSession.isSignInPending()) {
      console.log("Blockstack inconsistency: Already signed in yet signin is pending");
    }
    const defaultAvatar = Math.random() < 0.7 ?  "fas fa-user-circle" : "fas fa-user-secret"
    // console.log("UserData:", avatarUrl)
    return (
      <div className="Auth">
         { signOut &&
          <div className="btn-group dropdown">
            <button className="btn text-muted dropdown-toggle"
              data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <span className="avatar mr-3">
                {avatar ?
                 <img src={ avatar }
                      className="avatar-image mr-3" id="avatar-image" />
                 : <i className={defaultAvatar} style={{fontSize: "1.6rem", marginRight: "0.5em"}}></i>}
                { username && username.replace(/.id.blockstack$/, "") }
              </span>
            </button>
            <MoreMenu/>
          </div>}

        {(signIn || (!signOut && !userSession.isSignInPending())) &&
           <button
             className="btn btn-outline-primary"
             disabled={!signIn}
             onClick={ signIn }>
             <i className="fas fa-sign-in-alt mr-1" style={{fontSize: "1rem"}}></i>
             Sign In
           </button>}
        </div>
    )
}
