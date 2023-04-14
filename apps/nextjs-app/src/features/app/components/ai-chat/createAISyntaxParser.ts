/* eslint-disable @typescript-eslint/naming-convention */
import { FieldKeyType } from '@teable-group/core';
import { Table, View } from '@teable-group/sdk/model';
import { Space } from '@teable-group/sdk/model/space';
import { has } from 'lodash';
import router from 'next/router';
import type { Bar } from '../Chart/bar';
import { createChart } from '../Chart/createChart';
import type { Line } from '../Chart/line';
import type { Pie } from '../Chart/pie';
import { ChartType } from '../Chart/type';
import type { IParsedLine } from './parser/parseLine';
import { AISyntaxParser } from './parser/parseLine';

export const generateChartMap: { [messageId: string]: Bar | Pie | Line | undefined } = {};

export function createAISyntaxParser() {
  let tableId: string | undefined;
  let viewId: string | undefined;

  const executeCommand = async (parsedLine: IParsedLine) => {
    if (!tableId) {
      tableId = router.query.nodeId as string;
    }
    if (!viewId) {
      viewId = router.query.viewId as string;
    }
    console.log(`${tableId}:${viewId}`);
    console.log('execute: ', parsedLine.operation);
    switch (parsedLine.operation) {
      case 'create-table': {
        const { name, description, emojiIcon } = parsedLine.value;
        const tableData = await Space.createTable({
          name,
          description,
          icon: emojiIcon,
          fields: [],
        });
        tableId = tableData.id;
        const views = await View.getViews(tableId);
        viewId = views[0].id;
        router.push({
          pathname: '/space/[tableId]/[viewId]',
          query: { tableId, viewId },
        });
        return;
      }
      case 'create-field': {
        if (!tableId) {
          throw new Error("Can't create field without tableId");
        }
        const { name, type, options } = parsedLine.value;
        await Table.createField({ tableId, name, type, options });
        return;
      }
      case 'create-record': {
        if (!tableId) {
          throw new Error("Can't create record without table");
        }
        const { fieldName, recordValue } = parsedLine.value;
        await Table.createRecords({
          tableId,
          records: [{ fields: { [fieldName]: recordValue } }],
        });
        return;
      }
      case 'set-record': {
        if (!tableId) {
          throw new Error("Can't create record without tableId");
        }
        if (!viewId) {
          throw new Error("Can't find viewId");
        }
        const index = parsedLine.index;
        const { fieldName, recordValue } = parsedLine.value;
        await Table.updateRecord({ tableId, fieldName, viewId, index, value: recordValue });
        return;
      }
      case 'generate-chart': {
        const chartTypeArray = Object.values(ChartType);
        const { nodeId, viewId } = router.query;
        const result = await Table.getRecords({
          tableId: nodeId as string,
          viewId: viewId as string,
          fieldKey: FieldKeyType.Name,
        });
        const chartInstance = createChart(chartTypeArray[parsedLine.index], {
          options: parsedLine.value,
          data: result.records.map((v) => v.fields),
        });
        console.log(
          'records',
          result.records.map((v) => v.fields),
          parsedLine.value
        );
        Object.keys(generateChartMap).forEach((k) => {
          if (has(generateChartMap, k) && generateChartMap[k] == undefined) {
            generateChartMap[k] = chartInstance;
          }
        });
        return;
      }
      default: {
        console.error('unknown command:', parsedLine);
      }
    }
  };

  const parser = new AISyntaxParser(executeCommand);

  return async (input: string) => {
    await parser.processMultilineSyntax(input);
  };
}
