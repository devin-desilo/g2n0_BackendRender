import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { UserExperienceService } from './user-experience.service';
import { CreateUserExperienceDto } from './dto/create-user-experience.dto';
import { UpdateUserExperienceDto } from './dto/update-user-experience.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { successResponse } from '@src/auth/common.service';

@Controller('user-experience')
@ApiTags('user-experience')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class UserExperienceController {
  constructor(private readonly userExperienceService: UserExperienceService) {}

  @Post()
  async create(
    @Res() res,
    @Req() req,
    @Body() createUserExperienceDto: CreateUserExperienceDto,
  ) {
    const response = await this.userExperienceService.create(
      req.user?._id,
      createUserExperienceDto,
    );
    return res
      .status(200)
      .send(successResponse({ item: response }, 'Create the new experince'));
  }

  @Get()
  findAll() {
    return this.userExperienceService.findAll();
  }

  @Get('get-user-experience')
  async getUserExperience(@Res() res, @Req() req) {
    const response = await this.userExperienceService.getUserExperience(
      req.user?._id,
    );
    return res
      .status(200)
      .send(successResponse({ item: response }, 'get user experience list'));
  }

  @Get(':id')
  async findOne(@Res() res, @Param('id') id: string) {
    const response = await this.userExperienceService.findOne(id);
    return res
      .status(200)
      .send(
        successResponse(
          { item: response },
          'Your profile has been update successfully',
        ),
      );
  }

  @Patch(':id')
  async update(
    @Res() res,
    @Param('id') id: string,
    @Body() updateUserExperienceDto: UpdateUserExperienceDto,
  ) {
    const response = await this.userExperienceService.update(
      id,
      updateUserExperienceDto,
    );
    return res
      .status(200)
      .send(
        successResponse(
          { item: response },
          'Your profile has been update successfully',
        ),
      );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userExperienceService.remove(id);
  }
}
