import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Link {
  @Prop()
  title: string;

  @Prop()
  url: string;
}

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop()
  question: string;

  @Prop({ type: [Object] })
  questionReplies?: Comment[];
}

@Schema()
export class CourseContent {
  @Prop({ required: true })
  videoTitle: string;

  @Prop({ required: true })
  videoDescription: string;

  @Prop({ required: true })
  videoUrl: string;

  @Prop({ required: true })
  videoLength: number;

  @Prop({ type: [Link] })
  videoLinks: Link[];

  @Prop({ type: [Comment] })
  questions: Comment[];
}

@Schema()
export class CourseSection {
  @Prop({ required: true })
  sectionTitle: string;

  @Prop({ type: [CourseContent] })
  sectionContents: CourseContent[];
}

@Schema()
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ default: 0 })
  rating: number;

  @Prop()
  comment: string;

  @Prop({ type: [Object] })
  commentReplies: Comment[];
}

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  categories: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  estimatedPrice?: number;

  @Prop({
    type: {
      public_id: { type: String },
      url: { type: String },
    },
  })
  thumbnail: {
    public_id?: string;
    url?: string;
  };

  @Prop({ required: true })
  tags: string;

  @Prop({ required: true })
  level: string;

  @Prop({ required: true })
  demoUrl: string;

  @Prop({ type: [{ title: String }] })
  benefits: { title: string }[];

  @Prop({ type: [{ title: String }] })
  prerequisites: { title: string }[];

  @Prop({ type: [Review] })
  reviews: Review[];

  @Prop({ type: [CourseSection] })
  courseData: CourseSection[];

  @Prop({ default: 0 })
  ratings?: number;

  @Prop({ default: 0 })
  purchased: number;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
