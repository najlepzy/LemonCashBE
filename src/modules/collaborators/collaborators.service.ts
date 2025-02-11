import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { UsersService } from '@modules/users/users.service';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';

@Injectable()
export class CollaboratorsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async addCollaborator(ownerId: number, collaboratorIdentifier: string) {
    const collaborator = await this.usersService.findByIdentifier(
      collaboratorIdentifier,
    );
    if (!collaborator) {
      throw new NotFoundException('Collaborator user not found');
    }
    if (collaborator.id === ownerId) {
      throw new BadRequestException(
        'You cannot add yourself as a collaborator',
      );
    }
    // Check if the relationship already exists
    const existing = await this.prisma.userCollaborator.findUnique({
      where: {
        ownerId_collaboratorId: {
          ownerId,
          collaboratorId: collaborator.id,
        },
      },
    });
    if (existing) {
      throw new ConflictException('Collaborator already added');
    }
    await this.prisma.userCollaborator.create({
      data: {
        ownerId,
        collaboratorId: collaborator.id,
      },
    });
    const addedWithCollaborator = await this.prisma.userCollaborator.findUnique(
      {
        where: {
          ownerId_collaboratorId: { ownerId, collaboratorId: collaborator.id },
        },
        include: {
          collaborator: { select: { id: true, username: true, email: true } },
        },
      },
    );
    const owner = await this.prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner) {
      throw new NotFoundException('Owner not found');
    }
    const payload = {
      message: 'You have been invited to collaborate on a board',
      ownerId,
      ownerName: owner.username,
      collaboratorId: collaborator.id,
    };
    this.notificationsGateway.sendCollaboratorInvite(collaborator.id, payload);
    return {
      message: 'Invitation sent successfully',
      data: addedWithCollaborator,
    };
  }

  async listCollaborators(ownerId: number) {
    const collaborators = await this.prisma.userCollaborator.findMany({
      where: { ownerId, accepted: true },
      include: {
        collaborator: {
          select: { id: true, username: true, email: true },
        },
      },
    });
    return collaborators.map((rel) => ({
      id: rel.collaborator.id,
      username: rel.collaborator.username,
      email: rel.collaborator.email,
      accepted: rel.accepted,
    }));
  }

  async removeCollaborator(ownerId: number, collaboratorId: number) {
    const existing = await this.prisma.userCollaborator.findUnique({
      where: {
        ownerId_collaboratorId: { ownerId, collaboratorId },
      },
    });
    if (!existing) {
      throw new NotFoundException('Collaborator relationship not found');
    }
    await this.prisma.userCollaborator.delete({
      where: {
        ownerId_collaboratorId: { ownerId, collaboratorId },
      },
    });
    this.notificationsGateway.sendCollaborationRevoked(collaboratorId, {
      message: 'The owner has revoked your collaboration',
    });
    this.notificationsGateway.sendCollaboratorRemoved(ownerId, collaboratorId);

    return { message: 'Collaborator removed successfully' };
  }

  async isCollaborator(
    ownerId: number,
    collaboratorId: number,
  ): Promise<boolean> {
    const record = await this.prisma.userCollaborator.findUnique({
      where: {
        ownerId_collaboratorId: { ownerId, collaboratorId },
      },
    });
    return !!(record && record.accepted);
  }

  async acceptInvitation(ownerId: number, collaboratorId: number) {
    const invitation = await this.prisma.userCollaborator.findUnique({
      where: {
        ownerId_collaboratorId: { ownerId, collaboratorId },
      },
    });
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }
    if (invitation.accepted) {
      throw new BadRequestException('Invitation already accepted');
    }
    const updated = await this.prisma.userCollaborator.update({
      where: {
        ownerId_collaboratorId: { ownerId, collaboratorId },
      },
      data: { accepted: true },
      include: {
        collaborator: { select: { id: true, username: true, email: true } },
      },
    });
    this.notificationsGateway.server.emit('collaborator-accepted', {
      ownerId,
      collaborator: updated.collaborator,
    });
    return updated;
  }

  async rejectInvitation(ownerId: number, collaboratorId: number) {
    const invitation = await this.prisma.userCollaborator.findUnique({
      where: {
        ownerId_collaboratorId: { ownerId, collaboratorId },
      },
    });
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }
    if (invitation.accepted) {
      throw new BadRequestException(
        'Invitation already accepted, cannot reject',
      );
    }
    await this.prisma.userCollaborator.delete({
      where: {
        ownerId_collaboratorId: { ownerId, collaboratorId },
      },
    });
    return { message: 'Invitation rejected' };
  }
}
