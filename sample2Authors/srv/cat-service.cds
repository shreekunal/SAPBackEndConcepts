using {sample as db} from '../db/schema';

service CatalogService {
  entity Authors as projection on db.Authors;
}
