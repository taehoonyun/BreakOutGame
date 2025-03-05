// socketClient.ts
import { io, Socket } from "socket.io-client";
const userId = localStorage.getItem("userId");
/**
 * Creates and returns a Socket.IO client instance.
 * @param namespace - The namespace URL to connect to (default is "ws://example.com/my-namespace")
 * @returns The Socket.IO client instance.
 */
export  const createSocket = (
  namespace: string = "http://localhost:5000"
): Socket => {
  const socket = io(namespace, {
    reconnectionDelayMax: 10000,
    auth: {
      token: "123",
    },
    query: {
      userId,
    },
  });
  return socket;
};
