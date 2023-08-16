import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { PlanSchema } from './plan/plan.schema';
import { PlanService } from './plan/plan.service';
import { PlanController } from './plan/plan.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'client', 'dist'),
    }),
    MongooseModule.forRoot(
      'mongodb+srv://root:root@free.esed3gy.mongodb.net/',
      {
        dbName: 'holocene',
      },
    ),
    MongooseModule.forFeature([{ name: 'plan', schema: PlanSchema }]),
  ],
  controllers: [AppController, PlanController],
  providers: [AppService, PlanService],
})
export class AppModule {}
