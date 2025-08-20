import {
  IConsumer,
  IProducer,
  ITransport,
} from '../../interface/mediasoup.interface';

export interface IPeer {
  id: string;
  transports: Map<string, ITransport>;
  producers: Map<string, IProducer>;
  consumers: Map<string, IConsumer>;
  appData?: {
    hoTen: string;
    hinhAnh: string;
  };
}
