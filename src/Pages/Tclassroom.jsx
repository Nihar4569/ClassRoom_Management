import { Box, Button, Container, HStack, Input, Menu, MenuButton, MenuItem, MenuList, VStack } from '@chakra-ui/react';
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Context } from '..'
import Message from "../Components/Message";
import { addDoc, collection, getFirestore, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app, storage } from "../firebase";
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Student from './Student';
import attach from "../Images/attach.png"
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { v4 } from 'uuid';


export default function Tclassroom() {
    // Firebase initialization
    const auth = getAuth(app);
    const db = getFirestore(app);


    const { teacherData, chatId, setChatId, studentData } = useContext(Context)
    const [message, setMessage] = useState("");
    const currentTime = new Date();
    const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const navigate = useNavigate();

    const imgInputRef = useRef(null); // Add a ref for the file input element
    const fileInputRef = useRef(null);
    const vdoInputRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [messages, setMessages] = useState([]);

    const [imageUpload, setImageUpload] = useState(null);
    const [imgurl, setImgurl] = useState(null);
    const user = teacherData || studentData

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
                messagesContainerRef.current.scrollIntoView({ behavior: "smooth" });
                toast.success("Send")
            }
        } catch (error) {
            console.log(error.message);
            toast.error(error.message)
        }
    }

    //Images
  const imgupload = (file) => {
    // setLoader(true);
    const imageRef = ref(storage, `${chatId}/${file.name + v4()}`);
    uploadBytes(imageRef, file).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setImgurl(url);
        setImageUpload(null);
        // setLoader(false);
      });
    }).catch((error) => {
      console.error("Error uploading image:", error);
    //   setLoader(false); 
    });
  }

  useEffect(() => {
    if (imageUpload !== null) {
      imgupload(imageUpload)
      //setImageUpload(null);
    }
  }, [imageUpload]);
// useEffect(()=>{
//   console.log({loader});
// },[loader])
  useEffect(() => {
    if (imgurl !== null) {
      submitHandler();
    }
  }, [imgurl]);

  useEffect(() => {
    const quer = query(collection(db, chatId), orderBy("createdAt", "asc"));
    const unsubscribeforMessage = onSnapshot(quer, (snap) => {
      setMessages(
        snap.docs.map((item) => {
          const id = item.id;
          return { id, ...item.data() } // Add id to it
        })
      );
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    });

    return unsubscribeforMessage;
  }, [chatId, db, navigate]);

    return (
        <Box>
            {
                chatId ? (
                    <Box bg={"blue.300"}>
                        <Container h={"100vh"} bg={"white"}>
                            <VStack h={"full"}>
                                <HStack>
                                    <Button borderRadius={"25px"} colorScheme={"red"} w={"full"}>
                                        Logout
                                    </Button>
                                    <Button borderRadius={"25px"} colorScheme={"green"} w={"full"}>Switch Room</Button>
                                </HStack>
                                <VStack h="full" w="full" overflowY="auto" css={{
                                    "&::-webkit-scrollbar": {
                                        display: "none"
                                    }
                                }}>
                                    {
                                        messages.map((item) => (
                                            <Message
                                              key={item.id}
                                              user={item.uid === user.uid ? "me" : "other"}
                                              text={item.text}
                                              url={item.url}
                                              name={item.name}
                                              time={item.time}
                                              iurl={item.iurl}
                                            />
                                          ))
                                    }
                                    <div ref={messagesContainerRef} />
                                </VStack>
                                <form onSubmit={submitHandler} style={{ width: "100%" }}>
                                    <HStack>
                                        <Input borderRadius={"25px"} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter a Message" flex="1" />
                                        <Menu>
                                            <MenuButton borderRadius={"25px"} as={Button}>
                                                <img src={attach} />
                                            </MenuButton>
                                            <MenuList>
                                                <MenuItem onClick={() => imgInputRef.current.click()}>Images</MenuItem>
                                                <input ref={imgInputRef} id="file-upload" type="file" style={{ display: "none" }} accept="image/*" onChange={(event) => setImageUpload(event.target.files[0])} />
                                                <MenuItem onClick={() => vdoInputRef.current.click()}>Videos
                                                    <input ref={vdoInputRef} id="file-upload" type="file" style={{ display: "none" }} accept="video/*" onChange={(event) => setImageUpload(event.target.files[0])} />
                                                </MenuItem>
                                                <MenuItem onClick={() => fileInputRef.current.click()}>Attach File
                                                    <input ref={fileInputRef} id="file-upload" type="file" style={{ display: "none" }} onChange={(event) => setImageUpload(event.target.files[0])} /></MenuItem>
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
