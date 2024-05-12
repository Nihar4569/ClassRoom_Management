import { Box, Button, Center, Container, Input, Text, VStack } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { app } from '../firebase';
import { useCookies } from 'react-cookie';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';


export default function Admin() {
    //firebase
    const db = getFirestore(app)
    const [adminData, setAdminData] = useState("");
    const [emid, setEmid] = useState("");
    const [password, setPassword] = useState("");
    const [cookies, setCookie, removeCookie] = useCookies(['atoken']);
    const navigate = useNavigate()


    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const teacherDoc = await getDoc(doc(db, 'ADMIN', emid));
            if (teacherDoc.exists()) {
                const adminData = teacherDoc.data();

                if (adminData.password === password) {
                    setAdminData(adminData);
                    const expirationTime = new Date(Date.now() + 5 * 60 * 1000); // Current time + 5 minutes in milliseconds
                    setCookie('atoken', String(emid), { path: '/', expires: expirationTime });

                    toast.success(`Welcome ${adminData.name}`);
                }
                else {
                    toast.error("Incorrect Password")
                }
            }
            else {
                toast.error("Admin does'nt exist")
            }
        } catch (error) {
            toast.error(error.message);
        }
    }
    useEffect(()=>{
        if(cookies.atoken){
            navigate("/admindash")
        }
    },[cookies.atoken])
    return (
        <Box>
            <Container>
                <VStack m="5vh" p="10vh" borderRadius="5vh" backgroundColor="red.600">
                    <Text color="white" fontWeight="bold" fontSize="30px">Super Admin</Text>
                    <br />
                    <form onSubmit={submitHandler}>
                        <Input value={emid} onChange={(e) => { setEmid(e.target.value) }} fontWeight="bold" fontSize="20px" placeholder='Employee ID' textAlign={"center"} color={"white"} />
                        <Input value={password} onChange={(e) => { setPassword(e.target.value) }} fontWeight="bold" fontSize="18px" placeholder='Password' textAlign={"center"} type='password' color={"white"} />
                        <Center>
                            <Button type='submit'>Log In</Button>
                        </Center>
                    </form>
                </VStack>

            </Container>
        </Box>
    )
}
