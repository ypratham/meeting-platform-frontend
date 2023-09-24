import { useEffect } from "react";
import { useSocket } from "../context/SocketProvider";
import { useState } from "react";
import ReactPlayer from "react-player";
// import { useRef } from "react";
import { useCallback } from "react";

export const Meet = () => {
  const { socket, peer } = useSocket();
  const [selfStream, setSelfStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  //   const videoGrid = useRef();

  const addVideoStream = (video, stream, list) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    video.setAttribute("class", "meeting_video_video");
    list.append(video);
    console.log("New user video: ", video);
    if (video) {
      //   videoGrid.current.append(list);
    }
  };

  const removeUserVideo = (userId) => {
    const list = document.getElementById(userId);
    list.remove();
  };

  const handleUserConnection = useCallback(
    (userId, stream) => {
      const call = peer.call(userId, stream);
      const video = document.createElement("video");
      const listElement = document.createElement("li");
      listElement.setAttribute("id", userId);
      video.muted = false;

      call.on("stream", (userVideoStream) => {
        setRemoteStreams((prev) => {
          const payload = {
            id: userId,
            stream: userVideoStream,
          };

          const videos = prev.find((video) => video.id == payload.id);
          if (videos) {
            return prev;
          } else {
            return [...prev, payload];
          }
        });

        addVideoStream(video, userVideoStream, listElement);
      });

      call.on("close", () => {
        video.remove();
        listElement.remove();
      });
    },
    [peer]
  );

  useEffect(() => {
    peer.on("open", (id) => {
      socket.emit("join-room", { roomId: 14, userId: id });
    });
  }, [peer, socket]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then((stream) => {
        setSelfStream(stream);

        peer.on("call", (call) => {
          call.answer(stream);
          console.log(`Answered with incoming call.`);
          const videoElement = document.createElement("video");
          const list = document.createElement("li");
          call.on("stream", (remoteUserVideoStream) => {
            console.log({
              remoteUserVideoStream: remoteUserVideoStream.id,
            });

            setRemoteStreams((prev) => {
              const payload = {
                id: call.peer,
                stream: remoteUserVideoStream,
              };

              const videos = prev.find((video) => video.id == payload.id);
              if (videos) {
                return prev;
              } else {
                return [...prev, payload];
              }
            });

            addVideoStream(videoElement, remoteUserVideoStream, list);
          });
        });

        peer.on("close", () => {
          console.log(`Peer closed`);
        });

        socket.on("user-connected", (payload) => {
          console.log(`New user joined ${payload.userId}`);
          handleUserConnection(payload.userId, stream);
        });
      });

    socket.on("user-disconnected", ({ userId }) => {
      console.log(`${userId} left the room`);
      removeUserVideo(userId);
    });

    return () => {
      socket.removeAllListeners();
    };
  }, [socket, peer, remoteStreams, handleUserConnection]);

  useEffect(() => {
    console.log({ remoteStreams });
  });

  return (
    <div>
      Meet
      {selfStream && (
        <ReactPlayer
          width={"400px"}
          height={"300px"}
          style={{ objectFit: "cover" }}
          muted
          playing
          url={selfStream}
        />
      )}
      {/* <ul ref={videoGrid}></ul> */}
      <div>
        {remoteStreams.map((item) => (
          <>
            <p key={item.id}>{item.id}</p>
            <ReactPlayer
              width={"400px"}
              height={"300px"}
              style={{ objectFit: "cover" }}
              playing
              url={item.stream}
            />
          </>
        ))}
      </div>
    </div>
  );
};
