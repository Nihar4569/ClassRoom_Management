import React, { useContext, useEffect, useState } from 'react';
import { Context } from '..';
import { Box, Button, Container, VStack } from '@chakra-ui/react';
import { collection, getFirestore, onSnapshot, query } from 'firebase/firestore';
import { app } from '../firebase';
import Header from '../Components/Header';
import { useNavigate } from 'react-router-dom';

export default function StudentDash() {
  const { studentData, chatId, setChatId } = useContext(Context);
  const db = getFirestore(app);
  const [subjectsList, setSubjectsList] = useState([]);
  const navigate = useNavigate();

  const chatHandler = (chatId) => {

  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const quer = query(collection(db, `${studentData.semester}+${studentData.section}`));
        const unsubscribe = onSnapshot(quer, (snap) => {
          setSubjectsList(
            snap.docs.map((item) => {
              const id = item.id;
              return { id, ...item.data() };
            })
          );
        });

        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [db, studentData.semester, studentData.section,chatId]);

  if(chatId){
    navigate("/classroom")
  }
  if(!studentData){
    navigate("/")
  }
  return (
    <Box bg="grey">
      <Header />
      <Container h="calc(100vh - 8.3vh)" bg="white">
        {subjectsList.map((item) => (
          <VStack spacing={4}>
            <Button onClick={() => setChatId(`${studentData.semester}+${studentData.section}+${item.id}`)} key={item.id}>{item.id}</Button>
          </VStack>
        ))}
      </Container>
    </Box>
  );
}
