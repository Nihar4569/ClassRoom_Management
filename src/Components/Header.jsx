import React, { useContext } from 'react';
import { Text, VStack, HStack, Button } from '@chakra-ui/react';
import { Context } from '..'; // Assuming you have the Context imported from the correct location
import { Cookies, useCookies } from 'react-cookie';

function Header() {
    const { setTeacherData, setStudentData, setChatId } = useContext(Context); // Assuming you have a function to set teacher authentication status
    const [cookies, setCookie, removeCookie] = useCookies(['stoken', 'ttoken']);
    const handleLogout = () => {
        removeCookie('stoken');
        removeCookie('ttoken')
        setTeacherData("");
        setStudentData("");
        setChatId("");
    };

    return (
        <VStack p={"2vh"} backgroundColor={"blue.400"} spacing={4} alignItems="flex-start">
            <HStack justifyContent="space-between" w="100%">
                <Text color={"white"} style={{ fontSize: '20px' }} fontWeight="bold">Join your ClassRoom</Text>
                <Button colorScheme="blue" onClick={handleLogout}>Logout</Button>
            </HStack>
        </VStack>
    );
}

export default Header;
