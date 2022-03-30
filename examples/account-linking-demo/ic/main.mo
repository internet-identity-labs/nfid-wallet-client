import Prelude "mo:base/Prelude";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";

import User "./user/main";
import Authenticator "./authenticator/main";

shared (install) actor class NFIDAccountLinkingActor () {
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

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    // AUTHENTICATOR
    stable var stableAuthenticators: Authenticator.StaticAuthenticators = [];
    let authenticators = Authenticator.init(stableAuthenticators);


    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    // Returns principal id of the method caller
    public shared query({caller}) func whoami() : async Principal {
      return caller;
    };

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    // Returns the registered account linked to the method caller
    public shared query({caller}) func readAccount() : async Result<User.User, Text>{
      if (Principal.isAnonymous(caller)) {
        return #err "unauthenticated"
      };

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

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    // Registers a new account and links it to the method caller
    public shared ({caller}) func register(userName: Text) : async Result<User.User, Text> {
      if (Principal.isAnonymous(caller)) {
        return #err "unauthenticated"
      };

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

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    // Links the account of the method caller to a given
    // authenticator (principalId)
    public shared ({caller}) func linkAuthenticator(principalId: Text) : async Result<Text, Text> {
      if (Principal.isAnonymous(caller)) {
        return #err "unauthenticated"
      };

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
    system func preupgrade() {
      stableUsers:= User.persist(users.entities, nextUserId);
      stableAuthenticators := Authenticator.persist(authenticators);
    };
    system func postupgrade() { };
}
