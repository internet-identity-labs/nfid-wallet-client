import Array "mo:base/Blob";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import TrieMap "mo:base/TrieMap";

module User {
  // public type UserId = Principal;
  public type User = {
    userName: Text;
  };
  public type UserId = Nat;
  public type StaticUsers = [(User.UserId, { userName: Text; })];
  public type UserEntities = TrieMap.TrieMap<UserId, User.User>;
  public type UserStore = {
    entities: UserEntities;
    nextUserId: UserId;
  };
  public type StaticUserStore = {
    entities: StaticUsers;
    nextUserId: UserId;
  };


  public func init(users: StaticUsers): UserStore {
    return {
      entities = TrieMap.fromEntries<UserId, User>(Iter.fromArray(users), Nat.equal, Hash.hash);
      nextUserId = 1
    }
  };

  public func persist(users: UserEntities, nextUserId: Nat): StaticUserStore {
    { entities = Iter.toArray(users.entries()); nextUserId = nextUserId }
  };

  public func create(users: UserEntities, userId: UserId, userName: Text) : UserId {
    let newProfile = {userName = userName};
    users.put(userId, newProfile);
    return userId;
  };

  public func read(users: UserEntities, userId: UserId) : ?User {
    return users.get(userId);
  };

  public func update(users: UserEntities, userId: UserId, user: User) : ?User {
    users.put(userId, user);
    return users.get(userId);
  }
}
