import mongoose from 'mongoose';
import { BaseDocument, schemaFactory } from './base.model';

export interface ConfigDocument extends BaseDocument {
    label: string;
    value: string;
}

const configSchema = schemaFactory({
    label: { type: String, required: true },
    value: { type: String, required: true },
});

const ConfigModel = mongoose.model<ConfigDocument>('Config', configSchema);

export default ConfigModel;
