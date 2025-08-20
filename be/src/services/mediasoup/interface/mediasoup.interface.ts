import {
  Consumer,
  Producer,
  Router,
  WebRtcTransport,
  Worker,
} from 'mediasoup/node/lib/types';

export interface IWorker {
  worker: Worker;
  routers: Map<string, IRouter>;
}

export interface IRouter {
  router: Router;
}

export interface ITransport {
  transport: WebRtcTransport;
}

export interface IProducer {
  producer: Producer;
  type?: string;
}

export interface IConsumer {
  consumer: Consumer;
}
