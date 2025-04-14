import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { UploadCourseDto } from './dto/upload-course.dto';
import { EditCourseDto } from './dto/edit-course.dto';
import { AddQuestionDto } from './dto/add-question.dto';
import { AddAnswerDto } from './dto/add-answer.dto';
import { AddReviewDto } from './dto/add-review.dto';
import { AddReplyDto } from './dto/add-reply.dto';
import { Response, Request } from 'express';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
  ) {}

  async uploadCourse(body: UploadCourseDto, res: Response) {
    try {
      const course = await this.courseModel.create(body);
      return res.status(201).json({ success: true, course });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async editCourse(id: string, body: EditCourseDto, res: Response) {
    try {
      const course = await this.courseModel.findByIdAndUpdate(id, body, {
        new: true,
      });

      if (!course) {
        throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
      }

      return res.status(200).json({ success: true, course });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getSingleCourse(id: string, res: Response) {
    try {
      const course = await this.courseModel.findById(id);

      if (!course) {
        throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
      }

      return res.status(200).json({ success: true, course });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllCourses(res: Response) {
    try {
      const courses = await this.courseModel.find();
      return res.status(200).json({ success: true, courses });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getCourseByUser(id: string, req: Request, res: Response) {
    try {
      const course = await this.courseModel.findById(id);

      if (!course) {
        throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
      }

      // Giả định req.user đã có populated courses
      const isEnrolled = req.user?.courses?.some(
        (c: any) => c.courseId.toString() === id,
      );

      if (!isEnrolled && req.user?.role !== 'admin') {
        throw new HttpException(
          'You are not eligible to access this course',
          HttpStatus.FORBIDDEN,
        );
      }

      return res.status(200).json({ success: true, course });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async searchCourses(query: string, res: Response) {
    try {
      const regex = new RegExp(query, 'i');
      const courses = await this.courseModel
        .find({
          $or: [
            { name: regex },
            { categories: regex },
            { tags: regex },
            { level: regex },
          ],
        })
        .select('_id name categories price level createdAt');

      return res.status(200).json({ success: true, courses });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async advancedSearchCourses(query: any, res: Response) {
    try {
      const { query: q, category, level, priceMin, priceMax, sort } = query;
      const filter: any = {};

      if (q) {
        const regex = new RegExp(q, 'i');
        filter.$or = [{ name: regex }, { description: regex }, { tags: regex }];
      }

      if (category) {
        filter.categories = new RegExp(category, 'i');
      }

      if (level) {
        filter.level = new RegExp(level, 'i');
      }

      if (priceMin || priceMax) {
        filter.price = {};
        if (priceMin) filter.price.$gte = Number(priceMin);
        if (priceMax) filter.price.$lte = Number(priceMax);
      }

      let sortOption = { createdAt: -1 };
      switch (sort) {
        case 'price_asc':
          sortOption = { price: 1 };
          break;
        case 'price_desc':
          sortOption = { price: -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        case 'oldest':
          sortOption = { createdAt: 1 };
          break;
        case 'popular':
          sortOption = { purchased: -1 };
          break;
        case 'rating':
          sortOption = { ratings: -1 };
          break;
      }

      const courses = await this.courseModel
        .find(filter)
        .select(
          'name description categories price level thumbnail ratings purchased createdAt',
        )
        .sort(sortOption);

      return res.status(200).json({ success: true, courses });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async addQuestion(body: AddQuestionDto, req: Request, res: Response) {
    try {
      const { question, courseId, contentId } = body;

      const course = await this.courseModel.findById(courseId);

      const section = course?.courseData.find((s) =>
        s.sectionContents.some((c) => c._id.toString() === contentId),
      );

      const content = section?.sectionContents.find(
        (c) => c._id.toString() === contentId,
      );

      if (!content) {
        throw new HttpException('Content not found', HttpStatus.NOT_FOUND);
      }

      const newQuestion = {
        user: req.user?._id,
        question,
        questionReplies: [],
      };

      content.questions.push(newQuestion);

      await course.save();

      return res
        .status(200)
        .json({ success: true, message: 'Question added successfully' });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async addAnswer(body: AddAnswerDto, req: Request, res: Response) {
    try {
      const { answer, courseId, contentId, questionId } = body;

      const course = await this.courseModel.findById(courseId);

      const section = course?.courseData.find((s) =>
        s.sectionContents.some((c) => c._id.toString() === contentId),
      );

      const content = section?.sectionContents.find(
        (c) => c._id.toString() === contentId,
      );

      const question = content?.questions.find(
        (q) => q._id.toString() === questionId,
      );

      if (!question) {
        throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
      }

      question.questionReplies?.push({
        user: req.user?._id,
        question: answer,
      });

      await course.save();

      return res
        .status(200)
        .json({ success: true, message: 'Answer added successfully' });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async addReview(id: string, body: AddReviewDto, req: Request, res: Response) {
    try {
      const { review, rating } = body;
      const course = await this.courseModel.findById(id);

      const isEnrolled = req.user?.courses?.some((c: any) => c.courseId === id);

      if (!isEnrolled && req.user?.role !== 'admin') {
        throw new HttpException(
          'You are not eligible to review this course',
          HttpStatus.FORBIDDEN,
        );
      }

      const reviewData = {
        user: req.user._id,
        rating,
        comment: review,
      };

      course?.reviews.push(reviewData);

      let avg = 0;
      course?.reviews.forEach((r: any) => {
        avg += r.rating;
      });

      if (course) {
        course.ratings = avg / course.reviews.length;
      }

      await course?.save();

      return res.status(200).json({ success: true, course });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async addReplyToReview(body: AddReplyDto, req: Request, res: Response) {
    try {
      const { comment, courseId, reviewId } = body;

      const course = await this.courseModel.findById(courseId);

      const review = course?.reviews?.find(
        (r: any) => r._id.toString() === reviewId,
      );

      if (!review) {
        throw new HttpException('Review not found', HttpStatus.NOT_FOUND);
      }

      review.commentReplies?.push({
        user: req.user._id,
        question: comment,
      });

      await course?.save();

      return res.status(200).json({ success: true, course });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAdminCourses(res: Response) {
    try {
      const courses = await this.courseModel.find();
      return res.status(200).json({ success: true, courses });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteCourse(id: string, res: Response) {
    try {
      const course = await this.courseModel.findById(id);

      if (!course) {
        throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
      }

      await course.deleteOne();

      return res
        .status(200)
        .json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
