import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwtAuth.guard';

import { Request } from 'express';
import { CollaboratorsService } from './collaborators.service';
import { JwtPayload } from '@interface/jwt/interface';

@UseGuards(JwtAuthGuard)
@Controller('collaborators')
export class CollaboratorsController {
  constructor(private collaboratorsService: CollaboratorsService) {}

  @Post()
  async add(@Req() req: Request, @Body('identifier') identifier: string) {
    const user = req.user as any;
    const ownerId = +user.sub;
    return await this.collaboratorsService.addCollaborator(ownerId, identifier);
  }

  @Post('accept')
  async acceptInvitation(
    @Req() req: Request,
    @Body('ownerId') ownerId: number,
  ) {
    const user = req.user as JwtPayload;
    const collaboratorId = user.sub;
    const result = await this.collaboratorsService.acceptInvitation(
      ownerId,
      collaboratorId,
    );
    return { message: 'Invitation accepted', data: result };
  }

  @Post('reject')
  async rejectInvitation(
    @Req() req: Request,
    @Body('ownerId') ownerId: number,
  ) {
    const user = req.user as JwtPayload;
    const collaboratorId = user.sub;
    const result = await this.collaboratorsService.rejectInvitation(
      ownerId,
      collaboratorId,
    );
    return result;
  }

  @Get()
  async list(@Req() req: Request) {
    const user = req.user as any;
    const ownerId = +user.sub;
    const collaborators =
      await this.collaboratorsService.listCollaborators(ownerId);
    return {
      message: 'Collaborators retrieved successfully',
      data: collaborators,
    };
  }

  // Collaborator leaves the relationship
  @Delete('leave')
  async leaveCollaboration(
    @Req() req: Request,
    @Query('ownerId', ParseIntPipe) ownerId: number,
  ) {
    const user = req.user as JwtPayload;
    const collaboratorId = +user.sub;
    const result = await this.collaboratorsService.removeCollaborator(
      ownerId,
      collaboratorId,
    );
    return result;
  }

  // Owner removes a specific collaborator
  @Delete(':collaboratorId')
  async remove(
    @Req() req: Request,
    @Param('collaboratorId', ParseIntPipe) collaboratorId: number,
  ) {
    const user = req.user as any;
    const ownerId = +user.sub;
    return await this.collaboratorsService.removeCollaborator(
      ownerId,
      collaboratorId,
    );
  }
}
