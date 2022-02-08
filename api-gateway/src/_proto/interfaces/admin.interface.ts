export interface AdminServiceInterface {
  listUsers(ListUsersDto);
  updateUser(UpdateUserDto);
  healthCheck(MessageDef);
}
