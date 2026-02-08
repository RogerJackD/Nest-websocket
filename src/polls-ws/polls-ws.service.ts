import { Injectable } from '@nestjs/common';
import { UpdatePollDto } from './dto/update-poll.dto';
import { CreatePollDto } from './dto/create-poll.dto';
import { Repository } from 'typeorm';
import { Poll } from './entities/polls.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { WsException } from '@nestjs/websockets';
import { VotePollDto } from './dto/vote-poll.dto';

@Injectable()
export class PollsWsService {
  
  constructor(
    @InjectRepository(Poll)
    private readonly pollRepository : Repository<Poll>,
  ) {}

  async create(createPollDto: CreatePollDto) {

    const votes = new Array(createPollDto.options.length).fill(0);

    const newPoll = this.pollRepository.create({...createPollDto, votes})

    return await this.pollRepository.save(newPoll);
  }

  findAll() {
    return this.pollRepository.find();
  }

  async findOne(id: number) {
    const pollFound = await this.pollRepository.findOneBy({id});

    if( !pollFound ) throw new WsException(`Poll with ID ${id} not Found`);

    return pollFound;
  }

  update(updatePollsWDto: UpdatePollDto) {
    return `This action updates a pollsW`;
  }

  async remove(id: number) {
    const pollFound =  await this.findOne(id);

    this.pollRepository.remove(pollFound);

    return true;
  }

  async votePoll(votePollDto: VotePollDto){
    const pollFound = await this.findOne(votePollDto.pollId);

    if( votePollDto.optionIndex >= pollFound.options.length || votePollDto.optionIndex < 0) throw new WsException("optionIndex is biggest than the options poll");

    pollFound.votes[votePollDto.optionIndex] += 1;

    return this.pollRepository.save(pollFound);
  }
}
