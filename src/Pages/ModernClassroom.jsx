// File location: src/Pages/ModernClassroom.jsx
import React, { useContext, useEffect, useRef, useState } from 'react';
import { 
  Box, 
  Container, 
  Flex, 
  HStack, 
  Input, 
  VStack,
  IconButton,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  Tooltip,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Avatar,
  AvatarGroup,
  Badge,
  Heading,
  Divider
} from '@chakra-ui/react';
import { 
  AttachmentIcon, 
  ChatIcon, 
  CheckIcon, 
  ChevronRightIcon, 
  CloseIcon, 
  InfoOutlineIcon, 
  PlusSquareIcon, 
  SettingsIcon, 
  SmallAddIcon 
} from '@chakra-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Context } from '..';
import ModernMessage from '../../BIN/ModernMessage';
import { 
  addDoc, 
  collection, 
  doc, 
  getDoc, 
  getFirestore, 
  onSnapshot, 
  orderBy, 
  query, 
  serverTimestamp 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app, storage } from "../firebase";
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { v4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import ModernHeader from '../Components/ModernHeader';
import ModernButton from '../Components/ModernButton';
import { FaFilePdf, FaFileImage, FaFileVideo, FaFileAudio } from 'react-icons/fa';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

export default function ModernClassroom() {
  // Firebase initialization
  const auth = getAuth(app);
  const db = getFirestore(app);
  const navigate = useNavigate();

  // Component state
  const { teacherData, chatId, setChatId, studentData } = useContext(Context);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [imageUpload, setImageUpload] = useState(null);
  const [imgurl, setImgurl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeParticipants, setActiveParticipants] = useState([]);
  const [isMembersPanelOpen, setIsMembersPanelOpen] = useState(false);
  
  // Get current user information
  const user = teacherData || studentData;
  
  // Current time formatting
  const currentTime = new Date();
  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Refs for file inputs and scrolling
  const imgInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const vdoInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const messageInputRef = useRef(null);
  
  // Drawer for members panel
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Theme colors - Define all useColorModeValue calls at the top level of the component
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const chatAreaBg = useColorModeValue('white', 'gray.800');
  const inputBg = useColorModeValue('gray.100', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const scrollbarTrackBg = "transparent";
  const scrollbarThumbBg = useColorModeValue("rgba(0,0,0,0.1)", "rgba(255,255,255,0.1)");
  const scrollbarThumbHoverBg = useColorModeValue("rgba(0,0,0,0.2)", "rgba(255,255,255,0.2)");
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  
  // Handle sending messages
  const submitHandler = async (e) => {
    if (e) e.preventDefault();
    
    try {
      if (message.trim() || imgurl) {
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
        
        // Scroll to bottom of messages
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }
    } catch (error) {
      console.error("Error sending message:", error.message);
    }
  };
  
  // Handle file uploads
  const handleFileUpload = (file) => {
    if (!file) return;
    
    setIsUploading(true);
    
    const imageRef = ref(storage, `${chatId}/${file.name + v4()}`);
    
    uploadBytes(imageRef, file)
      .then((snapshot) => getDownloadURL(snapshot.ref))
      .then((url) => {
        setImgurl(url);
        setImageUpload(null);
      })
      .catch((error) => {
        console.error("Error uploading file:", error);
      })
      .finally(() => {
        setIsUploading(false);
      });
  };
  
  // Handle Enter key press for message submission
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitHandler();
    }
  };
  
  // Effect to upload image when selected
  useEffect(() => {
    if (imageUpload !== null) {
      handleFileUpload(imageUpload);
    }
  }, [imageUpload]);
  
  // Effect to send message after image URL is set
  useEffect(() => {
    if (imgurl !== null) {
      submitHandler();
    }
  }, [imgurl]);
  
  // Effect to fetch messages and scroll to bottom
  useEffect(() => {
    if (chatId) {
      const q = query(collection(db, chatId), orderBy("createdAt", "asc"));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setMessages(newMessages);
        
        // Create a unique list of active participants
        const participants = [];
        const uniqueIds = new Set();
        
        newMessages.forEach(msg => {
          if (!uniqueIds.has(msg.uid)) {
            uniqueIds.add(msg.uid);
            participants.push({
              uid: msg.uid,
              name: msg.name
            });
          }
        });
        
        setActiveParticipants(participants);
        
        // Scroll to bottom after messages update
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          }
        }, 100);
      });
      
      return () => unsubscribe();
    } else {
      // Redirect if no chatId is available
      if (studentData) {
        navigate("/studentdash");
      } else if (teacherData) {
        navigate("/teacherdash");
      } else {
        navigate("/");
      }
    }
  }, [chatId, db, navigate, studentData, teacherData]);
  
  // Effect to focus on message input when component mounts
  useEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, []);
  
  // Get room info from chatId
  const getRoomInfo = () => {
    if (!chatId) return { semester: "", section: "", subject: "" };
    
    const parts = chatId.split('+');
    return {
      semester: parts[0].replace('semester', 'Semester '),
      section: parts[1].toUpperCase(),
      subject: parts[2] ? parts[2].toUpperCase() : ""
    };
  };
  
  const roomInfo = getRoomInfo();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    }
  };
  
  return (
    <Box minH="100vh" bg={bgColor}>
      <ModernHeader />
      
      <Container maxW="container.xl" py={4} px={{ base: 2, md: 4 }} h="calc(100vh - 72px)">
        <MotionFlex
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          h="full"
          direction="column"
        >
          {/* Classroom info bar */}
          <MotionBox
            variants={itemVariants}
            bg={chatAreaBg}
            p={4}
            borderRadius="lg"
            boxShadow="sm"
            mb={4}
          >
            <Flex justify="space-between" align="center">
              <HStack>
                <Text fontSize="xl" fontWeight="bold">
                  {roomInfo.subject}
                </Text>
                <Badge colorScheme="blue" fontSize="sm">
                  {roomInfo.semester} {roomInfo.section}
                </Badge>
              </HStack>
              
              <HStack>
                <Tooltip label="Switch Room">
                  <IconButton
                    icon={<SettingsIcon />}
                    variant="ghost"
                    onClick={() => setChatId("")}
                    aria-label="Switch Room"
                    colorScheme="brand"
                  />
                </Tooltip>
                
                <Tooltip label="View Participants">
                  <IconButton
                    icon={<InfoOutlineIcon />}
                    variant="ghost"
                    onClick={onOpen}
                    aria-label="View Participants"
                    colorScheme="brand"
                  />
                </Tooltip>
                
                <AvatarGroup size="sm" max={3}>
                  {activeParticipants.slice(0, 4).map((participant, index) => (
                    <Avatar 
                      key={index} 
                      name={participant.name} 
                    />
                  ))}
                </AvatarGroup>
              </HStack>
            </Flex>
          </MotionBox>
          
          {/* Messages area */}
          <MotionBox
            variants={itemVariants}
            flex="1"
            overflowY="auto"
            bg={chatAreaBg}
            borderRadius="lg"
            boxShadow="sm"
            mb={4}
            p={4}
            ref={messagesContainerRef}
            css={{
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: scrollbarTrackBg,
              },
              "&::-webkit-scrollbar-thumb": {
                background: scrollbarThumbBg,
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: scrollbarThumbHoverBg,
              },
            }}
          >
            {messages.length === 0 ? (
              <Flex 
                h="full" 
                align="center" 
                justify="center" 
                direction="column"
                opacity={0.6}
              >
                <ChatIcon boxSize={12} mb={4} />
                <Text fontSize="lg">No messages yet</Text>
                <Text fontSize="sm">Be the first to send a message!</Text>
              </Flex>
            ) : (
              <VStack spacing={4} align="stretch">
                {messages.map((item) => (
                  <ModernMessage
                    key={item.id}
                    message_id={item.id}
                    uid={item.uid}
                    user={item.uid === user.uid ? "me" : "other"}
                    text={item.text}
                    url={item.url}
                    name={item.name}
                    time={item.time}
                    iurl={item.iurl}
                    access={user.access}
                  />
                ))}
              </VStack>
            )}
          </MotionBox>
          
          {/* Message input area */}
          <MotionBox
            variants={itemVariants}
            as="form"
            onSubmit={submitHandler}
          >
            <Flex 
              bg={chatAreaBg}
              p={4}
              borderRadius="lg"
              boxShadow="sm"
            >
              <InputGroup size="md">
                <Input
                  ref={messageInputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  bg={inputBg}
                  borderWidth={1}
                  borderColor={borderColor}
                  borderRadius="full"
                  pr="4.5rem"
                  fontSize="md"
                  h="50px"
                />
                <InputRightElement width="4.5rem" h="full">
                  <HStack spacing={1} pr={1}>
                    <Menu placement="top">
                      <MenuButton
                        as={IconButton}
                        icon={<AttachmentIcon />}
                        variant="ghost"
                        size="sm"
                        isDisabled={isUploading}
                        aria-label="Attach files"
                      />
                      <MenuList>
                        <MenuItem 
                          icon={<FaFileImage />} 
                          onClick={() => imgInputRef.current.click()}
                        >
                          Image
                        </MenuItem>
                        <input
                          ref={imgInputRef}
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => setImageUpload(e.target.files[0])}
                        />
                        
                        <MenuItem 
                          icon={<FaFileVideo />} 
                          onClick={() => vdoInputRef.current.click()}
                        >
                          Video
                        </MenuItem>
                        <input
                          ref={vdoInputRef}
                          type="file"
                          accept="video/*"
                          style={{ display: "none" }}
                          onChange={(e) => setImageUpload(e.target.files[0])}
                        />
                        
                        <MenuItem 
                          icon={<FaFileAudio />} 
                          onClick={() => audioInputRef.current.click()}
                        >
                          Audio
                        </MenuItem>
                        <input
                          ref={audioInputRef}
                          type="file"
                          accept="audio/*"
                          style={{ display: "none" }}
                          onChange={(e) => setImageUpload(e.target.files[0])}
                        />
                        
                        <MenuItem 
                          icon={<FaFilePdf />} 
                          onClick={() => fileInputRef.current.click()}
                        >
                          Document
                        </MenuItem>
                        <input
                          ref={fileInputRef}
                          type="file"
                          style={{ display: "none" }}
                          onChange={(e) => setImageUpload(e.target.files[0])}
                        />
                      </MenuList>
                    </Menu>
                    
                    <IconButton
                      icon={<ChevronRightIcon />}
                      colorScheme="brand"
                      variant="ghost"
                      borderRadius="full"
                      size="sm"
                      type="submit"
                      isLoading={isUploading}
                      aria-label="Send message"
                    />
                  </HStack>
                </InputRightElement>
              </InputGroup>
            </Flex>
          </MotionBox>
        </MotionFlex>
      </Container>
      
      {/* Members drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            Classroom Participants
          </DrawerHeader>
          <DrawerBody>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Heading size="sm" mb={2} color="brand.500">
                  Class Details
                </Heading>
                <HStack spacing={2} mb={1}>
                  <Text fontWeight="bold">Subject:</Text>
                  <Text>{roomInfo.subject}</Text>
                </HStack>
                <HStack spacing={2} mb={1}>
                  <Text fontWeight="bold">Semester:</Text>
                  <Text>{roomInfo.semester}</Text>
                </HStack>
                <HStack spacing={2}>
                  <Text fontWeight="bold">Section:</Text>
                  <Text>{roomInfo.section}</Text>
                </HStack>
              </Box>
              
              <Divider />
              
              <Box>
                <Heading size="sm" mb={4} color="brand.500">
                  Active Participants ({activeParticipants.length})
                </Heading>
                <VStack align="stretch" spacing={2}>
                  {activeParticipants.map((participant, index) => (
                    <HStack 
                      key={index} 
                      p={2} 
                      borderRadius="md"
                      _hover={{ bg: hoverBg }}
                    >
                      <Avatar size="sm" name={participant.name} />
                      <Text>{participant.name}</Text>
                      {participant.uid === user.uid && (
                        <Badge colorScheme="green" ml="auto">You</Badge>
                      )}
                      {teacherData && teacherData.uid === participant.uid && (
                        <Badge colorScheme="purple" ml="auto">Teacher</Badge>
                      )}
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}