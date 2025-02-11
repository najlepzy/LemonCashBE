import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { NotificationsGateway } from '@notifications/notifications.gateway';

jest.setTimeout(10000);

class FakeSocket {
  connected = true;
  private events: Record<string, ((data: any) => void)[]> = {};

  on(event: string, callback: (data: any) => void) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  once(event: string, callback: (data: any) => void) {
    this.on(event, callback);
  }

  emit(event: string, data: any) {
    if (this.events[event]) {
      for (const callback of this.events[event]) {
        callback(data);
      }
    }
  }

  disconnect() {
    this.connected = false;
  }
}

describe('NotificationsGateway Integration Test', () => {
  let app: INestApplication;
  let gateway: NotificationsGateway;
  let fakeSocket: FakeSocket;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [NotificationsGateway],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    fakeSocket = new FakeSocket();
    gateway = app.get(NotificationsGateway);
    gateway['clients'].set(1, fakeSocket as any);
  });

  afterAll(async () => {
    fakeSocket.disconnect();
    await app.close();
  });

  it('should emit "collaborator-invite" and client receives it', (done) => {
    const payload = { message: 'Invitation' };

    fakeSocket.once('collaborator-invite', (data: any) => {
      try {
        expect(data).toEqual(payload);
        done();
      } catch (error) {
        done(error);
      }
    });

    gateway.sendCollaboratorInvite(1, payload);
  });

  it('should emit "collaboration-revoked" and client receives it', (done) => {
    const payload = { message: 'Revoked' };

    fakeSocket.once('collaboration-revoked', (data: any) => {
      try {
        expect(data).toEqual(payload);
        done();
      } catch (error) {
        done(error);
      }
    });

    gateway.sendCollaborationRevoked(1, payload);
  });

  it('should emit "collaborator-removed" and client receives it', (done) => {
    const collaboratorId = 2;

    fakeSocket.once('collaborator-removed', (data: any) => {
      try {
        expect(data).toEqual({ collaboratorId });
        done();
      } catch (error) {
        done(error);
      }
    });

    gateway.sendCollaboratorRemoved(1, collaboratorId);
  });
});