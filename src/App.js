// File location: src/App.js
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useContext, useEffect } from "react";
import { Context } from "./index";
import { useCookies } from "react-cookie";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "./firebase";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import theme from "./theme";

// Import pages
import Landing from "./Pages/Landing";
import Student from "./Pages/Student";
import Teacher from "./Pages/Teacher";
import StudentDash from "./Pages/StudentDash";
import TeacherDash from "./Pages/TeacherDash";
import Classroom from "./Pages/Classroom";
import Admin from "./Pages/Admin";
import AdminDash from "./Pages/AdminDash";
import Screen from "./Pages/Screen";
import Lobby from "./Pages/Lobby";
import VideoCall from "./Pages/VideoCall";

function App() {
  const {
    studentData,
    setStudentData,
    teacherData,
    setTeacherData,
    setTAuthenticated,
    setSAuthenticated,
    setLoader
  } = useContext(Context);

  // Cookie management
  const [cookies, setCookie, removeCookie] = useCookies(['stoken', 'ttoken']);

  // Firebase initialization
  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoader(true);

        // Check for student token
        if (cookies.stoken) {
          const key = String(cookies.stoken);
          const studentDoc = await getDoc(doc(db, 'STUDENTS', key));

          if (studentDoc.exists()) {
            const studentdata = studentDoc.data();
            setStudentData(studentdata);
            setSAuthenticated(true);
          } else {
            setStudentData("");
            removeCookie('stoken', { path: '/' });
          }
        }
        // Check for teacher token
        else if (cookies.ttoken) {
          const key = String(cookies.ttoken);
          const teacherDoc = await getDoc(doc(db, 'TEACHERS', key));

          if (teacherDoc.exists()) {
            const teacherdata = teacherDoc.data();
            setTeacherData(teacherdata);
            setTAuthenticated(true);
          } else {
            setTeacherData("");
            removeCookie('ttoken', { path: '/' });
          }
        }

        setLoader(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoader(false);
      }
    };

    fetchData();
  }, [db, cookies.stoken, cookies.ttoken, setStudentData, setTeacherData, setSAuthenticated, setTAuthenticated, setLoader, removeCookie]);

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Router>
        <Routes>
          {/* Main routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/teacher" element={<Teacher />} />
          <Route path="/student" element={<Student />} />
          <Route path="/studentdash" element={<StudentDash />} />
          <Route path="/teacherdash" element={<TeacherDash />} />
          <Route path="/classroom" element={<Classroom />} />

          {/* Admin routes */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/admindash" element={<AdminDash />} />

          {/* Other features */}
          <Route path="/screen" element={<Screen />} />
          <Route path="/lobby" element={<Lobby />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />

          <Route path="/videocall" element={<VideoCall />} />
          <Route path="/videocall/:roomId" element={<VideoCall />} />


        </Routes>

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '10px',
              padding: '16px',
              boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)'
            }
          }}
        />
      </Router>
    </ChakraProvider>
  );
}

export default App;