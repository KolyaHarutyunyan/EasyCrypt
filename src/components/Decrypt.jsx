import React, { useState, useEffect, useCallback, useReducer } from 'react'
import { useBlockstack } from 'react-blockstack'
import { isNil, isNull } from 'lodash'
import KeyField from './KeyField.jsx'
import { usePrivateKey } from './cipher.jsx'
import Dropzone, { SaveButton, decryptedFilename } from './Dropzone.jsx'

import css from 'text-security/dist/text-security.css'

function decryptHandler(file, decryptContent, setResult) {
  if (file) {
    var myReader = new FileReader()
    myReader.readAsArrayBuffer(file)
    myReader.addEventListener("loadend", (e) => {
      var buffer = e.srcElement.result; //arraybuffer object
      if (buffer) {
        console.log("decryptHandler", file, buffer.length)
        var decodedString = String.fromCharCode.apply(null, new Uint8Array(buffer));
        const originalObject = decryptContent(decodedString)
        if (originalObject) {
          const decrypted = new Blob([originalObject])  // https://fileinfo.com/filetypes/encoded
          decrypted.filename = file.name
          setResult(decrypted)
        } else {
          console.warn("File not decrypted:", file)
          setResult(null)
        }
      } else {
        console.warn("Failed to read file:", file)
        setResult(null)
      }
  })}}


function decryptReducer (state, action) {
  // shared for multiple components
  console.debug("DECRYPT RED:", state, action)
  switch (action.type) {
    case "files":
      const files = action.files
      const file = files && files[0]
      return({...state, file: file, message: null})
    case "content":
      return({...state, content: action.content})
    case "message":
      return({...state, message: action.message})
    case "reset":
      return({})
    default:
      throw new Error("Unknown event option:", action.type);
  }
}

export function DropDecrypt ({setResult, gotResult, onError, filename}) {
  const { userSession } = useBlockstack()

  const [{file}, dispatch] = useReducer(decryptReducer, {});
  const setFiles = (files) => dispatch({type: "files", files: files })
  const setMessage = (message) => dispatch({type: "message", message: message})

  const decryptContent = useCallback((content => {
    try {
      return( userSession.decryptContent(content) )
    } catch (err) {
      console.info("Failed to decrypt:", err)
      setFiles(null)
      onError && onError({type: "decrypt failed", error: err, message: "Can't decrypt the file, possibly because it is not encrypted with your public key."})
      return(null)
    }
  }), [userSession])
  const placeholder = <span>Drag & drop a <cite>dCrypt</cite> encrypted file here, or click to select from your filesystem.</span>

  useEffect( () => decryptHandler(file, decryptContent, setResult), [file, decryptContent])

  return (
      <>
        <Dropzone className="Dropzone" onChange = { setFiles }
                  placeholder={placeholder}>
        { ((!isNull(gotResult) ? gotResult : file)
         ? <div className="mx-auto text-center">
              <div><i className="fas fa-unlock-alt m-auto"></i></div>
              <div className="mt-2">{filename || (file && file.name)}</div>
           </div>
         : <div className="mx-auto text-center">
             <div>
               <i className="fas fa-file-import m-auto"></i>
             </div>
             <div className="mt-4">
               {placeholder}
             </div>
           </div>)}
         </Dropzone>
      </>
    );
  }

export default function Decrypt (props) {
  const { userData, userSession } = useBlockstack()
  const {username} = userData || {}
  const privateKey = usePrivateKey()

  const [{content, message}, dispatch] = useReducer(decryptReducer, {});
  const setResult = (content) => dispatch({type: "content", content: content})
  const setMessage = (message) => dispatch({type: "message", message: message})
  const filename  = content && content.filename && decryptedFilename(content.filename)
  const onError = ({type, message}) => {
    console.warn("Problem during decryption:", type, message)
    setMessage(message)
  }
  const resetForm = () => dispatch({type: "reset"})
  console.debug("DECRYPT:", content, message)
  return (
    <div className="jumbotron">
     <div className="m-auto" style={{maxWidth: "40em"}}>
      <div className="d-flex justify-content-center align-items-center w-100">
        <KeyField className="PrivateKeyField"
          username={username}
          label="Private Key" privateKey={privateKey} />
      </div>

      <div className="mt-4 pt-4 m-auto align-items-center" >
        <DropDecrypt setResult={setResult} gotResult={!!content} onError={onError}
                     filename={filename}/>
        { message &&
          <div className="alert alert-warning text-center mt-4">
            {message}
          </div>
        }
        { content &&
           <div className="alert alert-info text-center mt-4">
              The file has been decrypted and the result is ready to be saved.
            </div> }
        <div className="d-flex justify-content-center align-items-center mt-3">
          <SaveButton content={content} onComplete={ resetForm }
                      filename={filename}>
            Save Decrypted File
          </SaveButton>
        </div>
       </div>
      </div>
    </div>
  )
}
