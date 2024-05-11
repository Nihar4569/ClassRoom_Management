import { Text, VStack } from '@chakra-ui/react'
import React from 'react'

function Header() {
    return (
        <VStack p={"2vh"} backgroundColor={"blue.400"}>
            <Text color={"white"} style={{ fontSize: '20px' }} fontWeight="bold">Join your ClassRoom</Text>
        </VStack>
    )
}

export default Header