import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from '@src/config/db/schemas';
import { IUser } from '@src/config/db/schemas/user.model';
import { Model, Types } from 'mongoose';
import { CreateCollaborationDto } from './dto/create-collaboration.dto';
import { UpdateCollaborationDto } from './dto/update-collaboration.dto';
import { Collaboration, ICollaboration } from './entities/collaboration.entity';
import {
  CollaborationMember,
  ICollaborationMemberCommunity,
} from './entities/member.entity';

@Injectable()
export class CollaborationService {
  constructor(
    @InjectModel(Collaboration.name)
    private readonly collaborationModel: Model<ICollaboration>,
    @InjectModel(CollaborationMember.name)
    private readonly memberCollaborationModel: Model<ICollaborationMemberCommunity>,
    @InjectModel(Users.name)
    private readonly userModel: Model<IUser>,
  ) {}

  async create(
    memberId: string,
    createCollaborationDto: CreateCollaborationDto,
  ): Promise<ICollaboration> {
    createCollaborationDto.image = createCollaborationDto.image?.path ?? null;
    const community = await this.collaborationModel.create({
      ...createCollaborationDto,
      userId: memberId,
    });
    const member = await this.memberCollaborationModel.create({
      memberId: memberId,
      collaborationId: community?._id,
      type: 'owner',
    });

    community.members.push(member);
    await community.save();
    return community;
  }

  async findAll(
    userId: string | null,
    type?: string,
  ): Promise<ICollaboration[]> {
    let query = this.collaborationModel
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

  async findOne(id: string): Promise<ICollaboration> {
    return await this.collaborationModel
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
    updateCommunityDto: UpdateCollaborationDto,
  ): Promise<ICollaboration> {
    return await this.collaborationModel
      .findByIdAndUpdate(id, updateCommunityDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<void> {
    // Delete the image file from disk before removing the community
    const community = await this.collaborationModel.findById(id).exec();
    const imagePath = `./uploads/${community.image}`;
    console.log(imagePath);

    // fs.unlinkSync(imagePath);
    await this.collaborationModel.findByIdAndDelete(id).exec();
  }

  async addMemberToCollaboration(
    collaborationId: string,
    memberId: string,
  ): Promise<Collaboration> {
    const community = await this.collaborationModel
      .findById(collaborationId)
      .exec();
    if (!community) {
      throw Error('Collaboration not found');
    }
    if (!Types.ObjectId.isValid(memberId)) {
      throw new Error('Invalid Member ID');
    }

    const checkUser = await this.userModel.findById(memberId);
    if (!checkUser) {
      throw Error('Invalid Member ID');
    }

    let member = await this.memberCollaborationModel.findOne({
      memberId: memberId,
      collaborationId: collaborationId,
    });
    if (member) {
      throw Error(
        `You have already joned this collaboration with as ${member.type}`,
      );
    }
    member = await this.memberCollaborationModel.create({
      memberId: memberId,
      collaborationId: collaborationId,
      type: 'member',
    });
    community.members.push(member);
    await community.save();
    return community;
  }
}
