import { CreateEntityDTO } from "../model/dto/createEntityDTO";

type Tree = Map<string, Map<string, CreateEntityDTO[]>>;

export class Transformer {
  static transform(cities): Tree {
    const tree: Tree = new Map();
    for (const item of cities) {
      const { id, city, state_name, county_name } = item;
      if (tree.has(state_name)) {
        const counties = tree.get(state_name)!;
        if (counties.has(county_name)) {
          const cities = counties.get(county_name)!;
          cities.push({ id, city, county_name, state_name });
        } else {
          counties.set(county_name, [{ id, city, county_name, state_name }]);
        }
      } else {
        const counties = new Map([[county_name, [{ id, city, county_name, state_name }]]]);
        tree.set(state_name, counties);
      }
    }
    return tree;
  }
}