import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/user/entities/project.entity';
import { Repository, Like } from 'typeorm';
import { ILike } from 'typeorm';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async findAll(): Promise<Project[]> {
    return this.projectRepository.find({
      relations: ['owner'],
      order: { createdAt: 'DESC' },
    });
  }

  async searchProjects(term: string): Promise<Project[]> {
  return this.projectRepository.find({
    where: [
      { name: ILike(`%${term}%`) },
      { description: ILike(`%${term}%`) },
    ],
    relations: ['owner'],
    order: { createdAt: 'DESC' },
  });

  
}

async createProject(name: string, description: string): Promise<Project> {
    const existing = await this.projectRepository.findOne({ where: { name } });
    if (existing) {
      throw new BadRequestException('Project with this name already exists.');
    }
    const project = this.projectRepository.create({ name, description });
    return this.projectRepository.save(project);
  }


}

