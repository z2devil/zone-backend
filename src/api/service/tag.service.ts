import { BaseCrudProvider } from '../common';
import TagModel, { TagDocument } from '../models/tag.model';

const CRUD = BaseCrudProvider<TagDocument, Omit<TagDocument, 'createdAt'>>(
  TagModel
);

export default CRUD;
