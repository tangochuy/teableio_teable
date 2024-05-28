import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { getBasePermissionUpdateChannel } from '@teable/core';
import { ShareDbService } from '../../share-db/share-db.service';
import { Events, BasePermissionUpdateEvent } from '../events';

@Injectable()
export class BasePermissionUpdateListener {
  private readonly logger = new Logger(BasePermissionUpdateListener.name);

  constructor(private readonly shareDbService: ShareDbService) {}

  @OnEvent(Events.BASE_PERMISSION_UPDATE, { async: true })
  async basePermissionUpdateListener(listenerEvent: BasePermissionUpdateEvent) {
    const {
      payload: { baseId },
    } = listenerEvent;
    const channel = getBasePermissionUpdateChannel(baseId);
    const presence = this.shareDbService.connect().getPresence(channel);
    const localPresence = presence.create();

    localPresence.submit(undefined, (error) => {
      error && this.logger.error(error);
    });
  }
}
