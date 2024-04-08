import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClimateVaultDto } from './dto/create-climate-vault.dto';
import { UpdateClimateVaultDto } from './dto/update-climate-vault.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ClimateVault } from './entities/climate-vault.entity';
import { Model } from 'mongoose';
import { Category } from './entities/category.entity';

@Injectable()
export class ClimateVaultService {
  constructor(
    @InjectModel(ClimateVault.name)
    private climateVaultModel: Model<ClimateVault>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}
  async create(
    userId: string,
    createClimateVaultDto: CreateClimateVaultDto,
  ): Promise<ClimateVault> {
    const category = await this.categoryModel.findById(
      createClimateVaultDto.category_id,
    );
    if (!category) {
      throw new Error('Category not found');
    }

    const createdClimateVault = new this.climateVaultModel({
      ...createClimateVaultDto,
      category: category._id,
      userId: userId,
      file: createClimateVaultDto.file?.path ?? '',
    });

    return createdClimateVault.save();
  }

  async findAll(
    userId: string,
    filterList?: {
      type: string;
      category_id: string;
      search: string;
      sortKey: string;
      sortBy: string;
      page: number;
      pageSize: number;
    },
  ): Promise<{ data: ClimateVault[]; total: number; page: number }> {
    const { type, category_id, search, sortKey, sortBy, page, pageSize } =
      filterList || {};

    let query = this.climateVaultModel.find();

    // Filter by type
    if (type) {
      query = query.where('type').equals(type);
    }

    // Filter by category_id
    if (category_id) {
      query = query.where('category_id').equals(category_id);
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

  async findAllCategory(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async findOne(id: string): Promise<ClimateVault> {
    const climateVault = await this.climateVaultModel
      .findById(id)
      .populate('category')
      .populate('userId')
      .exec();
    if (!climateVault) {
      throw new NotFoundException(`ClimateVault with ID ${id} not found`);
    }
    return climateVault;
  }

  async update(
    id: string,
    updateClimateVaultDto: UpdateClimateVaultDto,
  ): Promise<ClimateVault> {
    const existingClimateVault = await this.climateVaultModel.findByIdAndUpdate(
      id,
      updateClimateVaultDto,
      { new: true },
    );
    if (!existingClimateVault) {
      throw new NotFoundException(`ClimateVault with ID ${id} not found`);
    }
    return existingClimateVault;
  }

  async remove(id: string) {
    const deletedClimateVault = await this.climateVaultModel
      .deleteOne({ _id: id })
      .exec();
    if (!deletedClimateVault) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return deletedClimateVault;
  }

  async seed() {
    try {
      // Check if the Category collection is empty
      const count = await this.categoryModel.countDocuments().exec();
      if (count > 0) {
        console.log('Category collection already seeded.');
        return;
      }

      // Create Category items
      const categories = [
        { name: 'Public Policy' },
        { name: 'Carbon capture' },
        { name: 'Category name' },
      ];

      await this.categoryModel.create(categories);

      console.log('Category collection seeded successfully.');
    } catch (error) {
      console.error('Error seeding Category collection:', error);
    }
  }
}
