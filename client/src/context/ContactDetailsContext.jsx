import { createContext,useContext,useState } from "react";

const ContactDetailsContext = createContext();
const ContactDetailsProvider= ({children})=>{
    const [contactDetailsArray,setContactDetailsArray]=useState({searchedNewUser:false,detailsArray:[]});
    return (
        <ContactDetailsContext.Provider value={[contactDetailsArray,setContactDetailsArray]}>
            {children}
        </ContactDetailsContext.Provider>
    )
}

const useContactDetailsArray=()=>useContext(ContactDetailsContext);
export {useContactDetailsArray,ContactDetailsProvider};