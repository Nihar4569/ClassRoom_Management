// File location: src/Components/ModernMessage.jsx
import { 
  Avatar, 
  Box, 
  Flex, 
  HStack, 
  IconButton, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  Text, 
  VStack,
  useColorModeValue,
  Image,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Tooltip
} from '@chakra-ui/react';
import { 
  DeleteIcon, 
  ChevronDownIcon, 
  DownloadIcon, 
  StarIcon, 
  ViewIcon, 
  CheckIcon, 
  CloseIcon 
} from '@chakra-ui/icons';
import React, { useContext, useEffect, useState } from 'react';
import { Context } from '../index';
import { motion } from 'framer-motion';
import { deleteDoc, doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';
import { app } from '../firebase';

// PDF icon import
import pdfIcon from "../Images/pdf.png";

const MotionBox = motion(Box);

function Message({ message_id, uid, text, url, user, name, time, iurl, access }) {
  const db = getFirestore(app);
  const { chatId } = useContext(Context);
  const [userData, setUserData] = useState({});
  const [adminAccess, setAdminAccess] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Determine file types
  const isPDF = iurl && iurl.toLowerCase().includes('.pdf');
  const isVideo = iurl && /\.(mp4|ogg|webm|avi|wmv|flv|mov|mkv|mpeg|3gp|mpg)/i.test(iurl);
  const isImage = iurl && /\.(png|jpe?g|gif|bmp)[^/]*$/i.test(iurl);
  const isAudio = iurl && /\.(mp3|wav|ogg|aac|flac)[^/]*$/i.test(iurl);

  // Extract filename for PDF display
  let fileName = '';
  if (isPDF) {
    const roomIdLength = chatId.length;
    const startIndex = iurl.lastIndexOf('/') + roomIdLength + 8;
    const endIndex = iurl.toLowerCase().lastIndexOf('.pdf');
    fileName = iurl.substring(startIndex, endIndex);
  }

  // Calculate message theme colors - move all useColorModeValue calls to the top level
  const myMessageBg = useColorModeValue('brand.100', 'brand.900');
  const myMessageBorder = useColorModeValue('brand.200', 'brand.700');
  const otherMessageBg = useColorModeValue('gray.100', 'gray.700');
  const otherMessageBorder = useColorModeValue('gray.200', 'gray.600');
  const nameColor = useColorModeValue('brand.600', 'brand.300');
  const audioBoxBg = useColorModeValue('gray.50', 'gray.800');
  
  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, chatId, message_id));
    } catch (error) {
      console.error("Error deleting message:", error.message);
    }
  };

  const toggleAdminAccess = async () => {
    try {
      await updateDoc(doc(db, "STUDENTS", uid), {
        access: !adminAccess
      });
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
          setAdminAccess(userdata.access);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    
    getAccessData();
  }, [uid, access]);

  // Animation variants
  const messageVariants = {
    initial: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 300
      }
    }
  };

  return (
    <MotionBox
      w="100%"
      display="flex"
      justifyContent={user === "me" ? "flex-end" : "flex-start"}
      mb={4}
      initial="initial"
      animate="animate"
      variants={messageVariants}
    >
      {user !== "me" && (
        <Avatar 
          size="sm" 
          name={name}
          src={url} 
          bg={nameColor}
          mr={2}
        />
      )}
      
      <Flex 
        direction="column"
        alignItems={user === "me" ? "flex-end" : "flex-start"}
        maxW="70%"
      >
        <HStack mb={1} spacing={2}>
          <Text 
            fontSize="xs" 
            fontWeight="bold" 
            color={nameColor}
          >
            @{name}
          </Text>
          
          {user !== "other" && (
            <Text 
              fontSize="xs" 
              color="gray.500"
            >
              {time}
            </Text>
          )}
        </HStack>
        
        <Box
          bg={user === "me" ? myMessageBg : otherMessageBg}
          borderWidth="1px"
          borderColor={user === "me" ? myMessageBorder : otherMessageBorder}
          borderRadius="lg"
          p={3}
          position="relative"
          boxShadow="sm"
        >
          {access && (
            <Box position="absolute" top={2} right={2} zIndex={2}>
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<ChevronDownIcon />}
                  variant="ghost"
                  size="xs"
                  borderRadius="full"
                  aria-label="Options"
                />
                <MenuList fontSize="sm">
                  <MenuItem icon={<DeleteIcon />} onClick={handleDelete}>
                    Delete Message
                  </MenuItem>
                  <MenuItem 
                    icon={adminAccess ? <CloseIcon /> : <CheckIcon />} 
                    onClick={toggleAdminAccess}
                  >
                    {adminAccess ? "Remove Admin Access" : "Make Admin"}
                  </MenuItem>
                </MenuList>
              </Menu>
            </Box>
          )}

          {/* File content display */}
          {isPDF && (
            <VStack align="center" mb={2}>
              <Tooltip label={`Open ${fileName}.pdf`}>
                <Box 
                  as="a" 
                  href={iurl} 
                  target="_blank" 
                  rel="noreferrer"
                  _hover={{ transform: 'scale(1.05)' }}
                  transition="all 0.2s"
                >
                  <Image 
                    src={pdfIcon} 
                    alt="PDF" 
                    w="50px" 
                    h="50px" 
                  />
                </Box>
              </Tooltip>
              <Text fontSize="xs" color="gray.500">
                {fileName}.pdf
              </Text>
            </VStack>
          )}

          {isVideo && (
            <Box position="relative" maxW="100%" mb={2}>
              <Box 
                borderRadius="md" 
                overflow="hidden"
                boxShadow="md"
              >
                <video 
                  controls 
                  width="100%" 
                  style={{ borderRadius: '0.375rem' }}
                  onClick={onOpen}
                >
                  <source src={iurl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </Box>
              
              <IconButton
                icon={<DownloadIcon />}
                size="sm"
                position="absolute"
                bottom={2}
                right={2}
                borderRadius="full"
                onClick={() => window.open(iurl, '_blank')}
                aria-label="Download video"
              />
              
              <Modal isOpen={isOpen} onClose={onClose} size="4xl">
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Video</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody pb={6}>
                    <video 
                      controls 
                      width="100%" 
                      autoPlay
                    >
                      <source src={iurl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </ModalBody>
                </ModalContent>
              </Modal>
            </Box>
          )}

          {isImage && (
            <Box 
              mb={2} 
              borderRadius="md" 
              overflow="hidden"
              boxShadow="md"
              cursor="pointer"
              onClick={onOpen}
              _hover={{ transform: 'scale(1.02)' }}
              transition="all 0.2s"
            >
              <Image 
                src={iurl} 
                alt="Shared image" 
                maxH="200px"
                borderRadius="md"
              />
              
              <Modal isOpen={isOpen} onClose={onClose} size="4xl">
                <ModalOverlay />
                <ModalContent bg="transparent" boxShadow="none">
                  <ModalCloseButton color="white" />
                  <ModalBody display="flex" justifyContent="center">
                    <Image 
                      src={iurl} 
                      alt="Shared image" 
                      maxH="90vh"
                    />
                  </ModalBody>
                </ModalContent>
              </Modal>
            </Box>
          )}

          {isAudio && (
            <HStack mb={2} spacing={2} align="center">
              <Box 
                borderRadius="md" 
                overflow="hidden"
                boxShadow="sm"
                p={1}
                bg={audioBoxBg}
              >
                <audio controls style={{ maxWidth: '200px' }}>
                  <source src={iurl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </Box>
              <IconButton
                icon={<DownloadIcon />}
                size="xs"
                borderRadius="full"
                as="a"
                href={iurl}
                download
                aria-label="Download audio"
              />
            </HStack>
          )}

          {/* Message text */}
          {text && (
            <Text fontSize="sm">{text}</Text>
          )}
        </Box>
      </Flex>
      
      {user === "me" && (
        <Avatar 
          size="sm" 
          name={name}
          src={url}
          bg={nameColor}
          ml={2}
        />
      )}
      
      {user !== "me" && user !== "other" && (
        <Text 
          fontSize="xs" 
          color="gray.500" 
          alignSelf="flex-end"
          ml={2}
        >
          {time}
        </Text>
      )}
    </MotionBox>
  );
}

export default Message;