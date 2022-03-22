import Prelude "mo:base/Prelude";
import Iter "mo:base/Iter";

import User "./user/main"

shared (install) actor class GinActor () {
    let admin = install.caller;

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    // USER

    stable var usersStatic: [(User.UserId, User.User)] = [];
    let users = User.init(usersStatic);

    // REGISTER
    public shared ({caller}) func userCreate() : async User.User {
      User.create(users, caller)
    };

    // READ
    public shared ({caller}) func userRead() : async ?User.User {
      User.read(users, caller)
    };

    // UPDATE
    public shared ({caller}) func userUpdate(user: User.User) : async ?User.User {
      User.update(users, caller, user)
    };

    // DELETE
    public shared ({caller}) func userDelete() : async User.User {
      Prelude.nyi() // to do -- for testing / upgrades sub-story
    };

    // USER
    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    // SYSTEM
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    system func preupgrade() {
      usersStatic := User.persist(users);
    };
    system func postupgrade() {
      usersStatic := [];
    };
}
