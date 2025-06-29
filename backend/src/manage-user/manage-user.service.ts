import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestUser } from '../user/entities/request-user.entity';
import { User } from '../user/entities/user.entity';
import { Role } from '../user/entities/role.entity';
import * as fastcsv from 'fast-csv';
import { Response } from 'express';

@Injectable()
export class ManageUserService {
  constructor(
    @InjectRepository(RequestUser) private requestUserRepo: Repository<RequestUser>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>
  ) {}
  
async getAllRequestUsers(): Promise<RequestUser[]> {
    return await this.requestUserRepo.find();
  }
  
  async addUserFromRequest(id: number, roleName: 'manager' | 'employee') {
    const requestUser = await this.requestUserRepo.findOne({ where: { id } });
    if (!requestUser) throw new NotFoundException('Request user not found');

    const role = await this.roleRepo.findOne({ where: { name: roleName } });
    if (!role) throw new NotFoundException('Role not found');

    const user = this.userRepo.create({
      username: requestUser.name,
      email: requestUser.email,
      password: requestUser.password,
      role,
    });

    await this.userRepo.save(user);
    await this.requestUserRepo.delete({ id });

    return { message: `${roleName} added successfully`, user };
  }

  async getUsersByRole(roleName: string) {
    return this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('role.name = :roleName', { roleName })
      .getMany();
  }
  
  async searchUsers(term: string): Promise<User[]> {
    if (!term) {
      throw new BadRequestException('Search term is required');
    }
  
    const isNumeric = /^\d+$/.test(term); 
  
    const query = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role');
  
    if (isNumeric) {
      query.where('CAST(user.id AS TEXT) = :term', { term });
    } else {
      query.where('user.username ILIKE :term', { term: `%${term}%` });
    }
  
    return query.getMany();
  }
  
  async searchUsersByRole(term: string, roleName: string): Promise<User[]> {
  if (!term) {
    throw new BadRequestException('Search term is required');
  }

  const isNumeric = /^\d+$/.test(term);

  const query = this.userRepo
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.role', 'role')
    .where('role.name = :roleName', { roleName });

  if (isNumeric) {
    query.andWhere('CAST(user.id AS TEXT) = :term', { term });
  } else {
    query.andWhere('user.username ILIKE :term', { term: `%${term}%` });
  }

  return query.getMany();
}

  
async filterUsersByDate(startDate: string, endDate: string): Promise<User[]> {
  if (!startDate || !endDate) {
    throw new BadRequestException('Both startDate and endDate are required');
  }

  const start = new Date(startDate);
  const end = new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000); 

  return this.userRepo
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.role', 'role')
    .where('user.createdAt BETWEEN :start AND :end', {
      start,
      end,
    })
    .getMany();
}

async filterUsersByRoleAndDate(roleName: string, startDate: string, endDate: string): Promise<User[]> {
  const start = new Date(startDate);
  const end = new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000);

  return this.userRepo
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.role', 'role')
    .where('role.name = :roleName', { roleName })
    .andWhere('user.createdAt BETWEEN :start AND :end', { start, end })
    .getMany();
}

  
  async exportAllUsersToCSV(res: Response): Promise<void> {
    const users = await this.userRepo.find({
      relations: ['role'],
      order: { id: 'ASC' }, 
    });
  
    const data = users.map(user => ({
      id: user.id,
      name: user.username,
      email: user.email,
      role: user.role?.name || 'Unknown', 
      createdAt: user.createdAt.toLocaleString('en-BD'),
      updatedAt: user.updatedAt.toLocaleString('en-BD'),
    }));
  
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=all-users.csv');
  
    const csvStream = fastcsv.format({ headers: true });
    csvStream.pipe(res);
    data.forEach(row => csvStream.write(row));
    csvStream.end();
  }

  async exportUsersByRoleToCSV(roleName: string, res: Response): Promise<void> {
    const users = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('role.name = :roleName', { roleName })
      .getMany();

    const data = users.map(user => ({
      ID: user.id,
      Name: user.username,
      Email: user.email,
      Role: user.role?.name || 'N/A',
      CreatedAt: user.createdAt.toISOString(),
      UpdatedAt: user.updatedAt.toISOString(),
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${roleName}-users.csv`);

    const csvStream = fastcsv.format({ headers: true });
    csvStream.pipe(res);
    data.forEach(row => csvStream.write(row));
    csvStream.end();
  }
  
async changeUserRole(id: number, newRole: 'manager' | 'employee') {
  const user = await this.userRepo.findOne({
    where: { id },
    relations: ['role'],
  });

  if (!user) throw new NotFoundException('User not found');
  if (user.role.name === newRole) {
    throw new BadRequestException('User already has this role');
  }

  const newRoleEntity = await this.roleRepo.findOneBy({ name: newRole });
  if (!newRoleEntity) throw new NotFoundException('Target role not found');

  user.role = newRoleEntity;
  await this.userRepo.save(user);

  return { message: `Role updated to ${newRole}` };
}

async setDisabledStatus(id: number, status: boolean | null) {
  const user = await this.userRepo.findOneBy({ id });
  if (!user) throw new NotFoundException('User not found');
  user.isDisabled = status;
  await this.userRepo.save(user);
  return { message: status ? 'User disabled' : 'User enabled' };
}

}
