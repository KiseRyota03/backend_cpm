import {
  Controller,
  Post,
  Body,
  Put,
  Get,
  Delete,
  Param,
  Query,
  Req,
  Res,
  UseFilters,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { UploadCourseDto } from './dto/upload-course.dto';
import { EditCourseDto } from './dto/edit-course.dto';
import { AddQuestionDto } from './dto/add-question.dto';
import { AddAnswerDto } from './dto/add-answer.dto';
import { AddReviewDto } from './dto/add-review.dto';
import { AddReplyDto } from './dto/add-reply.dto';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { Response, Request } from 'express';

@Controller('courses')
@UseFilters(HttpExceptionFilter)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post('upload')
  uploadCourse(@Body() body: UploadCourseDto, @Res() res: Response) {
    return this.coursesService.uploadCourse(body, res);
  }

  @Put(':id')
  editCourse(
    @Param('id') id: string,
    @Body() body: EditCourseDto,
    @Res() res: Response,
  ) {
    return this.coursesService.editCourse(id, body, res);
  }

  @Get(':id')
  getSingleCourse(@Param('id') id: string, @Res() res: Response) {
    return this.coursesService.getSingleCourse(id, res);
  }

  @Get()
  getAllCourses(@Res() res: Response) {
    return this.coursesService.getAllCourses(res);
  }

  @Get('user-course/:id')
  getCourseByUser(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.coursesService.getCourseByUser(id, req, res);
  }

  @Get('search')
  searchCourses(@Query('query') query: string, @Res() res: Response) {
    return this.coursesService.searchCourses(query, res);
  }

  @Get('advanced-search')
  advancedSearchCourses(@Query() query: any, @Res() res: Response) {
    return this.coursesService.advancedSearchCourses(query, res);
  }

  @Post('add-question')
  addQuestion(
    @Body() body: AddQuestionDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.coursesService.addQuestion(body, req, res);
  }

  @Post('add-answer')
  addAnswer(
    @Body() body: AddAnswerDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.coursesService.addAnswer(body, req, res);
  }

  @Post(':id/review')
  addReview(
    @Param('id') id: string,
    @Body() body: AddReviewDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.coursesService.addReview(id, body, req, res);
  }

  @Post('add-reply')
  addReply(
    @Body() body: AddReplyDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.coursesService.addReplyToReview(body, req, res);
  }

  @Get('admin/all')
  getAdminCourses(@Res() res: Response) {
    return this.coursesService.getAdminCourses(res);
  }

  @Delete(':id')
  deleteCourse(@Param('id') id: string, @Res() res: Response) {
    return this.coursesService.deleteCourse(id, res);
  }
}
