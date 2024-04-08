import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Users } from '@src/config/db/schemas';
import axios from 'axios';
import express from 'express';
import { AuthService } from './auth.service';
import { errorResponse, successResponse } from './common.service';
import {
  LoginUserDto,
  RegisterUser,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto/create-auth.dto';
import { LinkdinAuthGuard } from './guards/linkdin-auth.guard';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({
    type: LoginUserDto,
    description: 'Login ',
  })
  @ApiResponse({
    status: 200,
    description: 'User Login',
    type: [Users],
  })
  async login(@Body() loginDto: LoginUserDto, @Res() res) {
    try {
      const token = await this.authService.authenticate(loginDto);
      return res
        .status(200)
        .send(successResponse({ item: token }, 'Your Login successfully'));
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

  @Post('register')
  @ApiOperation({ summary: 'User Registration' })
  @ApiBody({ type: RegisterUser })
  @ApiResponse({
    status: 200,
    description: 'Your register api.',
  })
  @ApiResponse({
    status: 422,
    description: 'Validation Error.',
  })
  async registerUser(@Body() body: RegisterUser, @Res() res) {
    try {
      const response = await this.authService.register({
        ...body,
      });
      return res
        .status(200)
        .send(
          successResponse(
            { item: { id: response.id, mobile: response.mobile } },
            'Varification email has been sent',
          ),
        );
    } catch (error) {
      console.log(error?.errors);
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

  @Post('verify-email')
  @ApiOperation({ summary: 'Verification Email' })
  @ApiBody({ type: VerifyOtpDto }) // Specify the request body structure
  @ApiResponse({
    status: 200,
    description: 'Your register email has been verify successfully.',
  })
  @ApiResponse({
    status: 422,
    description: 'Validation Error.',
  })
  async verifyEmail(
    @Body()
    body: VerifyOtpDto,
    @Req() req: express.Request,
    @Res() res,
  ) {
    try {
      const response = await this.authService.verifyEmail(body);
      if (response) {
        const token = await this.authService.authenticate({
          email: response.email,
          password: body.password,
        });
        return res
          .status(200)
          .send(successResponse({ item: token }, 'Your Login successfully'));
      }
      return res.status(422).send(errorResponse('invlid token', 422, null));
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

  @Post('/forgotPassword')
  @ApiOperation({ summary: 'Forgot Password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', default: 'superadmin@gmail.com' },
      },
    },
  })
  async forgotPassword(@Body() body: { email: string }, @Res() res) {
    try {
      await this.authService.forgotPassword(body.email);
      return res.status(200).send(
        successResponse(
          {
            item: {
              status: true,
              message: 'Email send successfully.',
            },
          },
          'Email send successfully.',
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

  @Post('/resetPassword')
  @ApiOperation({ summary: 'Reset Password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        password: { type: 'string', default: '' },
        reset_password_token: { type: 'string', default: '' },
      },
    },
  })
  async resetPassword(@Body() body: ResetPasswordDto, @Res() res) {
    try {
      await this.authService.resetPassword(body);
      return res.status(200).send(
        successResponse(
          {
            item: {
              status: true,
              message: 'Password updated successfully',
            },
          },
          'Password updated successfully',
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

  @Get('linkedin-redirect')
  @UseGuards(LinkdinAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res) {
    try {
      return res
        .status(200)
        .send(successResponse(req, 'Linkdin redirect successfully'));
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

  @Get('linkedin/callback')
  async linkdinCallback(@Req() req, @Res() res, @Query() query) {
    try {
      const accuessToken = await this.getUserAccess(query.code);
      const userInfo = await this.getLinkdineUserinfo(
        accuessToken.access_token,
        accuessToken.token_type,
      );
      const response = await this.authService.linkdinRegister({
        ...userInfo,
        first_name: userInfo.given_name,
        last_name: userInfo.family_name,
        verified: userInfo.email_verified,
        profileImage: userInfo.picture,
        roleId: 1,
      });

      return res.redirect(
        `${this.configService.get<string>(
          'FRONT_URL',
        )}signup?token=${response.token}&state=linkdin`,
      );
    } catch (error) {
      return res.redirect(
        `${this.configService.get<string>(
          'FRONT_URL',
        )}signup?message=${error?.errors?.[0] ?? error}&state=linkdin`,
      );
    }
  }

  async getUserAccess(code: string) {
    try {
      const params = new URLSearchParams();
      params.append('code', code);
      params.append('client_id', process.env.LINKDIN_CLIENT_ID);
      params.append('client_secret', process.env.LINKDIN_CLIENT_SECRET);
      params.append('redirect_uri', process.env.LINKDIN_CALLBACK_URL);
      params.append('grant_type', 'authorization_code');
      const accuessToken = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      return accuessToken.data;
    } catch (error) {
      throw Error(
        error.response?.data?.error_description ?? 'Something Went Wrong!',
      );
    }
  }

  async getLinkdineUserinfo(access_token: string, token_type: string) {
    try {
      const userInfo = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: {
          Authorization: `${token_type} ${access_token}`,
        },
      });
      return userInfo.data;
    } catch (error) {
      throw Error(
        error.response?.data?.error_description ?? 'Something Went Wrong!',
      );
    }
  }

  // @Post('resend-otp')
  // @ApiOperation({ summary: 'Verification Otp' })
  // @ApiBody({ type: ResendOtpDto }) // Specify the request body structure
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       phoneNumber: { type: 'number', default: '8128273971' },
  //       userId: { type: 'string', default: '1' },
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Your mobile otp has been sent successfully.',
  // })
  // @ApiResponse({
  //   status: 422,
  //   description: 'Validation Error.',
  // })
  // async resendOtp(@Body() resendOtpRequest: ResendOtpDto, @Res() res) {
  //   try {
  //     const response = await this.authService.resendOtp(resendOtpRequest);
  //     return res.status(200).send(
  //       successResponse(
  //         {
  //           item: {
  //             id: response.id,
  //             email: response.email,
  //           },
  //         },
  //         'Otp has been sent successfully',
  //       ),
  //     );
  //   } catch (error) {
  //     return res
  //       .status(422)
  //       .send(
  //         errorResponse(
  //           error?.errors?.[0] ?? error,
  //           422,
  //           error?.errors ?? error,
  //         ),
  //       );
  //   }
  // }
}
