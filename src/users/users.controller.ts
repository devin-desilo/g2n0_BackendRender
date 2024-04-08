import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Res,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Users } from '@src/config/db/schemas';
import { AuthGuard } from '@nestjs/passport';
import { errorResponse, successResponse } from '@src/auth/common.service';
import { UpdateUserSecondDto } from '@src/auth/dto/update-auth.dto';
import {
  CreateUserSecondDto,
  CreateUsersDto,
} from '@src/auth/dto/create-auth.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '@src/utils/multer.config';
import { Multer } from 'multer';

@Controller('user')
@ApiTags('Users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/list')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get User List' })
  @ApiResponse({
    status: 200,
    description: 'User Login',
    type: [Users],
  })
  async findAll(@Req() req, @Res() res) {
    const users = await this.usersService.findAll();
    return res
      .status(200)
      .send(successResponse({ item: users }, 'Get Users List'));
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get User' })
  @ApiResponse({
    status: 200,
    description: 'User Login',
    type: [Users],
  })
  async getProfile(@Req() req, @Res() res) {
    const users = await this.usersService.findOne(req.user?._id);
    return res
      .status(200)
      .send(successResponse({ item: users }, 'Get Profile Detail'));
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string, @Res() res) {
    const users = await this.usersService.findOne(id);
    return res
      .status(200)
      .send(successResponse({ item: users }, 'Get Profile detail'));
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserSecondDto,
    @Res() res,
  ) {
    const updateProfile = await this.usersService.updateProfile(
      id,
      updateUserDto,
    );
    return res
      .status(200)
      .send(successResponse({ item: updateProfile }, 'Update Profile detail'));
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post('update-profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Profile Update' })
  @ApiBody({
    type: CreateUserSecondDto, // Use the FileUploadDto as the request body type
    description: 'Add new Profile',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('profileImage', multerConfig))
  @ApiResponse({
    status: 200,
    description: 'Profile Update.',
  })
  @ApiResponse({
    status: 422,
    description: 'Validation Error.',
  })
  async updateProfile(
    @Req() req,
    @Body() body: CreateUserSecondDto,
    @UploadedFile() profileImage: Multer.File,
    @Res() res,
  ) {
    try {
      body.id = req.user?.roleId === 3 ? req.body?.id : req.user?._id;
      body.profileImage = profileImage;
      const response = await this.usersService.registerStep(body);
      return res
        .status(200)
        .send(
          successResponse(
            { item: response },
            'Your profile has been update successfully',
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

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Profile Update' })
  @ApiBody({
    type: CreateUsersDto, // Use the FileUploadDto as the request body type
    description: 'Add new Profile',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile Update.',
  })
  @ApiResponse({
    status: 422,
    description: 'Validation Error.',
  })
  async create(@Req() req, @Body() body: CreateUsersDto, @Res() res) {
    try {
      const response = await this.usersService.createUser(body);
      return res
        .status(200)
        .send(successResponse({ item: response }, 'User ja'));
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

  @Post('change-status')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Profile status Update' })
  @ApiBody({
    type: CreateUserSecondDto, // Use the FileUploadDto as the request body type
    description: 'Profile block/Unblock',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile status Update',
  })
  @ApiResponse({
    status: 422,
    description: 'Validation Error.',
  })
  async statusUpdateProfile(
    @Req() req,
    @Body() body: CreateUserSecondDto,
    @Res() res,
  ) {
    try {
      body.id = req.user?.roleId === 3 ? req.body?.id : req.user?._id;
      console.log('body', body, req.body, req.user);
      const response = await this.usersService.changeStatus(body);
      return res
        .status(200)
        .send(
          successResponse(
            { item: response },
            'User profile has been update successfully',
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
