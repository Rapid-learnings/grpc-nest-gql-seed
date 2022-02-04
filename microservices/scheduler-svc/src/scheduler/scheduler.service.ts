import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import * as redis from 'redis';
const jobQueueKey = 'Events';
import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SchedulerService {
  private redisClient;
  constructor(private httpService: HttpService) {
    // create redis client with the redis server URL
    this.redisClient = redis.createClient({
      url: process.env.REDIS_URL,
    });
    this.redisClient.on('error', (err) =>
      console.log('Redis Client Error', err),
    );
    // connect to redis DB
    this.redisClient.connect();
  }

  async callEndpoint(URL, payload) {
    let response = null;
    try {
      // calling the post API for collection
      response = await this.httpService.post(URL, payload).toPromise();
    } catch (e) {
      const { error, statusCode } = e.response.data;
    }
  }

  async triggerEvent(type, id) {
    let payload = {};
    let URL = '';
    switch (type) {
      case 'collectionId':
        // await this.callEndpoint(`${process.env.BASE_URL}/collection/publish-collection/`, {
        //      collectionId: id,
        //    });
        payload = { collectionId: id };
        URL = `${process.env.BASE_URL}/collection/publish-collection/`;
        break;
      case 'nftId':
        payload = {
          id,
          type,
        };
        URL = `${process.env.BASE_URL}/collection/nft-auction-expiration/`;
        break;
      case 'offerId':
        payload = {
          id,
          type,
        };
        URL = `${process.env.BASE_URL}/collection/nft-auction-expiration/`;
        break;
      case 'componentId':
        payload = {
          componentId: id,
        };
        URL = `${process.env.BASE_URL}/collection/component-auction-expiration/`;
        break;
      default:
        console.log(`invalid type`);
        return;
    }
  }

  @Cron('*/10 * * * * *') // running this function every 10 seconds
  async getEvents() {
    console.log('hello');
    // current time in seconds
    const curr = Math.floor(Date.now() / 1000) + 1;
    this.redisClient;
    // fetching all events with with scor (date in seconds) less than current time
    let events = await this.redisClient.zRangeByScore(jobQueueKey, 0, curr);
    // if found any
    if (events.length) {
      console.log(events);
      // calling their respective endpoints in collections msc based on type
      events = await Promise.all(
        events.map(async (event) => {
          // slicing the type and id from string
          const type = event.split('_')[0];
          const id = event.split('_')[1];
          // call the Rest API for the event
          await this.triggerEvent(type, id);
          return event;
        }),
      );
      // removing the events from job queue as they are now triggered
      console.log(await this.redisClient.zRem(jobQueueKey, events));
    }
  }

  async createEvent(dto) {
    // creating event in DB, type is a string for differentiating between  events with different purposes
    let { scheduledDate, type, id } = dto;
    scheduledDate = Math.floor(new Date(scheduledDate).getTime() / 1000); // converting the iso date in string to time in seconds format
    // Using sorted set as a job queue
    return await this.redisClient.zAdd(jobQueueKey, {
      score: scheduledDate, // the scheduled date in seconds as the score
      value: type + '_' + id, // '<object type>_<ID of object>' as string
    });
  }
}
