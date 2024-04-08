import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { CommunityService } from './community.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';

@Controller('community')
@ApiTags('Community')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post()
  @ApiBody({
    type: CreateCommunityDto, // Use the FileUploadDto as the request body type
    description: 'Add new Communities',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async create(
    @Body() createCommunityDto: CreateCommunityDto,
    @UploadedFile() image: Multer.File,
    @Req() req,
    @Res() res,
  ) {
    try {
      const user = req.user;
      createCommunityDto.image = image;
      const response = await this.communityService.create(
        user?._id,
        createCommunityDto,
      );
      return res
        .status(200)
        .send(
          successResponse(
            { item: response },
            'Your Communities created successfully',
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
    description: 'Filter Land by Land type',
    enum: ['all', 'my', 'other', 'joined', 'my-community'],
  })
  async findAll(
    @Res() res,
    @Req() req,
    @Query() filterList?: { type: string },
  ) {
    try {
      const userId: string | null = req.user?._id;
      const response = await this.communityService.findAll(
        userId,
        filterList?.type ?? 'all',
      );
      return res
        .status(200)
        .send(
          successResponse({ item: response }, 'Get Communities successfully'),
        );
    } catch (error) {
      console.log('sddasdsdsad', error);
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
    const response = await this.communityService.findOne(id);
    return res
      .status(200)
      .send(
        successResponse({ item: response }, 'Get Communities Detail By ID'),
      );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCommunityDto: UpdateCommunityDto,
    @Res() res,
  ) {
    const response = await this.communityService.update(id, updateCommunityDto);
    return res
      .status(200)
      .send(successResponse({ item: response }, 'Update Communities'));
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res) {
    try {
      await this.communityService.remove(id);
      return res
        .status(200)
        .send(successResponse({ item: null }, 'Delete Communities'));
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

  @Post(':communityId/join-member')
  async addMemberToCommunity(
    @Req() req,
    @Param('communityId') communityId: string,
    @Res() res,
  ) {
    try {
      const response = await this.communityService.addMemberToCommunity(
        communityId,
        req.user?._id,
      );
      return res
        .status(200)
        .send(
          successResponse(
            { item: response },
            'You have joined community successfully',
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
}
