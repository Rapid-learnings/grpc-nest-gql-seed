import { Field, ObjectType, Int, Float } from '@nestjs/graphql';
import { Users } from '../../user/typeDef/resolver-type';

@ObjectType()
export class Admins {
  @Field({ nullable: true, description: 'tells the name' })
  name: string;
}

@ObjectType()
export class ListUsersDef {
  @Field((type) => Int)
  totalUsers: number;

  @Field(() => [Users], {
    nullable: true,
    description: "tells the user's information",
  })
  users: Users[];
}

@ObjectType()
export class UpdateUserDef {
  @Field(() => Users, {
    nullable: true,
    description: "tells the user's information",
  })
  user?: Users;

  @Field({ nullable: true, description: "tells the user's update status" })
  message: string;
}
