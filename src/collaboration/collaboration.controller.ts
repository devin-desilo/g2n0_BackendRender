import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import { Multer } from 'multer';
import { CollaborationService } from './collaboration.service';
import { CreateCollaborationDto } from './dto/create-collaboration.dto';
import { UpdateCollaborationDto } from './dto/update-collaboration.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '@src/utils/multer.config';
import { errorResponse, successResponse } from '@src/auth/common.service';

@Controller('collaboration')
@ApiTags('Collaboration')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class CollaborationController {
  constructor(private readonly collaborationService: CollaborationService) {}

  @Post()
  @ApiBody({
    type: CreateCollaborationDto, // Use the FileUploadDto as the request body type
    description: 'Add new Collaboration',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async create(
    @Body() createCollaborationDto: CreateCollaborationDto,
    @UploadedFile() image: Multer.File,
    @Req() req,
    @Res() res,
  ) {
    try {
      const user = req.user;
      createCollaborationDto.image = image;
      const response = await this.collaborationService.create(
        user?._id,
        createCollaborationDto,
      );
      return res
        .status(200)
        .send(
          successResponse(
            { item: response },
            'Your Collaboration created successfully',
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
    enum: ['all', 'my', 'other'],
  })
  async findAll(
    @Res() res,
    @Req() req,
    @Query() filterList?: { type: string },
  ) {
    try {
      const userId: string | null = req.user?._id;
      const response = await this.collaborationService.findAll(
        userId,
        filterList?.type,
      );
      return res
        .status(200)
        .send(
          successResponse({ item: response }, 'Get Communities successfully'),
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
    const response = await this.collaborationService.findOne(id);
    return res
      .status(200)
      .send(
        successResponse({ item: response }, 'Get Communities Detail By ID'),
      );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCollaborationDto: UpdateCollaborationDto,
    @Res() res,
  ) {
    const response = await this.collaborationService.update(
      id,
      updateCollaborationDto,
    );
    return res
      .status(200)
      .send(successResponse({ item: response }, 'Update Communities'));
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res) {
    try {
      await this.collaborationService.remove(id);
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

  @Post(':collaborationId/join-member')
  async addMemberToCollaboration(
    @Req() req,
    @Param('collaborationId') collaborationId: string,
    @Res() res,
  ) {
    try {
      const response = await this.collaborationService.addMemberToCollaboration(
        collaborationId,
        req.user?._id,
      );
      return res
        .status(200)
        .send(
          successResponse(
            { item: response },
            'You have joined collaboration successfully',
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
