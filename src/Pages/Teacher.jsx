import React, { useContext, useEffect, useState } from 'react';
import { Box, Button, Container, Input, Text, VStack, Menu, MenuButton, MenuList, MenuItem, Center, Toast, TagLabel, FormLabel } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { addDoc, collection, doc, getDoc, getFirestore, setDoc, listCollections } from 'firebase/firestore';
import { app, storage } from "../firebase"
import { getAuth } from 'firebase/auth';
import { useCookies } from 'react-cookie';
import { Context } from '..';
import { Navigate } from 'react-router-dom';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { v4 } from 'uuid';




export default function Teacher() {
    const [isLogin, setIsLogin] = useState(true);
    const [teacherName, setTeacherName] = useState("")
    const [teacherIdFile, setTeacherIdFile] = useState(null);
    const [teacherPassword, setTeacherPassword] = useState("null")
    const [emid, setemid] = useState("");
    let [idurl, setidurl] = useState("");
    const [lemid, setLemid] = useState("");
    const [lpassword, setLpassword] = useState("");
    const {teacherData,setTeacherData} = useContext(Context);

    // Firebase initialization
    const auth = getAuth(app);
    const db = getFirestore(app);

    //Token
    const [cookies, setCookie, removeCookie] = useCookies(['ttoken']);



    const toggleForm = () => {
        setIsLogin(!isLogin);
    };

    const teacherRegister = async (e) => {
        e.preventDefault();
        if (!teacherName || !emid || !teacherIdFile || !teacherPassword) {
            toast.error("Please fill in all fields.");
            return;
        }
        try {
            const teacherDoc = await getDoc(doc(db, 'TEACHERS', emid));
            if(!teacherDoc.exists()){
                await idupload(teacherIdFile)
            await setDoc(doc(db, 'TEACHERS', emid), {
                name: teacherName,
                emid: emid,
                idUrl: idurl,
                access: false,
                password: teacherPassword
            });
            toast.success(`Welcome ${teacherName}`);
            }
            else{
                toast.error("Teacher Already Exist")
            }
        } catch (error) {
            toast.error(error.message);
        }
    };



    const idupload = async (file) => {
        try {
            const imageRef = ref(storage, `TeacherID/${file.name + v4()}`);
            const snapshot = await uploadBytes(imageRef, file);
            const url = await getDownloadURL(snapshot.ref);
            idurl = url;
            toast.success('Upload Successful');
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error(error.message);
        }
    };

    const teacherlogin = async(e)=>{
        e.preventDefault();
        try {
            const teacherDoc = await getDoc(doc(db, 'TEACHERS', lemid));
            if(teacherDoc.exists()){
                const teacherData = teacherDoc.data();
                if(teacherData.access){
                    if(teacherData.password === lpassword){
                        setTeacherData(teacherData);
                        setCookie('ttoken', String(lemid), { path: '/' });
                        toast.success(`Welcome ${teacherData.name}`);
                        console.log(teacherData);
                    }
                    else{
                        toast.error("Incorrect Password")
                    }
                }
                else{
                    toast.error("Access Denied Wait for Verification of your id")
                }
            }
            else{
                toast.error("Teacher does'nt exist")
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    if(teacherData) return <Navigate to={"/teacherdash"}/>
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
                        <Text color="white" fontWeight="bold" fontSize="30px">Teacher Login</Text>
                        <br />
                        <form onSubmit={teacherlogin}>
                            <Input value={lemid} onChange={(e) => setLemid(e.target.value)} placeholder='Employee ID' textAlign={"center"} />
                            <Input value={lpassword} onChange={(e) => setLpassword(e.target.value)} placeholder='Password' textAlign={"center"} type='password' />
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
                        <Text color="white" fontWeight="bold" fontSize="30px">Teacher Sign Up</Text>
                        <br />
                        <form onSubmit={teacherRegister}>
                            <VStack>
                                <Input value={teacherName} onChange={(e) => setTeacherName(e.target.value)} type='text' placeholder='Enter Your Name' textAlign={"center"} required={true} />
                                <Input value={emid} onChange={(e) => setemid(e.target.value)} type='number' placeholder='Employee Id' textAlign={"center"} required={true} />
                                <FormLabel htmlFor="file-upload">Upload Teacher ID Card:</FormLabel>
                                <Input onChange={(event) => setTeacherIdFile(event.target.files[0])} id="file-upload" type="file" accept="image/*" required={true} />
                                <Input value={teacherPassword} onChange={(e) => setTeacherPassword(e.target.value)} type='password' placeholder='Password' textAlign={"center"} required={true} />
                                <Button type='submit'>Sign Up</Button>

                            </VStack>
                        </form>
                        <Button _hover={{ backgroundColor: "blue.500", color: "white" }} onClick={toggleForm}>Back to Login</Button>
                    </VStack>
                </motion.div>
            </Container>
        </Box>
    )
}
