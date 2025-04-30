// File location: src/Pages/Teacher.jsx
import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Input,
  Text,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  useColorModeValue,
  Heading,
  Divider,
  FormErrorMessage,
  useToast,
  IconButton,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Image
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewIcon, ViewOffIcon, InfoIcon } from '@chakra-ui/icons';
import { addDoc, collection, doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { app, storage } from "../firebase";
import { getAuth } from 'firebase/auth';
import { useCookies } from 'react-cookie';
import { Context } from '..';
import { Navigate } from 'react-router-dom';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { v4 } from 'uuid';
import ModernHeader from '../Components/ModernHeader';
import ModernButton from '../Components/ModernButton';
import { FaCamera, FaIdCard, FaUpload } from 'react-icons/fa';

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

export default function Teacher() {
  // Auth states
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states for signup
  const [teacherName, setTeacherName] = useState("");
  const [teacherIdFile, setTeacherIdFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [teacherPassword, setTeacherPassword] = useState("");
  const [emid, setEmid] = useState("");
  const [idurl, setIdurl] = useState("");
  
  // Form states for login
  const [lemid, setLemid] = useState("");
  const [lpassword, setLpassword] = useState("");
  
  // Form validation
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Context and cookies
  const { teacherData, setTeacherData } = useContext(Context);
  const [cookies, setCookie] = useCookies(['ttoken']);
  
  // Modal for terms
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Toast notifications
  const toast = useToast();
  
  // Firebase initialization
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  // Theme colors
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const activeCardBg = useColorModeValue('blue.50', 'blue.900');
  const inactiveCardBg = useColorModeValue('gray.50', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.700');
  
  const toggleForm = () => {
    setIsLogin(!isLogin);
    setErrors({});
  };
  
  const validateForm = (isLoginForm) => {
    const newErrors = {};
    
    if (isLoginForm) {
      if (!lemid) newErrors.lemid = "Employee ID is required";
      if (!lpassword) newErrors.lpassword = "Password is required";
    } else {
      if (!teacherName) newErrors.teacherName = "Full name is required";
      if (!emid) newErrors.emid = "Employee ID is required";
      if (!teacherIdFile) newErrors.teacherIdFile = "ID card upload is required";
      if (!teacherPassword) newErrors.teacherPassword = "Password is required";
      if (teacherPassword && teacherPassword.length < 6) {
        newErrors.teacherPassword = "Password must be at least 6 characters";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleIdFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setTeacherIdFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Upload ID file to storage
  const idupload = async (file) => {
    try {
      const imageRef = ref(storage, `TeacherID/${file.name + v4()}`);
      const snapshot = await uploadBytes(imageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setIdurl(url);
      return url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };
  
  // Register new teacher
  const teacherRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm(false)) return;
    
    setIsSubmitting(true);
    
    try {
      const teacherDoc = await getDoc(doc(db, 'TEACHERS', emid));
      
      if (!teacherDoc.exists()) {
        // Upload ID file and get URL
        const uploadedUrl = await idupload(teacherIdFile);
        
        // Create teacher document
        await setDoc(doc(db, 'TEACHERS', emid), {
          uid: emid,
          name: teacherName,
          emid: emid,
          idUrl: uploadedUrl,
          access: false,
          password: teacherPassword
        });
        
        toast({
          title: "Registration successful",
          description: `Welcome ${teacherName}! Your account is pending approval.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        
        // Reset form
        setTeacherName("");
        setTeacherIdFile(null);
        setPreviewUrl(null);
        setTeacherPassword("");
        setEmid("");
        setIsLogin(true);
      } else {
        toast({
          title: "Registration failed",
          description: "Teacher already exists with this ID. Please try logging in.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Login existing teacher
  const teacherLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm(true)) return;
    
    setIsSubmitting(true);
    
    try {
      const teacherDoc = await getDoc(doc(db, 'TEACHERS', lemid));
      
      if (teacherDoc.exists()) {
        const teacherData = teacherDoc.data();
        
        if (teacherData.access) {
          if (teacherData.password === lpassword) {
            setTeacherData(teacherData);
            setCookie('ttoken', String(lemid), { path: '/' });
            
            toast({
              title: "Login successful",
              description: `Welcome back, ${teacherData.name}!`,
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          } else {
            toast({
              title: "Login failed",
              description: "Incorrect password",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          }
        } else {
          toast({
            title: "Account pending",
            description: "Your account is still pending approval by an administrator.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
        }
      } else {
        toast({
          title: "Login failed",
          description: "Teacher not found with this ID",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
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
  
  const formVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 100
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.3
      }
    }
  };
  
  // Redirect if already logged in
  if (teacherData) {
    return <Navigate to="/teacherdash" />;
  }
  
  return (
    <Box minH="100vh" bg={bgColor}>
      <ModernHeader />
      
      <Container py={10} maxW="container.xl">
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <MotionBox variants={itemVariants} mb={8} textAlign="center">
            <Heading 
              fontSize={{ base: "3xl", md: "4xl" }}
              bgGradient="linear(to-r, green.500, teal.500)"
              bgClip="text"
              mb={2}
            >
              Teacher Portal
            </Heading>
            <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>
              {isLogin ? "Sign in to access your classrooms" : "Create a new teacher account"}
            </Text>
          </MotionBox>
          
          <HStack spacing={8} align="flex-start" justify="center" flexDir={{ base: "column", md: "row" }}>
            <AnimatePresence mode="wait">
              {isLogin ? (
                <MotionBox
                  key="login"
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  bg={activeCardBg}
                  p={8}
                  borderRadius="xl"
                  boxShadow="lg"
                  w={{ base: "full", md: "400px" }}
                >
                  <VStack spacing={4} as="form" onSubmit={teacherLogin}>
                    <Heading size="lg" textAlign="center" color="green.500">
                      Teacher Login
                    </Heading>
                    
                    <FormControl isInvalid={errors.lemid}>
                      <FormLabel>Employee ID</FormLabel>
                      <Input
                        value={lemid}
                        onChange={(e) => setLemid(e.target.value)}
                        placeholder="Enter your employee ID"
                        bg={inputBg}
                        size="lg"
                      />
                      <FormErrorMessage>{errors.lemid}</FormErrorMessage>
                    </FormControl>
                    
                    <FormControl isInvalid={errors.lpassword}>
                      <FormLabel>Password</FormLabel>
                      <InputGroup>
                        <Input
                          value={lpassword}
                          onChange={(e) => setLpassword(e.target.value)}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          bg={inputBg}
                          size="lg"
                        />
                        <InputRightElement h="full">
                          <IconButton
                            icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          />
                        </InputRightElement>
                      </InputGroup>
                      <FormErrorMessage>{errors.lpassword}</FormErrorMessage>
                    </FormControl>
                    
                    <ModernButton
                      type="submit"
                      colorScheme="green"
                      size="lg"
                      width="full"
                      mt={6}
                      isLoading={isSubmitting}
                      loadingText="Signing in"
                    >
                      Sign In
                    </ModernButton>
                  </VStack>
                </MotionBox>
              ) : (
                <MotionBox
                  key="register"
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  bg={activeCardBg}
                  p={8}
                  borderRadius="xl"
                  boxShadow="lg"
                  w={{ base: "full", md: "500px" }}
                >
                  <VStack spacing={4} as="form" onSubmit={teacherRegister}>
                    <Heading size="lg" textAlign="center" color="green.500">
                      Teacher Registration
                    </Heading>
                    
                    <FormControl isInvalid={errors.teacherName}>
                      <FormLabel>Full Name</FormLabel>
                      <Input
                        value={teacherName}
                        onChange={(e) => setTeacherName(e.target.value)}
                        placeholder="Enter your full name"
                        bg={inputBg}
                      />
                      <FormErrorMessage>{errors.teacherName}</FormErrorMessage>
                    </FormControl>
                    
                    <FormControl isInvalid={errors.emid}>
                      <FormLabel>Employee ID</FormLabel>
                      <Input
                        value={emid}
                        onChange={(e) => setEmid(e.target.value)}
                        type="text"
                        placeholder="Enter your employee ID"
                        bg={inputBg}
                      />
                      <FormErrorMessage>{errors.emid}</FormErrorMessage>
                    </FormControl>
                    
                    <FormControl isInvalid={errors.teacherPassword}>
                      <FormLabel>Password</FormLabel>
                      <InputGroup>
                        <Input
                          value={teacherPassword}
                          onChange={(e) => setTeacherPassword(e.target.value)}
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          bg={inputBg}
                        />
                        <InputRightElement h="full">
                          <IconButton
                            icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          />
                        </InputRightElement>
                      </InputGroup>
                      <FormErrorMessage>{errors.teacherPassword}</FormErrorMessage>
                    </FormControl>
                    
                    <FormControl isInvalid={errors.teacherIdFile}>
                      <FormLabel>Upload ID Card</FormLabel>
                      <HStack>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleIdFileChange}
                          display="none"
                          id="file-upload"
                        />
                        <Button
                          as="label"
                          htmlFor="file-upload"
                          leftIcon={<FaUpload />}
                          colorScheme="green"
                          variant="outline"
                          cursor="pointer"
                          flex={1}
                        >
                          {teacherIdFile ? "Change ID Image" : "Choose ID Image"}
                        </Button>
                        {previewUrl && (
                          <IconButton
                            icon={<FaCamera />}
                            colorScheme="green"
                            onClick={onOpen}
                            aria-label="Preview ID"
                          />
                        )}
                      </HStack>
                      {previewUrl && (
                        <Box mt={2} borderWidth={1} borderRadius="md" overflow="hidden" h="100px">
                          <Image src={previewUrl} alt="ID Preview" h="full" w="auto" mx="auto" objectFit="contain" />
                        </Box>
                      )}
                      <FormErrorMessage>{errors.teacherIdFile}</FormErrorMessage>
                    </FormControl>
                    
                    <HStack mt={2}>
                      <InfoIcon color="green.500" />
                      <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                        Your account will require admin approval before first login
                      </Text>
                    </HStack>
                    
                    <ModernButton
                      type="submit"
                      colorScheme="green"
                      size="lg"
                      width="full"
                      mt={4}
                      isLoading={isSubmitting}
                      loadingText="Registering"
                    >
                      Register
                    </ModernButton>
                  </VStack>
                </MotionBox>
              )}
            </AnimatePresence>
            
            <MotionBox
              variants={itemVariants}
              bg={inactiveCardBg}
              p={8}
              borderRadius="xl"
              boxShadow="md"
              w={{ base: "full", md: "300px" }}
              mt={{ base: 8, md: 0 }}
              textAlign="center"
            >
              <VStack spacing={6}>
                <Badge
                  colorScheme="green"
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="sm"
                >
                  {isLogin ? "New Teacher?" : "Existing Account?"}
                </Badge>
                
                <Heading size="md">
                  {isLogin ? "Create an Account" : "Sign In Instead"}
                </Heading>
                
                <Text color={useColorModeValue('gray.600', 'gray.400')}>
                  {isLogin
                    ? "Sign up to create your teacher profile, manage classes, and engage with students."
                    : "Already have an account? Sign in to continue managing your classes."}
                </Text>
                
                <Divider />
                
                <ModernButton
                  onClick={toggleForm}
                  variant="outline"
                  colorScheme="green"
                  size="lg"
                  width="full"
                >
                  {isLogin ? "Register Now" : "Back to Login"}
                </ModernButton>
              </VStack>
            </MotionBox>
          </HStack>
        </MotionBox>
      </Container>
      
      {/* Modal for ID preview */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>ID Card Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {previewUrl && (
              <Image 
                src={previewUrl} 
                alt="ID Preview" 
                maxH="500px" 
                maxW="100%" 
                mx="auto" 
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}