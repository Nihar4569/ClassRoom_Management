// File location: src/Pages/ModernScreen.jsx
import React, { useEffect, useRef, useState, useContext } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Flex, 
  Grid, 
  Heading, 
  HStack, 
  IconButton, 
  Input, 
  Stack, 
  Text, 
  VStack,
  useColorModeValue,
  useClipboard,
  Tooltip,
  Badge,
  useToast,
  Divider,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import SimplePeer from 'simple-peer';
import io from 'socket.io-client';
import { Context } from '..';
import ModernHeader from '../Components/ModernHeader';
import ModernButton from '../Components/ModernButton';
import { CopyIcon, InfoIcon, SettingsIcon, PhoneIcon, InfoOutlineIcon, CheckIcon, WarningIcon } from '@chakra-ui/icons';
import { FaDesktop, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from 'react-icons/fa';

// Socket connection
const socket = io('http://localhost:5000');

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

export default function ModernScreen() {
  // State for peer connection
  const [peer, setPeer] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [participantCount, setParticipantCount] = useState(0);

  // Context and refs
  const { teacherData, studentData } = useContext(Context);
  const user = teacherData || studentData;
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const cancelRef = useRef();

  // Toast for notifications
  const toast = useToast();
  
  // Generate a random room ID if none provided
  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  // Copy room ID to clipboard
  const { hasCopied, onCopy } = useClipboard(roomId);
  
  // Alert dialog for leaving room
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Theme colors
  const boxBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const hintColor = useColorModeValue('gray.600', 'gray.400');
  const statusColors = {
    disconnected: useColorModeValue('red.500', 'red.300'),
    connecting: useColorModeValue('orange.500', 'orange.300'),
    connected: useColorModeValue('green.500', 'green.300')
  };

  // Socket event handling
  useEffect(() => {
    socket.on('signal', (data) => {
      if (peer) {
        peer.signal(data.signal);
      }
    });

    socket.on('room-participants', (count) => {
      setParticipantCount(count);
    });

    return () => {
      socket.off('signal');
      socket.off('room-participants');
    };
  }, [peer]);

  // Create a new room
  const createRoom = () => {
    const id = roomId || generateRoomId();
    setRoomId(id);
    socket.emit('join-room', id);
    setIsInRoom(true);
    setConnectionStatus('connecting');
    
    toast({
      title: "Room created",
      description: `Room ID: ${id}`,
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  // Join an existing room
  const joinRoom = () => {
    if (!roomId) {
      toast({
        title: "Room ID required",
        description: "Please enter a room ID to join",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    socket.emit('join-room', roomId);
    setIsInRoom(true);
    setConnectionStatus('connecting');
    
    toast({
      title: "Joining room",
      description: `Connecting to room ${roomId}`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  // Start screen sharing
  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true, 
        audio: audioEnabled 
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      const peerInstance = new SimplePeer({
        initiator: true,
        stream: stream,
        trickle: false,
      });

      // Handle peer events
      peerInstance.on('signal', (data) => {
        socket.emit('signal', { signal: data, to: roomId });
      });

      peerInstance.on('connect', () => {
        setConnectionStatus('connected');
        toast({
          title: "Connected",
          description: "Screen sharing started",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      });

      peerInstance.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      peerInstance.on('error', (err) => {
        console.error('Peer error:', err);
        toast({
          title: "Connection error",
          description: err.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });

      setPeer(peerInstance);
      setSharing(true);
      
      // Handle when user stops sharing
      stream.getVideoTracks()[0].onended = () => {
        stopSharing();
      };
      
    } catch (error) {
      console.error('Error starting screen share:', error);
      toast({
        title: "Screen sharing failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Join screen share as viewer
  const joinScreenShare = () => {
    const peerInstance = new SimplePeer({
      initiator: false,
      trickle: false,
    });

    peerInstance.on('signal', (data) => {
      socket.emit('signal', { signal: data, to: roomId });
    });

    peerInstance.on('connect', () => {
      setConnectionStatus('connected');
      toast({
        title: "Connected",
        description: "Viewing screen share",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    });

    peerInstance.on('stream', (remoteStream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    });

    peerInstance.on('error', (err) => {
      console.error('Peer error:', err);
      toast({
        title: "Connection error",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    });

    setPeer(peerInstance);
    setViewing(true);
  };

  // Stop sharing or viewing
  const stopSharing = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }
    
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      remoteVideoRef.current.srcObject = null;
    }
    
    if (peer) {
      peer.destroy();
      setPeer(null);
    }
    
    setSharing(false);
    setViewing(false);
    setConnectionStatus('disconnected');
  };

  // Leave room completely
  const leaveRoom = () => {
    stopSharing();
    socket.emit('leave-room', roomId);
    setIsInRoom(false);
    setRoomId('');
    onClose();
    
    toast({
      title: "Left room",
      description: "You have left the screen sharing session",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  // Toggle audio
  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
    }
  };

  // Toggle video
  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled);
    
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
    }
  };

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
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <ModernHeader />
      
      <Container maxW="container.xl" py={8}>
        <MotionFlex
          direction="column"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <MotionBox variants={itemVariants} mb={8} textAlign="center">
            <Heading 
              fontSize={{ base: "2xl", md: "4xl" }}
              bgGradient="linear(to-r, purple.500, blue.500)"
              bgClip="text"
              mb={4}
            >
              Screen Sharing
            </Heading>
            
            <Text color={hintColor} fontSize="lg" maxW="700px" mx="auto">
              Share your screen for presentations, demonstrations, or collaborative work sessions
            </Text>
          </MotionBox>

          {!isInRoom ? (
            <MotionBox 
              variants={itemVariants}
              bg={boxBg}
              p={8}
              borderRadius="xl"
              boxShadow="lg"
              maxW="600px"
              mx="auto"
            >
              <VStack spacing={6}>
                <Heading size="md" mb={2}>Join or Create a Room</Heading>
                
                <Input
                  placeholder="Enter Room ID or leave empty to generate"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  size="lg"
                  borderRadius="md"
                />
                
                <HStack spacing={4} width="full">
                  <ModernButton 
                    onClick={createRoom} 
                    colorScheme="blue" 
                    leftIcon={<FaDesktop />}
                    flex="1"
                  >
                    Create Room
                  </ModernButton>
                  
                  <ModernButton 
                    onClick={joinRoom} 
                    colorScheme="purple"
                    leftIcon={<PhoneIcon />}
                    flex="1"
                    isDisabled={!roomId}
                  >
                    Join Room
                  </ModernButton>
                </HStack>
              </VStack>
            </MotionBox>
          ) : (
            <Grid
              templateColumns={{ base: "1fr", lg: "3fr 1fr" }}
              gap={6}
            >
              {/* Main video area */}
              <MotionBox variants={itemVariants}>
                <Box 
                  bg={boxBg}
                  borderRadius="xl"
                  overflow="hidden"
                  boxShadow="lg"
                  h={{ base: "400px", md: "600px" }}
                  position="relative"
                >
                  {/* Status bar */}
                  <Flex 
                    justify="space-between"
                    align="center"
                    bg={useColorModeValue('gray.100', 'gray.700')}
                    p={3}
                    borderBottom="1px"
                    borderColor={borderColor}
                  >
                    <HStack>
                      <Badge 
                        colorScheme={
                          connectionStatus === 'connected' ? 'green' : 
                          connectionStatus === 'connecting' ? 'yellow' : 'red'
                        }
                        variant="subtle"
                        px={2}
                        py={1}
                        borderRadius="full"
                      >
                        {connectionStatus === 'connected' ? 'Connected' : 
                         connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                      </Badge>
                      
                      <Text fontSize="sm">Room: {roomId}</Text>
                      
                      <Tooltip
                        label={hasCopied ? "Copied!" : "Copy Room ID"}
                        closeOnClick={false}
                      >
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
                      <Badge>{participantCount} participant(s)</Badge>
                      
                      <Tooltip label="Leave Room">
                        <IconButton
                          icon={<WarningIcon />}
                          colorScheme="red"
                          variant="ghost"
                          size="sm"
                          onClick={onOpen}
                          aria-label="Leave Room"
                        />
                      </Tooltip>
                    </HStack>
                  </Flex>
                  
                  {/* Video display */}
                  <Flex 
                    height="calc(100% - 48px)"
                    width="100%"
                    justify="center"
                    align="center"
                    bg={useColorModeValue('gray.50', 'gray.900')}
                    position="relative"
                  >
                    {connectionStatus === 'disconnected' ? (
                      <VStack spacing={4}>
                        <InfoIcon boxSize={10} color="gray.400" />
                        <Text color="gray.500">
                          {viewing || sharing ? 
                            "Connection ended" : 
                            "Start or join screen sharing to begin"}
                        </Text>
                      </VStack>
                    ) : (
                      <Box width="100%" height="100%">
                        <video 
                          ref={remoteVideoRef} 
                          autoPlay 
                          playsInline
                          style={{ 
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            backgroundColor: '#000',
                            display: viewing ? 'block' : 'none'
                          }} 
                        />
                      </Box>
                    )}
                  </Flex>
                  
                  {/* Controls overlay */}
                  <HStack 
                    position="absolute" 
                    bottom="0" 
                    left="0" 
                    right="0"
                    justify="center"
                    p={4}
                    spacing={3}
                    bg="rgba(0,0,0,0.3)"
                    backdropFilter="blur(10px)"
                  >
                    {!sharing && !viewing ? (
                      <>
                        <ModernButton
                          onClick={startScreenShare}
                          colorScheme="blue"
                          leftIcon={<FaDesktop />}
                        >
                          Share Screen
                        </ModernButton>
                        
                        <ModernButton
                          onClick={joinScreenShare}
                          colorScheme="purple"
                          leftIcon={<FaVideo />}
                        >
                          View Share
                        </ModernButton>
                      </>
                    ) : (
                      <>
                        <IconButton
                          icon={audioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
                          onClick={toggleAudio}
                          colorScheme={audioEnabled ? "blue" : "gray"}
                          variant="solid"
                          borderRadius="full"
                          aria-label="Toggle Audio"
                        />
                        
                        <IconButton
                          icon={videoEnabled ? <FaVideo /> : <FaVideoSlash />}
                          onClick={toggleVideo}
                          colorScheme={videoEnabled ? "blue" : "gray"}
                          variant="solid"
                          borderRadius="full"
                          aria-label="Toggle Video"
                        />
                        
                        <ModernButton
                          onClick={stopSharing}
                          colorScheme="red"
                        >
                          {sharing ? "Stop Sharing" : "Disconnect"}
                        </ModernButton>
                      </>
                    )}
                  </HStack>
                </Box>
              </MotionBox>
              
              {/* Preview and info panel */}
              <MotionBox variants={itemVariants}>
                <VStack spacing={6}>
                  {/* Local video preview */}
                  <Box
                    bg={boxBg}
                    borderRadius="xl"
                    overflow="hidden"
                    boxShadow="md"
                    h="200px"
                    w="100%"
                  >
                    <Box
                      as="video"
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      width="100%"
                      height="100%"
                      objectFit="cover"
                      bg="black"
                    />
                    
                    <Text
                      position="absolute"
                      bottom="8px"
                      left="8px"
                      color="white"
                      fontSize="sm"
                      bg="rgba(0,0,0,0.5)"
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      Your Screen
                    </Text>
                  </Box>
                  
                  {/* Connection info */}
                  <Box
                    bg={boxBg}
                    borderRadius="xl"
                    boxShadow="md"
                    p={4}
                    w="100%"
                  >
                    <VStack spacing={3} align="stretch">
                      <Heading size="sm">Connection Info</Heading>
                      <Divider />
                      
                      <HStack justify="space-between">
                        <Text fontSize="sm">Status:</Text>
                        <Badge colorScheme={
                          connectionStatus === 'connected' ? 'green' : 
                          connectionStatus === 'connecting' ? 'yellow' : 'red'
                        }>
                          {connectionStatus}
                        </Badge>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontSize="sm">Room ID:</Text>
                        <Text fontSize="sm" fontWeight="bold">{roomId}</Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontSize="sm">Participants:</Text>
                        <Text fontSize="sm">{participantCount}</Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontSize="sm">Role:</Text>
                        <Badge colorScheme={sharing ? "blue" : viewing ? "purple" : "gray"}>
                          {sharing ? "Presenter" : viewing ? "Viewer" : "Not Connected"}
                        </Badge>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontSize="sm">Audio:</Text>
                        <Badge colorScheme={audioEnabled ? "green" : "red"}>
                          {audioEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </HStack>
                    </VStack>
                  </Box>
                </VStack>
              </MotionBox>
            </Grid>
          )}
        </MotionFlex>
      </Container>
      
      {/* Confirmation dialog for leaving room */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Leave Room
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to leave this screen sharing session? This will disconnect you from all participants.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={leaveRoom} ml={3}>
                Leave
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};