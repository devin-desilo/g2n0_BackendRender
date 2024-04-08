import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IUser, Users } from '@src/config/db/schemas/user.model';
import { Model, Types } from 'mongoose';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { Community, ICommunity } from './entities/community.entity';
import { IMemberCommunity, Member } from './entities/member.entity';

@Injectable()
export class CommunityService {
  constructor(
    @InjectModel(Community.name)
    private readonly communityModel: Model<ICommunity>,
    @InjectModel(Member.name)
    private readonly memberCommunityModel: Model<IMemberCommunity>,
    @InjectModel(Users.name)
    private readonly userModel: Model<IUser>,
  ) {}

  async create(
    memberId: string,
    createCommunityDto: CreateCommunityDto,
  ): Promise<ICommunity> {
    createCommunityDto.image = createCommunityDto.image?.path ?? null;
    const community = await this.communityModel.create({
      ...createCommunityDto,
      userId: memberId,
    });
    const member = await this.memberCommunityModel.create({
      memberId: memberId,
      communityId: community?._id,
      type: 'owner',
    });
    community.members.push(member);
    await community.save();
    return community;
  }

  async findAll(userId: string | null, type?: string): Promise<ICommunity[]> {
    let query = this.communityModel
      .find()
      .populate({
        path: 'members',
        populate: {
          path: 'memberId',
          model: 'Users',
          select: '-password -areaOfInterest -roleId -reset_password_token ',
        }, // Populate the 'user' field inside 'members'
      })
      .populate({
        path: 'userId',
        select: '-password -areaOfInterest -roleId -reset_password_token ',
      });

    if (type === 'my' && userId) {
      query = query
        .where('members')
        .elemMatch({ memberId: userId, type: 'owner' });
    } else if (type === 'joined' && userId) {
      query = query
        .where('members')
        .elemMatch({ memberId: userId, type: 'member' }); // Filter communities where memberId exists in the members array
    } else if (type === 'other' && userId) {
      query = query
        .where('members.memberId')
        .ne(userId)
        .where('isActive')
        .equals(true);
    } else if (type === 'my-community') {
      query = query.where('members').elemMatch({ memberId: userId });
    } else {
      query = query.where('isActive').equals(true);
    }

    query = query.sort({ isActive: 'asc' }); // Assuming 'createdAt' is the field you want to sort by

    return await query.exec();
  }

  async findOne(id: string): Promise<ICommunity> {
    return await this.communityModel
      .findById(id)
      .populate({
        path: 'members',
        populate: {
          path: 'memberId',
          model: 'Users',
          select: '-password -areaOfInterest -roleId -reset_password_token ',
        }, // Populate the 'user' field inside 'members'
      })
      .populate({
        path: 'userId',
        select: '-password -areaOfInterest -roleId -reset_password_token ',
      })
      .exec();
  }

  async update(
    id: string,
    updateCommunityDto: UpdateCommunityDto,
  ): Promise<ICommunity> {
    return await this.communityModel
      .findByIdAndUpdate(id, updateCommunityDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<void> {
    // Delete the image file from disk before removing the community
    const community = await this.communityModel.findById(id).exec();
    const imagePath = `./uploads/${community.image}`;
    console.log(imagePath);

    // fs.unlinkSync(imagePath);
    await this.communityModel.findByIdAndDelete(id).exec();
  }

  async addMemberToCommunity(
    communityId: string,
    memberId: string,
  ): Promise<Community> {
    const community = await this.communityModel.findById(communityId).exec();
    if (!community) {
      throw Error('Community not found');
    }
    if (!Types.ObjectId.isValid(memberId)) {
      throw new Error('Invalid Member ID');
    }

    const checkUser = await this.userModel.findById(memberId);
    if (!checkUser) {
      throw Error('Invalid Member ID');
    }

    let member = await this.memberCommunityModel.findOne({
      memberId: memberId,
      communityId: communityId,
    });
    if (member) {
      throw Error(
        `You have already joned this community with as ${member.type}`,
      );
    }
    member = await this.memberCommunityModel.create({
      memberId: memberId,
      communityId: communityId,
      type: 'member',
    });
    community.members.push(member);
    await community.save();
    return community;
  }
}
