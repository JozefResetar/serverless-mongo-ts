import { Context } from 'aws-lambda';
import { Model } from 'mongoose';
import { MessageUtil, Transformer, streamToString, mapToObject } from '../utils';
import { EntitiesService } from '../service/entities';
import { CreateEntityDTO } from '../model/dto/createEntityDTO';
import { Entities } from '../model';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import Parser from '@gregoranders/csv';

const BATCH_LENGTH = 25;

export class EntitiesController extends EntitiesService {
  constructor (Entities: Model<any>) {
    super(Entities);
  }

  async tree(): Promise<object> {
    console.log("tree")
    try {
      const entities = await Entities.collection.find();
      const result = await entities.toArray();
      console.log(result)
      
      return {
          statusCode: 200,
          body: JSON.stringify(mapToObject(Transformer.transform(result))),
        };
      } catch (err) {
        console.log(err);

        return {
          statusCode: 500,
          body: JSON.stringify({ message: 'Error processing your request' }),
        };
      }
  }

  async load(): Promise<object> {
    console.log("load")
    try {
      const s3client = new S3Client({ region: "eu-central-1"});
      const params = {
        Bucket: "assetario",
        Key: "uscities.csv",
      };

      try {
        const command = new GetObjectCommand(params);
        const response = await s3client.send(command);

        const { Body } = response; 
        const parser = new Parser({ fieldSeparator: "," });
        const rows = parser.parse(await streamToString(Body));

        console.log("File loaded")
        let i = 0;
        let docs = [];

        for await (const [col0,,,col3,,col5,,,,,,,,,,,col16,] of rows) {
          docs.push(new Entities({ city: col0, id: col16.replace(/\r/g, ""), county_name: col5, state_name: col3 }));
          if (i % BATCH_LENGTH === 0) {
            await this.insertBatch(docs);
            docs = []
          }
          i += 1;
        }

        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Data saved to MongoDB' }),
        };
      } catch (err) {
        console.log(err);

        return {
          statusCode: 500,
          body: JSON.stringify({ message: 'Error saving data to MongoDB' }),
        };
      }
    } catch (err) {
      console.error(err);

      throw err;
    }
  }

  async insertBatch(docs) {

    try {
      const result = await this.insertMany(docs);
      console.log("ok");
      return MessageUtil.success(result);
    } catch (err) {
      console.log("error");
      console.error(err);

      return MessageUtil.error(err.code, err.message);
    }
  }

  async create (event: any, context?: Context) {
    console.log('functionName', context.functionName);
    const params: CreateEntityDTO = JSON.parse(event.body);

    try {
      const result = await this.createEntity({
        ...params
      });

      return MessageUtil.success(result);
    } catch (err) {
      console.error(err);

      return MessageUtil.error(err.code, err.message);
    }
  }

  async update (event: any) {
    const id: string = event.pathParameters.id;
    const body: object = JSON.parse(event.body);

    try {
      const result = await this.updateEntities(id, body);
      return MessageUtil.success(result);
    } catch (err) {
      console.error(err);

      return MessageUtil.error(err.code, err.message);
    }
  }

  async find () {
    try {
      const result = await this.findEntities();

      return MessageUtil.success(result);
    } catch (err) {
      console.error(err);

      return MessageUtil.error(err.code, err.message);
    }
  }

  async findOne (event: any, context: Context) {
    // The amount of memory allocated for the function
    console.log('memoryLimitInMB: ', context.memoryLimitInMB);

    const id: string = event.pathParameters.id;

    try {
      const result = await this.findOneEntityById(id);

      return MessageUtil.success(result);
    } catch (err) {
      console.error(err);

      return MessageUtil.error(err.code, err.message);
    }
  }

  async deleteOne (event: any) {
    const id = event.pathParameters.id;

    try {
      const result = await this.deleteOneEntityById(id);

      if (result.deletedCount === 0) {
        return MessageUtil.error(1010, 'The data was not found! May have been deleted!');
      }

      return MessageUtil.success(result);
    } catch (err) {
      console.error(err);

      return MessageUtil.error(err.code, err.message);
    }
  }
}
