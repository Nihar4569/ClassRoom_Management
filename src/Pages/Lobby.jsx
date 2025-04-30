// File location: src/Pages/Lobby.jsx
import React, { useContext, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Text, 
  VStack,
  Heading,
  useColorModeValue,
  Flex,
  Icon,
  Badge,
  HStack,
  Avatar
} from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Context } from '..';
import ModernHeader from '../Components/ModernHeader';
import { FaComment, FaDesktop, FaExchangeAlt } from 'react-icons/fa';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionHeading = motion(Heading);

export default function Lobby() {
    const navigate = useNavigate();
    const { teacherData, studentData } = useContext(Context);
    const controls = useAnimation();
    
    const user = teacherData || studentData;
    const cardBg = useColorModeValue('white', 'gray.800');
    const hoverBg = useColorModeValue('blue.50', 'blue.900');
    
    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }
        
        controls.start({ opacity: 1, y: 0 });
    }, [user, navigate, controls]);
    
    const cardVariants = {
        initial: { 
            opacity: 0, 
            y: 20, 
            scale: 0.9 
        },
        animate: i => ({ 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { 
                delay: i * 0.15,
                type: "spring",
                stiffness: 100,
                damping: 10
            }
        }),
        hover: { 
            scale: 1.05,
            boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
            backgroundColor: hoverBg,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 15
            }
        },
        tap: { 
            scale: 0.98, 
            boxShadow: "0 5px 10px rgba(0,0,0,0.1)",
            transition: {
                type: "spring",
                stiffness: 500,
                damping: 20
            }
        }
    };
    
    const optionCards = [
        {
            title: "Classroom Chat",
            description: "Join live discussions, share resources and communicate with your class",
            icon: FaComment,
            color: "blue.500",
            path: "/classroom"
        },
        {
            title: "Screen Share",
            description: "Share your screen for presentations, demonstrations and collaborative sessions",
            icon: FaDesktop,
            color: "purple.500",
            path: "/screen"
        }
    ];
    
    if (teacherData) {
        optionCards.push({
            title: "Switch Class",
            description: "Change to a different classroom or manage multiple classes",
            icon: FaExchangeAlt,
            color: "green.500",
            path: "/teacherdash"
        });
    }

    return (
        <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
            <ModernHeader />
            
            <Container maxW="container.xl" py={10}>
                <MotionFlex
                    direction="column"
                    initial={{ opacity: 0, y: 20 }}
                    animate={controls}
                    transition={{ duration: 0.5 }}
                >
                    <MotionBox textAlign="center" mb={10}>
                        <MotionHeading
                            fontSize={{ base: "3xl", md: "4xl" }}
                            bgGradient="linear(to-r, brand.500, purple.500)"
                            bgClip="text"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            Welcome to Your Hub
                        </MotionHeading>
                        
                        <HStack justify="center" spacing={4} mt={4}>
                            <Avatar size="md" name={user?.name} bg="brand.500" />
                            <VStack align="start" spacing={0}>
                                <Text fontSize="xl" fontWeight="bold">{user?.name}</Text>
                                <Badge colorScheme={teacherData ? "green" : "blue"}>
                                    {teacherData ? "Teacher" : "Student"}
                                </Badge>
                            </VStack>
                        </HStack>
                    </MotionBox>
                    
                    <Grid 
                        templateColumns={{ base: "1fr", md: "repeat(auto-fit, minmax(300px, 1fr))" }}
                        gap={8}
                    >
                        {optionCards.map((card, index) => (
                            <MotionBox
                                key={index}
                                custom={index}
                                variants={cardVariants}
                                initial="initial"
                                animate="animate"
                                whileHover="hover"
                                whileTap="tap"
                                bg={cardBg}
                                borderRadius="xl"
                                p={6}
                                boxShadow="md"
                                cursor="pointer"
                                onClick={() => navigate(card.path)}
                                position="relative"
                                overflow="hidden"
                                h="260px"
                                display="flex"
                                flexDirection="column"
                                justifyContent="center"
                            >
                                {/* Background glow effect */}
                                <Box
                                    position="absolute"
                                    top="-20px"
                                    left="-20px"
                                    width="100px"
                                    height="100px"
                                    borderRadius="full"
                                    bg={card.color}
                                    opacity="0.1"
                                    zIndex="0"
                                />
                                
                                <VStack spacing={6} align="center" position="relative" zIndex="1">
                                    <Flex
                                        justify="center"
                                        align="center"
                                        w="80px"
                                        h="80px"
                                        borderRadius="full"
                                        bg={`${card.color}20`}
                                        color={card.color}
                                    >
                                        <Icon as={card.icon} boxSize={8} />
                                    </Flex>
                                    
                                    <VStack spacing={2}>
                                        <Heading size="lg" textAlign="center" color={card.color}>
                                            {card.title}
                                        </Heading>
                                        <Text textAlign="center" opacity={0.8}>
                                            {card.description}
                                        </Text>
                                    </VStack>
                                </VStack>
                            </MotionBox>
                        ))}
                    </Grid>
                </MotionFlex>
            </Container>
        </Box>
    );
}