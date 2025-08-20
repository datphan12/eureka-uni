import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NhomHocTapService } from './nhomhoctap.service';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: process.env.FRONT_END_URL, credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly nhomHocTapService: NhomHocTapService) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_group')
  async handleJoinGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() maNhom: string,
  ) {
    if (!maNhom) {
      client.emit('error', { message: 'Mã nhóm không hợp lệ' });
      return;
    }

    client.join(maNhom);
    // try {
    //   const tinNhanNhom = await this.nhomHocTapService.getMessages(maNhom);
    //   client.emit('tin_nhan_nhom', tinNhanNhom);
    // } catch (error) {
    //   console.error(
    //     `Failed to fetch messages for group ${maNhom}: ${error.message}`,
    //   );
    //   client.emit('error', {
    //     message: 'Không thể lấy tin nhắn',
    //     details: error.message,
    //   });
    // }
  }

  @SubscribeMessage('leave_group')
  handleLeaveGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() maNhom: string,
  ) {
    if (maNhom) {
      client.leave(maNhom);
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CreateMessageDto,
  ) {
    try {
      const new_message = await this.nhomHocTapService.createMessage(data);
      this.server.to(data.maNhom).emit('new_message', new_message);
    } catch (error) {
      console.error(`Failed to send message: ${error.message}`);
      client.emit('error', {
        message: 'Không thể gửi tin nhắn',
        details: error.message,
      });
    }
  }

  async notifyRoomMessage(roomId: string, data: any) {
    this.server.to(roomId).emit('notification', data);
  }
}
