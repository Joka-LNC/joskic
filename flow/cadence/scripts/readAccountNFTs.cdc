import Joskicv2 from "../contracts/Joskicv2.cdc"
import MetadataViews from "../contracts/MetadataViews.cdc"

pub fun main(address: Address): [Joskicv2.CustomMetadata] {
    let collection = getAccount(address).getCapability(Joskicv2.CollectionPublicPath)
                    .borrow<&Joskicv2.Collection{MetadataViews.ResolverCollection}>()
                    ?? panic("Could not borrow a reference to the collection")

    let ids = collection.getIDs()

    var answer: [Joskicv2.CustomMetadata] = []

    for id in ids {
        let nft = collection.borrowViewResolver(id: id)
        let view = nft.resolveView(Type<Joskicv2.CustomMetadata>())!
        let customMetadata = view as! Joskicv2.CustomMetadata
        answer.append(customMetadata)
    }

    return answer
}