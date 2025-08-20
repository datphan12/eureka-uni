import {
  DtlsParameters,
  IceCandidate,
  IceParameters,
} from 'mediasoup/node/lib/WebRtcTransportTypes';

export interface ITransportOptions {
  id: string;
  iceParameters: IceParameters;
  iceCandidates: IceCandidate[];
  dtlsParameters: DtlsParameters;
}
