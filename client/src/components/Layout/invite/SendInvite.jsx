import React from 'react'

const SendInvite = ({inviteId,contactName}) => {
  return (
    <div className="sendinvitebox">
      <p className='sendinvitebox-text'>Ready to connect with <span>{contactName}</span>? Click the button below to send an invite!</p>
      <button className='sendinvitebox-button'>Send Invite</button>
    </div>
  )
}

export default SendInvite;