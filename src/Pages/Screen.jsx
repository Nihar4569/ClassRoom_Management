// File location: src/Pages/ScreenShare.jsx
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
  useDisclosure,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Select,
  Center
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import SimplePeer from 'simple-peer';
import io from 'socket.io-client';
import { Context } from '..';
import ModernHeader from '../Components/ModernHeader';
import ModernButton from '../Components/ModernButton';
import { 
  CopyIcon, 
  InfoIcon, 
  CheckIcon, 
  WarningIcon
} from '@chakra-ui/icons';
import { 
  FaDesktop, 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaVideo, 
  FaVideoSlash, 
  FaShareSquare, 
  FaUserPlus
} from 'react-icons/fa';
import { 
  collection, 
  addDoc, 
  getFirestore, 
  serverTimestamp, 
  doc,
  updateDoc,
  where,
  getDocs,
  query
} from 'firebase/firestore';
import { app } from '../firebase';
import { useNavigate } from 'react-router-dom';

// Socket.io connection - secure solution would use environment variables
const SOCKET_SERVER = process.env.REACT_APP_SOCKET_SERVER || 'https://your-socket-server.herokuapp.com';
// If no server is specified, we'll create a mock socket with the required functions
const socket = SOCKET_SERVER === 'https://your-socket-server.herokuapp.com' 
  ? {
      on: (event, callback) => {},
      emit: (event, data) => {
        console.log(`Mock emit: ${event}`, data);
      },
      off: (event) => {},
      id: 'mock-socket-id'
    }
  : io(SOCKET_SERVER);

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

export default function Screen() {
  // State for peer connection
  const [localPeer, setLocalPeer] = useState(null);
  const [remotePeers, setRemotePeers] = useState({});
  const [peerId, setPeerId] = useState('');
  const [sharing, setSharing] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [participantCount, setParticipantCount] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [screenshareType, setScreenshareType] = useState('screen');
  const [error, setError] = useState('');
  const [roomMetadata, setRoomMetadata] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  
  // Context and refs
  const { teacherData, studentData } = useContext(Context);
  const user = teacherData || studentData;
  const db = getFirestore(app);
  const localVideoRef = useRef(null);
  const remoteVideoContainerRef = useRef(null);
  const remoteVideosRef = useRef({});
  const cancelRef = useRef();
  const navigate = useNavigate();

  // Toast for notifications
  const toast = useToast();
  
  // Generate a random room ID if none provided
  const generateRoomId = () => {
    return `${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`;
  };

  // Copy room ID to clipboard
  const { hasCopied, onCopy } = useClipboard(roomId);
  
  // Alert dialog for leaving room
  const { isOpen, onOpen, onClose } = useDisclosure();
  // Fetch user's classrooms
  useEffect(() => {
    if (!user) return;
    
    const fetchClassrooms = async () => {
      try {
        if (teacherData) {
          // For teachers, query all document collections that might contain their classes
          const allClassrooms = [];
          for (let sem = 1; sem <= 8; sem++) {
            for (let section of ['A', 'B', 'C', 'D', 'E', 'F']) {
              const collectionPath = `semester${sem}+${section}`;
              try {
                const snapshot = await getDocs(collection(db, collectionPath));
                snapshot.forEach(doc => {
                  if (doc.data().createdBy === teacherData.uid) {
                    allClassrooms.push({
                      id: `${collectionPath}+${doc.id}`,
                      name: `Semester ${sem} ${section} - ${doc.id}`
                    });
                  }
                });
              } catch (err) {
                // Collection might not exist, continue to next one
              }
            }
          }
          setClassrooms(allClassrooms);
        } else if (studentData) {
          // For students, get classes from their semester and section
          const collectionPath = `${studentData.semester}+${studentData.section}`;
          try {
            const snapshot = await getDocs(collection(db, collectionPath));
            const studentClasses = snapshot.docs.map(doc => ({
              id: `${collectionPath}+${doc.id}`,
              name: `${doc.id}`
            }));
            setClassrooms(studentClasses);
          } catch (err) {
            console.error("Error fetching student classes:", err);
          }
        }
      } catch (error) {
        console.error("Error fetching classrooms:", error);
        toast({
          title: "Error",
          description: "Failed to load your classrooms.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };
    
    fetchClassrooms();
  }, [user, teacherData, studentData, db, toast]);

  // Theme colors
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const boxBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const hintColor = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('gray.100', 'gray.700');
  const videoContainerBg = useColorModeValue('gray.50', 'gray.900');
  const participantBg = useColorModeValue('gray.50', 'gray.700');
  const participantHoverBg = useColorModeValue('gray.100', 'gray.600');
  
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

  // Setup socket.io event listeners
  useEffect(() => {
    // Only proceed if we're not using the mock socket
    if (socket.id === 'mock-socket-id') return;
    
    // Handle the socket connection events
    socket.on('connect', () => {
      setPeerId(socket.id);
      console.log('Connected to signaling server with ID:', socket.id);
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from signaling server');
      if (isInRoom) {
        toast({
          title: "Connection lost",
          description: "You've been disconnected from the signaling server.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    });
    
    // Listen for room participant updates
    socket.on('participants', (data) => {
      setParticipantCount(data.count);
      setParticipants(data.participants || []);
    });
    
    // Listen for another peer's signal data
    socket.on('signal', (data) => {
      handleIncomingSignal(data);
    });
    
    // Listen for peer disconnection
    socket.on('peer-disconnected', (peerId) => {
      console.log('Peer disconnected:', peerId);
      
      // Remove the peer from our remotePeers state
      setRemotePeers(prev => {
        const newPeers = { ...prev };
        if (newPeers[peerId]) {
          if (newPeers[peerId].peer) {
            newPeers[peerId].peer.destroy();
          }
          delete newPeers[peerId];
        }
        return newPeers;
      });
      
      // Remove the video element
      if (remoteVideosRef.current[peerId]) {
        const videoElement = remoteVideosRef.current[peerId];
        if (videoElement && videoElement.parentNode) {
          videoElement.parentNode.removeChild(videoElement);
        }
        delete remoteVideosRef.current[peerId];
      }
      
      toast({
        title: "Participant left",
        description: "A participant has left the room.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    });
    
    // Socket cleanup
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('participants');
      socket.off('signal');
      socket.off('peer-disconnected');
    };
  }, [isInRoom, toast]);

  // Handle incoming WebRTC signal
  const handleIncomingSignal = (data) => {
    const { from, signal, metadata } = data;
    
    console.log('Received signal from:', from, 'type:', signal.type);
    
    if (signal.type === 'offer' && !remotePeers[from]) {
      console.log('Creating new peer as answer to:', from);
      createPeer(from, false, signal, metadata);
    } else if (remotePeers[from]) {
      console.log('Existing peer, signaling:', from);
      remotePeers[from].peer.signal(signal);
    }
  };
  // Create a WebRTC peer
  const createPeer = (peerId, initiator, incomingSignal = null, metadata = {}) => {
    try {
      const peer = new SimplePeer({
        initiator,
        trickle: true,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });
      
      peer.on('error', (err) => {
        console.error('Peer connection error:', err);
        toast({
          title: "Connection error",
          description: "An error occurred with the WebRTC connection.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
      
      peer.on('signal', (signal) => {
        console.log('Sending signal to:', peerId);
        socket.emit('signal', {
          to: peerId,
          from: socket.id,
          signal,
          metadata: {
            name: user?.name || 'Anonymous',
            isTeacher: !!teacherData,
            userId: user?.uid
          }
        });
      });
      
      peer.on('connect', () => {
        console.log('Peer connected:', peerId);
        setConnectionStatus('connected');
        
        toast({
          title: "Connected",
          description: `Connected to ${metadata?.name || 'a participant'}.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Update remotePeers state to reflect connected status
        setRemotePeers(prev => ({
          ...prev,
          [peerId]: {
            ...prev[peerId],
            connected: true,
            metadata
          }
        }));
      });
      
      peer.on('stream', (stream) => {
        console.log('Received stream from:', peerId);
        
        // Create and setup the video element for this peer
        if (!remoteVideosRef.current[peerId]) {
          const video = document.createElement('video');
          video.srcObject = stream;
          video.id = `video-${peerId}`;
          video.autoplay = true;
          video.playsInline = true;
          video.className = 'remote-video';
          video.style.width = '100%';
          video.style.height = '100%';
          video.style.objectFit = 'contain';
          
          remoteVideosRef.current[peerId] = video;
          
          if (remoteVideoContainerRef.current) {
            remoteVideoContainerRef.current.appendChild(video);
          }
        }
        
        setViewing(true);
      });
      
      peer.on('close', () => {
        console.log('Peer connection closed:', peerId);
        
        // Clean up this peer
        setRemotePeers(prev => {
          const newPeers = { ...prev };
          delete newPeers[peerId];
          return newPeers;
        });
        
        // Remove the video element
        if (remoteVideosRef.current[peerId]) {
          const videoElement = remoteVideosRef.current[peerId];
          if (videoElement && videoElement.parentNode) {
            videoElement.parentNode.removeChild(videoElement);
          }
          delete remoteVideosRef.current[peerId];
        }
      });
      
      // If this is an answer to an offer, signal the incoming offer
      if (incomingSignal) {
        peer.signal(incomingSignal);
      }
      
      // Store the peer in our remotePeers state
      setRemotePeers(prev => ({
        ...prev,
        [peerId]: {
          peer,
          initiator,
          connected: false,
          metadata
        }
      }));
      
      return peer;
    } catch (err) {
      console.error('Error creating peer:', err);
      setError('Failed to create peer connection. Please try again.');
      return null;
    }
  };
  
  // Create a new room in Firestore and join it
  const createRoom = async () => {
    if (isCreatingRoom) return;
    
    setIsCreatingRoom(true);
    setError('');
    
    try {
      const id = roomId || generateRoomId();
      setRoomId(id);
      
      // Save room to Firestore
      await addDoc(collection(db, 'screenshares'), {
        roomId: id,
        createdBy: user?.uid,
        creatorName: user?.name,
        classroom: selectedClassroom || null,
        createdAt: serverTimestamp(),
        active: true
      });
      
      // Join the socket.io room
      socket.emit('join-room', {
        roomId: id,
        name: user?.name || 'Anonymous',
        isTeacher: !!teacherData,
        userId: user?.uid
      });
      
      setIsInRoom(true);
      setConnectionStatus('connecting');
      
      toast({
        title: "Room created",
        description: `Room ID: ${id}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error creating room:', error);
      setError('Failed to create room. Please try again.');
      toast({
        title: "Error",
        description: "Failed to create screen sharing room.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCreatingRoom(false);
    }
  };

// Join an existing room
const joinRoom = () => {
    if (!roomId) {
      setError('Please enter a room ID to join');
      return;
    }
    
    setError('');
    
    // Verify room exists in Firestore
    const verifyAndJoin = async () => {
      try {
        const q = query(
          collection(db, 'screenshares'), 
          where('roomId', '==', roomId),
          where('active', '==', true)
        );
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          setError('Room not found or is no longer active');
          return;
        }
        
        // Get room metadata
        const roomData = snapshot.docs[0].data();
        setRoomMetadata({
          id: snapshot.docs[0].id,
          ...roomData
        });
        
        // Join the socket.io room
        socket.emit('join-room', {
          roomId,
          name: user?.name || 'Anonymous',
          isTeacher: !!teacherData,
          userId: user?.uid
        });
        
        setIsInRoom(true);
        setConnectionStatus('connecting');
        
        toast({
          title: "Joining room",
          description: `Connecting to room ${roomId}`,
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error joining room:', error);
        setError('Failed to join room. Please try again.');
      }
    };
    
    verifyAndJoin();
  };

  // Start screen sharing
  const startScreenShare = async () => {
    try {
      let displayMediaOptions = { video: true };
      
      // Add audio only if selected
      if (audioEnabled) {
        displayMediaOptions.audio = true;
      }
      
      // Get screen sharing stream
      const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // For each participant, create an initiator peer and share the stream
      Object.keys(remotePeers).forEach(peerId => {
        // Destroy existing peer if any
        if (remotePeers[peerId].peer) {
          remotePeers[peerId].peer.destroy();
        }
        
        // Create new peer with stream
        const newPeer = new SimplePeer({
          initiator: true,
          trickle: true,
          stream,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' }
            ]
          }
        });
        
        newPeer.on('signal', signal => {
          console.log('Sending signal to:', peerId);
          socket.emit('signal', {
            to: peerId,
            from: socket.id,
            signal,
            metadata: {
              name: user?.name || 'Anonymous',
              isTeacher: !!teacherData,
              userId: user?.uid,
              isScreenShare: true
            }
          });
        });
        
        newPeer.on('error', err => {
          console.error('Peer error during screen sharing:', err);
        });
        
        // Update remotePeers state
        setRemotePeers(prev => ({
          ...prev,
          [peerId]: {
            ...prev[peerId],
            peer: newPeer,
            initiator: true
          }
        }));
      });
      
      setSharing(true);
      
      // Handle when user stops sharing screen
      stream.getVideoTracks()[0].onended = () => {
        stopSharing();
      };
      
      toast({
        title: "Screen sharing started",
        description: "Your screen is now being shared with the room.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error starting screen share:', error);
      
      // The user canceled, which throws a DOMException
      if (error.name === 'NotAllowedError') {
        toast({
          title: "Screen sharing canceled",
          description: "You canceled the screen sharing request.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      toast({
        title: "Screen sharing failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Join an existing screen share as viewer
  const joinScreenShare = () => {
    // The peers are already created during room join,
    // so we just need to let others know we're ready to view
    socket.emit('ready-to-receive', { roomId });
    
    setViewing(true);
    
    toast({
      title: "Viewing screen share",
      description: "Waiting for someone to share their screen.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  // Stop sharing or viewing
  const stopSharing = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }
    
    // Destroy all peer connections and re-create them
    Object.keys(remotePeers).forEach(peerId => {
      if (remotePeers[peerId].peer) {
        remotePeers[peerId].peer.destroy();
        
        // Create new peer without the stream
        createPeer(peerId, true);
      }
    });
    
    setSharing(false);
    setViewing(false);
    
    toast({
      title: "Screen sharing stopped",
      description: "Your screen sharing has ended.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  // Leave room completely
  const leaveRoom = async () => {
    // Stop any active sharing
    stopSharing();
    
    // Destroy all peer connections
    Object.keys(remotePeers).forEach(peerId => {
      if (remotePeers[peerId].peer) {
        remotePeers[peerId].peer.destroy();
      }
    });
    
    // Reset state
    setRemotePeers({});
    setConnectionStatus('disconnected');
    
    // Leave the socket room
    socket.emit('leave-room', { roomId });
    
    // Mark room as inactive if creator
    if (roomMetadata && roomMetadata.createdBy === user?.uid) {
      try {
        await updateDoc(doc(db, 'screenshares', roomMetadata.id), {
          active: false,
          endedAt: serverTimestamp()
        });
      } catch (err) {
        console.error('Error updating room status:', err);
      }
    }
    
    setIsInRoom(false);
    setRoomId('');
    setRoomMetadata(null);
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

  // Render function for participant list 
  const renderParticipantList = () => {
    if (participants.length === 0) {
      return (
        <Text textAlign="center" color={hintColor}>
          No other participants yet
        </Text>
      );
    }
    
    return participants.map((participant, index) => (
      <Box 
        key={participant.id || index}
        p={3}
        borderRadius="md"
        bg={participantBg}
        _hover={{ bg: participantHoverBg }}
        mb={2}
      >
        <HStack justify="space-between">
          <HStack>
            <Text fontWeight="medium">{participant.name}</Text>
            {participant.isTeacher && (
              <Badge colorScheme="green">Teacher</Badge>
            )}
            {participant.id === socket.id && (
              <Badge>You</Badge>
            )}
          </HStack>
          
          {participant.isScreenSharing && (
            <Badge colorScheme="blue">Sharing</Badge>
          )}
        </HStack>
      </Box>
    ));
  };

  // Return null if the socket is mock and user is not in dev mode
  if (socket.id === 'mock-socket-id' && process.env.NODE_ENV !== 'development') {
    return (
      <Box minH="100vh" bg={bgColor}>
        <ModernHeader />
        <Container maxW="container.md" py={10}>
          <VStack spacing={6} align="center">
            <Heading size="lg" textAlign="center">Screen Sharing Not Available</Heading>
            <Text textAlign="center">
            socket.io server is disabled for now. Please Contact Admin
            </Text>
            <ModernButton onClick={() => navigate(-1)} colorScheme="blue">
              Go Back
            </ModernButton>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor}>
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
                
                <FormControl isInvalid={!!error}>
                  <FormLabel>Room ID</FormLabel>
                  <Input
                    placeholder="Enter Room ID or leave empty to generate"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    size="lg"
                    borderRadius="md"
                  />
                  {error && <FormErrorMessage>{error}</FormErrorMessage>}
                </FormControl>
                
                <FormControl>
                  <FormLabel>Associate with classroom (optional)</FormLabel>
                  <Select
                    placeholder="Select a classroom"
                    value={selectedClassroom}
                    onChange={(e) => setSelectedClassroom(e.target.value)}
                  >
                    {classrooms.map(classroom => (
                      <option key={classroom.id} value={classroom.id}>
                        {classroom.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                
                <HStack spacing={4} width="full">
                  <ModernButton 
                    onClick={createRoom} 
                    colorScheme="blue" 
                    leftIcon={<FaDesktop />}
                    flex="1"
                    isLoading={isCreatingRoom}
                    loadingText="Creating"
                  >
                    Create Room
                  </ModernButton>
                  
                  <ModernButton 
                    onClick={joinRoom} 
                    colorScheme="purple"
                    leftIcon={<FaUserPlus />}
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
                    bg={headerBg}
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
                  <Box
                    height="calc(100% - 48px)"
                    width="100%"
                    position="relative"
                    bg={videoContainerBg}
                  >
                    {/* Remote videos container */}
                    <Box
                      ref={remoteVideoContainerRef}
                      position="absolute"
                      top="0"
                      left="0"
                      right="0"
                      bottom="0"
                      display={viewing ? "block" : "flex"}
                      justifyContent="center"
                      alignItems="center"
                    >
                      {!viewing && (
                        <VStack spacing={4}>
                          <InfoIcon boxSize={10} color="gray.400" />
                          <Text color="gray.500">
                            {connectionStatus === 'connected' 
                              ? "Waiting for someone to share their screen..." 
                              : "Please start or join a screen share to begin"}
                          </Text>
                        </VStack>
                      )}
                    </Box>
                  </Box>
                  
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
                          leftIcon={<FaShareSquare />}
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
                          isDisabled={!sharing}
                        />
                        
                        <IconButton
                          icon={videoEnabled ? <FaVideo /> : <FaVideoSlash />}
                          onClick={toggleVideo}
                          colorScheme={videoEnabled ? "blue" : "gray"}
                          variant="solid"
                          borderRadius="full"
                          aria-label="Toggle Video"
                          isDisabled={!sharing}
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
                    position="relative"
                  >
                    <Box
                      as="video"
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      width="100%"
                      height="100%"
                      objectFit="contain"
                      bg="black"
                    />
                    
                    {sharing ? (
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
                        Your Screen (Sharing)
                      </Text>
                    ) : (
                      <Center h="100%">
                        <Text color="gray.500">
                          Preview will appear when sharing
                        </Text>
                      </Center>
                    )}
                  </Box>
                  
                  {/* Participants list */}
                  <Box
                    bg={boxBg}
                    borderRadius="xl"
                    boxShadow="md"
                    p={4}
                    w="100%"
                  >
                    <VStack spacing={3} align="stretch">
                      <Heading size="sm">Participants ({participantCount})</Heading>
                      <Divider />
                      
                      <Box maxH="200px" overflowY="auto" px={1}>
                        {renderParticipantList()}
                      </Box>
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
              {roomMetadata?.createdBy === user?.uid && (
                <Text mt={2} fontWeight="bold" color="red.500">
                  As the creator of this room, leaving will end the session for everyone.
                </Text>
              )}
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

