// File location: src/Components/ModernHeader.jsx
import React, { useContext, useState } from 'react';
import { 
  Box, 
  Flex, 
  Heading, 
  HStack, 
  IconButton, 
  useColorMode, 
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Text,
  useBreakpointValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  useDisclosure
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Context } from '..';
import { useCookies } from 'react-cookie';
import { ChevronDownIcon, HamburgerIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import ModernButton from './ModernButton';

const MotionBox = motion(Box);

function ModernHeader() {
  const { setTeacherData, setStudentData, setChatId, teacherData, studentData } = useContext(Context);
  const [cookies, setCookie, removeCookie] = useCookies(['stoken', 'ttoken']);
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const userData = teacherData || studentData;

  const bgColor = useColorModeValue('brand.500', 'gray.800');
  const textColor = useColorModeValue('white', 'white');
  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleLogout = () => {
    removeCookie('stoken', { path: '/' });
    removeCookie('ttoken', { path: '/' });
    setTeacherData("");
    setStudentData("");
    setChatId("");
  };

  const logoVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 15
      }
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/lobby' },
    { name: 'Classroom', path: '/classroom' },
    { name: 'Screen Share', path: '/screen' },
  ];

  if (teacherData) {
    navItems.push({ name: 'Switch Class', path: '/teacherdash' });
  }

  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="1000"
      boxShadow="lg"
      bg={bgColor}
      px={{ base: 4, md: 6 }}
      py={3}
    >
      <Flex align="center" justify="space-between">
        <HStack spacing={4}>
          {isMobile && (
            <IconButton
              icon={<HamburgerIcon />}
              variant="ghost"
              color={textColor}
              onClick={onOpen}
              aria-label="Open Menu"
            />
          )}
          
          <MotionBox
            variants={logoVariants}
            initial="initial"
            animate="animate"
          >
            <Heading 
              color={textColor} 
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="bold"
              letterSpacing="tight"
            >
              ClassRoom Hub
            </Heading>
          </MotionBox>
        </HStack>

        {!isMobile && (
          <HStack spacing={6}>
            {navItems.map((item, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Text 
                  color={textColor} 
                  fontWeight="medium"
                  cursor="pointer"
                  _hover={{ 
                    textDecoration: 'none', 
                    color: 'brand.200',
                    transform: 'translateY(-2px)',
                  }}
                  transition="all 0.2s"
                >
                  {item.name}
                </Text>
              </MotionBox>
            ))}
          </HStack>
        )}

        <HStack spacing={3}>
          <IconButton
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            variant="ghost"
            color={textColor}
            onClick={toggleColorMode}
            aria-label="Toggle Color Mode"
          />

          {userData && (
            <Menu>
              <MenuButton
                as={Box}
                cursor="pointer"
                transition="all 0.2s"
                _hover={{ transform: 'scale(1.05)' }}
              >
                <HStack>
                  <Avatar 
                    size="sm" 
                    name={userData.name} 
                    src=""
                    bg="accent.500"
                  />
                  <Text color={textColor} display={{ base: "none", md: "block" }}>
                    {userData.name}
                  </Text>
                  <ChevronDownIcon color={textColor} />
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem>Profile</MenuItem>
                <MenuItem>Settings</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          )}

          {!userData && (
            <ModernButton colorScheme="accent" onClick={() => {}}>
              Login
            </ModernButton>
          )}
        </HStack>
      </Flex>

      {/* Mobile drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch" mt={4}>
              {navItems.map((item, index) => (
                <Text
                  key={index}
                  fontSize="lg"
                  fontWeight="medium"
                  _hover={{ color: 'brand.500' }}
                  cursor="pointer"
                >
                  {item.name}
                </Text>
              ))}
              <Box pt={6}>
                <ModernButton 
                  w="full" 
                  colorScheme="red" 
                  onClick={handleLogout}
                >
                  Logout
                </ModernButton>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}

export default ModernHeader;