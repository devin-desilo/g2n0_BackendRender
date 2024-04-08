import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Collaboration } from '@src/collaboration/entities/collaboration.entity';
import { Comment } from '@src/comments/entities/comment.entity';
import { Community } from '@src/community/entities/community.entity';
import { Model, Types } from 'mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { NotificationService } from '@src/notification/notification.service';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Community.name)
    private readonly communityModel: Model<Community>,
    @InjectModel(Collaboration.name)
    private readonly collaborationModel: Model<Collaboration>,
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    private readonly notificationService: NotificationService,
  ) {}

  async create(userId: string, createPostDto: CreatePostDto): Promise<Post> {
    createPostDto.uploadMedia = createPostDto.uploadMedia?.path ?? null;
    const { postJoin, events, ...createPost } = createPostDto;

    const createdPost = await this.postModel.create({
      ...createPost,
      userId: userId,
      postJoin: JSON.parse(postJoin),
      events: JSON.parse(events),
    });
    await createdPost.save();
    await this.notificationService.createNewPostNotification(
      userId,
      createPostDto.title,
      createPostDto.description,
      createPostDto,
    );
    return createdPost;
  }

  async findAll(
    userId: string | null,
    filterList?: {
      type: string;
      category_id: string;
      search: string;
      sortKey: string;
      sortBy: string;
      page: number;
      pageSize: number;
    },
  ): Promise<{ data: Post[]; total: number; page: number }> {
    const { type, category_id, page, pageSize, search, sortBy, sortKey } =
      filterList;
    let postWhere = {};
    if (search) {
      const regexPattern = new RegExp(search, 'i');
      if (search) {
        postWhere = { title: { $regex: regexPattern } };
      }
    }
    let query = this.postModel
      .find(postWhere)
      .populate({
        path: 'userId',
        select: '-password -areaOfInterest -roleId -reset_password_token ',
      })
      .populate('postJoin.community') // Populate the community field in postJoin
      .populate('postJoin.collaboration') // Populate the community field in postJoin
      .populate('postJoin.user')
      .populate('comments')
      .populate({
        path: 'likes',
        select: '-password -areaOfInterest -roleId -reset_password_token ',
        model: 'Users',
      });

    if (type === 'my' && userId) {
      query = query.where('userId').equals(userId);
    }
    if (type === 'community' && category_id) {
      query = query
        .where('postJoin')
        .elemMatch({ id: category_id, type: 'Community' });
    }
    if (type === 'collaboration' && category_id) {
      query = query
        .where('postJoin')
        .elemMatch({ id: category_id, type: 'Collaboration' });
    }
    if (type === 'users' && category_id) {
      query = query
        .where('postJoin')
        .elemMatch({ id: category_id, type: 'Users' });
    }

    // Search by title or description
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = query.or([
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ]);
    }

    // Sort
    if (sortKey && sortBy) {
      const sortOptions: any = { [sortKey]: sortBy === 'asc' ? 1 : -1 };
      query = query.sort(sortOptions);
    } else {
      query = query.sort({ createdAt: 'desc' }); // Default sort by createdAt in descending order
    }

    // Pagination
    // const total = await query.countDocuments();

    if (page && pageSize) {
      const skip = (page - 1) * pageSize;
      query = query.skip(skip).limit(pageSize);
    }
    const data = await query.exec();

    return { data, total: 100, page };
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postModel
      .findById(id)
      .populate('postJoin.community') // Populate the community field in postJoin
      .populate('postJoin.collaboration') // Populate the community field in postJoin
      .populate('postJoin.user')
      .populate('comments')
      .populate({
        path: 'likes',
        select: '-password -reset_password_token -roleId',
        model: 'Users',
      })
      .exec();
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const { postJoin, events, ...updatePost } = updatePostDto;
    let otherData = {};
    if (postJoin) {
      otherData = { ...otherData, postJoin: JSON.parse(postJoin) };
    }
    if (events) {
      otherData = { ...otherData, events: JSON.parse(events) };
    }
    const existingPost = await this.postModel
      .findByIdAndUpdate(
        id,
        {
          ...updatePost,
          ...otherData,
        },
        { new: true },
      )
      .populate('postJoin.community') // Populate the community field in postJoin
      .populate('postJoin.collaboration') // Populate the community field in postJoin
      .populate('postJoin.user')
      .populate('comments')
      .exec();

    if (!existingPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return existingPost;
  }

  async remove(id: string): Promise<void> {
    const result = await this.postModel.deleteOne({ _id: id }).exec();
    if (!result) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
  }

  async addComment(postId: string, content: string): Promise<Comment> {
    const newComment = await this.commentModel.create({
      content,
      postId: postId,
    });
    return await newComment.save();
  }
  async getGlobalSearch(
    userId: string | null,
    search?: string,
  ): Promise<{
    posts: Post[];
    community: Community[];
    collaboration: Collaboration[];
  }> {
    let postWhere = {};
    const regexPattern = new RegExp(search, 'i');
    if (search) {
      postWhere = { name: { $regex: regexPattern } };
    }
    const query = this.postModel
      .find(postWhere)
      .populate('postJoin.community') // Populate the community field in postJoin
      .populate('postJoin.collaboration') // Populate the community field in postJoin
      .populate('postJoin.user')
      .populate('comments')
      .sort({ createdAt: 'desc' });

    const communityQuery = this.communityModel
      .find(postWhere)
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
      .sort({ createdAt: 'desc' });

    const collaborationQuery = this.collaborationModel
      .find(postWhere)
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
      .sort({ createdAt: 'desc' });
    return {
      posts: await query.exec(),
      community: await communityQuery.exec(),
      collaboration: await collaborationQuery.exec(),
    };
  }

  async likePost(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    // Check if the user has already liked the post
    // Toggle like/unlike
    if (post.likes.includes(new Types.ObjectId(userId))) {
      // Unlike post
      const filteredIds = post.likes.filter(
        (id) => !id.equals(new Types.ObjectId(userId)),
      );

      post.likes = filteredIds;
    } else {
      // Like post
      post.likes.push(new Types.ObjectId(userId));
    }
    await post.save();
    const response = await this.postModel.findById(postId).populate({
      path: 'userId',
      select: '-password -areaOfInterest -roleId -reset_password_token ',
    });
    return response;
  }

  async unlikePost(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Remove the user from likes
    post.likes = post.likes.filter((id) => id.toString() !== userId);
    await post.save();

    return post;
  }
}
