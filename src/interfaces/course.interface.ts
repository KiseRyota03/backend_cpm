import { Document } from 'mongoose';

export interface ILink {
  title: string;
  url: string;
}

export interface IComment {
  user: string; // ObjectId (string)
  question: string;
  questionReplies?: IComment[];
}

export interface ICourseContent {
  videoTitle: string;
  videoDescription: string;
  videoUrl: string;
  videoLength: number;
  videoLinks: ILink[];
  questions: IComment[];
}

export interface ICourseSection {
  sectionTitle: string;
  sectionContents: ICourseContent[];
}

export interface IReview {
  user: string; // ObjectId (string)
  rating: number;
  comment: string;
  commentReplies: IComment[];
}

export interface ICourse extends Document {
  name: string;
  description: string;
  categories: string;
  price: number;
  estimatedPrice?: number;
  thumbnail: {
    public_id?: string;
    url?: string;
  };
  tags: string;
  level: string;
  demoUrl: string;
  benefits: { title: string }[];
  prerequisites: { title: string }[];
  reviews: IReview[];
  courseData: ICourseSection[];
  ratings?: number;
  purchased: number;
}
