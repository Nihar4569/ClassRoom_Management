// File location: src/Pages/StudentDash.jsx
import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Flex,
  Divider,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Avatar
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Context } from '..';
import { collection, getFirestore, onSnapshot, query } from 'firebase/firestore';
import { app } from '../firebase';
import { useNavigate } from 'react-router-dom';
import ModernHeader from '../Components/ModernHeader';
import { FaBook, FaChalkboardTeacher, FaComments, FaDesktop } from 'react-icons/fa';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionCard = motion(Card);

export default function StudentDash() {
  // Context and state
  const { studentData, chatId, setChatId } = useContext(Context);
  const [subjectsList, setSubjectsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Hooks
  const navigate = useNavigate();
  const toast = useToast();
  const db = getFirestore(app);
  
  // Theme colors
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const highlightColor = useColorModeValue('blue.500', 'blue.300');
  const statBg = useColorModeValue('blue.50', 'blue.900');
  
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
      borderColor: "blue.300",
      transition: {
        duration: 0.2
      }
    }
  };
  
  // Handle subject selection
  const handleSubjectSelect = (subjectId) => {
    if (!studentData) return;
    
    const classroomId = `${studentData.semester}+${studentData.section}+${subjectId}`;
    setChatId(classroomId);
    navigate("/lobby");
  };
  
  // Fetch subject list
  useEffect(() => {
    const fetchData = async () => {
      if (!studentData || !studentData.semester || !studentData.section) {
        if (!studentData) {
          navigate("/");
        }
        return;
      }
      
      setIsLoading(true);
      
      try {
        const classroomId = `${studentData.semester}+${studentData.section}`;
        const q = query(collection(db, classroomId));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const subjects = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setSubjectsList(subjects);
          setIsLoading(false);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching subjects:', error);
        toast({
          title: "Error fetching subjects",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [db, studentData, navigate, toast]);
  
  // Redirect if necessary
  useEffect(() => {
    if (chatId) {
      navigate("/classroom");
    }
  }, [chatId, navigate]);
  
  if (!studentData) {
    return null;
  }
  
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
          {/* Student info sidebar */}
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
                  <Heading size="md" color={highlightColor}>Student Profile</Heading>
                  <Badge colorScheme="blue">Active</Badge>
                </HStack>
                
                <HStack spacing={4}>
                  <Avatar 
                    name={studentData.name} 
                    bg="blue.500" 
                    color="white" 
                    size="lg" 
                  />
                  <VStack align="flex-start" spacing={0}>
                    <Text fontWeight="bold" fontSize="xl">{studentData.name}</Text>
                    <Text color={useColorModeValue('gray.600', 'gray.400')}>
                      Reg. No: {studentData.regd}
                    </Text>
                  </VStack>
                </HStack>
                
                <Divider />
                
                <SimpleGrid columns={2} w="full" spacing={4}>
                  <Stat bg={statBg} p={3} borderRadius="md">
                    <StatLabel>Semester</StatLabel>
                    <StatNumber>
                      {studentData.semester?.replace('semester', '') || '-'}
                    </StatNumber>
                  </Stat>
                  
                  <Stat bg={statBg} p={3} borderRadius="md">
                    <StatLabel>Section</StatLabel>
                    <StatNumber>
                      {studentData.section || '-'}
                    </StatNumber>
                  </Stat>
                </SimpleGrid>
                
                <Divider />
                
                <VStack align="stretch" w="full" spacing={3}>
                  <Heading size="sm">Quick Actions</Heading>
                  
                  <Button 
                    leftIcon={<FaDesktop />} 
                    colorScheme="blue" 
                    variant="outline"
                    onClick={() => navigate('/screen')}
                    size="sm"
                  >
                    Join Screen Share
                  </Button>
                </VStack>
              </VStack>
            </Box>
          </MotionBox>
          
          {/* Subjects listing */}
          <MotionBox variants={itemVariants} flex={1}>
            <Box mb={6}>
              <Heading 
                size="lg" 
                mb={2}
                bgGradient="linear(to-r, blue.500, purple.500)"
                bgClip="text"
              >
                Your Subjects
              </Heading>
              <Text color={useColorModeValue('gray.600', 'gray.400')}>
                Semester {studentData.semester?.replace('semester', '') || '-'} • Section {studentData.section || '-'}
              </Text>
            </Box>
            
            {isLoading ? (
              <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
                {[1, 2, 3].map((i) => (
                  <Box key={i} p={5} borderRadius="xl" boxShadow="md">
                    <Skeleton height="30px" width="70%" mb={4} />
                    <Skeleton height="20px" width="40%" mb={2} />
                    <Skeleton height="20px" width="60%" mb={4} />
                    <Skeleton height="40px" width="100%" />
                  </Box>
                ))}
              </SimpleGrid>
            ) : subjectsList.length === 0 ? (
              <Alert
                status="info"
                variant="subtle"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                height="200px"
                borderRadius="xl"
              >
                <AlertIcon boxSize="40px" mr={0} mb={4} />
                <AlertTitle mb={2} fontSize="lg">No Subjects Available</AlertTitle>
                <AlertDescription maxWidth="sm">
                  No subjects have been created for your class yet. Please check back later or contact your teacher.
                </AlertDescription>
              </Alert>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
                {subjectsList.map((subject) => (
                  <MotionCard
                    key={subject.id}
                    variants={cardVariants}
                    whileHover="hover"
                    bg={cardBg}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="xl"
                    overflow="hidden"
                    h="100%"
                  >
                    <CardHeader bg={useColorModeValue('blue.50', 'blue.900')} p={4}>
                      <Heading size="md">
                        {subject.id}
                      </Heading>
                    </CardHeader>
                    
                    <CardBody py={4}>
                      <VStack align="start" spacing={3}>
                        <HStack>
                          <Icon as={FaChalkboardTeacher} color={highlightColor} />
                          <Text>
                            Class discussions and materials
                          </Text>
                        </HStack>
                        
                        <HStack>
                          <Icon as={FaComments} color={highlightColor} />
                          <Text>
                            Real-time communication
                          </Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                    
                    <CardFooter 
                      bg={useColorModeValue('gray.50', 'gray.700')} 
                      borderTopWidth="1px"
                      borderColor={borderColor}
                      p={3}
                    >
                      <Button 
                        colorScheme="blue" 
                        size="md" 
                        width="full"
                        leftIcon={<FaBook />}
                        onClick={() => handleSubjectSelect(subject.id)}
                      >
                        Enter Classroom
                      </Button>
                    </CardFooter>
                  </MotionCard>
                ))}
              </SimpleGrid>
            )}
          </MotionBox>
        </MotionFlex>
      </Container>
    </Box>
  );
}