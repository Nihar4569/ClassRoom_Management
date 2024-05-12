import React, { useContext, useEffect, useState } from 'react';
import { Box, Button, Container, Input, Text, VStack, Menu, MenuButton, MenuList, MenuItem, Center, Toast } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { addDoc, collection, doc, getDoc, getFirestore, setDoc, listCollections } from 'firebase/firestore';
import { app } from "../firebase"
import { getAuth } from 'firebase/auth';
import { useCookies } from 'react-cookie';
import { Context } from '..';
import { Navigate } from 'react-router-dom';


export default function Student() {
    const [isLogin, setIsLogin] = useState(true);
    const [regd, setRegd] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [semester, setSemester] = useState(""); // State for semester selection
    const [sectionn, setSectionn] = useState("");
    const [lregd, setLregd] = useState("");
    const [lpassword, setLpassword] = useState("");

    const {studentData,setStudentData} = useContext(Context)

    // Firebase initialization
    const auth = getAuth(app);
    const db = getFirestore(app);

    const toggleForm = () => {
        setIsLogin(!isLogin);
    };

    //cookie
  const [cookies, setCookie, removeCookie] = useCookies(['stoken']);
    

    

    const registerHandler = async (e) => {
        e.preventDefault();
        try {
            const studentsDoc = await getDoc(doc(db, 'STUDENTS', regd));
            if (studentsDoc.exists()) {
                toast.error("Student Already Exists");
            } else {
                await setDoc(doc(db, 'STUDENTS', regd), {
                    uid:regd,
                    name: name,
                    regd: regd,
                    email: email,
                    password: password,
                    semester: semester, // Include semester in the document data
                    section: sectionn,
                    classroomid: `${semester}+${sectionn}`
                });
                toast.success("Registration Successful");
                // Clear form fields after successful registration
                setName("");
                setRegd("");
                setEmail("");
                setPassword("");
                setSemester(""); // Clear semester selection
                setSectionn("");
            }

        } catch (error) {
            console.error('Error registering student:', error);
            toast.error(error.message);
        }
    };


    const loginHandler = async (e) => {
        e.preventDefault();
        try {
            const studentDoc = await getDoc(doc(db, 'STUDENTS', lregd));
            if (studentDoc.exists()) {
                const studentData = studentDoc.data(); // Directly get student data here
                if (studentData.password === lpassword) {
                    setStudentData(studentData);
                    setCookie('stoken', String(lregd), { path: '/' });
                    toast.success("Logged in");
                    console.log(cookies.stoken)
                } else {
                    toast.error("Incorrect Password");
                }
            } else {
                toast.error("Student not found");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };
    

    if(studentData){
        return <Navigate to={"/studentdash"}/>
       }



    return (
        <Box>
            <VStack p="2vh" backgroundColor="blue.400">
                <Text color="white" fontSize="20px" fontWeight="bold">Join your ClassRoom</Text>
            </VStack>

            <Container>
                <motion.div
                    animate={{ opacity: isLogin ? 1 : 0.5, scale: isLogin ? 1 : 0.5 }}
                    transition={{ duration: 0.5 }}
                >
                    <VStack m="5vh" p="10vh" borderRadius="5vh" backgroundColor="blue.300">
                        <Text color="white" fontWeight="bold" fontSize="30px">Student Login</Text>
                        <br />
                        <form onSubmit={loginHandler}>
                            <Input value={lregd} onChange={(e) => setLregd(e.target.value)} placeholder='Regd No' textAlign={"center"} />
                            <Input value={lpassword} onChange={(e) => setLpassword(e.target.value)} placeholder='Password' textAlign={"center"} />
                            <Center>
                                <Button type='submit'>Log In</Button>
                            </Center>
                        </form>
                        <Button _hover={{ backgroundColor: "blue.500", color: "white" }} onClick={toggleForm}>Sign Up</Button>
                    </VStack>
                </motion.div>


                <motion.div
                    animate={{ opacity: isLogin ? 0.5 : 1, scale: isLogin ? 0.5 : 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <VStack m="5vh" p="10vh" borderRadius="5vh" backgroundColor="blue.300">
                        <Text color="white" fontWeight="bold" fontSize="30px">Student Sign Up</Text>
                        <br />
                        <form onSubmit={registerHandler}>
                            <VStack>
                                <Input value={name} onChange={(e) => setName(e.target.value)} type='text' placeholder='Enter Your Name' textAlign={"center"} />
                                <Input value={regd} onChange={(e) => setRegd(e.target.value)} type='number' placeholder='Regd No' textAlign={"center"} />
                                <Input value={email} onChange={(e) => setEmail(e.target.value)} type='email' placeholder='Email' textAlign={"center"} />
                                <Input value={password} onChange={(e) => setPassword(e.target.value)} type='password' placeholder='Password' textAlign={"center"} />
                                {/* Replace Input with Menu for semester dropdown */}
                                <Menu>
                                    <MenuButton textColor={"grey"} backgroundColor={"blue.300"} as={Button} textAlign="center">
                                        {semester ? `Semester ${semester}` : 'Select Semester'}
                                    </MenuButton>
                                    <MenuList>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(semester => (
                                            <MenuItem key={semester} onClick={(e) => setSemester(`semester${semester}`)}>{`Semester ${semester}`}</MenuItem>
                                        ))}
                                    </MenuList>
                                </Menu>
                                <Input value={sectionn}
                                    onChange={(e) => setSectionn(e.target.value.toUpperCase())}
                                    placeholder='Section'
                                    type='text'
                                    maxLength={1} // Set maximum length to 1 character
                                    style={{ textAlign: 'center' }} />
                                <Button type='submit'>Sign Up</Button>
                            </VStack>
                        </form>
                        <Button _hover={{ backgroundColor: "blue.500", color: "white" }} onClick={toggleForm}>Back to Login</Button>
                    </VStack>
                </motion.div>
            </Container>
        </Box>
    );
}
