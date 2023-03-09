import { Model } from 'mongoose';
import { CreateEntityDTO } from '../model/dto/createEntityDTO';


export class EntitiesService {
  private Entities: Model<any>;
  constructor(Entities: Model<any>) {
    this.Entities = Entities;
  }

  protected async insertMany(docs): Promise<object> {
    try {
      console.log(JSON.stringify(docs));
      const result = await this.Entities.insertMany(docs);
      console.log("insertMany ok")
      return result;
    } catch (err) {
      console.error("insertMany error")
      console.error(err);

      throw err;
    }
  }

  protected async createEntity(doc): Promise<object> {
    try {
      console.log("create");
      const result = await this.Entities.create(doc);
      console.log("end")
      return result;
    } catch (err) {
      console.error(err);

      throw err;
    }
  }

  protected updateEntities(id: string, data: object) {
    return this.Entities.findOneAndUpdate(
      { id },
      { $set: data },
      { new: true },
    );
  }

  protected findEntities() {
    return this.Entities.find();
  }

  protected findOneEntityById(id: string) {
    return this.Entities.findOne({ id });
  }

  protected deleteOneEntityById(id: string) {
    return this.Entities.deleteOne({ id });
  }
}
