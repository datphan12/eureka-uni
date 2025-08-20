import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
import { useAuthStore } from "@store";
import { Avatar } from "@components";
import { Video, Mic, MicOff, Monitor, PhoneOff, Users, VideoOff } from "lucide-react";
import { toast } from "react-toastify";

const VideoCall = () => {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const roomId = query.get("roomId");

    const user = useAuthStore((state) => state.user);

    const [socket, setSocket] = useState(null);
    const [device, setDevice] = useState(null);
    const [sendTransport, setSendTransport] = useState(null);
    const [recvTransport, setRecvTransport] = useState(null);
    const [peers, setPeers] = useState([]);
    const [localStream, setLocalStream] = useState(null);
    const [videoProducer, setVideoProducer] = useState(null);
    const [audioProducer, setAudioProducer] = useState(null);
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [screenProducer, setScreenProducer] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const localVideoRef = useRef(null);
    const deviceRef = useRef(null);
    const recvTransportRef = useRef(null);
    const remoteMediaRef = useRef(null);

    const consumersRef = useRef(new Map());

    useEffect(() => {
        const newSocket = io(`${import.meta.env.VITE_NESTJS_API_URL}/mediasoup`);
        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("Connected to server mediasoup:", newSocket.id);
        });

        newSocket.on("join-room-error", ({ error, code }) => {
            if (code === "PERMISSION_DENIED") {
                toast.error("Bạn không có quyền tham gia phòng họp này!");
            } else {
                toast.error(error || "Có lỗi xảy ra khi tham gia phòng");
            }
        });

        newSocket.on("new-peer", ({ peer }) => {
            setPeers((prevPeers) => [...prevPeers, peer]);
            toast.success(`${peer.appData.hoTen} đã tham gia phòng.`);
        });

        newSocket.on("peer-left", ({ peerId }) => {
            setPeers((prevPeers) => prevPeers.filter((peer) => peer.id !== peerId));
            cleanupPeerMedia(peerId);
        });

        newSocket.on("producer-closed", ({ producerId, peerId, kind }) => {
            cleanupProducerMedia(producerId, peerId, kind);
        });

        return () => {
            newSocket.close();
        };
    }, []);

    useEffect(() => {
        if (socket) {
            joinRoom();
        }
    }, [socket]);

    const cleanupProducerMedia = (producerId, peerId, kind) => {
        const consumer = consumersRef.current.get(producerId);

        const elementId =
            kind === "video"
                ? consumer.type === "screen"
                    ? `screen-${peerId}-${producerId}`
                    : `video-container-${peerId}-${producerId}`
                : `audio-${peerId}-${producerId}`;

        const element = document.getElementById(elementId);
        if (element) {
            if (kind === "video") {
                const videoElement = element.querySelector("video");
                if (videoElement && videoElement.srcObject) {
                    videoElement.srcObject.getTracks().forEach((track) => {
                        track.stop();
                    });
                }
            } else if (kind === "audio") {
                if (element.srcObject) {
                    element.srcObject.getTracks().forEach((track) => {
                        track.stop();
                    });
                }
            }

            element.remove();
        }

        if (consumer) {
            consumer.consumer.close();
            consumersRef.current.delete(producerId);
        }
    };

    const cleanupPeerMedia = (peerId) => {
        const mediaContainer = document.getElementById("remote-media");
        if (!mediaContainer) return;

        const peerElements = mediaContainer.querySelectorAll(`[id*="${peerId}"]`);
        peerElements.forEach((element) => {
            const mediaElement =
                element.tagName === "VIDEO" || element.tagName === "AUDIO"
                    ? element
                    : element.querySelector("video, audio");

            if (mediaElement && mediaElement.srcObject) {
                mediaElement.srcObject.getTracks().forEach((track) => track.stop());
            }

            element.remove();
        });

        consumersRef.current.forEach((consumer, producerId) => {
            const elementExists =
                document.getElementById(`video-container-${peerId}-${producerId}`) ||
                document.getElementById(`audio-${peerId}-${producerId}`);
            if (!elementExists) {
                consumer.consumer.close();
                consumersRef.current.delete(producerId);
            }
        });
    };

    const createDevice = async (rtpCapabilities) => {
        const newDevice = new mediasoupClient.Device();
        await newDevice.load({ routerRtpCapabilities: rtpCapabilities });
        setDevice(newDevice);
        deviceRef.current = newDevice;
        return newDevice;
    };

    const createSendTransport = async (device, transportOptions) => {
        const newSendTransport = device.createSendTransport(transportOptions);
        newSendTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
            try {
                socket.emit("connect-transport", {
                    transportId: newSendTransport.id,
                    dtlsParameters,
                    roomId,
                    peerId: user.id,
                });
                callback();
            } catch (error) {
                errback(error);
            }
        });

        newSendTransport.on("produce", ({ kind, rtpParameters, appData }, callback, errback) => {
            try {
                socket.emit(
                    "produce",
                    {
                        transportId: newSendTransport.id,
                        kind,
                        rtpParameters,
                        roomId,
                        peerId: user.id,
                        appData,
                    },
                    (response) => {
                        if (response.producerId) {
                            callback({ id: response.producerId });
                        } else {
                            callback({ id: response });
                        }
                    }
                );
            } catch (error) {
                errback(error);
            }
        });

        setSendTransport(newSendTransport);
        return newSendTransport;
    };

    const createRecvTransport = async (device, transportOptions) => {
        const newRecvTransport = device.createRecvTransport(transportOptions);
        newRecvTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
            try {
                socket.emit("connect-transport", {
                    transportId: newRecvTransport.id,
                    dtlsParameters,
                    roomId,
                    peerId: user.id,
                });
                callback();
            } catch (error) {
                errback(error);
            }
        });
        setRecvTransport(newRecvTransport);
        recvTransportRef.current = newRecvTransport;
        return newRecvTransport;
    };

    const getLocalAudioStreamAndTrack = async () => {
        const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });

        const audioTrack = audioStream.getAudioTracks()[0];
        return audioTrack;
    };

    const joinRoom = async () => {
        if (!socket) return;

        socket.emit(
            "join-room",
            { roomId, peer: { id: user.id, appData: { hoTen: user.hoTen, hinhAnh: user.hinhAnh } } },
            async (response) => {
                if (response.error) {
                    toast.error(response.error);
                    setTimeout(() => {
                        window.close();
                    }, 2000);
                    return;
                }

                const { sendTransportOptions, recvTransportOptions, rtpCapabilities, peers, existingProducers } =
                    response;

                const newDevice = await createDevice(rtpCapabilities);

                const newSendTransport = await createSendTransport(newDevice, sendTransportOptions);
                const newRecvTransport = await createRecvTransport(newDevice, recvTransportOptions);

                socket.on("new-producer", handleNewProducer);

                const audioTrack = await getLocalAudioStreamAndTrack();
                audioTrack.enabled = false;
                const newAudioProducer = await newSendTransport.produce({ track: audioTrack });

                setAudioProducer(newAudioProducer);

                setPeers(peers.filter((peer) => peer.id !== user.id));

                for (const producerInfo of existingProducers) {
                    await consume(producerInfo);
                }

                toast.success("Đã tham gia phòng họp");
            }
        );
    };

    const leaveRoom = () => {
        if (!socket) return;

        socket.emit("leave-room", { peerId: user.id }, (response) => {
            if (response && response.error) {
                console.error("Error leaving room:", response.error);
                return;
            }
            setPeers([]);
            if (localStream) {
                localStream.getTracks().forEach((track) => track.stop());
                setLocalStream(null);
            }
            if (sendTransport) {
                sendTransport.close();
                setSendTransport(null);
            }
            if (recvTransport) {
                recvTransport.close();
                setRecvTransport(null);
            }
            if (device) {
                setDevice(null);
            }
            socket.off("new-producer", handleNewProducer);

            window.close();
        });
    };

    const startCamera = async () => {
        if (!sendTransport) return;
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
        });
        setLocalStream(stream);

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }

        const videoTrack = stream.getVideoTracks()[0];
        const newVideoProducer = await sendTransport.produce({ track: videoTrack, appData: { type: "camera" } });
        setVideoProducer(newVideoProducer);
    };

    const stopCamera = () => {
        if (videoProducer) {
            socket.emit("close-producer", {
                roomId,
                peerId: user.id,
                producerId: videoProducer.id,
            });

            videoProducer.close();
            setVideoProducer(null);
        }

        if (localStream) {
            localStream.getTracks().forEach((track) => track.stop());
            setLocalStream(null);
        }

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
    };

    const toggleMicrophone = () => {
        if (audioProducer) {
            const newState = !audioEnabled;
            audioProducer.track.enabled = newState;
            setAudioEnabled(newState);
        }
    };

    const startScreenShare = async () => {
        if (!sendTransport) return;

        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
        });
        const screenTrack = stream.getVideoTracks()[0];

        const newScreenProducer = await sendTransport.produce({
            track: screenTrack,
            appData: { type: "screen" },
        });
        setScreenProducer(newScreenProducer);

        screenTrack.onended = () => {
            console.log("Screen sharing ended by user");
            if (socket && newScreenProducer) {
                socket.emit("close-producer", {
                    roomId,
                    peerId: user.id,
                    producerId: newScreenProducer.id,
                });
            }

            if (newScreenProducer) {
                newScreenProducer.close();
            }

            setScreenProducer(null);
        };
    };

    const stopScreenShare = () => {
        if (screenProducer) {
            socket.emit("close-producer", {
                roomId,
                peerId: user.id,
                producerId: screenProducer.id,
            });

            screenProducer.close();
            setScreenProducer(null);
        }
    };

    const handleNewProducer = async ({ producerId, peerId, kind }) => {
        await consume({ producerId, peerId, kind });
    };

    const consume = async ({ producerId, peerId }) => {
        const device = deviceRef.current;
        const recvTransport = recvTransportRef.current;
        if (!device || !recvTransport) {
            console.log("Device hoặc RecvTransport không được khởi tạo");
            return;
        }

        if (consumersRef.current.has(producerId)) {
            console.log(`Already consuming producer ${producerId}`);
            return;
        }

        socket.emit(
            "consume",
            {
                transportId: recvTransport.id,
                producerId,
                roomId,
                peerId: user.id,
                rtpCapabilities: device.rtpCapabilities,
            },
            async (response) => {
                if (response.error) {
                    console.error("Error consuming:", response.error);
                    return;
                }

                const { consumerData } = response;

                const consumer = await recvTransport.consume({
                    id: consumerData.id,
                    producerId: consumerData.producerId,
                    kind: consumerData.kind,
                    rtpParameters: consumerData.rtpParameters,
                });

                await consumer.resume();

                consumersRef.current.set(producerId, { consumer, type: consumerData?.type });

                const remoteStream = new MediaStream();
                remoteStream.addTrack(consumer.track);

                const mediaContainer = document.getElementById("remote-media");
                const screenContainer = document.getElementById("remote-screen");
                if (!mediaContainer) {
                    console.error("Remote media container not found");
                    return;
                }

                if (consumer.kind === "video") {
                    const isScreenShare = consumerData?.type === "screen";

                    if (isScreenShare) {
                        const existingContainer = document.getElementById(`screen-${peerId}-${producerId}`);
                        if (existingContainer) {
                            existingContainer.remove();
                        }

                        const videoContainer = document.createElement("div");
                        videoContainer.id = `screen-${peerId}-${producerId}`;
                        videoContainer.className = "bg-gray-800 max-w-[1000px] h-auto relative mb-2";

                        const videoElement = document.createElement("video");
                        videoElement.id = `video-${peerId}-${producerId}`;
                        videoElement.srcObject = remoteStream;
                        videoElement.autoplay = true;
                        videoElement.playsInline = true;
                        videoElement.className = "w-full h-full object-cover rounded-lg";

                        videoContainer.appendChild(videoElement);

                        screenContainer.appendChild(videoContainer);
                    } else {
                        const existingContainer = document.getElementById(`video-container-${peerId}-${producerId}`);
                        if (existingContainer) {
                            existingContainer.remove();
                        }

                        const videoContainer = document.createElement("div");
                        videoContainer.id = `video-container-${peerId}-${producerId}`;
                        videoContainer.className = "bg-gray-800 w-[300px] h-[180px] relative mb-2";

                        const videoElement = document.createElement("video");
                        videoElement.id = `video-${peerId}-${producerId}`;
                        videoElement.srcObject = remoteStream;
                        videoElement.autoplay = true;
                        videoElement.playsInline = true;
                        videoElement.className = "w-full h-full object-cover rounded-lg";

                        const nameLabel = document.createElement("div");
                        nameLabel.className =
                            "absolute bottom-2 left-2 bg-gray-900 bg-opacity-70 px-2 py-1 rounded text-sm";
                        nameLabel.textContent = `Peer ${peerId.slice(0, 8)}`;

                        videoContainer.appendChild(videoElement);
                        videoContainer.appendChild(nameLabel);

                        mediaContainer.appendChild(videoContainer);
                    }
                } else if (consumer.kind === "audio") {
                    const existingAudio = document.getElementById(`audio-${peerId}-${producerId}`);
                    if (existingAudio) {
                        existingAudio.remove();
                    }

                    const audioElement = document.createElement("audio");
                    audioElement.id = `audio-${peerId}-${producerId}`;
                    audioElement.srcObject = remoteStream;
                    audioElement.autoplay = true;
                    audioElement.className = "hidden";

                    mediaContainer.appendChild(audioElement);

                    try {
                        await audioElement.play();
                    } catch (err) {
                        console.error("Audio playback failed:", err);
                    }
                }

                consumer.on("close", () => {
                    cleanupProducerMedia(producerId, peerId, consumer.kind);
                });
            }
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-gray-800 flex justify-between items-center border-b border-gray-700">
                <div className="flex items-center space-x-3">
                    <h1 className="text-xl font-semibold">Phòng họp</h1>
                    <div className="flex items-center space-x-2 bg-gray-700 px-3 py-1 rounded-full text-sm">
                        <span>Room: {roomId}</span>
                        <button className="hover:text-blue-400 transition-colors" title="Copy room ID"></button>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-blue-400" />
                        <span className="text-sm">{peers.length + 1} người tham gia</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className={`p-2 rounded-full ${
                                sidebarOpen ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
                            } transition-colors`}
                            title="Participants"
                        >
                            <Users className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 p-4 flex gap-x-2">
                    {/* main video */}
                    <div id="remote-screen" className="flex-1 flex justify-center"></div>

                    {/* Other Videos Layout */}
                    <div className="flex flex-col h-[calc(100vh-200px)] gap-y-2 overflow-y-auto no-scrollbar">
                        {/* Local Video */}
                        <div className="bg-gray-800 w-[300px] h-[180px] relative">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover rounded-lg"
                            />
                            {!localStream && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-75 rounded-lg">
                                    <VideoOff className="w-12 h-12 text-gray-400" />
                                </div>
                            )}
                            <div className="absolute bottom-2 left-2 bg-gray-900 bg-opacity-70 px-2 py-1 rounded text-sm">
                                Bạn {screenProducer ? "(Đang chia sẻ màn hình)" : ""}
                            </div>

                            {/* Camera status indicator */}
                            <div className="absolute top-2 right-2 flex space-x-2">
                                {!videoProducer && (
                                    <div className="bg-red-500 bg-opacity-70 p-1 rounded-full">
                                        <VideoOff className="w-4 h-4" />
                                    </div>
                                )}
                                {!audioEnabled && (
                                    <div className="bg-red-500 bg-opacity-70 p-1 rounded-full">
                                        <MicOff className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Remote Videos */}
                        <div id="remote-media" ref={remoteMediaRef} className="flex-1 flex flex-col"></div>
                    </div>
                </div>

                {/* Sidebar */}
                {sidebarOpen && (
                    <div className="w-64 bg-gray-800 border-l border-gray-700 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-700">
                            <h2 className="font-semibold">Người tham gia ({peers.length + 1})</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center space-x-2">
                                    <Avatar src={user.hinhAnh} />
                                    <span>{user?.hoTen || "Bạn"} (Bạn)</span>
                                </div>
                                <div className="flex space-x-1">
                                    {videoProducer ? (
                                        <Video className="w-4 h-4 text-green-400" />
                                    ) : (
                                        <VideoOff className="w-4 h-4 text-red-400" />
                                    )}
                                    {audioEnabled ? (
                                        <Mic className="w-4 h-4 text-green-400" />
                                    ) : (
                                        <MicOff className="w-4 h-4 text-red-400" />
                                    )}
                                </div>
                            </div>

                            {peers.map((peer) => (
                                <div key={peer.id} className="flex items-center justify-between py-2">
                                    <div className="flex items-center space-x-2">
                                        <Avatar src={peer.appData.hinhAnh} />
                                        <span>{peer.appData.hoTen}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="p-4 bg-gray-800 border-t border-gray-700 flex justify-center">
                <div className="flex space-x-4 items-center">
                    <button
                        onClick={videoProducer ? stopCamera : startCamera}
                        className={`p-3 rounded-full ${
                            videoProducer ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"
                        } transition-colors`}
                        title={videoProducer ? "Stop Camera" : "Start Camera"}
                    >
                        {videoProducer ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                    </button>

                    <button
                        onClick={toggleMicrophone}
                        className={`p-3 rounded-full ${
                            audioEnabled ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"
                        } transition-colors`}
                        title={audioEnabled ? "Mute Microphone" : "Unmute Microphone"}
                    >
                        {audioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                    </button>

                    <button
                        onClick={screenProducer ? stopScreenShare : startScreenShare}
                        className={`p-3 rounded-full ${
                            screenProducer ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-700 hover:bg-gray-600"
                        } transition-colors`}
                        title={screenProducer ? "Stop Screen Share" : "Start Screen Share"}
                    >
                        <Monitor className="w-6 h-6" />
                    </button>

                    <button
                        onClick={leaveRoom}
                        className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
                        title="Leave Call"
                    >
                        <PhoneOff className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoCall;
