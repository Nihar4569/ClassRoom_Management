// File location: src/Pages/Admin.jsx
import React, { useEffect, useState } from 'react';
import { 
    Box, 
    Button, 
    Center, 
    Container, 
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input, 
    Text, 
    VStack,
    useColorModeValue,
    InputGroup,
    InputRightElement,
    IconButton,
    useToast
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { ViewIcon, ViewOffIcon, LockIcon } from '@chakra-ui/icons';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { app } from '../firebase';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import ModernHeader from '../Components/ModernHeader';
import Loader from '../Components/Loader';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

export default function Admin() {
    // Firebase
    const db = getFirestore(app);
    const [adminData, setAdminData] = useState("");
    const [emid, setEmid] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [cookies, setCookie, removeCookie] = useCookies(['atoken']);
    const navigate = useNavigate();
    const toast = useToast();

    // Theme
    const bgGradient = useColorModeValue(
        'linear(to-br, red.600, red.500)',
        'linear(to-br, red.700, red.600)'
    );
    const formBg = useColorModeValue('white', 'gray.800');
    const inputBg = useColorModeValue('gray.50', 'gray.700');

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const submitHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const teacherDoc = await getDoc(doc(db, 'ADMIN', emid));
            
            if (teacherDoc.exists()) {
                const adminData = teacherDoc.data();

                if (adminData.password === password) {
                    setAdminData(adminData);
                    const expirationTime = new Date(Date.now() + 5 * 60 * 1000); // Current time + 5 minutes
                    setCookie('atoken', String(emid), { path: '/', expires: expirationTime });

                    toast({
                        title: "Authentication successful",
                        description: `Welcome ${adminData.name}`,
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                    });
                    
                    navigate('/admindash');
                } else {
                    toast({
                        title: "Authentication failed",
                        description: "Incorrect password",
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                    });
                }
            } else {
                toast({
                    title: "Authentication failed",
                    description: "Admin doesn't exist",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (cookies.atoken) {
            navigate("/admindash");
        }
    }, [cookies.atoken, navigate]);

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
                stiffness: 100,
                damping: 12
            }
        }
    };

    return (
        <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
            <ModernHeader />
            
            <Container py={12} maxW="container.md">
                <MotionFlex
                    direction="column"
                    align="center"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <MotionBox variants={itemVariants} mb={6} textAlign="center">
                        <Heading 
                            size="xl" 
                            mb={2}
                            bgGradient='linear(to-r, red.500, red.300)'
                            bgClip="text"
                        >
                            Admin Portal
                        </Heading>
                        <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>
                            Secure access to administrative functions
                        </Text>
                    </MotionBox>
                    
                    <MotionBox 
                        variants={itemVariants}
                        w="full"
                        maxW="450px"
                        p={8}
                        borderRadius="xl"
                        bg={formBg}
                        boxShadow="xl"
                        borderWidth="1px"
                        borderColor={useColorModeValue('gray.200', 'gray.700')}
                    >
                        <form onSubmit={submitHandler}>
                            <VStack spacing={4}>
                                <Box 
                                    p={4} 
                                    borderRadius="full" 
                                    bg="red.100" 
                                    color="red.500"
                                    mb={2}
                                >
                                    <LockIcon w={8} h={8} />
                                </Box>
                                
                                <Heading size="md" mb={4}>Administrator Login</Heading>
                                
                                <FormControl isRequired>
                                    <FormLabel>Employee ID</FormLabel>
                                    <Input
                                        value={emid}
                                        onChange={(e) => setEmid(e.target.value)}
                                        placeholder="Enter Admin ID"
                                        size="lg"
                                        bg={inputBg}
                                    />
                                </FormControl>
                                
                                <FormControl isRequired>
                                    <FormLabel>Password</FormLabel>
                                    <InputGroup>
                                        <Input
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter Password"
                                            size="lg"
                                            bg={inputBg}
                                        />
                                        <InputRightElement h="full">
                                            <IconButton
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                                icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                                                variant="ghost"
                                                onClick={togglePasswordVisibility}
                                                size="sm"
                                            />
                                        </InputRightElement>
                                    </InputGroup>
                                </FormControl>
                                
                                <Button
                                    mt={6}
                                    w="full"
                                    size="lg"
                                    type="submit"
                                    colorScheme="red"
                                    isLoading={isLoading}
                                    loadingText="Authenticating"
                                    boxShadow="md"
                                    _hover={{
                                        transform: 'translateY(-2px)',
                                        boxShadow: 'lg',
                                    }}
                                    _active={{
                                        transform: 'translateY(0)',
                                        boxShadow: 'sm',
                                    }}
                                    transition="all 0.2s"
                                >
                                    Admin Login
                                </Button>
                            </VStack>
                        </form>
                    </MotionBox>
                    
                    <MotionBox variants={itemVariants} mt={4}>
                        <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                            This area is restricted to authorized personnel only
                        </Text>
                    </MotionBox>
                </MotionFlex>
            </Container>
        </Box>
    );
}