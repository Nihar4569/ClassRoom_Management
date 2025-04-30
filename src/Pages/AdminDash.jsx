// File location: src/Pages/AdminDash.jsx
import React, { useEffect, useState } from 'react';
import { 
    Box, 
    Button, 
    Container, 
    Flex, 
    HStack, 
    Image, 
    Table, 
    Tbody, 
    Td, 
    Text, 
    Th, 
    Thead, 
    Tr, 
    VStack,
    Heading,
    Badge,
    IconButton,
    useColorModeValue,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    ModalFooter,
    Tooltip,
    Skeleton,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    useToast
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon, ViewIcon } from '@chakra-ui/icons';
import { collection, getFirestore, onSnapshot, query, updateDoc, doc } from 'firebase/firestore';
import { app } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { motion } from 'framer-motion';
import ModernHeader from '../Components/ModernHeader';

const MotionBox = motion(Box);
const MotionTr = motion(Tr);

export default function AdminDash() {
    const db = getFirestore(app);
    const [teacherList, setTeacherList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [cookies, setCookie, removeCookie] = useCookies(['atoken']);
    const navigate = useNavigate();
    const toast = useToast();
    
    // Modal hooks
    const { 
        isOpen: isImageOpen, 
        onOpen: onImageOpen, 
        onClose: onImageClose 
    } = useDisclosure();
    
    const { 
        isOpen: isConfirmOpen, 
        onOpen: onConfirmOpen, 
        onClose: onConfirmClose 
    } = useDisclosure();

    // Theme colors
    const bgColor = useColorModeValue('white', 'gray.800');
    const headerBg = useColorModeValue('gray.100', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');
    
    useEffect(() => {
        if (!cookies.atoken) {
            navigate("/");
            return;
        }
        
        const q = query(collection(db, "TEACHERS"));
        setIsLoading(true);
        
        const unsubscribe = onSnapshot(q, (snap) => {
            const teachers = snap.docs.map((item) => ({
                id: item.id,
                ...item.data()
            }));
            
            setTeacherList(teachers);
            setIsLoading(false);
        });

        return unsubscribe;
    }, [db, cookies.atoken, navigate]);

    const handleViewImage = (imageUrl) => {
        setSelectedImage(imageUrl);
        onImageOpen();
    };

    const handleConfirmAccess = (teacher) => {
        setSelectedTeacher(teacher);
        onConfirmOpen();
    };

    const handleAccessUpdate = async () => {
        if (!selectedTeacher) return;
        
        try {
            const newAccess = !selectedTeacher.access;
            
            await updateDoc(doc(db, "TEACHERS", selectedTeacher.id), {
                access: newAccess
            });
            
            toast({
                title: `Access ${newAccess ? 'Granted' : 'Revoked'}`,
                description: `${selectedTeacher.name}'s access has been ${newAccess ? 'granted' : 'revoked'}.`,
                status: newAccess ? "success" : "info",
                duration: 3000,
                isClosable: true,
            });
            
            onConfirmClose();
        } catch (error) {
            toast({
                title: "Error",
                description: `Failed to update access: ${error.message}`,
                status: "error",
                duration: 3000,
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
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { type: "spring", stiffness: 100, damping: 15 }
        }
    };

    return (
        <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
            <ModernHeader />
            
            <Container maxW="container.xl" py={8}>
                <MotionBox
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <MotionBox variants={itemVariants} mb={8}>
                        <Flex justify="space-between" align="center">
                            <VStack align="flex-start" spacing={1}>
                                <Heading 
                                    size="lg"
                                    bgGradient='linear(to-r, red.500, red.300)'
                                    bgClip="text"
                                >
                                    Admin Dashboard
                                </Heading>
                                <Text color={useColorModeValue('gray.600', 'gray.400')}>
                                    Manage teacher access and verification
                                </Text>
                            </VStack>
                            
                            <Badge 
                                colorScheme="red" 
                                fontSize="md" 
                                px={3} 
                                py={1}
                                borderRadius="full"
                            >
                                Administrator
                            </Badge>
                        </Flex>
                    </MotionBox>
                    
                    <MotionBox 
                        variants={itemVariants}
                        bg={bgColor}
                        borderRadius="xl"
                        overflow="hidden"
                        boxShadow="md"
                    >
                        <Box p={4} bg={headerBg} borderBottomWidth="1px" borderColor={borderColor}>
                            <Flex justify="space-between" align="center">
                                <Heading size="md">Teacher Verification</Heading>
                                <Text color={useColorModeValue('gray.600', 'gray.400')}>
                                    {teacherList.length} Teacher{teacherList.length !== 1 && 's'}
                                </Text>
                            </Flex>
                        </Box>
                        
                        {isLoading ? (
                            <VStack p={6} spacing={4}>
                                {[1, 2, 3].map((item) => (
                                    <Skeleton key={item} height="60px" width="100%" />
                                ))}
                            </VStack>
                        ) : teacherList.length === 0 ? (
                            <Alert status="info" variant="subtle" flexDirection="column" p={6}>
                                <AlertIcon boxSize={10} mr={0} mb={4} />
                                <AlertTitle fontSize="lg" mb={2}>No teachers found</AlertTitle>
                                <AlertDescription>
                                    There are no teachers registered in the system yet.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <Box overflowX="auto">
                                <Table variant="simple">
                                    <Thead>
                                        <Tr bg={headerBg}>
                                            <Th>Name</Th>
                                            <Th>ID</Th>
                                            <Th>ID Proof</Th>
                                            <Th>Status</Th>
                                            <Th>Actions</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {teacherList.map((teacher, index) => (
                                            <MotionTr 
                                                key={teacher.id}
                                                variants={itemVariants}
                                                custom={index}
                                                _hover={{ bg: hoverBg }}
                                                transition="background 0.2s"
                                            >
                                                <Td fontWeight="medium">{teacher.name}</Td>
                                                <Td>{teacher.id}</Td>
                                                <Td>
                                                    <HStack>
                                                        <Image 
                                                            src={teacher.idUrl} 
                                                            alt="ID" 
                                                            boxSize="40px" 
                                                            objectFit="cover"
                                                            borderRadius="md"
                                                        />
                                                        <Tooltip label="View ID">
                                                            <IconButton
                                                                icon={<ViewIcon />}
                                                                size="sm"
                                                                colorScheme="blue"
                                                                variant="ghost"
                                                                onClick={() => handleViewImage(teacher.idUrl)}
                                                                aria-label="View ID"
                                                            />
                                                        </Tooltip>
                                                    </HStack>
                                                </Td>
                                                <Td>
                                                    <Badge 
                                                        colorScheme={teacher.access ? "green" : "red"}
                                                        variant="solid"
                                                        px={2}
                                                        py={1}
                                                        borderRadius="full"
                                                    >
                                                        {teacher.access ? "Authorized" : "Unauthorized"}
                                                    </Badge>
                                                </Td>
                                                <Td>
                                                    <Button
                                                        leftIcon={teacher.access ? <CloseIcon /> : <CheckIcon />}
                                                        colorScheme={teacher.access ? "red" : "green"}
                                                        size="sm"
                                                        onClick={() => handleConfirmAccess(teacher)}
                                                    >
                                                        {teacher.access ? "Revoke Access" : "Grant Access"}
                                                    </Button>
                                                </Td>
                                            </MotionTr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>
                        )}
                    </MotionBox>
                </MotionBox>
            </Container>
            
            {/* Image View Modal */}
            <Modal isOpen={isImageOpen} onClose={onImageClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Teacher ID Verification</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Image 
                            src={selectedImage} 
                            alt="Teacher ID" 
                            w="full"
                            borderRadius="md"
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
            
            {/* Confirmation Modal */}
            <Modal isOpen={isConfirmOpen} onClose={onConfirmClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        {selectedTeacher?.access ? "Revoke Access" : "Grant Access"}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedTeacher && (
                            <Text>
                                Are you sure you want to {selectedTeacher.access ? "revoke" : "grant"} access for <strong>{selectedTeacher.name}</strong>?
                                {selectedTeacher.access 
                                    ? " This will prevent them from accessing the platform."
                                    : " This will allow them to create and manage classes."}
                            </Text>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onConfirmClose}>
                            Cancel
                        </Button>
                        <Button 
                            colorScheme={selectedTeacher?.access ? "red" : "green"}
                            onClick={handleAccessUpdate}
                        >
                            {selectedTeacher?.access ? "Revoke Access" : "Grant Access"}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}