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
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { errorResponse, successResponse } from '@src/auth/common.service';

@Controller('notification')
@ApiTags('Notification')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiBody({ type: CreateNotificationDto })
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
    @Req() req,
    @Res() res,
  ) {
    try {
      const response = await this.notificationService.create(
        createNotificationDto,
      );
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
  async findAll(@Req() req, @Res() res) {
    try {
      const user = req.user;
      const response = await this.notificationService.findAll(user?._id);
      return res
        .status(200)
        .send(
          successResponse(
            { item: response },
            'get the notification list successfully',
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
  async findOne(@Param('id') id: string, @Req() req, @Res() res) {
    try {
      const response = await this.notificationService.findOne(id);
      return res
        .status(200)
        .send(
          successResponse(
            { item: response },
            'Your notification detail get by id',
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
    @Body() updateNotificationDto: UpdateNotificationDto,
    @Req() req,
    @Res() res,
  ) {
    try {
      const response = await this.notificationService.update(
        id,
        updateNotificationDto,
      );
      return res
        .status(200)
        .send(successResponse({ item: response }, 'Your notification update'));
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
  remove(@Param('id') id: string) {
    return this.notificationService.remove(id);
  }
}
