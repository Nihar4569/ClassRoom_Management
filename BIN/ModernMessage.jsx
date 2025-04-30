// // File location: src/Components/ModernMessage.jsx
// import { 
//     Avatar, 
//     Box, 
//     Flex, 
//     HStack, 
//     IconButton, 
//     Menu, 
//     MenuButton, 
//     MenuList, 
//     MenuItem, 
//     Text, 
//     VStack,
//     useColorModeValue,
//     Image,
//     Button,
//     useDisclosure,
//     Modal,
//     ModalOverlay,
//     ModalContent,
//     ModalHeader,
//     ModalBody,
//     ModalFooter,
//     ModalCloseButton,
//     Tooltip,
//     Divider,
//     useToast,
//     Badge,
//     Heading
//   } from '@chakra-ui/react';
//   import { 
//     DeleteIcon, 
//     ChevronDownIcon, 
//     DownloadIcon, 
//     ViewIcon, 
//     CheckIcon, 
//     CloseIcon,
//     InfoOutlineIcon,
//     WarningIcon,
//     StarIcon,
//     TimeIcon
//   } from '@chakra-ui/icons';
//   import React, { useContext, useEffect, useState } from 'react';
//   import { Context } from '../index';
//   import { motion } from 'framer-motion';
//   import { deleteDoc, doc, getDoc, getFirestore, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
//   import { app } from '../firebase';
  
//   // PDF icon import
//   import pdficon from "../Images/pdf.png";
  
//   const MotionBox = motion(Box);
  
//   function Message({ message_id, uid, text, url, user, name, time, iurl, access }) {
//     const db = getFirestore(app);
//     const { chatId, studentData, teacherData } = useContext(Context);
//     const [userData, setUserData] = useState({});
//     const [adminAccess, setAdminAccess] = useState(false);
//     const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
//     const [isTeacher, setIsTeacher] = useState(false);
//     const [isPinned, setIsPinned] = useState(false);
//     const [showConfirmation, setShowConfirmation] = useState(false);
//     const [actionType, setActionType] = useState('');
//     const toast = useToast();
    
//     // Modal disclosures
//     const { isOpen: isMediaOpen, onOpen: onMediaOpen, onClose: onMediaClose } = useDisclosure();
//     const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
//     const { isOpen: isUserInfoOpen, onOpen: onUserInfoOpen, onClose: onUserInfoClose } = useDisclosure();
  
//     // Determine file types
//     const isPDF = iurl && iurl.toLowerCase().includes('.pdf');
//     const isVideo = iurl && /\.(mp4|ogg|webm|avi|wmv|flv|mov|mkv|mpeg|3gp|mpg)/i.test(iurl);
//     const isImage = iurl && /\.(png|jpe?g|gif|bmp)[^/]*$/i.test(iurl);
//     const isAudio = iurl && /\.(mp3|wav|ogg|aac|flac)[^/]*$/i.test(iurl);
  
//     // Extract filename for PDF display
//     let fileName = '';
//     if (isPDF) {
//       const roomIdLength = chatId.length;
//       const startIndex = iurl.lastIndexOf('/') + roomIdLength + 8;
//       const endIndex = iurl.toLowerCase().lastIndexOf('.pdf');
//       fileName = iurl.substring(startIndex, endIndex);
//     }
  
//     // Calculate message theme colors - move all useColorModeValue calls to the top level
//     const myMessageBg = useColorModeValue('brand.100', 'brand.900');
//     const myMessageBorder = useColorModeValue('brand.200', 'brand.700');
//     const otherMessageBg = useColorModeValue('gray.100', 'gray.700');
//     const otherMessageBorder = useColorModeValue('gray.200', 'gray.600');
//     const nameColor = useColorModeValue('brand.600', 'brand.300');
//     const audioBoxBg = useColorModeValue('gray.50', 'gray.800');
//     const pinnedBg = useColorModeValue('yellow.50', 'yellow.900');
//     const pinnedBorder = useColorModeValue('yellow.200', 'yellow.700');
    
//     // Check if current user is admin or teacher
//     useEffect(() => {
//       const currentUserIsAdmin = studentData?.access || teacherData?.access || false;
//       setIsCurrentUserAdmin(currentUserIsAdmin);
//       setIsTeacher(!!teacherData);
//     }, [studentData, teacherData]);
    
//     // Delete message handler
//     const handleDelete = async () => {
//       try {
//         await deleteDoc(doc(db, chatId, message_id));
//         toast({
//           title: "Message deleted",
//           status: "success",
//           duration: 2000,
//           isClosable: true,
//         });
//       } catch (error) {
//         console.error("Error deleting message:", error.message);
//         toast({
//           title: "Error deleting message",
//           description: error.message,
//           status: "error",
//           duration: 3000,
//           isClosable: true,
//         });
//       }
//     };
  
//     // Toggle admin access handler
//     const admintoggle = async () => {
//       setActionType('admin');
//       onConfirmOpen();
//     };
    
//     // Perform the admin status change
//     const confirmAdminToggle = async () => {
//       try {
//         await updateDoc(doc(db, "STUDENTS", uid), {
//           access: !adminAccess,
//           lastModifiedBy: teacherData?.uid || studentData?.uid,
//           lastModifiedAt: serverTimestamp()
//         });
        
//         toast({
//           title: adminAccess ? "Admin access removed" : "Admin access granted",
//           status: "success",
//           duration: 2000,
//           isClosable: true,
//         });
        
//         // Update local state immediately for better UX
//         setAdminAccess(!adminAccess);
//         onConfirmClose();
//       } catch (error) {
//         console.error("Error updating access:", error);
//         toast({
//           title: "Error updating access",
//           description: error.message,
//           status: "error",
//           duration: 3000,
//           isClosable: true,
//         });
//       }
//     };
    
//     // Pin/Unpin message handler
//     const togglePin = async () => {
//       setActionType('pin');
//       onConfirmOpen();
//     };
    
//     // Perform the pin/unpin action
//     const confirmTogglePin = async () => {
//       try {
//         // In a real implementation, you would update a "pinnedMessages" collection or field
//         // For demo purposes, we'll just show a toast
//         setIsPinned(!isPinned);
//         toast({
//           title: isPinned ? "Message unpinned" : "Message pinned",
//           status: "success",
//           duration: 2000,
//           isClosable: true,
//         });
//         onConfirmClose();
//       } catch (error) {
//         console.error("Error pinning message:", error);
//         toast({
//           title: "Error",
//           description: error.message,
//           status: "error",
//           duration: 3000,
//           isClosable: true,
//         });
//       }
//     };
  
//     // Fetch user data and access status
//     useEffect(() => {
//       const getAccessData = async () => {
//         try {
//           const userDoc = await getDoc(doc(db, 'STUDENTS', uid));
//           if (userDoc.exists()) {
//             const userdata = userDoc.data();
//             setUserData(userdata);
//             setAdminAccess(userdata.access);
//           }
//         } catch (error) {
//           console.error("Error fetching user data:", error);
//         }
//       };
      
//       getAccessData();
//     }, [uid, access, db]);
  
//     // Show user profile modal
//     const showUserInfo = () => {
//       onUserInfoOpen();
//     };
  
//     // Animation variants
//     const messageVariants = {
//       initial: { 
//         opacity: 0, 
//         y: 20,
//         scale: 0.95
//       },
//       animate: { 
//         opacity: 1, 
//         y: 0,
//         scale: 1,
//         transition: {
//           type: "spring",
//           damping: 15,
//           stiffness: 300
//         }
//       }
//     };
  
//     // Get confirmation modal title and description based on action type
//     const getConfirmationDetails = () => {
//       if (actionType === 'admin') {
//         return {
//           title: adminAccess ? "Remove Admin Access" : "Grant Admin Access",
//           description: adminAccess 
//             ? `Are you sure you want to remove admin access from ${name}?` 
//             : `Are you sure you want to grant admin access to ${name}?`
//         };
//       } else if (actionType === 'pin') {
//         return {
//           title: isPinned ? "Unpin Message" : "Pin Message",
//           description: isPinned 
//             ? "Are you sure you want to unpin this message?" 
//             : "Are you sure you want to pin this message for everyone to see?"
//         };
//       } else if (actionType === 'delete') {
//         return {
//           title: "Delete Message",
//           description: "Are you sure you want to delete this message? This action cannot be undone."
//         };
//       }
      
//       return { title: "Confirm Action", description: "Are you sure you want to perform this action?" };
//     };
  
//     return (
//       <MotionBox
//         w="100%"
//         display="flex"
//         justifyContent={user === "me" ? "flex-end" : "flex-start"}
//         mb={4}
//         initial="initial"
//         animate="animate"
//         variants={messageVariants}
//       >
//         {user !== "me" && (
//           <Avatar 
//             size="sm" 
//             name={name}
//             src={url} 
//             bg={nameColor}
//             mr={2}
//             onClick={showUserInfo}
//             cursor="pointer"
//           />
//         )}
        
//         <Flex 
//           direction="column"
//           alignItems={user === "me" ? "flex-end" : "flex-start"}
//           maxW="70%"
//         >
//           <HStack mb={1} spacing={2}>
//             <Text 
//               fontSize="xs" 
//               fontWeight="bold" 
//               color={nameColor}
//               cursor="pointer"
//               onClick={showUserInfo}
//               _hover={{ textDecoration: "underline" }}
//             >
//               @{name}
//               {adminAccess && (
//                 <Badge ml={1} colorScheme="green" fontSize="2xs">
//                   ADMIN
//                 </Badge>
//               )}
//             </Text>
            
//             {user !== "other" && (
//               <Text 
//                 fontSize="xs" 
//                 color="gray.500"
//               >
//                 {time}
//               </Text>
//             )}
//           </HStack>
          
//           <Box
//             bg={isPinned ? pinnedBg : user === "me" ? myMessageBg : otherMessageBg}
//             borderWidth="1px"
//             borderColor={isPinned ? pinnedBorder : user === "me" ? myMessageBorder : otherMessageBorder}
//             borderRadius="lg"
//             p={3}
//             position="relative"
//             boxShadow={isPinned ? "md" : "sm"}
//           >
//             {isPinned && (
//               <Box position="absolute" top="-8px" right="8px">
//                 <Badge colorScheme="yellow" variant="solid" borderRadius="full" px={2}>
//                   <HStack spacing={1}>
//                     <StarIcon boxSize={2} />
//                     <Text fontSize="xs">Pinned</Text>
//                   </HStack>
//                 </Badge>
//               </Box>
//             )}
            
//             {(isCurrentUserAdmin || isTeacher) && (
//               <Box position="absolute" top={2} right={2} zIndex={2}>
//                 <Menu>
//                   <MenuButton
//                     as={IconButton}
//                     icon={<ChevronDownIcon />}
//                     variant="ghost"
//                     size="xs"
//                     borderRadius="full"
//                     aria-label="Options"
//                   />
//                   <MenuList fontSize="sm">
//                     <MenuItem icon={<DeleteIcon />} onClick={() => {
//                       setActionType('delete');
//                       onConfirmOpen();
//                     }}>
//                       Delete Message
//                     </MenuItem>
                    
//                     {isTeacher && (
//                       <MenuItem 
//                         icon={adminAccess ? <CloseIcon /> : <CheckIcon />} 
//                         onClick={admintoggle}
//                       >
//                         {adminAccess ? "Remove Admin Access" : "Make Admin"}
//                       </MenuItem>
//                     )}
                    
//                     {/* Allow admins to make other users admin only if current user is a teacher */}
//                     {isCurrentUserAdmin && !isTeacher && studentData?.access && (
//                       <MenuItem 
//                         icon={adminAccess ? <CloseIcon /> : <CheckIcon />} 
//                         onClick={admintoggle}
//                         isDisabled={user === "me"} // Can't change own admin status
//                       >
//                         {adminAccess ? "Remove Admin Access" : "Make Admin"}
//                       </MenuItem>
//                     )}
                    
//                     <MenuItem 
//                       icon={isPinned ? <CloseIcon /> : <StarIcon />} 
//                       onClick={togglePin}
//                     >
//                       {isPinned ? "Unpin Message" : "Pin Message"}
//                     </MenuItem>
//                   </MenuList>
//                 </Menu>
//               </Box>
//             )}
  
//             {/* File content display */}
//             {isPDF && (
//               <VStack align="center" mb={2}>
//                 <Tooltip label={`Open ${fileName}.pdf`}>
//                   <Box 
//                     as="a" 
//                     href={iurl} 
//                     target="_blank" 
//                     rel="noreferrer"
//                     _hover={{ transform: 'scale(1.05)' }}
//                     transition="all 0.2s"
//                   >
//                     <Image 
//                       src={pdficon} 
//                       alt="PDF" 
//                       w="50px" 
//                       h="50px" 
//                     />
//                   </Box>
//                 </Tooltip>
//                 <Text fontSize="xs" color="gray.500">
//                   {fileName}.pdf
//                 </Text>
//               </VStack>
//             )}
  
//             {isVideo && (
//               <Box position="relative" maxW="100%" mb={2}>
//                 <Box 
//                   borderRadius="md" 
//                   overflow="hidden"
//                   boxShadow="md"
//                 >
//                   <video 
//                     controls 
//                     width="100%" 
//                     style={{ borderRadius: '0.375rem' }}
//                     onClick={onMediaOpen}
//                   >
//                     <source src={iurl} type="video/mp4" />
//                     Your browser does not support the video tag.
//                   </video>
//                 </Box>
                
//                 <IconButton
//                   icon={<DownloadIcon />}
//                   size="sm"
//                   position="absolute"
//                   bottom={2}
//                   right={2}
//                   borderRadius="full"
//                   onClick={() => window.open(iurl, '_blank')}
//                   aria-label="Download video"
//                 />
                
//                 <Modal isOpen={isMediaOpen} onClose={onMediaClose} size="4xl">
//                   <ModalOverlay />
//                   <ModalContent>
//                     <ModalHeader>Video</ModalHeader>
//                     <ModalCloseButton />
//                     <ModalBody pb={6}>
//                       <video 
//                         controls 
//                         width="100%" 
//                         autoPlay
//                       >
//                         <source src={iurl} type="video/mp4" />
//                         Your browser does not support the video tag.
//                       </video>
//                     </ModalBody>
//                   </ModalContent>
//                 </Modal>
//               </Box>
//             )}
  
//             {isImage && (
//               <Box 
//                 mb={2} 
//                 borderRadius="md" 
//                 overflow="hidden"
//                 boxShadow="md"
//                 cursor="pointer"
//                 onClick={onMediaOpen}
//                 _hover={{ transform: 'scale(1.02)' }}
//                 transition="all 0.2s"
//               >
//                 <Image 
//                   src={iurl} 
//                   alt="Shared image" 
//                   maxH="200px"
//                   borderRadius="md"
//                 />
                
//                 <Modal isOpen={isMediaOpen} onClose={onMediaClose} size="4xl">
//                   <ModalOverlay />
//                   <ModalContent bg="transparent" boxShadow="none">
//                     <ModalCloseButton color="white" />
//                     <ModalBody display="flex" justifyContent="center">
//                       <Image 
//                         src={iurl} 
//                         alt="Shared image" 
//                         maxH="90vh"
//                       />
//                     </ModalBody>
//                   </ModalContent>
//                 </Modal>
//               </Box>
//             )}
  
//             {isAudio && (
//               <HStack mb={2} spacing={2} align="center">
//                 <Box 
//                   borderRadius="md" 
//                   overflow="hidden"
//                   boxShadow="sm"
//                   p={1}
//                   bg={audioBoxBg}
//                 >
//                   <audio controls style={{ maxWidth: '200px' }}>
//                     <source src={iurl} type="audio/mpeg" />
//                     Your browser does not support the audio element.
//                   </audio>
//                 </Box>
//                 <IconButton
//                   icon={<DownloadIcon />}
//                   size="xs"
//                   borderRadius="full"
//                   as="a"
//                   href={iurl}
//                   download
//                   aria-label="Download audio"
//                 />
//               </HStack>
//             )}
  
//             {/* Message text */}
//             {text && (
//               <Text fontSize="sm">{text}</Text>
//             )}
//           </Box>
//         </Flex>
        
//         {user === "me" && (
//           <Avatar 
//             size="sm" 
//             name={name}
//             src={url}
//             bg={nameColor}
//             ml={2}
//             cursor="pointer"
//             onClick={showUserInfo}
//           />
//         )}
        
//         {user !== "me" && user !== "other" && (
//           <Text 
//             fontSize="xs" 
//             color="gray.500" 
//             alignSelf="flex-end"
//             ml={2}
//           >
//             {time}
//           </Text>
//         )}
        
//         {/* Confirmation Modal */}
//         <Modal isOpen={isConfirmOpen} onClose={onConfirmClose}>
//           <ModalOverlay />
//           <ModalContent>
//             <ModalHeader>{getConfirmationDetails().title}</ModalHeader>
//             <ModalCloseButton />
//             <ModalBody>
//               <Text>{getConfirmationDetails().description}</Text>
//             </ModalBody>
//             <ModalFooter>
//               <Button variant="ghost" mr={3} onClick={onConfirmClose}>
//                 Cancel
//               </Button>
//               <Button 
//                 colorScheme={
//                   actionType === 'delete' ? 'red' : 
//                   actionType === 'admin' ? (adminAccess ? 'red' : 'green') : 
//                   'blue'
//                 } 
//                 onClick={
//                   actionType === 'delete' ? handleDelete :
//                   actionType === 'admin' ? confirmAdminToggle :
//                   actionType === 'pin' ? confirmTogglePin :
//                   onConfirmClose
//                 }
//               >
//                 Confirm
//               </Button>
//             </ModalFooter>
//           </ModalContent>
//         </Modal>
        
//         {/* User Info Modal */}
//         <Modal isOpen={isUserInfoOpen} onClose={onUserInfoClose} isCentered>
//           <ModalOverlay />
//           <ModalContent>
//             <ModalHeader>User Information</ModalHeader>
//             <ModalCloseButton />
//             <ModalBody>
//               <VStack spacing={4} align="center">
//                 <Avatar size="xl" name={name} src={url} />
//                 <Heading size="md">{name}</Heading>
                
//                 <HStack>
//                   <Badge colorScheme={adminAccess ? "green" : "gray"}>
//                     {adminAccess ? "Admin" : "Member"}
//                   </Badge>
                  
//                   {user === "me" && (
//                     <Badge colorScheme="blue">You</Badge>
//                   )}
//                 </HStack>
                
//                 <Divider />
                
//                 <Box w="full">
//                   <HStack justify="space-between" w="full" mb={2}>
//                     <Text fontWeight="medium">User ID:</Text>
//                     <Text>{uid}</Text>
//                   </HStack>
                  
//                   {userData.email && (
//                     <HStack justify="space-between" w="full" mb={2}>
//                       <Text fontWeight="medium">Email:</Text>
//                       <Text>{userData.email}</Text>
//                     </HStack>
//                   )}
                  
//                   {userData.regd && (
//                     <HStack justify="space-between" w="full" mb={2}>
//                       <Text fontWeight="medium">Registration:</Text>
//                       <Text>{userData.regd}</Text>
//                     </HStack>
//                   )}
                  
//                   {userData.semester && userData.section && (
//                     <HStack justify="space-between" w="full" mb={2}>
//                       <Text fontWeight="medium">Class:</Text>
//                       <Text>
//                         {userData.semester.replace('semester', 'Semester ')} {userData.section}
//                       </Text>
//                     </HStack>
//                   )}
//                 </Box>
//               </VStack>
//             </ModalBody>
//             <ModalFooter>
//               <Button onClick={onUserInfoClose}>Close</Button>
//             </ModalFooter>
//           </ModalContent>
//         </Modal>
//       </MotionBox>
//     );
//   }
  
//   export default Message;