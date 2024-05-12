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
import Classroom from "./Pages/Tclassroom";
import Admin from "./Pages/Admin";
import AdminDash from "./Pages/AdminDash";

function App() {
  const {studentData,setStudentData,teacherData,setTeacherData,tAuthenticated,
    setTAuthenticated,sAuthenticated,setSAuthenticated} = useContext(Context)
  //cookie
  const [cookies, setCookie, removeCookie] = useCookies(['stoken', 'ttoken']);

   // Firebase initialization
   const auth = getAuth(app);
   const db = getFirestore(app);

  useEffect(() => {
        
    const fetchData = async () => {
        try {
            if(cookies.stoken){
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
            }
            else{
              const key = String(cookies.ttoken);
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
            }
        } catch (error) {
            toast.error(error.message);
        }
    };
    fetchData(); // Call fetchData inside useEffect
}, []);


  return (
    <div className="App">
      <Router>
      <Routes>
        {/* <Route path="/chat" element={<Chat/>}/> */}
        <Route path="/" element={<TS/>}/>
        <Route path="/teacher" element={<Teacher/>}/>
        <Route path="/student" element={<Student/>}/>
        <Route path="/studentdash" element={<StudentDash/>}/>
        <Route path="/studentlogin" element={<Studentlogin/>}/>
        <Route path="/teacherdash" element={<TeacherDash/>}/>
        <Route path="/classroom" element={<Classroom/>}/>
        <Route path="/admin" element={<Admin/>}/>
        <Route path="/admindash" element={<AdminDash/>}/>
      </Routes>
      <Toaster/>
    </Router>
    </div>
  );
}

export default App;
