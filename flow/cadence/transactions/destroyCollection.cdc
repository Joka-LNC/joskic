import Joskicv2 from "../contracts/Joskicv2.cdc"
import NonFungibleToken from "../contracts/NonFungibleToken.cdc"

transaction {
  prepare(signer: AuthAccount) {
        destroy signer.load<@NonFungibleToken.Collection>(from: Joskicv2.CollectionStoragePath)
        signer.unlink(Joskicv2.CollectionPublicPath)
  }
}