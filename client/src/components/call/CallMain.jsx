import React, { useEffect, useState, useRef } from "react";
import { MdCallEnd } from "react-icons/md";
import { IoMicOffOutline, IoMicOutline, IoVideocam, IoVideocamOff } from "react-icons/io5";
import { HiOutlineSpeakerWave, HiOutlineSpeakerXMark } from "react-icons/hi2";
import UserIcon from "../UserIcon";
import peer from "../../services/peer";
import { useActiveChat } from "../../context/activeChatContext";

const CallMain = ({ endCall, myCall }) => {
  const [activeChat, setActiveChat] = useActiveChat();
  const [remoteStream, setRemoteStream] = useState();
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(myCall?.type === "video");
  const [speakerOn, setSpeakerOn] = useState(true);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    const handleTrack = (e) => {
      setRemoteStream(e.streams[0]);
    };
    peer.peer.addEventListener("track", handleTrack);
    return () => {
      peer.peer.removeEventListener("track", handleTrack);
    };
  }, []);

  useEffect(() => {
    if (myCall?.type === "video" && localVideoRef.current && myCall?.stream) {
      localVideoRef.current.srcObject = myCall.stream;
    }
  }, [myCall?.stream, callType]);

  useEffect(() => {
    if (myCall?.type === "video" && remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callType]);

  const toggleMic = () => {
    if (!myCall?.stream) return;
    const audioTracks = myCall.stream.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });
    setMicOn((prev) => !prev);
  };

  const toggleVideo = () => {
    if (!myCall?.stream) return;
    const videoTracks = myCall.stream.getVideoTracks();
    videoTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });
    setVideoOn((prev) => !prev);
  };

  const toggleSpeaker = () => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = speakerOn;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = speakerOn;
    }
    setSpeakerOn((prev) => !prev);
  };

  return (
    <div className="callmain">
      {myCall?.type == "voice" && (
        <>
          {activeChat?.photo ? (
            <img className="callmain-user-icon" src={activeChat?.photo} alt="profile pic" />
          ) : (
            <div className="callmain-user-icon">
              <UserIcon size="100%" />
            </div>
          )}
          {remoteStream && (
            <audio
              autoPlay
              ref={remoteAudioRef}
            />
          )}
        </>
      )}
      {myCall?.type == "video" && (
        <div className="callmain-video-wrapper">
          {remoteStream ? (
            <video
              className="callmain-remote-video"
              autoPlay
              playsInline
              ref={remoteVideoRef}
            />
          ) : (
            <div className="callmain-remote-placeholder">
              {activeChat?.photo ? (
                <img className="callmain-user-icon" src={activeChat?.photo} alt="profile pic" />
              ) : (
                <UserIcon size="200px" />
              )}
            </div>
          )}
          {myCall?.stream && (
            <video
              className="callmain-local-video"
              autoPlay
              playsInline
              muted
              ref={localVideoRef}
            />
          )}
        </div>
      )}
      {micOn ? (
        <IoMicOutline className="callmain-user-mute-icon" onClick={toggleMic} />
      ) : (
        <IoMicOffOutline className="callmain-user-mute-icon callmain-icon-off" onClick={toggleMic} />
      )}
      {myCall?.type === "video" && (
        videoOn ? (
          <IoVideocam className="callmain-video-toggle-icon" onClick={toggleVideo} />
        ) : (
          <IoVideocamOff className="callmain-video-toggle-icon callmain-icon-off" onClick={toggleVideo} />
        )
      )}
      <MdCallEnd onClick={endCall} className="callmain-cut-call-icon" />
      {speakerOn ? (
        <HiOutlineSpeakerWave className="callmain-mute-call-icon" onClick={toggleSpeaker} />
      ) : (
        <HiOutlineSpeakerXMark className="callmain-mute-call-icon callmain-icon-off" onClick={toggleSpeaker} />
      )}
    </div>
  );
};

export default CallMain;
