import { Box, Button, Container, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion';
import React from 'react'
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Header';

export default function TS() {
    const navigate = useNavigate();

    const studentHandler = (e)=>{
        e.preventDefault();
        navigate('/teacher');
    }
    
    const teacherHandler = (e)=>{
        e.preventDefault();
        navigate('/student');
    }

    return (
        <Box>
            <Header/>

            <Container>
                <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
                    <VStack m={"5vh"} p={"10vh"} borderRadius={"5vh"} backgroundColor={"blue.300"}>
                        <Text color={"white"} fontWeight={"bold"} fontSize={"30px"}>Student Login</Text>
                        <br />
                        <Button _hover={{ backgroundColor: "blue.500", color: "white" }} onClick={studentHandler}>Login/SignUp</Button>
                    </VStack>
                </motion.div>

                <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
                    <VStack m={"5vh"} p={"10vh"} borderRadius={"5vh"} backgroundColor={"blue.300"}>
                        <Text color={"white"} fontWeight={"bold"} fontSize={"30px"}>Teacher Login</Text>
                        <br />
                        <Button _hover={{ backgroundColor: "blue.500", color: "white" }} onClick={teacherHandler}>Login/SignUp</Button>
                    </VStack>
                </motion.div>
            </Container>
        </Box>
    )
}
