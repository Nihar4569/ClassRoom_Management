import { Box, Button, Container, Input, Menu, MenuButton, MenuItem, MenuList, Text, VStack } from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from 'react'
import { Context } from '..';
import Header from '../Components/Header';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../firebase';
import toast from 'react-hot-toast';
import { Navigate, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

export default function TeacherDash() {

  //FireBase
  const auth = getAuth(app);
  const db = getFirestore(app);
  //Cookie
  const [cookies, setCookie, removeCookie] = useCookies(['ttoken']);

  const { teacherData, chatId, setChatId, tAuthenticated, setTAuthenticated, setTeacherData } = useContext(Context);
  const [semester, setSemester] = useState("");
  const [section, setSection] = useState("");
  const [subject, setSubject] = useState("");
  const navigate = useNavigate();


  const classHandler = async (e) => {
    e.preventDefault();
    const chatId = `${semester}+${section}+${subject}`;
    const sectionId = `${semester}+${section}`
    setChatId(chatId);
    try {
      const sectionDoc = await getDoc(doc(db, sectionId, subject));
      if(!sectionDoc.exists()){
        await setDoc(doc(db, sectionId, subject), {
          chatId: chatId,
        });
        toast.success("Room created")
      }
      toast.success(`Welcome to ${section} ${subject}`);
      navigate("/lobby")
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logoutHandler = (e) => {
    e.preventDefault();
    try {
      removeCookie(['ttoken'])
      setTeacherData("");
      setTAuthenticated(false);
      console.log(teacherData)
    } catch (error) {
      toast.error(error.message)
    }
  }
  // useEffect(()=>{
  //   if(!teacherData){
  //     navigate("/")
  //   }
  // },[teacherData])

  if (!teacherData) {
    navigate("/")
  }
  if(!teacherData.access){
    navigate("/")
  }
  return (
    <Box>
      <Header />
      <br />
      <Container backgroundColor={"blue.300"}>
        <VStack textAlign={"center"}>
          <Text fontWeight="bold" fontSize="25px">Welcome <br /> {teacherData.name}</Text>
        </VStack>
        <VStack alignItems="center" p={'50px'}>
          <form onSubmit={classHandler} style={{ textAlign: 'center' }}> {/* Added style={{ textAlign: 'center' }} to center align the form */}
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
            <Input value={section} onChange={(e) => setSection(e.target.value.toUpperCase())} type='text' maxLength={1} textAlign={"center"} placeholder='Section' />
            <Input value={subject} onChange={(e) => setSubject(e.target.value.toUpperCase())} type='text' textAlign={"center"} placeholder='Subject' />
            <Button type='submit' mt={4}>Enter ClassRoom</Button> {/* Added mt={4} to add margin top */}
          </form>
          <Button onClick={logoutHandler} colorScheme='red'>Logout</Button>
        </VStack>

      </Container>
    </Box>
  )
}
