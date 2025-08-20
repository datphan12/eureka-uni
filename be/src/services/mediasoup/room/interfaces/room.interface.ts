import { IRouter } from '../../interface/mediasoup.interface';
import { IPeer } from './peer.interface';

export interface IRoom {
  id: string;
  router: IRouter;
  peers: Map<string, IPeer>;
}
