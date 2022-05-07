import mongoose from 'mongoose';

export interface ConfigDocument extends mongoose.Document {
    label: string;
    value: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}

const configSchema = new mongoose.Schema({
    label: { type: String, required: true },
    value: { type: String, required: true },
});

const ConfigModel = mongoose.model<ConfigDocument>('Config', configSchema);

export default ConfigModel;
