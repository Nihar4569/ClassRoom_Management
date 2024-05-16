import { Box, Button, Container, HStack, Input, Menu, MenuButton, MenuItem, MenuList, VStack } from '@chakra-ui/react';
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Context } from '..'
import Message from "../Components/Message";
import { addDoc, collection, doc, getDoc, getFirestore, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app, storage } from "../firebase";
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import attach from "../Images/attach.png"
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { v4 } from 'uuid';
import { useCookies } from 'react-cookie';

export default function ClassRoom() {
  // Firebase initialization
  const auth = getAuth(app);
  const db = getFirestore(app);

  const { teacherData, chatId, setChatId, studentData, setStudentData, setTeacherData } = useContext(Context)
  const [message, setMessage] = useState("");
  const currentTime = new Date();
  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const navigate = useNavigate();

  const imgInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const vdoInputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [messages, setMessages] = useState([]);

  const [imageUpload, setImageUpload] = useState(null);
  const [imgurl, setImgurl] = useState(null);
  const user = teacherData || studentData;
  console.log(user.access);

  const submitHandler = async (e) => {
    console.log(`This is chat id ${chatId}`);
    console.log(user.name);
    if (e) {
      e.preventDefault();
    }
    try {
      if (message || imgurl) {
        console.log(message);
        await addDoc(collection(db, chatId), {
          text: message,
          uid: user.uid,
          url: "",
          name: user.name,
          createdAt: serverTimestamp(),
          time: formattedTime,
          iurl: imgurl
        });
        setImageUpload(null);
        setImgurl(null);
        setMessage("");
        messagesContainerRef.current.scrollIntoView({ behavior: "smooth" });
        toast.success("Message sent");
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  }

  // Image upload function
  const imgupload = (file) => {
    const imageRef = ref(storage, `${chatId}/${file.name + v4()}`);
    uploadBytes(imageRef, file).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setImgurl(url);
        setImageUpload(null);
      });
    }).catch((error) => {
      console.error("Error uploading image:", error);
    });
  }

  useEffect(() => {
    if (imageUpload !== null) {
      imgupload(imageUpload);
    }
  }, [imageUpload]);

  useEffect(() => {
    if (imgurl !== null) {
      submitHandler();
    }
  }, [imgurl]);

  const [cookies, setCookie, removeCookie] = useCookies(['stoken','ttoken']);

  const logoutHandler = ()=>{
    removeCookie('stoken');
    removeCookie('ttoken');
    setStudentData("");
    setTeacherData("")
    setChatId("")
    navigate("/")
  }

  useEffect(() => {
    if(chatId != "" ){
      const quer = query(collection(db, chatId), orderBy("createdAt", "asc"));
    const unsubscribeforMessage = onSnapshot(quer, (snap) => {
      setMessages(
        snap.docs.map((item) => {
          const id = item.id;
          return { id, ...item.data() };
        })
      );
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    });

    return () => unsubscribeforMessage();
    }
    else{
      if(studentData){
        navigate("/studentdash")
      }
      if(teacherData){
        navigate("/teacherdash")
      }
    }
  }, [chatId, db, navigate,]);

  let access = false;
  console.log(messages.uid);
  if (user.access) {
    access = true;
    console.log(access);
  }

  useEffect(() => {
    const fetchData = async () => {
      if (studentData) {
        const studentDoc = await getDoc(doc(db, 'STUDENTS', studentData.uid));
        setStudentData(studentDoc.data());
      }
      if (teacherData) {
        const teacherDoc = await getDoc(doc(db, 'TEACHERS', teacherData.emid));
        setTeacherData(teacherDoc.data());
      }
    };

    fetchData();
  }, [studentData, teacherData, db,chatId]);

  return (
    <Box>
      {chatId ? (
        <Box bg={"blue.300"}>
          <Container h={"100vh"} bg={"white"}>
            <VStack h={"full"}>
              <HStack>
                {/* <Button onClick={logoutHandler} borderRadius={"25px"} colorScheme={"red"} w={"full"}>
                  Logout
                </Button> */}
                <Button onClick={()=>{setChatId("");}} borderRadius={"25px"} colorScheme={"green"} w={"full"}>Switch Room</Button>
              </HStack>
              <VStack h="full" w="full" overflowY="auto" css={{
                "&::-webkit-scrollbar": {
                  display: "none"
                }
              }}>
                {messages.map((item) => (
                  <Message
                    key={item.id}
                    uid={item.uid}
                    message_id={item.id}
                    user={item.uid === user.uid ? "me" : "other"}
                    text={item.text}
                    url={item.url}
                    name={item.name}
                    time={item.time}
                    iurl={item.iurl}
                    access={user.access}
                  />
                ))}
                <div ref={messagesContainerRef} />
              </VStack>
              <form onSubmit={submitHandler} style={{ width: "100%" }}>
                <HStack>
                  <Input borderRadius={"25px"} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter a Message" flex="1" />
                  <Menu>
                    <MenuButton borderRadius={"25px"} as={Button}>
                      <img src={attach} alt="Attach" />
                    </MenuButton>
                    <MenuList>
                      <MenuItem onClick={() => imgInputRef.current.click()}>Images</MenuItem>
                      <input ref={imgInputRef} id="file-upload" type="file" style={{ display: "none" }} accept="image/*" onChange={(event) => setImageUpload(event.target.files[0])} />
                      <MenuItem onClick={() => vdoInputRef.current.click()}>Videos
                        <input ref={vdoInputRef} id="file-upload" type="file" style={{ display: "none" }} accept="video/*" onChange={(event) => setImageUpload(event.target.files[0])} />
                      </MenuItem>
                      <MenuItem onClick={() => fileInputRef.current.click()}>Attach File
                        <input ref={fileInputRef} id="file-upload" type="file" style={{ display: "none" }} onChange={(event) => setImageUpload(event.target.files[0])} />
                      </MenuItem>
                    </MenuList>
                  </Menu>
                  <Button borderRadius={"25px"} _hover={{ backgroundColor: "purple.100" }} type="submit">Send</Button>
                </HStack>
              </form>
            </VStack>
          </Container>
        </Box>
      ) : teacherData ? (navigate("/teacherdash")) : studentData ? (navigate("/studentdash")) : navigate("/")
      }
    </Box>
  )
}
