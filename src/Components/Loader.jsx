// File location: src/Components/Loader.jsx
import React from 'react';
import { Box, Flex, Spinner, Text, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

function Loader({ text = "Loading..." }) {
    const spinnerColor = useColorModeValue('brand.500', 'brand.300');
    const textColor = useColorModeValue('gray.700', 'gray.300');
    
    return (
        <Flex 
            direction="column" 
            align="center" 
            justify="center" 
            height="100%" 
            width="100%"
            minH="200px"
        >
            <MotionBox
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                    opacity: 1, 
                    scale: 1,
                    transition: {
                        duration: 0.5,
                        ease: "easeOut"
                    }
                }}
            >
                <Spinner
                    thickness="4px"
                    speed="0.65s"
                    emptyColor="gray.200"
                    color={spinnerColor}
                    size="xl"
                    width="80px"
                    height="80px"
                />
            </MotionBox>
            
            <MotionBox
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: {
                        delay: 0.3,
                        duration: 0.4
                    }
                }}
                mt={4}
            >
                <Text 
                    fontSize="lg" 
                    fontWeight="medium"
                    color={textColor}
                    textAlign="center"
                >
                    {text}
                </Text>
            </MotionBox>
        </Flex>
    );
}

export default Loader;