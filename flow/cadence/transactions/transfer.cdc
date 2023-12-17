import Joskicv2 from "../contracts/Joskicv2.cdc"
import NonFungibleToken from "../contracts/NonFungibleToken.cdc"

transaction(recipient: Address, withdrawID: UInt64) {
  let ProviderCollection: &Joskicv2.Collection{NonFungibleToken.Provider}
  let RecipientCollection: &Joskicv2.Collection{NonFungibleToken.CollectionPublic}
  
  prepare(signer: AuthAccount) {
    self.ProviderCollection = signer.borrow<&Joskicv2.Collection{NonFungibleToken.Provider}>(from: Joskicv2.CollectionStoragePath)
                                ?? panic("This user does not have a Collection.")

    self.RecipientCollection = getAccount(recipient).getCapability(Joskicv2.CollectionPublicPath)
                                .borrow<&Joskicv2.Collection{NonFungibleToken.CollectionPublic}>()!
  }

  execute {
    self.RecipientCollection.deposit(token: <- self.ProviderCollection.withdraw(withdrawID: withdrawID))
  }
}