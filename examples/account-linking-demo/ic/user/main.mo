import Array "mo:base/Blob";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import TrieMap "mo:base/TrieMap";

module User {
  // public type UserId = Principal;
  public type UserId = Nat;
  public type UserEntities = TrieMap.TrieMap<UserId, User>;
  public type UserMap = TrieMap.TrieMap<Principal, UserId>;
  public type User = {
    firstName: Text;
  };

  public func init(users: [(UserId, User)]): UserEntities {
    return TrieMap.fromEntries<UserId, User>(Iter.fromArray(users), Principal.equal, Principal.hash)
  };

  public func persist(users: UserEntities): [(UserId, User)] {
    Iter.toArray(users.entries())
  };

  public func create(users: UserEntities, p: Principal) : User {
    let newProfile = {firstName = ""};
    users.put(p, newProfile);
    return newProfile;
  };

  public func read(users: UserEntities, p: Principal) : ?User {
    return users.get(p);
  };

  public func update(users: UserEntities, p: Principal, user: User) : ?User {
    users.put(p, user);
    return users.get(p);
  }
}
