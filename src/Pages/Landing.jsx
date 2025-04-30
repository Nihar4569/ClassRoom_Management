// File location: src/Pages/Landing.jsx
import React, { useState, useContext, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Text, 
  Heading, 
  VStack, 
  HStack, 
  Flex, 
  Image, 
  useColorModeValue,
  SimpleGrid
} from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Context } from '..';
import Loader from '../Components/Loader';
import ModernHeader from '../Components/ModernHeader';
import ModernButton from '../Components/ModernButton';

// Create motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

export default function Landing() {
  const { teacherData, studentData, loader } = useContext(Context);
  const navigate = useNavigate();
  const controls = useAnimation();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardHoverBg = useColorModeValue('gray.50', 'gray.700');
  const accentColor = useColorModeValue('brand.500', 'brand.400');

  const studentHandler = () => navigate('/student');
  const teacherHandler = () => navigate('/teacher');
  const adminHandler = () => navigate('/admin');

  useEffect(() => {
    controls.start({ opacity: 1, y: 0, transition: { duration: 0.5 } });
  }, [controls]);

  useEffect(() => {
    if (teacherData) navigate("/teacherdash");
    if (studentData) navigate("/studentdash");
  }, [teacherData, studentData, navigate]);

  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    },
  };

  const cardAnimation = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    }
  };

  return (
    <Box bg={bgColor} minH="100vh">
      <ModernHeader />
      
      <Container maxW="container.xl" py={10}>
        {loader ? (
          <Flex height="70vh" justify="center" align="center">
            <Loader />
          </Flex>
        ) : (
          <MotionFlex
            direction="column"
            align="center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <MotionBox
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              mb={12}
              textAlign="center"
            >
              <MotionHeading
                fontSize={{ base: "3xl", md: "5xl" }}
                fontWeight="bold"
                bgGradient="linear(to-r, brand.500, accent.500)"
                bgClip="text"
                pb={2}
              >
                Welcome to Classroom Hub
              </MotionHeading>
              <MotionText 
                fontSize={{ base: "md", md: "xl" }}
                opacity={0.8}
                maxW="700px"
                mx="auto"
                mt={4}
              >
                A modern platform for seamless classroom management, real-time communication, and interactive learning
              </MotionText>
            </MotionBox>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} width="full">
              {/* Student Card */}
              <MotionBox
                as="article"
                height="320px"
                bg={cardBg}
                p={6}
                borderRadius="xl"
                boxShadow="md"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                variants={cardAnimation}
                initial="rest"
                whileHover="hover"
                cursor="pointer"
                onClick={studentHandler}
              >
                <VStack spacing={4} align="center">
                  <Box 
                    bg="blue.100" 
                    p={4} 
                    borderRadius="full" 
                    color="brand.500"
                    fontSize="3xl"
                  >
                    👨‍🎓
                  </Box>
                  <Heading size="lg" color={accentColor}>Student Portal</Heading>
                  <Text textAlign="center">
                    Access your classes, join discussions, and collaborate with peers in real-time
                  </Text>
                </VStack>
                <ModernButton colorScheme="brand" size="lg" mt={4} w="full">
                  Login / Sign Up
                </ModernButton>
              </MotionBox>

              {/* Teacher Card */}
              <MotionBox
                as="article"
                height="320px"
                bg={cardBg}
                p={6}
                borderRadius="xl"
                boxShadow="md"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                variants={cardAnimation}
                initial="rest"
                whileHover="hover"
                cursor="pointer"
                onClick={teacherHandler}
              >
                <VStack spacing={4} align="center">
                  <Box 
                    bg="green.100" 
                    p={4} 
                    borderRadius="full" 
                    color="green.500"
                    fontSize="3xl"
                  >
                    👨‍🏫
                  </Box>
                  <Heading size="lg" color="green.500">Teacher Portal</Heading>
                  <Text textAlign="center">
                    Manage your classes, share resources, and engage with students effectively
                  </Text>
                </VStack>
                <ModernButton colorScheme="green" size="lg" mt={4} w="full">
                  Login / Sign Up
                </ModernButton>
              </MotionBox>

              {/* Admin Card */}
              <MotionBox
                as="article"
                height="320px"
                bg={cardBg}
                p={6}
                borderRadius="xl"
                boxShadow="md"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                variants={cardAnimation}
                initial="rest"
                whileHover="hover"
                cursor="pointer"
                onClick={adminHandler}
              >
                <VStack spacing={4} align="center">
                  <Box 
                    bg="red.100" 
                    p={4} 
                    borderRadius="full" 
                    color="red.500"
                    fontSize="3xl"
                  >
                    👨‍💼
                  </Box>
                  <Heading size="lg" color="red.500">Admin Portal</Heading>
                  <Text textAlign="center">
                    Control access permissions, monitor activities, and manage the platform
                  </Text>
                </VStack>
                <ModernButton colorScheme="red" size="lg" mt={4} w="full">
                  Admin Access
                </ModernButton>
              </MotionBox>
            </SimpleGrid>

            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              mt={16}
              textAlign="center"
            >
              <Heading size="md" mb={4}>Powerful Features</Heading>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} maxW="800px">
                <Feature icon="💬" title="Real-time Chat" />
                <Feature icon="🖥️" title="Screen Sharing" />
                <Feature icon="📁" title="File Sharing" />
                <Feature icon="🔐" title="Access Control" />
              </SimpleGrid>
            </MotionBox>
          </MotionFlex>
        )}
      </Container>
    </Box>
  );
}

// Feature component for the bottom section
const Feature = ({ icon, title }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  
  return (
    <MotionBox
      p={4}
      bg={bgColor}
      borderRadius="lg"
      boxShadow="sm"
      textAlign="center"
      whileHover={{ 
        y: -5, 
        boxShadow: "0 10px 20px rgba(0,0,0,0.1)" 
      }}
      transition={{ duration: 0.2 }}
    >
      <Text fontSize="2xl" mb={2}>{icon}</Text>
      <Text fontWeight="medium">{title}</Text>
    </MotionBox>
  );
};