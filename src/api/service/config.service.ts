import { BaseCrudProvider } from '../../api/common';
import ConfigModel, { ConfigDocument } from '../models/config.model';

const CRUD = BaseCrudProvider<
    ConfigDocument,
    Omit<ConfigDocument, 'createdAt'>
>(ConfigModel);

export default CRUD;
