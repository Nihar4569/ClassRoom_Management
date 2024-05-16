import { Avatar, Box, Button, HStack, Text, VStack, Menu, MenuButton, MenuList, MenuItem, IconButton } from '@chakra-ui/react';
import { ChevronDownIcon, DeleteIcon } from '@chakra-ui/icons';
import React, { useContext, useEffect, useState } from 'react';
import { Context } from '../index';
import pdficon from "../Images/pdf.png";
import DownloadIcon from "../Images/download.png";
import { Firestore, deleteDoc, doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { app } from '../firebase';

function Message({ message_id, uid, text, url, user, name, time, iurl, access }) {
  const db = getFirestore(app);

  const { chatId } = useContext(Context);
  const [userData, setUserData] = useState([]);
  const [adminAccess, setAdminAccess] = useState(false);

  const isPDF = iurl && iurl.toLowerCase().includes('.pdf');
  const isVideo = iurl && /\.(mp4|ogg|webm|avi|wmv|flv|mov|mkv|mpeg|3gp|mpg)/i.test(iurl);
  const isImage = iurl && /\.(png|jpe?g|gif|bmp)[^/]*$/i.test(iurl);
  const isAudio = iurl && /\.(mp3|wav|ogg|aac|flac)[^/]*$/i.test(iurl);

  let fileName = '';
  if (isPDF) {
    const roomIdLength = chatId.length;
    const startIndex = iurl.lastIndexOf('/') + roomIdLength + 8;
    const endIndex = iurl.toLowerCase().lastIndexOf('.pdf');
    fileName = iurl.substring(startIndex, endIndex);
  }

  const handleDelete = async () => {
    console.log(chatId);
    console.log(message_id);
    try {
      await deleteDoc(doc(db, chatId, message_id));
    } catch (error) {
      toast.error(error.message)
      console.log(error.message);
    }
  };
  const admintoggle = async () => {
    try {
      console.log(`this is admin access before ${adminAccess}`);
      await updateDoc(doc(db, "STUDENTS", uid), {
        access: !adminAccess
      });

      console.log(adminAccess);
      console.log("Access updated successfully");
      console.log(`this is admin access after ${adminAccess}`);
    } catch (error) {
      console.error("Error updating access:", error.message);
    }
  };


  useEffect(() => {
    const getAccessData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'STUDENTS', uid));
        if (userDoc.exists()) {
          const userdata = userDoc.data();
          setUserData(userdata);
          setAdminAccess(userData.access)
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    getAccessData();
  }, [userData,access]);
  return (
    <HStack width="100%" justifyContent={user === "me" ? "flex-end" : "flex-start"} mb={4}>
      {user !== "me" && <Avatar size="sm" src={url} />}
      {user !== "other" && <Text fontSize="sm" style={{ fontSize: '10px' }}>{time}</Text>}
      <VStack alignItems={user === "me" ? "flex-end" : "flex-start"} spacing={1} maxWidth="70%" borderWidth={1} borderColor={user === "me" ? "blue.100" : "gray.100"} borderRadius="lg" p={2} bg={user === "me" ? "blue.100" : "gray.100"}>
        <HStack justifyContent="space-between" width="100%">
          <Text fontSize="sm" style={{ fontSize: '10px' }} fontWeight="bold">@{name}</Text>
          {access && (
            <Menu>
              <MenuButton as={IconButton} icon={<ChevronDownIcon />} size="sm" variant="outline" />
              <MenuList>
                <MenuItem onClick={handleDelete}><DeleteIcon /> &nbsp; Delete</MenuItem>
                {
                  adminAccess ? (<MenuItem onClick={admintoggle}>Remove as Admin</MenuItem>) :
                    (<MenuItem onClick={admintoggle}>Make Admin</MenuItem>)
                }
              </MenuList>
            </Menu>
          )}
        </HStack>
        {isPDF ? (
          <a href={iurl} target="_blank" rel="noreferrer" download>
            <img src={pdficon} alt="PDF" style={{ cursor: 'pointer', width: '50px', height: '50px' }} />
          </a>
        ) : (
          isVideo ? (
            <Box position="relative" maxWidth="200px">
              <video controls style={{ cursor: 'pointer', maxWidth: '100%' }}>
                <source src={iurl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <Button
                position="absolute"
                bottom="0"
                right="0"
                size="sm"
                onClick={() => window.open(iurl, '_blank')}
              >
                <img src={DownloadIcon} alt="" style={{ width: '15px', height: '15px' }} />
              </Button>
            </Box>
          ) : isImage ? (
            <a href={iurl} target="_blank" rel="noreferrer">
              <img src={iurl} alt="IMG" style={{ cursor: 'pointer' }} />
            </a>
          ) : isAudio ? (
            <HStack>
              <audio controls>
                <source src={iurl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <a href={iurl}>
                <img href={iurl} src={DownloadIcon} alt="" style={{ width: '15px', height: '15px' }} />
              </a>
            </HStack>
          ) : null
        )}
        {isPDF && <Text fontSize="sm">{fileName}</Text>}
        <Text fontSize="sm">{text}</Text>
      </VStack>
      {user === "me" && <Avatar size="sm" src={url} />}
      {user !== "me" && <Text fontSize="sm" style={{ fontSize: '10px' }}>{time}</Text>}
    </HStack>
  );
}

export default Message;
