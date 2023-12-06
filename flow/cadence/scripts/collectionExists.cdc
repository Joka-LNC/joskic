import Joskicv2 from "../contracts/Joskicv2.cdc"
import NonFungibleToken from "../contracts/NonFungibleToken.cdc"
import MetadataViews from "../contracts/MetadataViews.cdc"

pub fun main(address: Address): Bool {
  let collectionCapability = getAccount(address).getCapability<&Joskicv2.Collection{NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection}>(Joskicv2.CollectionPublicPath)
  return collectionCapability.check()
}