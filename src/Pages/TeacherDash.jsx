// File location: src/Pages/TeacherDash.jsx
import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  VStack,
  Text,
  HStack,
  Heading,
  useColorModeValue,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Divider,
  Flex,
  Badge,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Tooltip,
  IconButton
} from '@chakra-ui/react';
import { 
  AddIcon, 
  ChevronDownIcon, 
  InfoIcon, 
  CheckIcon, 
  CloseIcon, 
  DeleteIcon 
} from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import { Context } from '..';
import ModernHeader from '../Components/ModernHeader';
import { doc, getDoc, getFirestore, setDoc, collection, query, onSnapshot, deleteDoc } from 'firebase/firestore';
import { app } from '../firebase';
import { useNavigate } from 'react-router-dom';
import ModernButton from '../Components/ModernButton';
import { FaChalkboardTeacher, FaRegCalendarAlt, FaBook, FaUserGraduate } from 'react-icons/fa';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionCard = motion(Card);

export default function TeacherDash() {
  // Firebase
  const db = getFirestore(app);
  
  // Context and navigation
  const { teacherData, chatId, setChatId, setTeacherData } = useContext(Context);
  const navigate = useNavigate();
  const toast = useToast();
  
  // Form states
  const [semester, setSemester] = useState("");
  const [section, setSection] = useState("");
  const [subject, setSubject] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Classes state
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  
  // Modal disclosure
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Theme colors - move all useColorModeValue calls to the top level
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('green.50', 'green.900');
  const highlightColor = useColorModeValue('green.500', 'green.300');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const cardHeaderBg = useColorModeValue('green.50', 'green.900');
  const cardFooterBg = useColorModeValue('gray.50', 'gray.700');
  
  // Fetch teacher's classes
  useEffect(() => {
    if (!teacherData || !teacherData.access) return;
    
    // Structure to store all classes
    const allClasses = [];
    
    // For each semester
    const fetchClasses = async () => {
      for (let sem = 1; sem <= 8; sem++) {
        const semesterStr = `semester${sem}`;
        
        // Loop through possible sections (A-F)
        for (let secCode = 65; secCode <= 70; secCode++) {
          const sectionStr = String.fromCharCode(secCode);
          const classPathBase = `${semesterStr}+${sectionStr}`;
          
          try {
            // Query all documents in this collection
            const q = query(collection(db, classPathBase));
            
            onSnapshot(q, (snapshot) => {
              if (!snapshot.empty) {
                // Add each class to our array
                snapshot.docs.forEach(doc => {
                  if (doc.id && doc.data()) {
                    allClasses.push({
                      id: doc.id,
                      semester: semesterStr,
                      section: sectionStr,
                      chatId: `${classPathBase}+${doc.id}`,
                      subject: doc.id
                    });
                  }
                });
                
                // Update state with sorted classes
                setClasses([...allClasses].sort((a, b) => {
                  // Sort by semester first
                  const semA = parseInt(a.semester.replace('semester', ''));
                  const semB = parseInt(b.semester.replace('semester', ''));
                  
                  if (semA !== semB) return semA - semB;
                  
                  // Then by section
                  if (a.section !== b.section) return a.section.localeCompare(b.section);
                  
                  // Then by subject
                  return a.subject.localeCompare(b.subject);
                }));
              }
            });
          } catch (error) {
            console.error(`Error fetching classes for ${classPathBase}:`, error);
          }
        }
      }
    };
    
    fetchClasses();
  }, [db, teacherData]);
  
  // Function to validate the class creation form
  const validateForm = () => {
    const newErrors = {};
    
    if (!semester) newErrors.semester = "Please select a semester";
    if (!section || section.trim() === "") newErrors.section = "Section is required";
    if (!subject || subject.trim() === "") newErrors.subject = "Subject is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Function to handle class creation
  const classHandler = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    const chatId = `${semester}+${section.toUpperCase()}+${subject.toUpperCase()}`;
    const sectionId = `${semester}+${section.toUpperCase()}`;
    
    try {
      const sectionDoc = await getDoc(doc(db, sectionId, subject.toUpperCase()));
      
      if (!sectionDoc.exists()) {
        await setDoc(doc(db, sectionId, subject.toUpperCase()), {
          chatId: chatId,
          createdBy: teacherData.uid,
          createdAt: new Date().toISOString(),
        });
      }
      
      setChatId(chatId);
      
      toast({
        title: "Class created",
        description: `${section} ${subject} is ready`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      navigate("/lobby");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to select and enter a class
  const enterClass = (classData) => {
    setChatId(classData.chatId);
    navigate("/lobby");
  };
  
  // Function to handle class deletion
  const handleDeleteClass = async () => {
    if (!selectedClass) return;
    
    try {
      const sectionId = `${selectedClass.semester}+${selectedClass.section}`;
      
      await deleteDoc(doc(db, sectionId, selectedClass.subject));
      
      toast({
        title: "Class deleted",
        description: `${selectedClass.section} ${selectedClass.subject} has been removed`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      
      // Update local state
      setClasses(classes.filter(c => c.chatId !== selectedClass.chatId));
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete class: ${error.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
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
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 100
      }
    },
    hover: {
      y: -5,
      boxShadow: "lg",
      borderColor: "green.300",
      transition: {
        duration: 0.2
      }
    }
  };
  
  // If not authenticated or access not granted, redirect
  useEffect(() => {
    if (!teacherData) {
      navigate("/");
    } else if (!teacherData.access) {
      toast({
        title: "Access denied",
        description: "Your account is still pending approval by an administrator.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      navigate("/");
    }
  }, [teacherData, navigate, toast]);
  
  if (!teacherData || !teacherData.access) {
    return null;
  }
  
  // Custom class card component to avoid Hook rules violations
  const ClassCard = ({ classItem, onDeleteClick, onCardClick }) => (
    <MotionCard
      variants={cardVariants}
      whileHover="hover"
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      overflow="hidden"
      cursor="pointer"
      onClick={onCardClick}
      h="100%"
    >
      <CardHeader bg={cardHeaderBg} p={4}>
        <Flex justify="space-between" align="center">
          <Heading size="md">
            {classItem.subject}
          </Heading>
          <IconButton
            icon={<DeleteIcon />}
            variant="ghost"
            colorScheme="red"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick(classItem);
            }}
            aria-label="Delete class"
          />
        </Flex>
      </CardHeader>
      
      <CardBody py={4}>
        <VStack align="start" spacing={2}>
          <HStack>
            <FaRegCalendarAlt color="currentColor" />
            <Text>
              Semester {classItem.semester.replace('semester', '')}
            </Text>
          </HStack>
          
          <HStack>
            <FaUserGraduate color="currentColor" />
            <Text>
              Section {classItem.section}
            </Text>
          </HStack>
        </VStack>
      </CardBody>
      
      <CardFooter 
        bg={cardFooterBg}
        borderTopWidth="1px"
        borderColor={borderColor}
        p={3}
      >
        <Button 
          colorScheme="green" 
          size="sm" 
          width="full"
          leftIcon={<FaBook />}
        >
          Enter Classroom
        </Button>
      </CardFooter>
    </MotionCard>
  );
  
  // Empty state component
  const EmptyState = () => (
    <MotionBox 
      variants={itemVariants}
      bg={cardBg}
      p={8}
      borderRadius="xl"
      boxShadow="md"
      borderWidth="1px"
      borderColor={borderColor}
      textAlign="center"
    >
      <VStack spacing={4}>
        <FaChalkboardTeacher size={50} color="currentColor" />
        <Heading size="md">No Classes Yet</Heading>
        <Text color={textColor}>
          Create your first class using the form on the left
        </Text>
        <ModernButton
          colorScheme="green"
          leftIcon={<AddIcon />}
          size="md"
          onClick={() => {
            // Scroll to create form on mobile or focus on semester field
            const semesterSelect = document.getElementById('semester-select');
            if (semesterSelect) {
              semesterSelect.focus();
            }
          }}
        >
          Create Your First Class
        </ModernButton>
      </VStack>
    </MotionBox>
  );
  
  return (
    <Box minH="100vh" bg={bgColor}>
      <ModernHeader />
      
      <Container maxW="container.xl" py={8}>
        <MotionFlex
          direction={{ base: "column", lg: "row" }}
          gap={8}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Teacher info and class creation form */}
          <MotionBox
            variants={itemVariants}
            w={{ base: "100%", lg: "350px" }}
            position={{ base: "relative", lg: "sticky" }}
            top={{ base: 0, lg: "100px" }}
            alignSelf={{ base: "auto", lg: "flex-start" }}
          >
            <Box
              bg={cardBg}
              p={6}
              borderRadius="xl"
              boxShadow="md"
              borderWidth="1px"
              borderColor={borderColor}
              mb={6}
            >
              <VStack align="flex-start" spacing={4}>
                <HStack w="full" justify="space-between">
                  <Heading size="md" color={highlightColor}>Teacher Profile</Heading>
                  <Badge colorScheme="green">Active</Badge>
                </HStack>
                
                <VStack align="flex-start" w="full" spacing={1}>
                  <Text fontWeight="bold" fontSize="xl">{teacherData.name}</Text>
                  <Text color={textColor}>Employee ID: {teacherData.emid}</Text>
                </VStack>
                
                <Divider />
                
                <VStack align="stretch" w="full" spacing={1}>
                  <Text fontWeight="bold" fontSize="sm" color={textColor}>
                    CLASSES
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">{classes.length}</Text>
                </VStack>
              </VStack>
            </Box>
            
            <Box
              as="form"
              onSubmit={classHandler}
              bg={cardBg}
              p={6}
              borderRadius="xl"
              boxShadow="md"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <VStack align="stretch" spacing={4}>
                <Heading size="md" color={highlightColor}>Create New Class</Heading>
                
                <FormControl isInvalid={errors.semester}>
                  <FormLabel>Semester</FormLabel>
                  <Menu>
                    <MenuButton
                      as={Button}
                      rightIcon={<ChevronDownIcon />}
                      w="full"
                      variant="outline"
                      textAlign="left"
                      colorScheme="green"
                      id="semester-select"
                    >
                      {semester ? `Semester ${semester.replace('semester', '')}` : 'Select Semester'}
                    </MenuButton>
                    <MenuList>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <MenuItem 
                          key={sem} 
                          onClick={() => setSemester(`semester${sem}`)}
                          fontWeight={semester === `semester${sem}` ? "bold" : "normal"}
                        >
                          {`Semester ${sem}`}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                  <FormErrorMessage>{errors.semester}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={errors.section}>
                  <FormLabel>Section</FormLabel>
                  <Input
                    value={section}
                    onChange={(e) => setSection(e.target.value.toUpperCase())}
                    placeholder="Enter section (e.g. A, B, C)"
                    maxLength={1}
                  />
                  <FormErrorMessage>{errors.section}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={errors.subject}>
                  <FormLabel>Subject</FormLabel>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value.toUpperCase())}
                    placeholder="Enter subject code"
                  />
                  <FormErrorMessage>{errors.subject}</FormErrorMessage>
                </FormControl>
                
                <ModernButton
                  type="submit"
                  colorScheme="green"
                  size="lg"
                  isLoading={isLoading}
                  loadingText="Creating"
                  leftIcon={<AddIcon />}
                  mt={2}
                >
                  Create Class
                </ModernButton>
              </VStack>
            </Box>
          </MotionBox>
          
          {/* Classes listing */}
          <MotionBox variants={itemVariants} flex={1}>
            <Box mb={6}>
              <Heading 
                size="lg" 
                mb={2}
                bgGradient="linear(to-r, green.500, teal.500)"
                bgClip="text"
              >
                Your Classes
              </Heading>
              <Text color={textColor}>
                Manage all your active classroom sessions
              </Text>
            </Box>
            
            {classes.length === 0 ? (
              <EmptyState />
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
                {classes.map((classItem) => (
                  <ClassCard 
                    key={classItem.chatId}
                    classItem={classItem}
                    onDeleteClick={(item) => {
                      setSelectedClass(item);
                      onOpen();
                    }}
                    onCardClick={() => enterClass(classItem)}
                  />
                ))}
              </SimpleGrid>
            )}
          </MotionBox>
        </MotionFlex>
      </Container>
      
      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Class</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedClass && (
              <Text>
                Are you sure you want to delete the class <strong>{selectedClass.subject}</strong> (Semester {selectedClass.semester.replace('semester', '')}, Section {selectedClass.section})?
                This will remove all class data and messages.
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeleteClass}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}