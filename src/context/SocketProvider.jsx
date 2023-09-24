/* eslint-disable react/prop-types */
import Peer from "peerjs";
import { useContext } from "react";
import { createContext } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = (props) => {
  const socket = io("demo-meet-be.onrender.com", {
    // transports: ["websocket"],
  });

  const peer = new Peer(undefined, {
    host: "demo-meet-be.onrender.com",
    // port: "",
    path: "/peerjs",
  });

  return (
    <SocketContext.Provider value={{ socket, peer }}>
      {props.children}
    </SocketContext.Provider>
  );
};
