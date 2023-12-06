import NonFungibleToken from "../contracts/NonFungibleToken.cdc"
import MetadataViews from "../contracts/MetadataViews.cdc"
import Joskicv2 from "../contracts/Joskicv2.cdc"

transaction(attributes: [[UInt64]]) {
  prepare(acct: AuthAccount) {
    let minterRef = acct.borrow<&Joskicv2.NFTMinter>(from: /storage/Joskicv2NFTMinter)
                    ?? panic("Could not borrow reference to NFTMinter resource")
    for attributeSet in attributes {
      minterRef.mintNFT(att1: attributeSet[0], att2: attributeSet[1], att3: attributeSet[2], att4: attributeSet[3])
    }
  }
  execute {
    log("NFTs minted.")
  }
}