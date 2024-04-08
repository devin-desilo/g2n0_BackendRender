import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const newComment = new this.commentModel(createCommentDto);
    return await newComment.save();
  }

  async findAll(): Promise<Comment[]> {
    return await this.commentModel.find().exec();
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentModel.findById(id).exec();
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    return comment;
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const existingComment = await this.commentModel.findByIdAndUpdate(
      id,
      updateCommentDto,
      { new: true },
    );
    if (!existingComment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    return existingComment;
  }

  async remove(id: string): Promise<void> {
    const result = await this.commentModel.deleteOne({ _id: id }).exec();
    if (result) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
  }
}
