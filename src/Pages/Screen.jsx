import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, VStack, Input } from '@chakra-ui/react';
import SimplePeer from 'simple-peer';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function ScreenShareAndView() {
  const [peer, setPeer] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    socket.on('signal', (data) => {
      if (peer) {
        peer.signal(data.signal);
      }
    });

    return () => {
      socket.off('signal');
    };
  }, [peer]);

  const createRoom = () => {
    socket.emit('join-room', roomId);
    setIsInRoom(true);
  };

  const joinRoom = () => {
    socket.emit('join-room', roomId);
    setIsInRoom(true);
  };

  const startScreenShare = async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    localVideoRef.current.srcObject = stream;
    localVideoRef.current.play();

    const peerInstance = new SimplePeer({
      initiator: true,
      stream: stream,
      trickle: false,
    });

    peerInstance.on('signal', (data) => {
      socket.emit('signal', { signal: data, to: roomId });
    });

    peerInstance.on('stream', (remoteStream) => {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play();
    });

    setPeer(peerInstance);
    setSharing(true);
  };

  const joinScreenShare = () => {
    const peerInstance = new SimplePeer({
      initiator: false,
      trickle: false,
    });

    peerInstance.on('signal', (data) => {
      socket.emit('signal', { signal: data, to: roomId });
    });

    peerInstance.on('stream', (remoteStream) => {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play();
    });

    setPeer(peerInstance);
    setSharing(false);
  };

  return (
    <Box>
      <VStack spacing={4}>
        {!isInRoom ? (
          <>
            <Input
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <Button onClick={createRoom} disabled={!roomId}>
              Create Room
            </Button>
            <Button onClick={joinRoom} disabled={!roomId}>
              Join Room
            </Button>
          </>
        ) : (
          <>
            {sharing ? (
              <>
                <Button onClick={startScreenShare} disabled={sharing}>
                  Start Screen Share
                </Button>
                <Button onClick={joinScreenShare} disabled={!sharing}>
                  Join Screen Share
                </Button>
              </>
            ) : (
              <>
                <Button onClick={startScreenShare}>
                  Start Screen Share
                </Button>
                <Button onClick={joinScreenShare}>
                  Join Screen Share
                </Button>
              </>
            )}
            <video ref={localVideoRef} style={{ width: '300px', margin: '10px' }} muted />
            <video ref={remoteVideoRef} style={{ width: '300px', margin: '10px' }} />
          </>
        )}
      </VStack>
    </Box>
  );
}
