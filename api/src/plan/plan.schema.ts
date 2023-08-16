import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema()
export class Plan {
  @Prop()
  name: string;
  @Prop()
  length: number;
  @Prop()
  width: number;
  @Prop()
  height: number;
  @Prop()
  weight: number;
  @Prop()
  quantity: number;
  @Prop()
  stackable: boolean;
  @Prop()
  tiltable: boolean;
}
export const PlanSchema = SchemaFactory.createForClass(Plan);
