import {BrowserRouter as Router, Route, Routes, Navigate} from "react-router-dom"
import toast, { Toaster } from "react-hot-toast";
import TS from "./Pages/TS";
import { useContext, useEffect } from "react";
import { Context } from "./index";
import { useCookies } from "react-cookie";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "./firebase";
import StudentDash from "./Pages/StudentDash";
import Teacher from "./Pages/Teacher";
import Studentlogin from "./Pages/TS";
import Student from "./Pages/Student";
import TeacherDash from "./Pages/TeacherDash";

function App() {
  const {studentData,setStudentData,teacherData,setTeacherData} = useContext(Context)
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
                    console.log(studentData);
                    toast.success("navigate to student")
            } else {
                toast.error("stoken not found.");
            }
            }
            else{
              const key = String(cookies.ttoken);
              const teacherDoc = await getDoc(doc(db, 'TEACHERS', key));
                if (teacherDoc.exists()) {
                    const teacherdata = teacherDoc.data(); // Directly use studentDoc.data() here
                    setTeacherData(teacherdata);
                    console.log(teacherData);
                    toast.success("navigate to teacher")
            } else {
                toast.error("stoken not found.");
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
        <Route path="/" element={<Teacher/>}/>
        <Route path="/studentdash" element={<StudentDash/>}/>
        <Route path="/studentlogin" element={<Studentlogin/>}/>
        <Route path="/teacherdash" element={<TeacherDash/>}/>
      </Routes>
      <Toaster/>
    </Router>
    </div>
  );
}

export default App;
