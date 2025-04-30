// File location: src/index.js
import React, { createContext, useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import theme from './theme';

export const Context = createContext({});

const AppWrapper = () => {
  // User data states
  const [studentData, setStudentData] = useState("");
  const [teacherData, setTeacherData] = useState("");
  
  // Authentication states
  const [tAuthenticated, setTAuthenticated] = useState(false);
  const [sAuthenticated, setSAuthenticated] = useState(false);
  
  // Application states
  const [chatId, setChatId] = useState("");
  const [loader, setLoader] = useState(false);
  
  // Legacy states (kept for backward compatibility)
  const [regd, setRegd] = useState("");
  const [name, setName] = useState("");
  const [chatid, setChatid] = useState("");

  return (
    <Context.Provider 
      value={{ 
        regd,
        setRegd,
        name,
        setName,
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
      }}
    >
      <App />
    </Context.Provider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);