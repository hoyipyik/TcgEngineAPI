const UsersController = require('./users.controller');
const UsersCardsController = require("./users.cards.controller");
const UsersFriendsController = require("./users.friends.controller");
const AuthTool = require('../authorization/auth.tool');
const config = require('../config');

const ADMIN = config.permissions.ADMIN; //Highest permision, can read and write all users
const SERVER = config.permissions.SERVER; //Middle permission, can read all users and grant rewards
const USER = config.permissions.USER; //Lowest permision, can only do things on same user

exports.route = function (app) {

  //Body: username, email, password, avatar
  app.post("/users/register", app.auth_limiter, [
    UsersController.RegisterUser,
  ]);

  app.get("/users", [
    AuthTool.isValidJWT,
    AuthTool.isPermissionLevel(USER),
    UsersController.GetAll,
  ]);

  app.get("/users/:userId", [
    AuthTool.isValidJWT,
    AuthTool.isPermissionLevel(USER),
    UsersController.GetUser,
  ]);

  // USER - EDITS ----------------------

  //Body: avatar, userId allows an admin to edit another user
  app.post("/users/edit/:userId", app.post_limiter, [
    AuthTool.isValidJWT,
    AuthTool.isPermissionLevel(USER),
    AuthTool.isSameUserOr(ADMIN),
    UsersController.EditUser,
  ]);

  //Body: permission
  app.post("/users/permission/edit/:userId", app.post_limiter, [
    AuthTool.isValidJWT,
    AuthTool.isPermissionLevel(ADMIN),
    UsersController.EditPermissions,
  ]);

  //Body: email
  app.post("/users/email/edit", app.auth_limiter, [
    AuthTool.isValidJWT,
    AuthTool.isPermissionLevel(USER),
    UsersController.EditEmail,
  ]);

  //Body: password_previous, password_new
  app.post("/users/password/edit", app.auth_limiter, [
    AuthTool.isValidJWT,
    AuthTool.isPermissionLevel(USER),
    UsersController.EditPassword,
  ]);

  //Body: email
  app.post("/users/password/reset", app.auth_limiter, [
    UsersController.ResetPassword,
  ]);

  //Body: addedCoinsNum
  app.post("/users/coins/purchase/", app.auth_limiter, [
    AuthTool.isValidJWT,
    AuthTool.isPermissionLevel(USER),
    UsersController.PaymentTrigger,
  ])

  app.post("/users/coins/pay/status", app.auth_limiter, [
    AuthTool.isValidJWT,
    AuthTool.isPermissionLevel(USER),
    UsersController.CoinsAddChecker,
  ])

  //body: email, code, password   (password is the new one)
  app.post("/users/password/reset/confirm", app.auth_limiter, [
    UsersController.ResetPasswordConfirm,
  ]);
  
  /*app.post("/users/delete/:userId", app.post_limiter, [
    AuthTool.isValidJWT,
    AuthTool.isPermissionLevel(ADMIN),
    UsersController.Delete,
  ]);*/
  
  // USER - EMAIL CONFIRMATION ---------------------------

  //Email confirm
  app.get("/users/email/confirm/:userId/:code", [
    UsersController.ConfirmEmail,
  ]);

  //Ask to resend confirmation email
  app.post("/users/email/resend", app.auth_limiter, [
    AuthTool.isValidJWT,
    AuthTool.isPermissionLevel(USER),
    UsersController.ResendEmail,
  ]);

  //Send a test email to one email address
  //body: title, text, email
  app.post("/users/email/send", app.auth_limiter, [
    AuthTool.isValidJWT,
    AuthTool.isPermissionLevel(ADMIN),
    UsersController.SendEmail,
  ]);

  // USER - CARDS --------------------------------------

  app.post("/users/cards/add/:userId", app.post_limiter, [
    AuthTool.isValidJWT,
    AuthTool.isPermissionLevel(SERVER),
    UsersCardsController.AddCards,
  ]);

  app.post("/users/packs/add/:userId", app.post_limiter, [
    AuthTool.isValidJWT,
    AuthTool.isPermissionLevel(SERVER),
    UsersCardsController.AddPacks,
  ]);

  app.post("/users/packs/open/", app.post_limiter, [
    AuthTool.isValidJWT,
    AuthTool.isPermissionLevel(USER),  
    UsersCardsController.OpenPack,
  ]);

  app.post("/users/packs/buy/", app.post_limiter, [
    AuthTool.isValidJWT,
    AuthTool.isPermissionLevel(USER),  
    UsersCardsController.BuyPack,
  ]);

  app.post("/users/packs/sell/", app.post_limiter, [
    AuthTool.isValidJWT,
    AuthTool.isPermissionLevel(USER),  
    UsersCardsController.SellPack,
  ]);

  app.post("/users/cards/buy/", app.post_limiter, [
    AuthTool.isValidJWT,
    AuthTool.isPermissionLevel(USER),  
    UsersCardsController.BuyCard,
  ]);

  app.post("/users/cards/sell/", app.post_limiter, [
    AuthTool.isValidJWT,
    AuthTool.isPermissionLevel(USER),  
    UsersCardsController.SellCard,
  ]);


  // USER - DECKS --------------------------------------

  //Decks
  app.post('/users/deck/:deckId', app.post_limiter, [
      AuthTool.isValidJWT,
      AuthTool.isPermissionLevel(USER),
      UsersCardsController.UpdateDeck
  ]);
  app.delete('/users/deck/:deckId', app.post_limiter, [
      AuthTool.isValidJWT,
      AuthTool.isPermissionLevel(USER),
      UsersCardsController.DeleteDeck
  ]);

  // USER - Friends --------------------------------------

  //body: username (friend username)
  app.post("/users/friends/add/", app.post_limiter, [
    AuthTool.isValidJWT,
    AuthTool.isPermissionLevel(USER),
    UsersFriendsController.AddFriend,
  ]);

  //body: username (friend username)
  app.post("/users/friends/remove/", app.post_limiter, [
    AuthTool.isValidJWT,
    AuthTool.isPermissionLevel(USER),
    UsersFriendsController.RemoveFriend,
  ]);

  app.get("/users/friends/list/", [
    AuthTool.isValidJWT,
    AuthTool.isPermissionLevel(USER),
    UsersFriendsController.ListFriends,
  ]);

  // USER - REWARDS ---------------------------

  app.post("/users/rewards/gain/:userId", app.post_limiter, [
    AuthTool.isValidJWT,
    AuthTool.isPermissionLevel(USER),
    AuthTool.isSameUserOr(SERVER),
    UsersController.GainReward,
  ]);

  // USER - STATS ---------------------------

  app.get("/online", [
    UsersController.GetOnline
  ]);

  // USER - 邮箱

  //发放奖励
  //Body: title, description, rewards[], filter
  app.post("/users/mailbox/addReward", app.post_limiter, [
    AuthTool.isValidJWT,
    AuthTool.isPermissionLevel(ADMIN),
    UsersController.AddRewardToMailbox,
  ])

  //领取奖励
  //Body: reward
  app.post("/users/mailbox/getReward", app.post_limiter, [
    AuthTool.isValidJWT,
    AuthTool.isPermissionLevel(USER),
    UsersController.GetRewardFromMailbox,
  ])
};