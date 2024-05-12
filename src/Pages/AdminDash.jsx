import { collection, getFirestore, onSnapshot, query, updateDoc, doc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { app } from '../firebase';
import { Box, Button, Container, HStack, Image, Table, Tbody, Td, Text, Th, Thead, Tr, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

export default function AdminDash() {
    const db = getFirestore(app);

    // Initialize teacherList as an array
    const [teacherList, setTeacherList] = useState([]);
    const [cookies, setCookie, removeCookie] = useCookies(['atoken']);
    const navigate = useNavigate();


    useEffect(() => {
        const quer = query(collection(db, "TEACHERS"));
        const unsubscribe = onSnapshot(quer, (snap) => {
            console.log("acc");
            setTeacherList(
                snap.docs.map((item) => {
                    const id = item.id;
                    return { id, ...item.data() }; // Add id to it
                })
            );
        });

        return unsubscribe;
    }, [db]);

    // Function to handle button click and update access
    const handleAccessUpdate = async (id, currentAccess) => {
        try {
            // Toggle the value of currentAccess
            const newAccess = !currentAccess;
            // Update the access field in the database
            await updateDoc(doc(db, "TEACHERS", id), {
                access: newAccess
            });
            console.log("Access updated successfully");
        } catch (error) {
            console.error("Error updating access:", error.message);
        }
    };

    if(cookies.atoken == undefined){
        navigate("/")
    }
    return (
        <Box>
            <Container>
                <VStack justifyContent={"center"} mb={4}>
                    <Text>
                        Teacher List
                    </Text>
                </VStack>
                <Table variant="striped" bg={"blue.300"}>
                    <Thead>
                        <Tr>
                            <Th>Name</Th>
                            <Th>ID</Th>
                            <Th>ID Proof</Th>
                            <Th>Access</Th>
                            <Th>Action</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {teacherList.map((item) => (
                            <Tr key={item.id}>
                                <Td>{item.name}</Td>
                                <Td>{item.id}</Td>
                                <Td>
                                    <a href={item.idUrl} target="_blank" rel="noopener noreferrer">
                                        <Image src={item.idUrl} />
                                    </a>
                                </Td>
                                <Td>{String(item.access)}</Td>
                                <Td>
                                    <Button colorScheme='red' onClick={() => handleAccessUpdate(item.id, item.access)}>
                                        {item.access ? "Unauthorize" : "Give Access"}
                                    </Button>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Container>
        </Box>
    );
}
