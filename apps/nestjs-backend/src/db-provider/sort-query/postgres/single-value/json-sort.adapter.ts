import { FieldType } from '@teable/core';
import type { Knex } from 'knex';
import { SortFunctionPostgres } from '../sort-query.function';

export class JsonSortAdapter extends SortFunctionPostgres {
  asc(builderClient: Knex.QueryBuilder): Knex.QueryBuilder {
    const { type } = this.field;

    if (type === FieldType.Link || type === FieldType.User) {
      builderClient.orderByRaw(`??::jsonb ->> 'title' ASC NULLS FIRST`, [this.columnName]);
    } else {
      builderClient.orderByRaw(`??::jsonb ASC NULLS FIRST`, [this.columnName]);
    }
    return builderClient;
  }

  desc(builderClient: Knex.QueryBuilder): Knex.QueryBuilder {
    const { type } = this.field;

    if (type === FieldType.Link || type === FieldType.User) {
      builderClient.orderByRaw(`??::jsonb ->> 'title' DESC NULLS LAST`, [this.columnName]);
    } else {
      builderClient.orderByRaw(`??::jsonb DESC NULLS LAST`, [this.columnName]);
    }
    return builderClient;
  }

  getAscSQL() {
    const { type } = this.field;

    if (type === FieldType.Link || type === FieldType.User) {
      return this.knex.raw(`??::jsonb ->> 'title' ASC NULLS FIRST`, [this.columnName]).toQuery();
    } else {
      return this.knex.raw(`??::jsonb ASC NULLS FIRST`, [this.columnName]).toQuery();
    }
  }

  getDescSQL() {
    const { type } = this.field;

    if (type === FieldType.Link || type === FieldType.User) {
      return this.knex.raw(`??::jsonb ->> 'title' DESC NULLS LAST`, [this.columnName]).toQuery();
    } else {
      return this.knex.raw(`??::jsonb DESC NULLS LAST`, [this.columnName]).toQuery();
    }
  }
}
