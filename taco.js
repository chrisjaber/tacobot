const DB = require("./db.js");
const slack = require("./slack.js");

const populate = () => {
  slack
    .getAllUsers()
    .then(formatUsers)
    .then(writeMembers)
    .then(() => {
      console.log("POPULATED DB!");
    })
    .catch(e => {
      console.log("ERROR WHEN POPULATING DB :(");
      console.log(e);
    });
};

const init = () => {
  if (!DB.exists()) populate();
};

const update = () => {
    populate();
};

const formatUsers = users => {
  const members = users.members.filter(user=>!user.deleted);
  return members.map(member => ({
    id: member.id,
    name: member.name
  }));
};

const updateUserName = (DBUser, APIMember) => {
  return { ...DBUser, name: APIMember.name };
};

const writeMembers = APIMembers => {
  const DBUsers = DB.getUsers();
  const formattedDBUsers = APIMembers.map(APIMember => {
    const DBUser = DBUsers.find(dbu => dbu.id === APIMember.id);
    if (DBUser !== undefined) return updateUserName(DBUser, APIMember);
    else return { ...APIMember, tacos: 0, left: 5, given: 0 };
  });
  DB.saveUsers(formattedDBUsers);
};

const giveTaco = (index, amount = 1) => {
  const DBUsers = DB.getUsers();
  const user = DBUsers[index];
  DBUsers[index] = { ...user, tacos: user.tacos + amount };
  DB.saveUsers(DBUsers);
};

const removeLeft = (index, amount = 1) => {
  const DBUsers = DB.getUsers();
  const user = DBUsers[index];
  DBUsers[index] = { ...user, left: user.left - amount, given: user.given + amount };
  DB.saveUsers(DBUsers);
};

const resetLeft = () => {
  const DBUsers = DB.getUsers();
  const fullUsers = DBUsers.map(user => ({ ...user, left: 5 }));
  DB.saveUsers(fullUsers);
};

module.exports = {
  init,
  update,
  writeMembers,
  giveTaco,
  removeLeft,
  resetLeft
};
