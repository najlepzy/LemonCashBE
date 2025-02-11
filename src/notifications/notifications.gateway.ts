import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private clients: Map<number, Socket> = new Map();

  handleConnection(client: Socket) {
    const userId = Number(client.handshake.query.userId);
    if (userId) {
      this.clients.set(userId, client);
    }
  }

  handleDisconnect(client: Socket) {
    this.clients.forEach((socket, userId) => {
      if (socket.id === client.id) {
        this.clients.delete(userId);
      }
    });
  }

  sendCollaboratorInvite(userId: number, payload: any) {
    const client = this.clients.get(userId);
    if (client) {
      client.emit('collaborator-invite', payload);
    }
  }

  sendCollaborationRevoked(userId: number, payload: any) {
    const client = this.clients.get(userId);
    if (client) {
      client.emit('collaboration-revoked', payload);
    }
  }

  sendCollaboratorRemoved(ownerId: number, collaboratorId: number) {
    const client = this.clients.get(ownerId);
    if (client) {
      client.emit('collaborator-removed', { collaboratorId });
    }
  }
}
