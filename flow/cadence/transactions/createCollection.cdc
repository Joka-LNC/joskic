import Joskicv2 from "../contracts/Joskicv2.cdc"
import NonFungibleToken from "../contracts/NonFungibleToken.cdc"
import MetadataViews from "../contracts/MetadataViews.cdc"

transaction() {
  
  prepare(signer: AuthAccount) {
  
    if signer.borrow<&Joskicv2.Collection>(from: Joskicv2.CollectionStoragePath) == nil {
      signer.save(<- Joskicv2.createEmptyCollection(), to: Joskicv2.CollectionStoragePath)
      signer.link<&Joskicv2.Collection{NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection}>(Joskicv2.CollectionPublicPath, target: Joskicv2.CollectionStoragePath)
    }
  }

  execute {
    log("Collection created.")
  }
}