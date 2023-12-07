import Head from 'next/head';
import { useEffect, useState } from 'react';
import * as fcl from '@onflow/fcl';
import React from 'react';
import { BeatLoader } from 'react-spinners';

export default function Mint() {
  const adminAddresses = ['0x90f6eb85d9c0cc1d'];
  const [hasCollection, setHasCollection] = useState(true);
  const [user, setUser] = useState({ loggedIn: null });
  const [nfts, setNfts] = useState([]);
  const [numNFTs, setNumNFTs] = useState(1)
  const userAddress = typeof window !== 'undefined' ? localStorage.getItem('userAddress') : null;
  const [numNFTsLeft, setNumNFTsLeft] = useState(0);
  const [txStatus, setTxStatus] = useState('');

  useEffect(() => {
    return fcl.currentUser().subscribe(user => {
      console.log('User:', user.addr);
      setUser(user);
      readClaimableNFTs(user.addr);
    });
  }, []);  

  if (userAddress) {
    try {
      const collectionExists = `import Joskicv2 from 0x90f6eb85d9c0cc1d
                                         import NonFungibleToken from 0x631e88ae7f1d7c20
                                         import MetadataViews from 0x631e88ae7f1d7c20
                                         pub fun main(address: Address): Bool {
                                           let collectionCapability = getAccount(address).getCapability<&Joskicv2.Collection{NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection}>(Joskicv2.CollectionPublicPath)
                                           return collectionCapability.check()
                                         }`;
      fcl.query({
        cadence: collectionExists,
        args: (arg, t) => [arg(userAddress, t.Address)],
      }).then(response => {
        if (response) {
          // Collection capability found, handle accordingly
          setHasCollection(true);
        } else {
          // No collection capability, handle accordingly
          setHasCollection(false);
        }
      }).catch(error => {
        console.error('Error checking collection capability:', error);
        // Handle error accordingly
        setHasCollection(false);
      });
    } catch (error) {
      console.error('Error in try block:', error);
      // Handle error accordingly
      setHasCollection(false);
    }
  }

  const mintNFTs = async () => {
    const attributes = Array.from({ length: numNFTs }, () => Array.from({ length: 4 }, () => Math.floor(Math.random() * 40) +60))
    
    const transactionId = await fcl.mutate({
      cadence: `import Joskicv2 from 0x90f6eb85d9c0cc1d
                import NonFungibleToken from 0x631e88ae7f1d7c20
                import MetadataViews from 0x631e88ae7f1d7c20
                transaction(attributes: [[UInt64]]) {
                  prepare(acct: AuthAccount) {
                    let minterRef = acct.borrow<&Joskicv2.NFTMinter>(from: /storage/Joskicv2NFTMinter)
                      ?? panic('Could not borrow reference to NFTMinter resource')
                    for attributeSet in attributes {
                      minterRef.mintNFT(att1: attributeSet[0], att2: attributeSet[1], att3: attributeSet[2], att4: attributeSet[3])
                    }
                  }
                  execute {
                    log('NFTs minted.')
                  }
      }`,
      args: (arg, t) => [arg(attributes, t.Array(t.Array(t.UInt64)))],
      proposer: fcl.currentUser().authorization,
      payer: fcl.currentUser().authorization,
      limit: 999
    });
  
    const transaction = await fcl.tx(transactionId).onceSealed()
    console.log(transaction)
  }

  const claimNFTs = async (numNFTs) => {
    const transactionId = await fcl.mutate({
      cadence: `
        import NonFungibleToken from 0x631e88ae7f1d7c20
        import MetadataViews from 0x631e88ae7f1d7c20
        import Joskicv2 from 0x90f6eb85d9c0cc1d
  
        transaction(numNFTs: Int) {
          prepare(acct: AuthAccount) {
            let collectionRef = acct.borrow<&Joskicv2.Collection{NonFungibleToken.CollectionPublic}>(from: Joskicv2.CollectionStoragePath)
              ?? panic('Could not borrow reference to Collection')
            var i = 0
            while i < numNFTs {
              let nft <- Joskicv2.claimNFT()
              collectionRef.deposit(token: <-nft)
              i = i + 1
            }
          }
          execute {
            log('NFTs claimed.')
          }
        }
      `,
      args: (arg, t) => [
        arg(numNFTs, t.Int),
      ],
      proposer: fcl.currentUser().authorization,
      payer: fcl.currentUser().authorization,
      limit: 999,
    });
  
    const transaction = await fcl.tx(transactionId).onceSealed();
    console.log(transaction);
  };

  const readClaimableNFTs = async (userAddress) => {
    const isAdmin = adminAddresses.includes(userAddress);
    const response = await fcl.send([
      fcl.script`
        import Joskicv2 from 0x90f6eb85d9c0cc1d
  
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
      `,
    ]);
  
    const data = await fcl.decode(response);
    console.log('Number of claimable NFTs:', data.length);
    setNumNFTsLeft(data.length);
    if (isAdmin) {
      console.log('NFTs:', nfts);
      setNfts(data);
    }
  };

  const createCollection = async () => {
    try {
      const transactionId = await fcl.mutate({
        cadence: ` import Joskicv2 from 0x90f6eb85d9c0cc1d
                   import NonFungibleToken from 0x631e88ae7f1d7c20
                   import MetadataViews from 0x631e88ae7f1d7c20
                   transaction() {
                     prepare(signer: AuthAccount) {
                       if signer.borrow<&Joskicv2.Collection>(from: Joskicv2.CollectionStoragePath) == nil {
                         signer.save(<- Joskicv2.createEmptyCollection(), to: Joskicv2.CollectionStoragePath)
                         signer.link<&Joskicv2.Collection{NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection}>(Joskicv2.CollectionPublicPath, target: Joskicv2.CollectionStoragePath)
                       }
                     }
                     execute {
                       log('Collection created.')
                     }
                   }`,
        args: (arg, t) => [],
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 999,
      });
      console.log('Transaction ID: ' + transactionId);
      fcl.tx(transactionId).subscribe(res => {
        console.log(res);
        if (res.status === 0 || res.status === 1) {
          setTxStatus('Pending...');
        } else if (res.status === 2) {
          setTxStatus('Finalized...');
        } else if (res.status === 3) {
          setTxStatus('Executed...');
        } else if (res.status === 4) {
          setTxStatus('Sealed!');
          setCollectionCreated(true);
        }
      });
    } catch (error) {
      console.error('Error creating collection:', error);
      setTxStatus('Transaction failed');
    }
  };

  return (
    <>
      <Head>
        <title>Završni rad Ivan Joskić</title>
        <meta charset='UTF-8'/>
        <meta name='description' content='Završni rad Ivan Joskić'/>
        <meta name='keywords' content='HTML, CSS, JavaScript'/>
        <meta name='author' content='Ivan Joskić'/>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'/>
      </Head>
      <div>
        {adminAddresses.includes(user.addr?.toLowerCase()) ? (
          <div>
            <input type='number' value={numNFTs} onChange={e => setNumNFTs(e.target.value)} />
            <button onClick={mintNFTs}>Mint NFTs</button>
            <div className='nft-container'>
              {nfts.map((nft, index) => (
                <div key={index} className='nft'>
                  <h2>{`ID: ${nft.id}`}</h2>
                  <p>{`Name: ${nft.name}`}</p>
                  <p>{`Attribute 1: ${nft.att1}`}</p>
                  <p>{`Attribute 2: ${nft.att2}`}</p>
                  <p>{`Attribute 3: ${nft.att3}`}</p>
                  <p>{`Attribute 4: ${nft.att4}`}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {hasCollection ? (
              <div className='no-nft-message'>
                <p>{`Number of NFTs left to be claimed: ${numNFTsLeft}`}</p>
                <input type='number' value={numNFTs} onChange={(e) => setNumNFTs(e.target.value)} />
                <button className='button' onClick={() => claimNFTs(numNFTs)}>Claim NFTs</button>
              </div>
            ) : (
              <div className='no-nft-message'>
                <p>{`Number of NFTs left to be claimed: ${numNFTsLeft}`}</p>
                <button className='button' disabled>Claim NFTs</button>
                <button className='button' onClick={createCollection}>Create Collection</button>
                {txStatus === 'Pending...' || txStatus === 'Finalized...' || txStatus === 'Executed...' ? (
                  <div>
                    <BeatLoader color='#123abc' loading={true} size={15} />
                    <p>{txStatus}</p>
                  </div>
                ) : (
                  <p>{txStatus}</p>
                )}
            </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}