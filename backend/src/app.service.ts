import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserService } from './user/user.service'; 

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly userService: UserService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async onModuleInit() {
    await this.userService.cleanUnusedAvatars();
  }
}
