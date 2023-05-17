import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { IOtOperation } from '@teable-group/core';
import { IdPrefix } from '@teable-group/core';
import type { Doc, Error } from '@teable/sharedb';
import ShareDBClass from '@teable/sharedb';
import _ from 'lodash';
import { TransactionService } from 'src/share-db/transaction.service';
import { RecordCreatedEvent } from './events';
import { SqliteDbAdapter } from './sqlite.adapter';

type IEventType = 'Create' | 'Edit' | 'Delete';

interface IEventCollectorMeta {
  type: IEventType;
  sort: number;
  context: ShareDBClass.middleware.SubmitContext;
}

@Injectable()
export class ShareDbService extends ShareDBClass {
  private logger = new Logger(ShareDbService.name);

  private eventCollector: Map<string, IEventCollectorMeta[]> = new Map();

  constructor(
    private readonly sqliteDbAdapter: SqliteDbAdapter,
    private readonly transactionService: TransactionService,
    private readonly eventEmitter: EventEmitter2
  ) {
    super({
      db: sqliteDbAdapter,
    });

    // this.use('submit', this.onSubmit);
    // this.use('apply', this.onApply);
    // this.use('commit', this.onCommit);
    // this.use('afterWrite', this.onAfterWrite);
    this.on('submitRequestEnd', this.onSubmitRequestEnd);
  }

  // private onSubmit(context: ShareDBClass.middleware.SubmitContext, next: (err?: unknown) => void) {
  //   console.log('ShareDb:SUBMIT:', context.extra, context.op);

  //   next();
  // }

  // private onApply(context: ShareDBClass.middleware.ApplyContext, next: (err?: unknown) => void) {
  //   console.log('ShareDb:apply:', context.ops, context.snapshot);

  //   next();
  // }

  // private onCommit(context: ShareDBClass.middleware.CommitContext, next: (err?: unknown) => void) {
  //   console.log('ShareDb:COMMIT:', context.ops, context.snapshot);

  //   next();
  // }

  // private onAfterWrite(context = SubmitRequest {backend: ShareDbService,
  // agent: Agent,
  // index: "rec_tbluD1SibWWuWFza6YL",
  // projection: undefined,
  // collection: "rec_tbluD1SibWWuWFza6YL",
  // ...}
  //   context: ShareDBClass.middleware.SubmitContext,
  //   next: (err?: unknown) => void
  // ) {
  //   console.log('ShareDb:afterWrite:', context.ops);

  //   next();
  // }

  private onSubmitRequestEnd(error: Error, context: ShareDBClass.middleware.SubmitContext) {
    const extra = context.extra as { [key: string]: unknown };
    const transactionKey = extra?.transactionKey as string;

    if (error) {
      this.logger.error(error);
      this.removeEventCollector(transactionKey);
      return;
    }

    let cacheEventArray = this.eventCollector.get(transactionKey);
    const transactionCacheMeta = this.transactionService.transactionCache.get(transactionKey);

    const eventType = this.getEventType(context.op)!;
    const cacheEventMeta: IEventCollectorMeta = {
      type: eventType,
      sort: transactionCacheMeta?.currentCount ?? (cacheEventArray?.length ?? 0) + 1,
      context: context,
    };

    (cacheEventArray = cacheEventArray ?? []).push(cacheEventMeta);

    this.eventCollector.set(transactionKey, cacheEventArray);

    if (!transactionCacheMeta) {
      // When the `event group` corresponding to a transaction ID completes,
      // the `type` in the event group is analyzed to dispatch subsequent event tasks
      this.eventAssign(transactionKey, cacheEventArray);
    }
  }

  private removeEventCollector(key: string | undefined) {
    if (!key) {
      return;
    }
    this.eventCollector.delete(key);
  }

  private getEventType(
    op: ShareDBClass.CreateOp | ShareDBClass.DeleteOp | ShareDBClass.EditOp
  ): IEventType | undefined {
    if ('create' in op) {
      return 'Create';
    }
    if ('op' in op) {
      return 'Edit';
    }
    if ('del' in op) {
      return 'Delete';
    }
  }

  private async eventAssign(
    transactionKey: string,
    cacheEventArray: IEventCollectorMeta[]
  ): Promise<void> {
    const getType = (types: IEventType[]): IEventType | undefined => {
      const typeFrequencies = _.countBy(types);
      if (typeFrequencies.Create && typeFrequencies.Edit) {
        return 'Create';
      }
      if (typeFrequencies.Edit && !typeFrequencies.Create && !typeFrequencies.Delete) {
        return 'Edit';
      }
      if (typeFrequencies.Delete && !typeFrequencies.Create && !typeFrequencies.Edit) {
        return 'Delete';
      }
    };

    const allTypes = _.map(cacheEventArray, 'type');
    const type = getType(allTypes)!;
    const lastContext = _.orderBy(cacheEventArray, 'sort', 'desc')[0].context;

    if (type === 'Create') {
      this.createEvent(lastContext);
    }

    if (type === 'Edit') {
      this.editEvent(lastContext);
    }

    if (type === 'Delete') {
      // Delete Event
    }

    this.removeEventCollector(transactionKey);
  }

  private async createEvent(context: ShareDBClass.middleware.SubmitContext): Promise<void> {
    const [docType, collectionId] = context.collection.split('_');
    if (IdPrefix.Record == docType) {
      this.eventEmitter.emitAsync(RecordCreatedEvent.EVENT_NAME, {
        tableId: collectionId,
        recordId: context.id,
        context,
      });
    }
  }

  private async editEvent(context: ShareDBClass.middleware.SubmitContext): Promise<void> {
    // editEvent
  }

  async submitOps(collection: string, id: string, ops: IOtOperation[]) {
    const doc = this.connect().get(collection, id);
    return new Promise<undefined>((resolve, reject) => {
      doc.submitOp(ops, undefined, (error) => {
        if (error) return reject(error);
        console.log('submit succeed!');
        resolve(undefined);
      });
    });
  }

  async createDocument(collection: string, id: string, snapshot: unknown) {
    const doc = this.connect().get(collection, id);
    return new Promise<Doc>((resolve, reject) => {
      doc.create(snapshot, (error) => {
        if (error) return reject(error);
        // console.log(`create document ${collectionId}.${id} succeed!`);
        resolve(doc);
      });
    });
  }
}
