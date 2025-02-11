import { NotificationsGateway } from '@notifications/notifications.gateway';
import { Socket } from 'socket.io';

describe('NotificationsGateway', () => {
  let gateway: NotificationsGateway;
  let fakeSocket: Partial<Socket>;

  beforeEach(() => {
    gateway = new NotificationsGateway();
    fakeSocket = {
      id: 'socket-1',
      emit: jest.fn(),
      handshake: { query: { userId: '1' } } as unknown as Socket['handshake'],
    };

    gateway.handleConnection(fakeSocket as Socket);
  });

  it('should add client on connection', () => {
    expect(gateway['clients'].get(1)).toEqual(fakeSocket);
  });

  it('should remove client on disconnect', () => {
    gateway.handleDisconnect(fakeSocket as Socket);
    expect(gateway['clients'].get(1)).toBeUndefined();
  });

  it('should send collaborator invite if client exists', () => {
    const payload = { message: 'Test invite' };
    gateway.sendCollaboratorInvite(1, payload);
    expect(fakeSocket.emit).toHaveBeenCalledWith(
      'collaborator-invite',
      payload,
    );
  });

  it('should send collaboration revoked if client exists', () => {
    const payload = { message: 'Test revoked' };
    gateway.sendCollaborationRevoked(1, payload);
    expect(fakeSocket.emit).toHaveBeenCalledWith(
      'collaboration-revoked',
      payload,
    );
  });

  it('should send collaborator removed if client exists', () => {
    const collaboratorId = 2;
    gateway.sendCollaboratorRemoved(1, collaboratorId);
    expect(fakeSocket.emit).toHaveBeenCalledWith('collaborator-removed', {
      collaboratorId,
    });
  });
});