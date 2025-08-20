import {
  RtpCapabilities,
  RtpParameters,
} from 'mediasoup/node/lib/rtpParametersTypes';

export interface IProducerParams {
  roomId: string;
  peerId: string;
  kind: 'audio' | 'video';
  rtpParameters: RtpParameters;
  transportId: string;
  type?: string;
}

export interface IConsumerParams {
  roomId: string;
  peerId: string;
  producerId: string;
  rtpCapabilities: RtpCapabilities;
  transportId: string;
}
