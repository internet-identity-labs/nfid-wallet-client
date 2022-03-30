import Array "mo:base/Blob";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import TrieMap "mo:base/TrieMap";

module Authenticator {
  public type StaticAuthenticators = [(Text, Nat)];
  public type AuthenticatorUserMap = TrieMap.TrieMap<Text, Nat>;

  public func init(authenticators: StaticAuthenticators): AuthenticatorUserMap {
    return TrieMap.fromEntries<Text, Nat>(Iter.fromArray(authenticators), Text.equal, Text.hash)
  };

  public func persist(authenticators: AuthenticatorUserMap): StaticAuthenticators {
    Iter.toArray(authenticators.entries())
  };

  public func create(authenticators: AuthenticatorUserMap, principal: Text, userId: Nat) : ?Nat {
    authenticators.put(principal, userId);
    return authenticators.get(principal);
  };

  public func read(authenticators: AuthenticatorUserMap, principal: Text) : ?Nat {
    return authenticators.get(principal);
  };

  public func update(authenticators: AuthenticatorUserMap, principal: Text, userId: Nat) : ?Nat {
    authenticators.put(principal, userId);
    return authenticators.get(principal);
  }
}
