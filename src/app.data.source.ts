import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';

export const mariaDataSource = new DataSource({
  type: 'mariadb',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User],
  synchronize: true,
  logging: true,
});
