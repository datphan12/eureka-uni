import { RtpCodecCapability } from 'mediasoup/node/lib/rtpParametersTypes';
import { WebRtcTransportOptions } from 'mediasoup/node/lib/WebRtcTransportTypes';

export const mediaCodecs: RtpCodecCapability[] = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000,
    parameters: {
      'x-google-start-bitrate': 300,
    },
  },
];

export const webRtcTransport_options: WebRtcTransportOptions = {
  listenIps: [
    {
      ip: process.env.WEBRTC_LISTEN_IP || '127.0.0.1',
      announcedIp: process.env.WEBRTC_ANNOUNCED_IP || '127.0.0.1',
    },
  ],
  enableUdp: true,
  enableTcp: true,
  preferUdp: true,
};
