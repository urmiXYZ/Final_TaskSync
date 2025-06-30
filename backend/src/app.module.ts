import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ManageUserModule } from './manage-user/manage-user.module'; 
import { AppService } from './app.service'; // ✅ IMPORT THIS
import { User } from './user/entities/user.entity';
import { Role } from './user/entities/role.entity';
import { PasswordResetRequest } from './user/entities/password-reset-request.entity';
import { RequestUser } from './user/entities/request-user.entity';
import { Category } from './category/entities/category.entity';
import { Conversation } from './user/entities/conversation.entity';
import { ConversationParticipant } from './user/entities/participants.entity';
import { Message } from './user/entities/message.entity';
import { FeedbackModule } from './feedback/feedback.module';
import { ProjectModule } from './project/project.module';
import { Project } from './user/entities/project.entity';
import { TeamMember } from './user/entities/teamMembers.entity';
import { ConfigModule } from '@nestjs/config';
import { ConversationModule } from './chat/conversation.module';
import { PersonalTask } from './user/entities/personal-task.entity';
import { PersonalTaskModule } from './personal-task/personal-task.module';
import { SalaryModule } from './salary/salary.module';
import { Task } from './user/entities/task.entity';
import { Salary } from './user/entities/salary.entity';
import { SalaryPayment } from './user/entities/salary-payment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
  isGlobal: true,
  load: [
    () => ({
      JWT_SECRET: 'my-very-secret-key', // <-- just put any string here
    }),
  ],
}),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'task_management',
      entities: [
        User,
        Role,
        PasswordResetRequest,
        RequestUser,
        Category,
        Conversation,
        ConversationParticipant,
        Message,
        Project,
        TeamMember,
        PersonalTask,
        Task,
        Salary,SalaryPayment
      ],
      synchronize: true,
    }),
    AuthModule,
    UserModule,
    CategoryModule,
    DashboardModule,
    ManageUserModule, 
    FeedbackModule,
    ProjectModule,
    ConversationModule,
    PersonalTaskModule,
    SalaryModule,
  ],
  providers: [AppService],
})
export class AppModule {}



