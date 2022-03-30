import Prelude "mo:base/Prelude";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";

import User "./user/main";
import Authenticator "./authenticator/main";

shared (install) actor class GinActor () {
    let admin = install.caller;

    public type Result<Data, Err> = {
      #data : Data;
      #err : Err;
    };

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    // USER

    stable var stableUsers: User.StaticUserStore = {entities = []; nextUserId = 1; };
    var nextUserId = stableUsers.nextUserId;
    let users = User.init(stableUsers.entities);


    // USER
    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    // AUTHENTICATOR

    stable var stableAuthenticators: Authenticator.StaticAuthenticators = [];
    let authenticators = Authenticator.init(stableAuthenticators);

    // AUTHENTICATOR
    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

    public shared ({caller}) func whoami() : async Principal {
      return caller;
    };

    public shared ({caller}) func readAccount() : async Result<User.User, Text>{
      switch (Authenticator.read(authenticators, Principal.toText(caller))) {
        case (?userId) {
          switch(User.read(users.entities, userId)){
            case (?user) {
              return #data user;
            };
            case(_) {
              return #err "user not found";
            };
          }
        };
        case(_) {
          #err "not registered";
        };
      }
    };

    // REGISTER
    public shared ({caller}) func register(userName: Text) : async Result<User.User, Text> {
      switch (Authenticator.read(authenticators, Principal.toText(caller))) {
        case (null) {
          let userId = User.create(users.entities, nextUserId, userName);
          nextUserId := nextUserId + 1;
          let authenticator = Authenticator.create(authenticators, Principal.toText(caller), userId);
          switch (User.read(users.entities, userId)) {
            case (?user) {
              return #data user;
            };
            case(_) {
              return #err "User not found";
            };
          };
        };
        case (_) {
          return #err "already registered";
        }
      }
    };

    public shared ({caller}) func linkAuthenticator(principalId: Text) : async Result<Text, Text> {
      switch (Authenticator.read(authenticators, principalId)) {
        case (null) {
          switch (Authenticator.read(authenticators, Principal.toText(caller))) {
            case (?userId) {
              let authenticator = Authenticator.create(authenticators, principalId, userId);
              return #data "account linked";
            };
            case (_) {
              return #err "not registered";
            }
          }
        };
        case (_) {
          return #err "already linked my friend";
        }
      }
    };

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    // SYSTEM
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    system func preupgrade() {
      stableUsers:= User.persist(users.entities, nextUserId);
      stableAuthenticators := Authenticator.persist(authenticators);
    };
    system func postupgrade() { };
}
