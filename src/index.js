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

  return(
    <Context.Provider value={{ 
      regd,
      setRegd,
      studentData,
      setStudentData,
      teacherData,
      setTeacherData
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

