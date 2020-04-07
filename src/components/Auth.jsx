import React, { useCallback } from 'react';
import { useBlockstack } from 'react-blockstack'
import { showBlockstackConnect } from '@blockstack/connect'
import { usePerson, useAuthOptions } from './library'

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
  <div className="dropdown-menu dropdown-menu-right">
    <a className="dropdown-item" href={profileManagerUrl} target="_blank" rel="noopener noreferrer">
      <i className="fas fa-user-cog"></i>
      <span className="ml-2">Edit Profile</span>
    </a>
    <div className="dropdown-divider"></div>
    <a className="dropdown-item" onClick={ signOut }>
      <i className="fas fa-sign-out-alt"></i>
      <span className="ml-2">Sign out</span>
    </a>
  </div>)
}

export default function Auth (props) {
    const {userSession, userData, signOut, authenticated, person} = useBlockstack()
    const authOptions = useAuthOptions()
    const signIn = useCallback (!authenticated && (() => { 
      showBlockstackConnect(authOptions)
    }), [authOptions])
    const { avatarUrl, username } = usePerson()
    const defaultAvatar = "fas fa-user-secret"
    return (
      <div className="Auth">
         { signOut &&
          <div className="btn-group dropdown">
            <button className="btn text-muted dropdown-toggle"
              data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <span className="avatar mr-3">
                {avatarUrl ?
                 <img src={ avatarUrl }
                      className="avatar-image mr-3" id="avatar-image" />
                 : <i className={defaultAvatar} style={{fontSize: "1.6rem", marginRight: "0.5em"}}></i>}
                { username }
              </span>
            </button>
            <MoreMenu/>
          </div>}

        {(signIn || !signOut) &&
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
