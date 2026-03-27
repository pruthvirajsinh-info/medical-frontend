"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import { RootState } from "../store";

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { token } = useSelector((state: RootState) => state.auth);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const targetUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
    const socket = io(targetUrl, {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const joinChat = (receiverId: string) => {
    socketRef.current?.emit("join_chat", receiverId);
  };

  const sendMessage = (receiverId: string, content: string) => {
    socketRef.current?.emit("send_message", { receiverId, content });
  };

  return {
    socket: socketRef.current,
    isConnected,
    joinChat,
    sendMessage,
  };
};
