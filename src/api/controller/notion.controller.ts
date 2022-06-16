import { Request, Response } from 'express';
import { result } from '../common';
// import { Client } from '@notionhq/client';
import { NotionAPI } from 'notion-client';

/**
 * 查找notion笔记
 */
export async function findNotionHandler(req: Request, res: Response) {
  // const notion = new Client({
  //   auth: '***REMOVED***',
  // });
  // const pageId = 'ec92ab830b54441d85007fbcf6af7820';
  // const response = await notion.pages.retrieve({ page_id: pageId });

  const notion = new NotionAPI({
    activeUser: 'd5199b57-44c4-4111-9787-11f8c7a9e632',
    authToken:
      '***REMOVED***',
  });
  const recordMap = await notion.getUsers([
    'd5199b57-44c4-4111-9787-11f8c7a9e632',
  ]);
  return result(res, recordMap);
}
