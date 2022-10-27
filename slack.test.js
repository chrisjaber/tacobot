const slack = require("./slack.js");

const formatUsers = users => {
  const members = users.members.filter(user=>!user.deleted);
  return members.map(member => ({
    id: member.id,
    name: member.name
  }));
};

slack
.getAllUsers()
.then(formatUsers)
.then((users) => {
  console.log("POPULATED DB!");
  console.log(users)
})
.catch(e => {
  console.log("ERROR WHEN POPULATING DB :(");
  console.log(e);
});

