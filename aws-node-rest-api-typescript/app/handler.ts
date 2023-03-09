import { Handler, Context } from 'aws-lambda';
import dotenv from 'dotenv';
import path from 'path';

import { Entities } from './model';
import { EntitiesController } from './controller/entities';
const { NODE_ENV } = process.env;
const dotenvPath = path.join(__dirname, '../', `config/.env.${NODE_ENV}`);
console.log(dotenvPath)
dotenv.config({
  path: dotenvPath,
});

const { DB_URL } = process.env;
console.log(DB_URL)

const Controller = new EntitiesController(Entities);

export const load: Handler = () => Controller.load();

export const tree: Handler = () => Controller.tree();

export const create: Handler = (event: any, context: Context) => {
  return Controller.create(event, context);
};

export const update: Handler = (event: any) => Controller.update(event);

export const find: Handler = () => Controller.find();

export const findOne: Handler = (event: any, context: Context) => {
  return Controller.findOne(event, context);
};

export const deleteOne: Handler = (event: any) => Controller.deleteOne(event);
