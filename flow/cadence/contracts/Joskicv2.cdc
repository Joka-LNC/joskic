import NonFungibleToken from "./NonFungibleToken.cdc"
import MetadataViews from "./MetadataViews.cdc"
import FungibleToken from "./FungibleToken.cdc"

pub contract Joskicv2: NonFungibleToken {

    pub var totalSupply: UInt64

    pub event ContractInitialized()

    pub event Withdraw(id: UInt64, from: Address?)
    
    pub event Deposit(id: UInt64, to: Address?)

    pub let CollectionStoragePath: StoragePath
    pub let CollectionPublicPath: PublicPath
    pub let NFTMinterStoragePath: StoragePath

    pub var claimableNFTs: @{UInt64: NFT}

    pub var nextNFTID: UInt64

    pub struct CustomMetadata {
        pub let id: UInt64
        pub let name: String
        pub let att1: UInt64
        pub let att2: UInt64
        pub let att3: UInt64
        pub let att4: UInt64

        init(id: UInt64, name: String, att1: UInt64, att2: UInt64, att3: UInt64, att4: UInt64) {
            self.id = id
            self.name = name
            self.att1 = att1
            self.att2 = att2
            self.att3 = att3
            self.att4 = att4
        }
    }

    pub resource NFT: NonFungibleToken.INFT, MetadataViews.Resolver {
        pub let id: UInt64
        pub let name: String
        pub let att1: UInt64
        pub let att2: UInt64
        pub let att3: UInt64
        pub let att4: UInt64

        init(
            id: UInt64,
            name: String,
            att1: UInt64,
            att2: UInt64,
            att3: UInt64,
            att4: UInt64
        ){
            self.id = id
            self.name = name
            self.att1 = att1
            self.att2 = att2
            self.att3 = att3
            self.att4 = att4
            Joskicv2.totalSupply = Joskicv2.totalSupply + 1
        }

        pub fun getViews(): [Type] {
            return [
                Type<MetadataViews.Display>()
            ]
        }
        
        pub fun resolveView(_ view: Type): AnyStruct? {
            switch view {
                case Type<CustomMetadata>():
                    return CustomMetadata(
                        id: self.id,
                        name: self.name,
                        att1: self.att1,
                        att2: self.att2,
                        att3: self.att3,
                        att4: self.att4
                    )
                default:
                    return nil
            }
        }
    }
    
    pub resource Collection: NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection {
        // dictionary of NFT conforming tokens
        // NFT is a resource type with an `UInt64` ID field
        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        // withdraw removes an NFT from the collection and moves it to the caller
        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("missing NFT")

            emit Withdraw(id: token.id, from: self.owner?.address)

            return <-token
        }

        // deposit takes a NFT and adds it to the collections dictionary
        // and adds the ID to the id array
        pub fun deposit(token: @NonFungibleToken.NFT) {
            let token <- token as! @Joskicv2.NFT

            let id: UInt64 = token.id

            // add the new token to the dictionary which removes the old one
            self.ownedNFTs[id] <-! token

            emit Deposit(id: id, to: self.owner?.address)
        }

        // getIDs returns an array of the IDs that are in the collection
        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        // borrowNFT gets a reference to an NFT in the collection
        // so that the caller can read its metadata and call its methods
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            return (&self.ownedNFTs[id] as &NonFungibleToken.NFT?)!
        }

        pub fun borrowViewResolver(id: UInt64): &AnyResource{MetadataViews.Resolver} {
            let nft = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
            let Joskicv2NFT = nft as! &Joskicv2.NFT
            return Joskicv2NFT
        }

        destroy() {
            destroy self.ownedNFTs
        }

        init () {
            self.ownedNFTs <- {}
        }
    }

    pub fun createEmptyCollection(): @Collection {
        return <- create Collection()
    }

    pub fun claimNFT(): @NonFungibleToken.NFT {
        let minterRef = self.account.borrow<&NFTMinter>(from: self.NFTMinterStoragePath)
            ?? panic("Could not borrow reference to NFTMinter resource")
        let id = minterRef.remainingIDs[0]
        let nft <- self.claimableNFTs.remove(key: id) ?? panic("No NFT available to claim")
        minterRef.removeID()
        return <-nft
    }

    pub fun getRemainingIDs(): [UInt64] {
        let minterRef = self.account.borrow<&NFTMinter>(from: self.NFTMinterStoragePath)
            ?? panic("Could not borrow reference to NFTMinter resource")
        return minterRef.remainingIDs
    }

    pub resource NFTMinter {
        pub var remainingIDs: [UInt64]

        pub fun mintNFT(att1: UInt64, att2: UInt64, att3: UInt64, att4: UInt64) {
            let id = Joskicv2.nextNFTID
            let nft <- create NFT(id: id, name: "Joskicv2 #".concat(id.toString()), att1: att1, att2: att2, att3: att3, att4: att4)
            self.remainingIDs.append(nft.id)
            Joskicv2.claimableNFTs[nft.id] <-! nft
            Joskicv2.nextNFTID = Joskicv2.nextNFTID + 1
        }

        pub fun removeID() {
            if self.remainingIDs.length > 0 {
                self.remainingIDs.remove(at: 0)
            } else {
                panic("No NFTS left to be claimed.")
            }
        }

        init() {
            self.remainingIDs = []
        }
    }

    init() {
        // Set the named paths
        self.CollectionStoragePath = /storage/Joskicv2Collection
        self.CollectionPublicPath = /public/Joskicv2Collection
        self.NFTMinterStoragePath = /storage/Joskicv2NFTMinter

        // Create a Collection and save it to storage
        self.account.save<@Joskicv2.Collection>(<- Joskicv2.createEmptyCollection(), to: Joskicv2.CollectionStoragePath)
        
        // Create a public capability for the Collection
        self.account.link<&Joskicv2.Collection{NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection}>(Joskicv2.CollectionPublicPath, target: Joskicv2.CollectionStoragePath)

        // Create NFTMinter resource and save it to storage
        self.account.save(<- create NFTMinter() , to: self.NFTMinterStoragePath)

        // Initialize the total supply
        self.totalSupply = 0

        self.nextNFTID = 1

        self.claimableNFTs <- {}
        emit ContractInitialized()
    }
}