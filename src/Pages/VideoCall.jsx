// File location: src/Pages/VideoCall.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useColorModeValue,
  useToast,
  useClipboard,
  IconButton,
  Tooltip,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Grid
} from '@chakra-ui/react';
import { CopyIcon, CheckIcon } from '@chakra-ui/icons';
import { 
  FaVideo, 
  FaVideoSlash, 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaDesktop, 
  FaPhoneSlash,
  FaUserPlus
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Context } from '..';
import ModernHeader from '../Components/ModernHeader';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getFirestore, serverTimestamp } from 'firebase/firestore';
import { app } from '../firebase';

const MotionBox = motion(Box);

export default function VideoCall() {
  // State
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  // Refs
  const localVideoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  
  // Context
  const { teacherData, studentData } = useContext(Context);
  const user = teacherData || studentData;
  const navigate = useNavigate();
  const toast = useToast();
  const db = getFirestore(app);
  
  // Copy room ID
  const { hasCopied, onCopy } = useClipboard(roomId);
  
  // Theme colors
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hintColor = useColorModeValue('gray.600', 'gray.400');
  
  // Leave call dialog
  const { 
    isOpen: isLeaveDialogOpen, 
    onOpen: onLeaveDialogOpen, 
    onClose: onLeaveDialogClose 
  } = useDisclosure();
  
  // Generate random room ID
  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
  };
  
  // Create a new room
  const createRoom = async () => {
    if (isCreating) return;
    setIsCreating(true);
    setError('');
    
    try {
      const newRoomId = roomId || generateRoomId();
      setRoomId(newRoomId);
      
      // In a real implementation, you would:
      // 1. Save the room details to Firestore
      // 2. Set up WebRTC signaling via a server
      
      // For this demo, we'll just create a room entry in Firestore
      await addDoc(collection(db, 'videocalls'), {
        roomId: newRoomId,
        createdBy: user?.uid,
        creatorName: user?.name,
        createdAt: serverTimestamp(),
        active: true
      });
      
      // Set up local stream
      await setupLocalStream();
      
      // Set room state
      setIsInRoom(true);
      
      // Add local user to participants
      const localParticipant = {
        id: 'local',
        name: user?.name || 'You',
        isLocal: true
      };
      setParticipants([localParticipant]);
      
      toast({
        title: "Room created",
        description: `Room ID: ${newRoomId}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error creating room:', error);
      setError('Failed to create room. Please check your camera and microphone permissions.');
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  // Join an existing room
  const joinRoom = async () => {
    if (!roomId) {
      setError('Please enter a room ID to join');
      return;
    }
    
    setError('');
    
    try {
      // In a real implementation, you would:
      // 1. Verify that the room exists in your database
      // 2. Connect to the signaling server
      // 3. Exchange signals with existing participants
      
      // For this demo, we'll just set up local stream and join
      await setupLocalStream();
      
      // Set room state
      setIsInRoom(true);
      
      // Add local user to participants
      const localParticipant = {
        id: 'local',
        name: user?.name || 'You',
        isLocal: true
      };
      
      // Simulate other participants
      const simulatedParticipant = {
        id: 'simulated',
        name: 'John Doe',
        isLocal: false
      };
      
      setParticipants([localParticipant, simulatedParticipant]);
      
      toast({
        title: "Room joined",
        description: `Connected to room ${roomId}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error joining room:', error);
      setError('Failed to join room. Please check your camera and microphone permissions.');
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Set up local media stream
  const setupLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw new Error('Could not access camera or microphone. Please check permissions.');
    }
  };
  
  // Toggle camera
  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };
  
  // Toggle microphone
  const toggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isAudioEnabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };
  
  // Toggle screen sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }
      
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = null;
      }
      
      setIsScreenSharing(false);
    } else {
      try {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        screenStreamRef.current = screenStream;
        
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = screenStream;
        }
        
        setIsScreenSharing(true);
        
        // Handle when user stops sharing screen
        screenStream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };
        
        toast({
          title: "Screen sharing started",
          status: "info",
          duration: 2000,
        });
      } catch (error) {
        console.error('Error sharing screen:', error);
        toast({
          title: "Screen sharing failed",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };
  
  // Leave the call
  const leaveCall = () => {
    // Stop all media streams
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    
    // Reset state
    setIsInRoom(false);
    setParticipants([]);
    setIsScreenSharing(false);
    
    // Close leave dialog
    onLeaveDialogClose();
    
    toast({
      title: "Call ended",
      status: "info",
      duration: 2000,
    });
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
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
      
      <Container maxW="container.xl" py={8}>
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {!isInRoom ? (
            <MotionBox
              variants={itemVariants}
              maxW="600px"
              mx="auto"
              mt={8}
            >
              <Box
                bg={cardBg}
                p={8}
                borderRadius="xl"
                boxShadow="lg"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <VStack spacing={6}>
                  <Heading
                    fontSize="2xl"
                    textAlign="center"
                    bgGradient="linear(to-r, blue.400, purple.500)"
                    bgClip="text"
                  >
                    Video Conference
                  </Heading>
                  
                  <Text color={hintColor} textAlign="center">
                    Create a new meeting or join an existing one to start a video call with screen sharing.
                  </Text>
                  
                  <FormControl isInvalid={!!error}>
                    <FormLabel>Room ID</FormLabel>
                    <Input
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                      placeholder="Enter room ID or leave empty to create a new one"
                      size="lg"
                    />
                    {error && <FormErrorMessage>{error}</FormErrorMessage>}
                  </FormControl>
                  
                  <HStack spacing={4} width="full">
                    <Button
                      colorScheme="blue"
                      size="lg"
                      width="full"
                      leftIcon={<FaVideo />}
                      onClick={createRoom}
                      isLoading={isCreating}
                      loadingText="Creating"
                    >
                      New Meeting
                    </Button>
                    
                    <Button
                      colorScheme="purple"
                      size="lg"
                      width="full"
                      leftIcon={<FaUserPlus />}
                      onClick={joinRoom}
                      isDisabled={!roomId}
                    >
                      Join Meeting
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            </MotionBox>
          ) : (
            <VStack spacing={4} h="calc(100vh - 160px)">
              {/* Room info bar */}
              <Flex
                w="full"
                justify="space-between"
                align="center"
                p={3}
                bg={cardBg}
                borderRadius="lg"
                boxShadow="md"
              >
                <HStack>
                  <Badge colorScheme="green" px={2} py={1} borderRadius="full">
                    Live
                  </Badge>
                  
                  <Text>Room: {roomId}</Text>
                  
                  <Tooltip label={hasCopied ? "Copied!" : "Copy Room ID"}>
                    <IconButton
                      icon={hasCopied ? <CheckIcon /> : <CopyIcon />}
                      size="sm"
                      variant="ghost"
                      onClick={onCopy}
                      aria-label="Copy Room ID"
                    />
                  </Tooltip>
                </HStack>
                
                <HStack>
                  <Badge>{participants.length} participant(s)</Badge>
                </HStack>
              </Flex>
              
              {/* Video area */}
              <Flex flex="1" w="full" gap={4} direction={{ base: "column", md: "row" }}>
                {/* Screen share */}
                {isScreenSharing && (
                  <Box
                    flex="3"
                    bg="black"
                    borderRadius="lg"
                    overflow="hidden"
                    position="relative"
                    h={{ base: "300px", md: "full" }}
                  >
                    <video
                      ref={screenVideoRef}
                      autoPlay
                      playsInline
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                    
                    <Badge
                      position="absolute"
                      bottom="8px"
                      left="8px"
                      colorScheme="purple"
                    >
                      Screen Share
                    </Badge>
                  </Box>
                )}
                
                {/* Participants grid */}
                <Box
                  flex={isScreenSharing ? "2" : "1"}
                  bg={cardBg}
                  borderRadius="lg"
                  p={4}
                  overflow="hidden"
                  h="full"
                >
                  <Grid
                    templateColumns={`repeat(auto-fit, minmax(${isScreenSharing ? '150px' : '250px'}, 1fr))`}
                    gap={4}
                    h="full"
                  >
                    {/* Local video */}
                    <Box position="relative" borderRadius="lg" overflow="hidden" bg="black">
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      
                      {!isVideoEnabled && (
                        <Flex
                          position="absolute"
                          top="0"
                          left="0"
                          right="0"
                          bottom="0"
                          bg="rgba(0,0,0,0.7)"
                          color="white"
                          justify="center"
                          align="center"
                        >
                          <FaVideoSlash size="24px" />
                        </Flex>
                      )}
                      
                      <Badge
                        position="absolute"
                        bottom="8px"
                        left="8px"
                        colorScheme="green"
                      >
                        You
                      </Badge>
                    </Box>
                    
                    {/* Simulated participant videos */}
                    {participants.filter(p => !p.isLocal).map(participant => (
                      <Box
                        key={participant.id}
                        position="relative"
                        borderRadius="lg"
                        overflow="hidden"
                        bg="black"
                        height="100%"
                      >
                        <Flex
                          h="full"
                          justify="center"
                          align="center"
                          color="white"
                          fontWeight="bold"
                          fontSize="lg"
                        >
                          {participant.name.charAt(0).toUpperCase()}
                        </Flex>
                        
                        <Badge
                          position="absolute"
                          bottom="8px"
                          left="8px"
                          colorScheme="blue"
                        >
                          {participant.name}
                        </Badge>
                      </Box>
                    ))}
                  </Grid>
                </Box>
              </Flex>
              
              {/* Controls */}
              <HStack
                spacing={4}
                p={4}
                bg={cardBg}
                borderRadius="full"
                boxShadow="md"
              >
                <IconButton
                  icon={isAudioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
                  onClick={toggleAudio}
                  colorScheme={isAudioEnabled ? "blue" : "gray"}
                  variant="solid"
                  borderRadius="full"
                  size="lg"
                  aria-label="Toggle microphone"
                />
                
                <IconButton
                  icon={isVideoEnabled ? <FaVideo /> : <FaVideoSlash />}
                  onClick={toggleVideo}
                  colorScheme={isVideoEnabled ? "blue" : "gray"}
                  variant="solid"
                  borderRadius="full"
                  size="lg"
                  aria-label="Toggle camera"
                />
                
                <IconButton
                  icon={<FaDesktop />}
                  onClick={toggleScreenShare}
                  colorScheme={isScreenSharing ? "purple" : "gray"}
                  variant="solid"
                  borderRadius="full"
                  size="lg"
                  aria-label="Share screen"
                />
                
                <IconButton
                  icon={<FaPhoneSlash />}
                  onClick={onLeaveDialogOpen}
                  colorScheme="red"
                  variant="solid"
                  borderRadius="full"
                  size="lg"
                  aria-label="End call"
                />
              </HStack>
            </VStack>
          )}
        </MotionBox>
      </Container>
      
      {/* Leave call dialog */}
      <Modal isOpen={isLeaveDialogOpen} onClose={onLeaveDialogClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Leave Meeting</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to leave this meeting?</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onLeaveDialogClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={leaveCall}>
              Leave
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}