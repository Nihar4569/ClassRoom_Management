import {BrowserRouter as Router, Route, Routes, Navigate} from "react-router-dom"
import toast, { Toaster } from "react-hot-toast";
import TS from "./Pages/Landing";
import { useContext, useEffect } from "react";
import { Context } from "./index";
import { useCookies } from "react-cookie";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "./firebase";
import StudentDash from "./Pages/StudentDash";
import Teacher from "./Pages/Teacher";
import Studentlogin from "./Pages/Landing";
import Student from "./Pages/Student";
import TeacherDash from "./Pages/TeacherDash";
import Classroom from "./Pages/Classroom";
import Admin from "./Pages/Admin";
import AdminDash from "./Pages/AdminDash";
import Lobby from "./Pages/Lobby";
import Screen from "./Pages/Screen";
import Landing from "./Pages/Landing";

function App() {
  const {studentData,setStudentData,teacherData,setTeacherData,tAuthenticated,
    setTAuthenticated,sAuthenticated,setSAuthenticated,setLoader} = useContext(Context)
  //cookie
  const [cookies, setCookie, removeCookie] = useCookies(['stoken', 'ttoken']);

   // Firebase initialization
   const auth = getAuth(app);
   const db = getFirestore(app);

  useEffect(() => {
        
    const fetchData = async () => {
        try {
            if(cookies.stoken){
              setLoader(true)
              const key = String(cookies.stoken);
              const studentDoc = await getDoc(doc(db, 'STUDENTS', key));
                if (studentDoc.exists()) {
                    const studentdata = studentDoc.data(); // Directly use studentDoc.data() here
                    setStudentData(studentdata);
                    setSAuthenticated(true);
                    console.log(studentData);
                    toast.success("navigate to student")

            } else {
                setStudentData("");
                toast.error("stoken not found.");
            }
            setLoader(false)
            }
            else{
              const key = String(cookies.ttoken);
              setLoader(true)
              const teacherDoc = await getDoc(doc(db, 'TEACHERS', key));
                if (teacherDoc.exists()) {
                    const teacherdata = teacherDoc.data(); // Directly use studentDoc.data() here
                    setTeacherData(teacherdata);
                    setTAuthenticated(true);
                    toast.success("navigate to teacher")
                    console.log(teacherData);
            } else {
                toast.error("ttoken not found.");
            }
            setLoader(false)
            }
        } catch (error) {
            toast.error(error.message);
        }
    };
    fetchData(); // Call fetchData inside useEffect
}, [db]);


  return (
    <div className="App">
      <Router>
      <Routes>
        {/* <Route path="/chat" element={<Chat/>}/> */}
        <Route path="/" element={<Landing/>}/>
        <Route path="/teacher" element={<Teacher/>}/>
        <Route path="/student" element={<Student/>}/>
        <Route path="/studentdash" element={<StudentDash/>}/>
        <Route path="/studentlogin" element={<Studentlogin/>}/>
        <Route path="/teacherdash" element={<TeacherDash/>}/>
        <Route path="/classroom" element={<Classroom/>}/>
        <Route path="/admin" element={<Admin/>}/>
        <Route path="/admindash" element={<AdminDash/>}/>
        <Route path="/screen" element={<Screen/>}/>
        <Route path="/lobby" element={<Lobby/>}/>
      </Routes>
      <Toaster/>
    </Router>
    </div>
  );
}

export default App;
