import { Avatar, Box, Button, HStack, Text, VStack, background } from '@chakra-ui/react';
import React, { useContext } from 'react';
import { Context } from '../index';
import pdficon from "../Images/pdf.png";
import DownloadIcon from "../Images/download.png";

function Message({ text, url, user, name, time, iurl }) {

  const { chatId } = useContext(Context);

  const isPDF = iurl && iurl.toLowerCase().includes('.pdf');
  const isVideo = iurl && /\.(mp4|ogg|webm|avi|wmv|flv|mov|mkv|mpeg|3gp|mpg)/i.test(iurl);
  const isImage = iurl && /\.(png|jpe?g|gif|bmp)[^/]*$/i.test(iurl);
  const isAudio = iurl && /\.(mp3|wav|ogg|aac|flac)[^/]*$/i.test(iurl);

  console.log(isImage);


  let fileName = '';

  if (isPDF) {
    const roomIdLength = chatId.length;
    const startIndex = iurl.lastIndexOf('/') + roomIdLength + 8;
    const endIndex = iurl.toLowerCase().lastIndexOf('.pdf');
    fileName = iurl.substring(startIndex, endIndex);
  }

  return (
    <HStack width="100%" justifyContent={user === "me" ? "flex-end" : "flex-start"} mb={4}>
      {user !== "me" && <Avatar size="sm" src={url} />}
      {user !== "other" && <Text fontSize="sm" style={{ fontSize: '10px' }}>{time}</Text>}
      <VStack alignItems={user === "me" ? "flex-end" : "flex-start"} spacing={1} maxWidth="70%" borderWidth={1} borderColor={user === "me" ? "blue.100" : "gray.100"} borderRadius="lg" p={2} bg={user === "me" ? "blue.100" : "gray.100"}>
        <Text fontSize="sm" style={{ fontSize: '10px' }} fontWeight="bold">@{name}</Text>
        {isPDF ? (
          <a href={iurl} target="_blank" rel="noreferrer" download>
            <img src={pdficon} alt="PDF" style={{ cursor: 'pointer', width: '50px', height: '50px' }} />
          </a>
        ) : (
          isVideo ? (
            <Box position="relative" maxWidth="200px">
              <video controls style={{ cursor: 'pointer', maxWidth: '100%' }}>
                <source src={iurl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <Button
                position="absolute"
                bottom="0"
                right="0"
                size="sm"
                onClick={() => window.open(iurl, '_blank')}
              >
                <img src={DownloadIcon} alt="" style={{ width: '15px', height: '15px' }} />
              </Button>
            </Box>

          ) : isImage ? (
            <a href={iurl} target="_blank" rel="noreferrer">
              <img src={iurl} alt="IMG" style={{ cursor: 'pointer' }} />
            </a>
          )
            : isAudio ? (
              <HStack>
                <audio controls>
                  <source src={iurl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
                <a href={iurl}><img href={iurl} src={DownloadIcon} alt="" style={{ width: '15px', height: '15px' }} /></a>
                
              </HStack>

            ) : <></>
        )}
        {isPDF && <Text fontSize="sm">{fileName}</Text>}
        <Text fontSize="sm">{text}</Text>
      </VStack>
      {user === "me" && <Avatar size="sm" src={url} />}
      {user !== "me" && <Text fontSize="sm" style={{ fontSize: '10px' }}>{time}</Text>}
    </HStack>
  );
}

export default Message;
