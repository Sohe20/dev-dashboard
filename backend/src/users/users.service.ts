
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

 async findAll(): Promise<Omit<User, 'password'>[]> {
  const users = await this.usersRepository.find();
  return users.map(({ password, ...rest }) => rest);
}


  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  create(name: string, email: string, password: string): Promise<User> {
    const user = this.usersRepository.create({ name, email, password });
    return this.usersRepository.save(user);
  }
}