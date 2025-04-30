// File location: src/Pages/Student.jsx
import React, { useContext, useState } from 'react';
import { 
  Box, 
  Container, 
  Input, 
  Text, 
  VStack, 
  HStack,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  Button as ChakraButton,
  useColorModeValue,
  Heading,
  Divider,
  Select,
  FormErrorMessage,
  useToast
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { addDoc, collection, doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import { app } from "../firebase";
import { useCookies } from 'react-cookie';
import { Context } from '..';
import { Navigate } from 'react-router-dom';
import ModernButton from '../Components/ModernButton';
import ModernHeader from '../Components/ModernHeader';

const MotionBox = motion(Box);

export default function Student() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    
    // Login form state
    const [lregd, setLregd] = useState("");
    const [lpassword, setLpassword] = useState("");
    
    // Register form state
    const [name, setName] = useState("");
    const [regd, setRegd] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [semester, setSemester] = useState("");
    const [section, setSection] = useState("");
    
    // Form validation
    const [errors, setErrors] = useState({});
    
    const { studentData, setStudentData } = useContext(Context);
    const toast = useToast();

    // Firebase initialization
    const db = getFirestore(app);
    const [cookies, setCookie] = useCookies(['stoken']);

    // Move all useColorModeValue calls to the top level
    const bgColor = useColorModeValue('gray.50', 'gray.900');
    const activeCardBg = useColorModeValue('blue.50', 'blue.900');
    const inactiveCardBg = useColorModeValue('gray.50', 'gray.700');
    const inputBgColor = useColorModeValue('white', 'gray.700');
    
    const validateForm = (isLoginForm) => {
        const newErrors = {};
        
        if (isLoginForm) {
            if (!lregd) newErrors.lregd = "Registration number is required";
            if (!lpassword) newErrors.lpassword = "Password is required";
        } else {
            if (!name) newErrors.name = "Name is required";
            if (!regd) newErrors.regd = "Registration number is required";
            if (!email) newErrors.email = "Email is required";
            else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";
            if (!password) newErrors.password = "Password is required";
            else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
            if (!semester) newErrors.semester = "Semester is required";
            if (!section) newErrors.section = "Section is required";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const toggleForm = () => {
        setIsLogin(!isLogin);
        setErrors({});
    };

    const loginHandler = async (e) => {
        e.preventDefault();
        
        if (!validateForm(true)) return;
        
        try {
            const studentDoc = await getDoc(doc(db, 'STUDENTS', lregd));
            
            if (studentDoc.exists()) {
                const studentData = studentDoc.data();
                
                if (studentData.password === lpassword) {
                    setStudentData(studentData);
                    setCookie('stoken', String(lregd), { path: '/' });
                    
                    toast({
                        title: "Login successful",
                        description: `Welcome back, ${studentData.name}!`,
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                        position: "top"
                    });
                } else {
                    toast({
                        title: "Login failed",
                        description: "Incorrect password. Please try again.",
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                        position: "top"
                    });
                }
            } else {
                toast({
                    title: "Login failed",
                    description: "Student not found. Please check your registration number.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                    position: "top"
                });
            }
        } catch (error) {
            toast({
                title: "Login failed",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top"
            });
        }
    };

    const registerHandler = async (e) => {
        e.preventDefault();
        
        if (!validateForm(false)) return;
        
        try {
            const studentsDoc = await getDoc(doc(db, 'STUDENTS', regd));
            
            if (studentsDoc.exists()) {
                toast({
                    title: "Registration failed",
                    description: "Student already exists. Please log in instead.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                    position: "top"
                });
            } else {
                await setDoc(doc(db, 'STUDENTS', regd), {
                    uid: regd,
                    name: name,
                    regd: regd,
                    email: email,
                    password: password,
                    semester: semester,
                    section: section.toUpperCase(),
                    classroomid: `${semester}+${section.toUpperCase()}`
                });
                
                toast({
                    title: "Registration successful",
                    description: "Your account has been created. You can now log in.",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                    position: "top"
                });
                
                // Clear form fields and switch to login
                setName("");
                setRegd("");
                setEmail("");
                setPassword("");
                setSemester("");
                setSection("");
                setIsLogin(true);
            }
        } catch (error) {
            toast({
                title: "Registration failed",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top"
            });
        }
    };

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

    const childVariants = {
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

    const formCardVariants = {
        initial: { opacity: 0, y: 20, scale: 0.9 },
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
            scale: 0.9,
            transition: {
                duration: 0.3
            }
        }
    };

    if (studentData) {
        return <Navigate to="/studentdash" />;
    }

    return (
        <Box minH="100vh" bg={bgColor}>
            <ModernHeader />
            
            <Container py={10} maxW="container.lg">
                <MotionBox
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <MotionBox 
                        variants={childVariants}
                        mb={8}
                        textAlign="center"
                    >
                        <Heading 
                            size="xl" 
                            mb={2}
                            bgGradient="linear(to-r, brand.500, accent.500)"
                            bgClip="text"
                        >
                            Student Portal
                        </Heading>
                        <Text fontSize="lg" opacity={0.8}>
                            {isLogin ? "Sign in to access your classroom" : "Create a new student account"}
                        </Text>
                    </MotionBox>

                    <HStack spacing={8} align="flex-start" justify="center" flexDir={{ base: "column", md: "row" }}>
                        <AnimatePresence mode="wait">
                            {isLogin ? (
                                <MotionBox
                                    key="login"
                                    variants={formCardVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    bg={activeCardBg}
                                    p={8}
                                    borderRadius="xl"
                                    boxShadow="lg"
                                    w={{ base: "full", md: "400px" }}
                                >
                                    <VStack spacing={4} as="form" onSubmit={loginHandler}>
                                        <Heading size="lg" textAlign="center">Login</Heading>
                                        
                                        <FormControl isInvalid={errors.lregd}>
                                            <FormLabel>Registration Number</FormLabel>
                                            <Input
                                                value={lregd}
                                                onChange={(e) => setLregd(e.target.value)}
                                                placeholder="Enter your registration number"
                                                bg={inputBgColor}
                                                size="lg"
                                            />
                                            <FormErrorMessage>{errors.lregd}</FormErrorMessage>
                                        </FormControl>
                                        
                                        <FormControl isInvalid={errors.lpassword}>
                                            <FormLabel>Password</FormLabel>
                                            <InputGroup>
                                                <Input
                                                    value={lpassword}
                                                    onChange={(e) => setLpassword(e.target.value)}
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter your password"
                                                    bg={inputBgColor}
                                                    size="lg"
                                                />
                                                <InputRightElement mt="2px">
                                                    <ChakraButton
                                                        h="1.75rem"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                                                    </ChakraButton>
                                                </InputRightElement>
                                            </InputGroup>
                                            <FormErrorMessage>{errors.lpassword}</FormErrorMessage>
                                        </FormControl>
                                        
                                        <ModernButton
                                            type="submit"
                                            colorScheme="brand"
                                            size="lg"
                                            width="full"
                                            mt={6}
                                        >
                                            Sign In
                                        </ModernButton>
                                    </VStack>
                                </MotionBox>
                            ) : (
                                <MotionBox
                                    key="register"
                                    variants={formCardVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    bg={activeCardBg}
                                    p={8}
                                    borderRadius="xl"
                                    boxShadow="lg"
                                    w={{ base: "full", md: "500px" }}
                                >
                                    <VStack spacing={4} as="form" onSubmit={registerHandler}>
                                        <Heading size="lg" textAlign="center">Create Account</Heading>
                                        
                                        <FormControl isInvalid={errors.name}>
                                            <FormLabel>Full Name</FormLabel>
                                            <Input
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Enter your full name"
                                                bg={inputBgColor}
                                            />
                                            <FormErrorMessage>{errors.name}</FormErrorMessage>
                                        </FormControl>
                                        
                                        <FormControl isInvalid={errors.regd}>
                                            <FormLabel>Registration Number</FormLabel>
                                            <Input
                                                value={regd}
                                                onChange={(e) => setRegd(e.target.value)}
                                                type="number"
                                                placeholder="Enter your registration number"
                                                bg={inputBgColor}
                                            />
                                            <FormErrorMessage>{errors.regd}</FormErrorMessage>
                                        </FormControl>
                                        
                                        <FormControl isInvalid={errors.email}>
                                            <FormLabel>Email</FormLabel>
                                            <Input
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                type="email"
                                                placeholder="Enter your email address"
                                                bg={inputBgColor}
                                            />
                                            <FormErrorMessage>{errors.email}</FormErrorMessage>
                                        </FormControl>
                                        
                                        <FormControl isInvalid={errors.password}>
                                            <FormLabel>Password</FormLabel>
                                            <InputGroup>
                                                <Input
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Create a password"
                                                    bg={inputBgColor}
                                                />
                                                <InputRightElement>
                                                    <ChakraButton
                                                        h="1.75rem"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                                                    </ChakraButton>
                                                </InputRightElement>
                                            </InputGroup>
                                            <FormErrorMessage>{errors.password}</FormErrorMessage>
                                        </FormControl>
                                        
                                        <HStack w="full" spacing={4}>
                                            <FormControl isInvalid={errors.semester}>
                                                <FormLabel>Semester</FormLabel>
                                                <Select
                                                    value={semester}
                                                    onChange={(e) => setSemester(e.target.value)}
                                                    placeholder="Select semester"
                                                    bg={inputBgColor}
                                                >
                                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                                        <option key={num} value={`semester${num}`}>
                                                            Semester {num}
                                                        </option>
                                                    ))}
                                                </Select>
                                                <FormErrorMessage>{errors.semester}</FormErrorMessage>
                                            </FormControl>
                                            
                                            <FormControl isInvalid={errors.section}>
                                                <FormLabel>Section</FormLabel>
                                                <Input
                                                    value={section}
                                                    onChange={(e) => setSection(e.target.value.toUpperCase())}
                                                    placeholder="Section"
                                                    maxLength={1}
                                                    bg={inputBgColor}
                                                />
                                                <FormErrorMessage>{errors.section}</FormErrorMessage>
                                            </FormControl>
                                        </HStack>
                                        
                                        <ModernButton
                                            type="submit"
                                            colorScheme="brand"
                                            size="lg"
                                            width="full"
                                            mt={6}
                                        >
                                            Register
                                        </ModernButton>
                                    </VStack>
                                </MotionBox>
                            )}
                        </AnimatePresence>
                            
                        <MotionBox
                            variants={childVariants}
                            bg={inactiveCardBg}
                            p={8}
                            borderRadius="xl"
                            boxShadow="md"
                            w={{ base: "full", md: "300px" }}
                            mt={{ base: 8, md: 0 }}
                            textAlign="center"
                        >
                            <VStack spacing={6}>
                                <Heading size="md">
                                    {isLogin ? "New to the platform?" : "Already have an account?"}
                                </Heading>
                                
                                <Text opacity={0.8}>
                                    {isLogin 
                                        ? "Create an account to join your classroom, access learning materials, and engage with peers and teachers."
                                        : "Sign in with your existing credentials to access your courses and continue learning where you left off."
                                    }
                                </Text>
                                
                                <Divider />
                                
                                <ModernButton
                                    onClick={toggleForm}
                                    variant="outline"
                                    colorScheme="brand"
                                    size="lg"
                                    width="full"
                                >
                                    {isLogin ? "Create Account" : "Sign In"}
                                </ModernButton>
                            </VStack>
                        </MotionBox>
                    </HStack>
                </MotionBox>
            </Container>
        </Box>
    );
}