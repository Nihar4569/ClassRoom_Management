import React, { useContext } from 'react';
import Header from '../Components/Header';
import { Box, Container, HStack, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Context } from '..';

export default function Lobby() {
    const navigate = useNavigate();
    const { teacherData, studentData } = useContext(Context);
    const user = teacherData || studentData;
    return (
        <>
            <Box>
                <Header />

                <Container maxW="container.xl">
                    <VStack spacing={{ base: 5, md: 10 }}>
                        <Text
                            fontWeight="bold"
                            color="blue.500"
                            fontSize={{ base: "3vh", md: "4vh" }}
                            textAlign="center"
                            mt={{ base: 4, md: 8 }}
                        >
                            Welcome 👋 {user.name}
                        </Text>
                        <HStack
                            justify="center"
                            spacing={{ base: 2, md: 5 }}
                            flexWrap="wrap"
                            w="full"
                        >
                            <VStack
                                onClick={() => navigate("/classroom")}
                                m={{ base: 2, md: 5 }}
                                p={{ base: 5, md: 10 }}
                                w={{ base: "25vh", md: "30vh" }}
                                h={{ base: "25vh", md: "30vh" }}
                                borderRadius="5vh"
                                backgroundColor="blue.300"
                                alignItems="center"
                                justifyContent="center"
                                _hover={{
                                    transform: 'scale(1.05)',
                                    transition: 'transform 0.3s',
                                    boxShadow: 'lg',
                                    cursor: "pointer"
                                }}
                            >
                                <Text
                                    textAlign="center"
                                    color="white"
                                    fontWeight="bold"
                                    fontSize={{ base: "20px", md: "30px" }}
                                >
                                    ClassRoom Chat
                                </Text>
                            </VStack>
                            <VStack
                                onClick={() => navigate("/screen")}
                                m={{ base: 2, md: 5 }}
                                p={{ base: 5, md: 10 }}
                                w={{ base: "25vh", md: "30vh" }}
                                h={{ base: "25vh", md: "30vh" }}
                                borderRadius="5vh"
                                backgroundColor="blue.300"
                                alignItems="center"
                                justifyContent="center"
                                _hover={{
                                    transform: 'scale(1.05)',
                                    transition: 'transform 0.3s',
                                    boxShadow: 'lg',
                                    cursor: "pointer"
                                }}
                            >
                                <Text
                                    textAlign="center"
                                    color="white"
                                    fontWeight="bold"
                                    fontSize={{ base: "20px", md: "30px" }}
                                >
                                    Screen Share
                                </Text>
                            </VStack>
                        </HStack>
                        {teacherData && (
                            <VStack
                                onClick={() => navigate("/teacherdash")}
                                m={{ base: 2, md: 5 }}
                                p={{ base: 5, md: 10 }}
                                w={{ base: "25vh", md: "30vh" }}
                                h={{ base: "25vh", md: "30vh" }}
                                borderRadius="5vh"
                                backgroundColor="blue.300"
                                alignItems="center"
                                justifyContent="center"
                                _hover={{
                                    transform: 'scale(1.05)',
                                    transition: 'transform 0.3s',
                                    boxShadow: 'lg',
                                    cursor: "pointer"
                                }}
                            >
                                <Text
                                    textAlign="center"
                                    color="white"
                                    fontWeight="bold"
                                    fontSize={{ base: "20px", md: "30px" }}
                                >
                                    Switch Class
                                </Text>
                            </VStack>
                        )}
                    </VStack>
                </Container>
            </Box>
        </>
    );
}
