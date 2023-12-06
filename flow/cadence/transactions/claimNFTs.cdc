import NonFungibleToken from "../contracts/NonFungibleToken.cdc"
import MetadataViews from "../contracts/MetadataViews.cdc"
import Joskicv2 from "../contracts/Joskicv2.cdc"

transaction(numNFTs: Int) {
  prepare(acct: AuthAccount) {
    let collectionRef = acct.borrow<&Joskicv2.Collection{NonFungibleToken.CollectionPublic}>(from: Joskicv2.CollectionStoragePath)
                                                                                ?? panic("Could not borrow reference to Collection")
    var i = 0
      while i < numNFTs {
        let nft <- Joskicv2.claimNFT()
        collectionRef.deposit(token: <-nft)
        i = i + 1
      }
  }
  execute {
    log("NFTs claimed.")
  }
}