import { Box, Button, Container, Text, VStack, Center } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '..';
import Loader from '../Components/Loader';

export default function Landing() {
    const { tAuthenticated, sAuthenticated, teacherData, studentData, loader } = useContext(Context);
    const navigate = useNavigate();
    const [scale, setScale] = useState(1);

    const studentHandler = (e) => {
        e.preventDefault();
        navigate('/student');
    }

    const teacherHandler = (e) => {
        e.preventDefault();
        navigate('/teacher');
    }

    const handleClick = () => {
        setScale(3.3);
        setTimeout(() => setScale(1), 300); // Reset scale after animation
    }

    if (teacherData) {
        navigate("/teacherdash")
    }
    if (studentData) {
        navigate("/studentdash")
    }

    return (
        <Box>
            <VStack p="2vh" backgroundColor="blue.400">
                <Text color="white" fontSize="20px" fontWeight="bold">Join your ClassRoom</Text>
            </VStack>

            <Container>
                {loader ? (
                    <Center height="80vh">
                        <Loader />
                    </Center>
                ) : (
                    <>
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            onClick={handleClick}
                            animate={{ scale: scale }}
                            transition={{ duration: 0.3 }}
                        >
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

                        <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
                            <VStack onClick={() => navigate("/admin")} m={"5vh"} p={"10vh"} borderRadius={"5vh"} backgroundColor={"blue.300"} _hover={{ bg: "red" }}>
                                <Text color={"white"} fontWeight={"bold"} fontSize={"30px"}>Super Admin</Text>
                            </VStack>
                        </motion.div>
                    </>
                )}
            </Container>
        </Box>
    )
}
