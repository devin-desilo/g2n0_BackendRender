import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { errorResponse, successResponse } from '@src/auth/common.service';
import { multerConfig } from '@src/utils/multer.config';
import { Multer } from 'multer';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostService } from './post.service';

@Controller('post')
@ApiTags('Posts')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreatePostDto })
  @UseInterceptors(FileInterceptor('uploadMedia', multerConfig))
  async create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() uploadMedia: Multer.File,
    @Req() req,
    @Res() res,
  ) {
    try {
      const user = req.user;
      createPostDto.uploadMedia = uploadMedia;
      const response = await this.postService.create(user?._id, createPostDto);
      return res
        .status(200)
        .send(
          successResponse(
            { item: response },
            'Your post has been created successfully',
          ),
        );
    } catch (error) {
      return res
        .status(422)
        .send(
          errorResponse(
            error?.errors?.[0] ?? error,
            422,
            error?.errors ?? error,
          ),
        );
    }
  }

  @Get()
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter Post by Land type',
    enum: ['all', 'my', 'community', 'collaboration', 'users'],
  })
  @ApiQuery({
    name: 'category_id',
    required: false,
    description: 'Filter Post by category_id',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Filter Post by search',
  })
  @ApiQuery({
    name: 'sortKey',
    required: false,
    description: 'Sort key',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort By',
    enum: ['asc', 'desc'],
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Page Size',
  })
  async findAll(
    @Res() res,
    @Req() req,
    @Query()
    filterList?: {
      type: string;
      category_id: string;
      search: string;
      sortKey: string;
      sortBy: string;
      page: number;
      pageSize: number;
    },
  ) {
    try {
      const userId: string | null = req.user?._id;
      const response = await this.postService.findAll(userId, filterList);
      return res
        .status(200)
        .send(
          successResponse(
            { item: response.data, count: response.total },
            'Get Post successfully',
          ),
        );
    } catch (error) {
      return res
        .status(422)
        .send(
          errorResponse(
            error?.errors?.[0] ?? error,
            422,
            error?.errors ?? error,
          ),
        );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res) {
    try {
      const response = await this.postService.findOne(id);
      return res
        .status(200)
        .send(successResponse({ item: response }, 'Get Post Detail By ID'));
    } catch (error) {
      return res
        .status(422)
        .send(
          errorResponse(
            error?.errors?.[0] ?? error,
            422,
            error?.errors ?? error,
          ),
        );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCommunityDto: UpdatePostDto,
    @Res() res,
  ) {
    try {
      const response = await this.postService.update(id, updateCommunityDto);
      return res
        .status(200)
        .send(successResponse({ item: response }, 'Update Post'));
    } catch (error) {
      return res
        .status(422)
        .send(
          errorResponse(
            error?.errors?.[0] ?? error,
            422,
            error?.errors ?? error,
          ),
        );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res) {
    try {
      await this.postService.remove(id);
      return res
        .status(200)
        .send(successResponse({ item: null }, 'Delete Post'));
    } catch (error) {
      return res
        .status(422)
        .send(
          errorResponse(
            error?.errors?.[0] ?? error,
            422,
            error?.errors ?? error,
          ),
        );
    }
  }

  @Post(':id/comment')
  async addComment(
    @Param('id') id: string,
    @Body('content') content: string,
    @Res() res,
  ) {
    try {
      const response = await this.postService.addComment(id, content);
      return res
        .status(200)
        .send(successResponse({ item: response }, 'Delete Post'));
    } catch (error) {
      return res
        .status(422)
        .send(
          errorResponse(
            error?.errors?.[0] ?? error,
            422,
            error?.errors ?? error,
          ),
        );
    }
  }

  @Get('search/all')
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Filter Search',
  })
  async getGlobalSearch(
    @Res() res,
    @Req() req,
    @Query() filterList?: { search: string },
  ) {
    try {
      const userId: string | null = req.user?._id;
      const response = await this.postService.getGlobalSearch(
        userId,
        filterList?.search,
      );

      return res
        .status(200)
        .send(
          successResponse(
            { item: response },
            'Get global filter list successfully',
          ),
        );
    } catch (error) {
      return res
        .status(422)
        .send(
          errorResponse(
            error?.errors?.[0] ?? error,
            422,
            error?.errors ?? error,
          ),
        );
    }
  }

  @Put(':id/like')
  async likePost(@Param('id') id: string, @Req() req, @Res() res) {
    try {
      const userId: string | null = req.user?._id;
      const response = await this.postService.likePost(id, userId);
      return res
        .status(200)
        .send(successResponse({ item: response }, 'Post Like Successfully'));
    } catch (error) {
      return res
        .status(422)
        .send(
          errorResponse(
            error?.errors?.[0] ?? error,
            422,
            error?.errors ?? error,
          ),
        );
    }
  }
}
