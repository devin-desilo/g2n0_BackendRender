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
import { ClimateVaultService } from './climate-vault.service';
import { CreateClimateVaultDto } from './dto/create-climate-vault.dto';
import { UpdateClimateVaultDto } from './dto/update-climate-vault.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { multerConfig } from '@src/utils/multer.config';
import { errorResponse, successResponse } from '@src/auth/common.service';
import { Category } from './entities/category.entity';

@Controller('climate-vault')
@ApiTags('Climate Vault')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ClimateVaultController {
  constructor(private readonly climateVaultService: ClimateVaultService) {}

  @Post()
  @ApiBody({
    type: CreateClimateVaultDto, // Use the FileUploadDto as the request body type
    description: 'Add new Create Climate Vault',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async create(
    @Body() createClimateVaultDto: CreateClimateVaultDto,
    @UploadedFile() uploadFile: Multer.File,
    @Req() req,
    @Res() res,
  ) {
    try {
      const user = req.user;
      createClimateVaultDto.file = uploadFile;
      const response = await this.climateVaultService.create(
        user?._id,
        createClimateVaultDto,
      );
      return res
        .status(200)
        .send(
          successResponse(
            { item: response },
            'Your Climate vault has been created successfully',
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
    description: 'Filter Climate vault by type',
    enum: ['Article', 'Video'],
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
    @Req() req,
    @Res() res,
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
      const response = await this.climateVaultService.findAll(
        userId,
        filterList,
      );
      return res
        .status(200)
        .send(
          successResponse(
            { item: response.data, count: response.total },
            'Your Climate vault list get successfully',
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

  @Get('/category/list')
  async findAllCategory(@Res() res): Promise<Category[]> {
    try {
      const response = await this.climateVaultService.findAllCategory();
      return res
        .status(200)
        .send(successResponse({ item: response }, 'Categpry List'));
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
      const response = await this.climateVaultService.findOne(id);
      return res
        .status(200)
        .send(
          successResponse(
            { item: response },
            'Your Climate vault list get successfully',
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

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClimateVaultDto: UpdateClimateVaultDto,
    @Req() req,
    @Res() res,
  ) {
    try {
      const response = await this.climateVaultService.update(
        id,
        updateClimateVaultDto,
      );
      return res
        .status(200)
        .send(successResponse({ item: response }, 'Update Climate Vault'));
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
      await this.climateVaultService.remove(id);
      return res
        .status(200)
        .send(successResponse({ item: null }, 'Delete Climate Vault'));
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
