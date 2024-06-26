import React, { createContext, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ChakraProvider } from '@chakra-ui/react';

export const Context = createContext({});

const AppWrapper = ()=>{
  const [regd, setRegd] = useState("");
  const [name, setName] = useState("");
  const [studentData,setStudentData] = useState("")
  const [teacherData,setTeacherData] = useState("")
  const [chatid,setChatid] = useState("");
  const [tAuthenticated,setTAuthenticated] = useState("");
  const [sAuthenticated,setSAuthenticated] = useState("");
  const [chatId,setChatId] = useState("")
  const [loader,setLoader] = useState(false)

  return(
    <Context.Provider value={{ 
      regd,
      setRegd,
      studentData,
      setStudentData,
      teacherData,
      setTeacherData,
      chatid,
      setChatid,
      tAuthenticated,
      setTAuthenticated,
      sAuthenticated,
      setSAuthenticated,
      chatId,
      setChatId,
      loader,
      setLoader
    }}>
      <ChakraProvider>
        <App/>
      </ChakraProvider>
    </Context.Provider>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);

