import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

const socket = io('http://localhost:4000');

export function useWalletSocket(eventName) {
  const [data, setData] = useState(null);

  useEffect(() => {
    function handleData(newData) {
      setData(newData);
    }

    socket.on(eventName, handleData);

    return () => {
      socket.off(eventName, handleData);
    };
  }, [eventName]);

  return data;
}