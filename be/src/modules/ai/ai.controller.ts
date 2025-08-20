import { Controller, Get, Query, Req } from '@nestjs/common';
import { CohereService } from 'src/services/cohere/cohere.service';
import { Auth } from '../shared/decorators/auth.decorator';

@Controller('ai')
export class AIController {
  constructor(private readonly cohereService: CohereService) {}

  @Get('recommend-courses')
  @Auth()
  getRecommendedCourses(@Query('name') name: string, @Req() req) {
    return this.cohereService.getRecommendedCourses(name, req.user.sub);
  }

  @Get('recommend-groups')
  @Auth()
  getRecommendedGroups(@Query('name') name: string, @Req() req) {
    return this.cohereService.getRecommendedGroups(name, req.user.sub);
  }

  @Get('classify-blogs')
  classifyBlogs() {
    return this.cohereService.classifyBlogs();
  }
}
