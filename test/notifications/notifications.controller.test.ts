import { NotificationsController } from '@notifications/notifications.controller';
import { NotificationsGateway } from '@notifications/notifications.gateway';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let gateway: Partial<NotificationsGateway>;

  beforeEach(() => {
    gateway = {
      sendCollaboratorInvite: jest.fn(),
    };
    controller = new NotificationsController(gateway as NotificationsGateway);
  });

  it('should emit event and return message', () => {
    const userId = '1';
    const result = controller.test(userId);
    expect(gateway.sendCollaboratorInvite).toHaveBeenCalledWith(1, {
      message: 'Test message from the backend',
    });
    expect(result).toEqual({ message: 'Event emitted' });
  });
});