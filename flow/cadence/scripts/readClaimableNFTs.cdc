import Joskicv2 from "../contracts/Joskicv2.cdc"

pub fun main():[Joskicv2.CustomMetadata] {

    var answer: [Joskicv2.CustomMetadata] = []

    for key in Joskicv2.claimableNFTs.keys {
        let nft = &Joskicv2.claimableNFTs[key] as &Joskicv2.NFT?
        let metadata = nft?.resolveView(Type<Joskicv2.CustomMetadata>())
        if let unwrappedMetadata = metadata {
            if let fullyUnwrapped = unwrappedMetadata {
                answer.append(fullyUnwrapped as! Joskicv2.CustomMetadata)
            }
        }
    }
    return answer
}